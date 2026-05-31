"use strict";

(function attachCaveGame() {
  const TILE = 32;
  const WORLD_COLUMNS = 112;
  const WORLD_ROWS = 17;
  const FLOOR_ROW = 13;
  const PLAYER_WIDTH = 24;
  const PLAYER_HEIGHT = 42;

  const BLOCK_COLORS = {
    wood: ["#a7713e", "#704724", "#d29958"],
    stone: ["#718078", "#4d5b56", "#9aa49f"],
    iron: ["#929b94", "#d5baa0", "#66736e"],
    gold: ["#77786a", "#ffe06a", "#555f59"],
    diamond: ["#668384", "#70e6dd", "#465e60"],
  };

  const ENEMY_TYPES = [
    { name: "洞穴史莱姆", color: "#779743", hp: 8, damage: 1, reward: 12, xp: 8 },
    { name: "岩穴蜘蛛", color: "#7d5a53", hp: 13, damage: 2, reward: 20, xp: 13 },
    { name: "地底僵尸", color: "#71836a", hp: 19, damage: 2, reward: 32, xp: 18 },
  ];

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  class CaveGame {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
      this.options = options;
      this.keys = new Set();
      this.blocks = [];
      this.enemies = [];
      this.particles = [];
      this.floatingTexts = [];
      this.cameraX = 0;
      this.cameraY = 0;
      this.running = true;
      this.lastTimestamp = 0;
      this.statusTick = 0;
      this.player = {
        x: 96,
        y: FLOOR_ROW * TILE - PLAYER_HEIGHT,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        vx: 0,
        vy: 0,
        facing: 1,
        grounded: false,
        hp: 5,
        maxHp: 5,
        invulnerableUntil: 0,
        mineUntil: 0,
        nextMineAt: 0,
        mineDirection: "right",
        attackUntil: 0,
      };

      this.bindControls();
      this.generateWorld();
      this.resizeCanvas();
      this.notifyStatus();
      window.addEventListener("resize", () => this.resizeCanvas());
      requestAnimationFrame((timestamp) => this.frame(timestamp));
    }

    getConfig() {
      return this.options.getConfig ? this.options.getConfig() : {};
    }

    resizeCanvas() {
      const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const width = Math.max(520, this.canvas.clientWidth || 960);
      const height = Math.max(360, this.canvas.clientHeight || 540);
      this.canvas.width = Math.floor(width * ratio);
      this.canvas.height = Math.floor(height * ratio);
      this.viewWidth = width;
      this.viewHeight = height;
      this.pixelRatio = ratio;
      this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
      this.context.imageSmoothingEnabled = false;
    }

    bindControls() {
      document.addEventListener("keydown", (event) => {
        if (event.target instanceof Element && event.target.matches("input, textarea, select")) return;
        const key = event.key.toLowerCase();
        if (["a", "d", "arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)) this.keys.add(key);
        if (key === "w" || key === "arrowup" || event.code === "Space") {
          event.preventDefault();
          this.jump();
        }
        if (key.startsWith("arrow")) {
          event.preventDefault();
        }
        if (key === "e") this.mine(this.miningDirectionFromKeys());
        if (key === "f") this.attack();
        if (key === "q" && this.options.onStartShift) this.options.onStartShift();
        if (key === "r") this.resetPosition();
      });

      document.addEventListener("keyup", (event) => {
        this.keys.delete(event.key.toLowerCase());
      });

      document.querySelectorAll("[data-cave-control]").forEach((button) => {
        const control = button.dataset.caveControl;
        if (["left", "right"].includes(control)) {
          const key = control === "left" ? "a" : "d";
          button.addEventListener("pointerdown", () => this.keys.add(key));
          button.addEventListener("pointerup", () => this.keys.delete(key));
          button.addEventListener("pointerleave", () => this.keys.delete(key));
          button.addEventListener("click", () => {
            this.player.facing = control === "left" ? -1 : 1;
            this.movePlayer("x", control === "left" ? -18 : 18);
            this.notifyStatus();
          });
          return;
        }

        button.addEventListener("click", () => {
          if (control === "jump") this.jump();
          if (control === "mine") this.mine();
          if (control === "attack") this.attack();
        });
      });

      this.canvas.addEventListener("pointerdown", () => this.canvas.focus());
    }

    generateWorld() {
      this.blocks = [];
      const config = this.getConfig();
      const depth = config.depth || 1;

      for (let column = 0; column < WORLD_COLUMNS; column += 1) {
        for (let row = FLOOR_ROW; row < WORLD_ROWS; row += 1) {
          this.addBlock(column, row, this.pickBlockType(column, row, depth));
        }
      }

      const obstacles = [
        [8, 12], [14, 12], [15, 11], [23, 12], [30, 12], [31, 11],
        [39, 12], [45, 12], [46, 11], [47, 10], [58, 12], [67, 12],
        [68, 11], [76, 12], [84, 12], [85, 11], [94, 12], [102, 12],
      ];
      obstacles.forEach(([column, row]) => {
        for (let currentRow = row; currentRow < FLOOR_ROW; currentRow += 1) {
          this.addBlock(column, currentRow, this.pickBlockType(column, currentRow, depth + 6));
        }
      });

      const ledges = [
        [11, 9, 4], [19, 10, 3], [34, 9, 4], [51, 10, 4],
        [62, 9, 3], [72, 10, 4], [89, 9, 4], [99, 10, 3],
      ];
      ledges.forEach(([column, row, width]) => {
        for (let offset = 0; offset < width; offset += 1) {
          this.addBlock(column + offset, row, this.pickBlockType(column + offset, row, depth + 9));
        }
      });

      this.enemies = [17, 27, 42, 55, 70, 82, 97, 106].map((column, index) => {
        const type = ENEMY_TYPES[Math.min(ENEMY_TYPES.length - 1, Math.floor((depth + index) / 12))];
        return {
          ...type,
          id: `${column}-${Date.now()}-${index}`,
          x: column * TILE + 4,
          y: FLOOR_ROW * TILE - 26,
          w: 26,
          h: 26,
          maxHp: type.hp,
          vx: 0,
          vy: 0,
          homeX: column * TILE + 4,
          homeY: FLOOR_ROW * TILE - 26,
          phase: index * 0.83,
          hitUntil: 0,
          dead: false,
        };
      });
    }

    hasActiveBoss() {
      return this.enemies.some((enemy) => enemy.isBoss && !enemy.dead);
    }

    spawnBoss(boss) {
      if (!boss || this.hasActiveBoss()) return false;
      const x = clamp(this.player.x + 190, 48, WORLD_COLUMNS * TILE - 64);
      const y = clamp(this.player.y - 36, 84, WORLD_ROWS * TILE - 58);
      this.enemies.push({
        ...boss,
        isBoss: true,
        x,
        y,
        w: 52,
        h: 52,
        maxHp: boss.hp,
        vx: 0,
        vy: 0,
        homeX: x,
        homeY: y,
        phase: Math.random() * 5,
        hitUntil: 0,
        dead: false,
      });
      this.setHint(`${boss.name}进入矿洞！靠近后按 F 攻击。`);
      this.notifyStatus();
      return true;
    }

    pickBlockType(column, row, depth) {
      const richness = depth + Math.floor(column / 10) + Math.max(0, FLOOR_ROW - row) * 2;
      const roll = Math.random() * 100;
      if (richness >= 24 && roll < Math.min(8, richness * 0.14)) return "diamond";
      if (richness >= 14 && roll < Math.min(18, 4 + richness * 0.38)) return "gold";
      if (richness >= 6 && roll < Math.min(36, 14 + richness * 0.62)) return "iron";
      if (roll < 76) return "stone";
      return "wood";
    }

    addBlock(column, row, type) {
      if (this.blocks.some((block) => block.column === column && block.row === row && !block.gone)) return;
      const hp = { wood: 1, stone: 2, iron: 4, gold: 5, diamond: 7 }[type];
      this.blocks.push({
        column,
        row,
        x: column * TILE,
        y: row * TILE,
        w: TILE,
        h: TILE,
        type,
        hp,
        maxHp: hp,
        gone: false,
      });
    }

    solidBlocksNear(rect) {
      return this.blocks.filter((block) =>
        !block.gone &&
        block.x < rect.x + rect.w + TILE &&
        block.x + block.w > rect.x - TILE &&
        block.y < rect.y + rect.h + TILE &&
        block.y + block.h > rect.y - TILE
      );
    }

    movePlayer(axis, distanceValue) {
      if (!distanceValue) return;
      this.player[axis] += distanceValue;
      const rect = this.player;
      this.solidBlocksNear(rect).forEach((block) => {
        if (!overlap(rect, block)) return;
        if (axis === "x") {
          rect.x = distanceValue > 0 ? block.x - rect.w : block.x + block.w;
          rect.vx = 0;
          return;
        }

        if (distanceValue > 0) {
          rect.y = block.y - rect.h;
          rect.grounded = true;
        } else {
          rect.y = block.y + block.h;
        }
        rect.vy = 0;
      });
    }

    update(delta, timestamp) {
      const left = this.keys.has("a") || this.keys.has("arrowleft");
      const right = this.keys.has("d") || this.keys.has("arrowright");
      const targetVx = (right ? 1 : 0) - (left ? 1 : 0);
      this.player.vx += (targetVx * 180 - this.player.vx) * Math.min(1, delta * 12);
      if (targetVx) this.player.facing = targetVx;

      this.player.vy += 980 * delta;
      this.player.grounded = false;
      this.movePlayer("x", this.player.vx * delta);
      this.movePlayer("y", this.player.vy * delta);

      this.player.x = clamp(this.player.x, 18, WORLD_COLUMNS * TILE - this.player.w - 18);
      if (this.player.y > WORLD_ROWS * TILE) this.handleBottomFall();

      this.updateEnemies(delta, timestamp);
      this.updateEffects(delta);

      const cameraTarget = this.player.x - this.viewWidth * 0.42;
      this.cameraX += (clamp(cameraTarget, 0, WORLD_COLUMNS * TILE - this.viewWidth) - this.cameraX) * Math.min(1, delta * 5);
      const maxCameraY = Math.max(0, WORLD_ROWS * TILE - this.viewHeight);
      const cameraTargetY = this.player.y - this.viewHeight * 0.55;
      this.cameraY += (clamp(cameraTargetY, 0, maxCameraY) - this.cameraY) * Math.min(1, delta * 5);
      this.statusTick += delta;
      if (this.statusTick > 0.14) {
        this.statusTick = 0;
        this.notifyStatus();
      }
    }

    updateEnemies(delta, timestamp) {
      const config = this.getConfig();
      this.enemies.forEach((enemy) => {
        if (enemy.dead) return;
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const alerted = Math.hypot(dx, dy) < 300;
        const patrolX = enemy.homeX + Math.sin(timestamp / 850 + enemy.phase) * 34;
        const patrolY = enemy.homeY + Math.cos(timestamp / 700 + enemy.phase) * 28;
        const targetX = alerted ? this.player.x : patrolX;
        const targetY = alerted ? this.player.y : patrolY;
        const speed = (alerted ? 58 : 24) * (enemy.isBoss ? 1.18 : 1);
        const verticalSpeed = (alerted ? 52 : 20) * (enemy.isBoss ? 1.12 : 1);
        enemy.vx += (clamp(targetX - enemy.x, -speed, speed) - enemy.vx) * Math.min(1, delta * 4.5);
        enemy.vy += (clamp(targetY - enemy.y, -verticalSpeed, verticalSpeed) - enemy.vy) * Math.min(1, delta * 4.5);
        enemy.x = clamp(enemy.x + enemy.vx * delta, 12, WORLD_COLUMNS * TILE - enemy.w - 12);
        enemy.y = clamp(enemy.y + enemy.vy * delta, 72, WORLD_ROWS * TILE - enemy.h - 10);

        if (overlap(this.player, enemy) && timestamp > this.player.invulnerableUntil) {
          const absorbed = Math.floor((config.armor || 0) / 4);
          const damage = Math.max(1, enemy.damage - absorbed);
          this.player.hp = Math.max(0, this.player.hp - damage);
          this.player.invulnerableUntil = timestamp + 850;
          this.player.vx = -Math.sign(dx || 1) * 170;
          this.player.vy = -180;
          this.addFloatingText(this.player.x, this.player.y - 10, `-${damage} 生命`, "#ef8365");
          if (this.options.onPlayerHit) this.options.onPlayerHit({ hp: this.player.hp, maxHp: this.player.maxHp });
          if (this.player.hp <= 0) this.handlePlayerDeath();
        }
      });
    }

    updateEffects(delta) {
      this.particles.forEach((particle) => {
        particle.life -= delta;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.vy += 240 * delta;
      });
      this.particles = this.particles.filter((particle) => particle.life > 0);

      this.floatingTexts.forEach((label) => {
        label.life -= delta;
        label.y -= 32 * delta;
      });
      this.floatingTexts = this.floatingTexts.filter((label) => label.life > 0);
    }

    jump() {
      if (!this.player.grounded) return;
      this.player.vy = -390;
      this.player.grounded = false;
    }

    miningVector(direction = "facing") {
      if (direction === "up") return { x: 0, y: -1 };
      if (direction === "down") return { x: 0, y: 1 };
      if (direction === "left") return { x: -1, y: 0 };
      if (direction === "right") return { x: 1, y: 0 };
      return { x: this.player.facing, y: 0 };
    }

    miningDirectionFromKeys() {
      if (this.keys.has("arrowup")) return "up";
      if (this.keys.has("arrowdown")) return "down";
      if (this.keys.has("arrowleft")) return "left";
      if (this.keys.has("arrowright")) return "right";
      return "facing";
    }

    nearestBlock(direction = "facing") {
      const vector = this.miningVector(direction);
      const playerCenter = {
        x: this.player.x + this.player.w / 2,
        y: this.player.y + this.player.h / 2,
      };
      const center = {
        x: playerCenter.x + vector.x * 32,
        y: playerCenter.y + vector.y * 32,
      };
      return this.blocks
        .filter((block) => {
          if (block.gone) return false;
          const blockCenter = { x: block.x + 16, y: block.y + 16 };
          const dx = blockCenter.x - playerCenter.x;
          const dy = blockCenter.y - playerCenter.y;
          const forwardDistance = dx * vector.x + dy * vector.y;
          const sidewaysDistance = Math.abs(dx * vector.y - dy * vector.x);
          return forwardDistance > -4 && forwardDistance < 94 && sidewaysDistance < 42 && distance(center, blockCenter) < 78;
        })
        .sort((left, right) =>
          distance(center, { x: left.x + 16, y: left.y + 16 }) -
          distance(center, { x: right.x + 16, y: right.y + 16 })
        )[0];
    }

    mine(direction = "facing") {
      const now = performance.now();
      if (now < this.player.nextMineAt) return;
      this.player.nextMineAt = now + 130;
      const config = this.getConfig();
      if ((config.durability ?? 1) <= 0) {
        this.setHint(`镐子耐久耗尽，按 Q 支付 ${config.shiftCost || 0} 金币补给并开启新班次。`);
        return;
      }
      const vector = this.miningVector(direction);
      this.player.mineDirection = direction === "facing" ? (vector.x < 0 ? "left" : "right") : direction;
      if (vector.x) this.player.facing = vector.x;
      const block = this.nearestBlock(direction);
      if (!block) {
        this.setHint("这个方向没有可挖掘方块，换个方向试试。");
        return;
      }

      if (this.options.canCollect && !this.options.canCollect()) {
        this.setHint("背包已满，按 S 出售或升级背包。");
        return;
      }

      const critical = Math.random() < (config.criticalChance || 0);
      block.hp -= (config.toolDamage || 1) * (critical ? 2 : 1);
      this.player.mineUntil = performance.now() + 230;
      this.spawnParticles(block.x + 16, block.y + 16, block.type, critical ? 12 : 6);
      if (critical) this.addFloatingText(block.x + 2, block.y - 6, "暴击挖掘！", "#ffe16d");

      if (block.hp <= 0) {
        block.gone = true;
        const result = this.options.onMine ? this.options.onMine({ type: block.type, critical }) : {};
        this.addFloatingText(block.x, block.y - 5, `+${result.amount || 1} ${result.name || block.type}`, "#f7e6aa");
        if (result.durability <= 0) {
          this.setHint(`镐子耐久耗尽，按 Q 支付 ${config.shiftCost || 0} 金币补给并开启新班次。`);
        }
      }
    }

    nearestEnemy() {
      const swordCenter = {
        x: this.player.x + this.player.w / 2 + this.player.facing * 38,
        y: this.player.y + this.player.h / 2,
      };
      return this.enemies
        .filter((enemy) => !enemy.dead && distance(swordCenter, { x: enemy.x + enemy.w / 2, y: enemy.y + enemy.h / 2 }) < 82)
        .sort((left, right) =>
          distance(swordCenter, { x: left.x + left.w / 2, y: left.y + left.h / 2 }) -
          distance(swordCenter, { x: right.x + right.w / 2, y: right.y + right.h / 2 })
        )[0];
    }

    attack() {
      const enemy = this.nearestEnemy();
      this.player.attackUntil = performance.now() + 210;
      if (!enemy) {
        this.setHint("挥剑落空，靠近怪物后按 F 攻击。");
        return;
      }

      const config = this.getConfig();
      const critical = Math.random() < (config.criticalChance || 0);
      const damage = (config.swordDamage || 2) * (critical ? 2 : 1);
      enemy.hp -= damage;
      enemy.hitUntil = performance.now() + 160;
      this.spawnParticles(enemy.x + 13, enemy.y + 13, "gold", critical ? 11 : 5);
      this.addFloatingText(enemy.x, enemy.y - 4, `${critical ? "暴击 " : ""}-${damage}`, critical ? "#ffe16d" : "#efb16f");

      if (enemy.hp <= 0) {
        enemy.dead = true;
        if (this.options.onEnemyDefeated) {
          this.options.onEnemyDefeated({
            id: enemy.id,
            isBoss: Boolean(enemy.isBoss),
            name: enemy.name,
            coins: enemy.reward,
            xp: enemy.xp,
          });
        }
      }
    }

    handlePlayerDeath() {
      const lostCoins = this.options.onPlayerDeath ? this.options.onPlayerDeath() : 0;
      this.setHint(`小猫回到了矿洞入口${lostCoins ? `，遗失 ${lostCoins} 金币` : ""}。`);
      this.resetPosition();
    }

    handleBottomFall() {
      const result = this.options.onDescend ? this.options.onDescend() : {};
      if (result.advanced) {
        this.generateWorld();
        this.resetPosition();
        this.setHint(`下潜成功：抵达 ${result.depth}m ${result.zone}，新的矿层已经展开。`);
        return;
      }

      this.resetPosition();
      this.setHint(result.message || "矿井底部暂时无法继续下潜，小猫回到了入口。");
    }

    restoreEntrancePlatform() {
      for (let column = 1; column <= 5; column += 1) {
        const block = this.blocks.find((candidate) => candidate.column === column && candidate.row === FLOOR_ROW);
        if (!block) {
          this.addBlock(column, FLOOR_ROW, "stone");
          continue;
        }
        block.gone = false;
        block.hp = block.maxHp;
      }
    }

    resetPosition() {
      this.restoreEntrancePlatform();
      this.player.x = 96;
      this.player.y = FLOOR_ROW * TILE - PLAYER_HEIGHT;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.hp = this.player.maxHp;
      this.player.invulnerableUntil = performance.now() + 1000;
      this.cameraX = 0;
      this.cameraY = 0;
      this.notifyStatus();
    }

    setHint(message) {
      if (this.options.onHint) this.options.onHint(message);
    }

    notifyStatus() {
      const config = this.getConfig();
      const nearestEnemy = this.nearestEnemy();
      const nearestBlock = this.nearestBlock();
      const firstEnemy = this.enemies.find((enemy) => !enemy.dead);
      const activeBoss = this.enemies.find((enemy) => enemy.isBoss && !enemy.dead);
      let hint = "方向键或 A、D 移动，W、↑ 或空格跳跃，按 E 挖矿。";
      if (nearestBlock) hint = `附近：${config.materialNames?.[nearestBlock.type] || nearestBlock.type}，按 E 挖掘；按住方向再按 E 可定向挖。`;
      if ((config.durability ?? 1) <= 0) hint = `镐子耐久耗尽，按 Q 支付 ${config.shiftCost || 0} 金币补给并开启新班次。`;
      if (nearestEnemy) hint = `${nearestEnemy.name}靠近了！按 F 使用${config.swordName || "剑"}。`;
      this.canvas.dataset.playerX = String(Math.round(this.player.x));
      this.canvas.dataset.playerY = String(Math.round(this.player.y));
      this.canvas.dataset.cameraX = String(Math.round(this.cameraX));
      this.canvas.dataset.cameraY = String(Math.round(this.cameraY));
      this.canvas.dataset.enemiesAlive = String(this.enemies.filter((enemy) => !enemy.dead).length);
      this.canvas.dataset.nearbyBlock = nearestBlock?.type || "";
      this.canvas.dataset.nearbyEnemy = nearestEnemy?.name || "";
      this.canvas.dataset.durability = String(config.durability ?? "");
      this.canvas.dataset.enemyX = String(Math.round(firstEnemy?.x || 0));
      this.canvas.dataset.enemyY = String(Math.round(firstEnemy?.y || 0));
      this.canvas.dataset.bossName = activeBoss?.name || "";
      this.canvas.dataset.bossHp = String(activeBoss?.hp || "");
      if (this.options.onStatus) {
        this.options.onStatus({
          hp: this.player.hp,
          maxHp: this.player.maxHp,
          armor: config.armor || 0,
          swordName: config.swordName || "木剑",
          swordQuality: config.swordQuality || "普通",
          hint,
          x: Math.floor(this.player.x / TILE),
          boss: activeBoss ? { name: activeBoss.name, hp: activeBoss.hp, maxHp: activeBoss.maxHp } : null,
        });
      }
    }

    spawnParticles(x, y, type, total) {
      const color = BLOCK_COLORS[type]?.[1] || "#e9d27a";
      for (let index = 0; index < total; index += 1) {
        this.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 170,
          vy: -40 - Math.random() * 130,
          color,
          life: 0.42 + Math.random() * 0.25,
        });
      }
    }

    addFloatingText(x, y, text, color) {
      this.floatingTexts.push({ x, y, text, color, life: 0.75 });
    }

    frame(timestamp) {
      if (!this.running) return;
      const delta = Math.min(0.033, (timestamp - this.lastTimestamp) / 1000 || 0);
      this.lastTimestamp = timestamp;
      this.update(delta, timestamp);
      this.draw(timestamp);
      requestAnimationFrame((nextTimestamp) => this.frame(nextTimestamp));
    }

    draw(timestamp) {
      const ctx = this.context;
      ctx.clearRect(0, 0, this.viewWidth, this.viewHeight);
      this.drawBackground(ctx);
      ctx.save();
      ctx.translate(-Math.round(this.cameraX), -Math.round(this.cameraY));
      this.drawTorches(ctx);
      this.blocks.forEach((block) => {
        if (
          !block.gone &&
          block.x + TILE >= this.cameraX &&
          block.x <= this.cameraX + this.viewWidth &&
          block.y + TILE >= this.cameraY &&
          block.y <= this.cameraY + this.viewHeight
        ) {
          this.drawBlock(ctx, block);
        }
      });
      this.enemies.forEach((enemy) => {
        if (!enemy.dead && enemy.x + enemy.w >= this.cameraX && enemy.x <= this.cameraX + this.viewWidth) {
          this.drawEnemy(ctx, enemy, timestamp);
        }
      });
      this.drawPlayer(ctx, timestamp);
      this.drawEffects(ctx);
      ctx.restore();
    }

    drawBackground(ctx) {
      ctx.fillStyle = "#172722";
      ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);
      for (let x = -24; x < this.viewWidth + 48; x += 48) {
        for (let y = -48; y < this.viewHeight + 48; y += 48) {
          const shade = ((x + y + Math.floor(this.cameraX + this.cameraY)) / 48) % 3 === 0 ? "#21362e" : "#1c3029";
          ctx.fillStyle = shade;
          ctx.fillRect(x - (this.cameraX % 48), y - (this.cameraY % 48), 46, 46);
        }
      }
      ctx.fillStyle = "rgba(7, 14, 12, 0.35)";
      ctx.fillRect(0, 0, this.viewWidth, 52);
    }

    drawTorches(ctx) {
      for (let column = 4; column < WORLD_COLUMNS; column += 14) {
        const x = column * TILE;
        ctx.fillStyle = "#6e482a";
        ctx.fillRect(x, 272, 5, 24);
        ctx.fillStyle = "#ffd568";
        ctx.fillRect(x - 3, 262, 11, 12);
        ctx.fillStyle = "rgba(255, 207, 91, 0.1)";
        ctx.fillRect(x - 22, 242, 50, 58);
      }
    }

    drawBlock(ctx, block) {
      const colors = BLOCK_COLORS[block.type];
      ctx.fillStyle = colors[0];
      ctx.fillRect(block.x, block.y, TILE, TILE);
      ctx.fillStyle = colors[2];
      ctx.fillRect(block.x + 3, block.y + 3, 10, 4);
      ctx.fillRect(block.x + 19, block.y + 14, 7, 6);
      ctx.fillStyle = colors[1];
      ctx.fillRect(block.x + TILE - 6, block.y, 6, TILE);
      ctx.fillRect(block.x, block.y + TILE - 6, TILE, 6);
      ctx.strokeStyle = "#101b17";
      ctx.lineWidth = 2;
      ctx.strokeRect(block.x + 1, block.y + 1, TILE - 2, TILE - 2);

      if (block.hp < block.maxHp) {
        ctx.strokeStyle = "rgba(20, 25, 22, 0.85)";
        ctx.beginPath();
        ctx.moveTo(block.x + 6, block.y + 4);
        ctx.lineTo(block.x + 17, block.y + 14);
        ctx.lineTo(block.x + 12, block.y + 26);
        ctx.moveTo(block.x + 17, block.y + 14);
        ctx.lineTo(block.x + 27, block.y + 9);
        ctx.stroke();
      }
    }

    drawPlayer(ctx, timestamp) {
      const player = this.player;
      if (timestamp < player.invulnerableUntil && Math.floor(timestamp / 70) % 2) return;
      const flip = player.facing < 0;
      ctx.save();
      ctx.translate(player.x + (flip ? player.w : 0), player.y);
      ctx.scale(flip ? -1 : 1, 1);

      ctx.fillStyle = "#bb7e4f";
      ctx.fillRect(3, 12, 22, 24);
      ctx.fillStyle = "#d49a61";
      ctx.fillRect(1, 0, 25, 23);
      ctx.fillStyle = "#d49a61";
      ctx.fillRect(2, -6, 7, 8);
      ctx.fillRect(18, -6, 7, 8);
      ctx.fillStyle = "#54788f";
      ctx.fillRect(5, 24, 18, 18);
      ctx.fillStyle = "#20211a";
      ctx.fillRect(7, 9, 4, 4);
      ctx.fillRect(18, 9, 4, 4);
      ctx.fillStyle = "#855546";
      ctx.fillRect(13, 15, 4, 3);

      const config = this.getConfig();
      if (timestamp < player.attackUntil) {
        ctx.save();
        ctx.translate(23, 20);
        ctx.rotate(-0.6);
        ctx.fillStyle = config.swordColor || "#d7ded7";
        ctx.fillRect(0, -3, 40, 7);
        ctx.fillStyle = "#a86e39";
        ctx.fillRect(-6, -4, 12, 9);
        ctx.restore();
      } else {
        ctx.fillStyle = "#9b6535";
        ctx.fillRect(21, 22, 28, 5);
        ctx.fillStyle = "#bdc8bf";
        ctx.fillRect(42, 13, 8, 18);
      }

      if (timestamp < player.mineUntil) {
        ctx.fillStyle = "#c7d0c7";
        ctx.fillRect(30, 4, 30, 6);
      }
      ctx.restore();
    }

    drawEnemy(ctx, enemy, timestamp) {
      if (enemy.isBoss) {
        ctx.fillStyle = "#e7c968";
        ctx.fillRect(enemy.x + 7, enemy.y - 14, enemy.w - 14, 7);
        ctx.fillRect(enemy.x + 11, enemy.y - 20, 7, 7);
        ctx.fillRect(enemy.x + enemy.w - 18, enemy.y - 20, 7, 7);
        ctx.strokeStyle = "rgba(255, 225, 110, 0.72)";
        ctx.lineWidth = 3;
        ctx.strokeRect(enemy.x - 3, enemy.y + 2, enemy.w + 6, enemy.h - 2);
      }
      ctx.fillStyle = timestamp < enemy.hitUntil ? "#f5d684" : enemy.color;
      ctx.fillRect(enemy.x, enemy.y + 6, enemy.w, enemy.h - 6);
      ctx.fillStyle = "#263029";
      ctx.fillRect(enemy.x + 5, enemy.y + 13, 4, 4);
      ctx.fillRect(enemy.x + 17, enemy.y + 13, 4, 4);
      ctx.fillStyle = "#172019";
      ctx.fillRect(enemy.x + 2, enemy.y + enemy.h - 4, enemy.w - 4, 4);
      ctx.fillStyle = "#1a241e";
      ctx.fillRect(enemy.x, enemy.y - 6, enemy.w, 4);
      ctx.fillStyle = "#d85f48";
      ctx.fillRect(enemy.x, enemy.y - 6, enemy.w * Math.max(0, enemy.hp / enemy.maxHp), 4);
    }

    drawEffects(ctx) {
      this.particles.forEach((particle) => {
        ctx.globalAlpha = clamp(particle.life * 2, 0, 1);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 6, 6);
      });
      ctx.globalAlpha = 1;
      ctx.font = 'bold 12px "Courier New"';
      this.floatingTexts.forEach((label) => {
        ctx.globalAlpha = clamp(label.life * 2, 0, 1);
        ctx.fillStyle = label.color;
        ctx.fillText(label.text, label.x, label.y);
      });
      ctx.globalAlpha = 1;
    }

    getStatus() {
      return {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        hp: this.player.hp,
        cameraX: Math.round(this.cameraX),
        cameraY: Math.round(this.cameraY),
        durability: this.getConfig().durability,
        nearbyBlock: this.nearestBlock()?.type || null,
        nearbyEnemy: this.nearestEnemy()?.name || null,
        boss: this.enemies
          .filter((enemy) => enemy.isBoss && !enemy.dead)
          .map((enemy) => ({ name: enemy.name, hp: enemy.hp, maxHp: enemy.maxHp }))[0] || null,
        enemiesAlive: this.enemies.filter((enemy) => !enemy.dead).length,
        enemies: this.enemies.filter((enemy) => !enemy.dead).map((enemy) => ({
          x: Math.round(enemy.x),
          y: Math.round(enemy.y),
        })),
        blocksRemaining: this.blocks.filter((block) => !block.gone).length,
      };
    }
  }

  window.CaveGame = CaveGame;
})();
