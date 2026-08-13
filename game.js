const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const CONFIG = {
  playerSize: 40,
  enemySize: 40,
  collisionThreshold: 30,
  playerSpeed: 180,
  dashSpeed: 600,
  dashDuration: 0.2,
  dashCooldown: 3,
  bulletSpeed: 300,
  enemySpeed: 60,
  enemyHP: 3,
  maxPlayerHP: 10,
  invincibleDuration: 1,
};
const ENEMY_TYPES = {
  fast: { hp: 1, speed: 100 },
  tank: { hp: 6, speed: 30 },
};
let playerX = 380;
let playerY = 280;
let playerHP = 10;
let lastTime = 0;
let dashTime = 0;
let invincibleTime = 0;
let dashCooldownTimer = 0;
let healItem = { x: 650, y: 500, width: 20, height: 20 };
let bullets = [];
let enemyBullets = [];
let rooms = [
  [
    {
      x: 600,
      y: 300,
      type: "fast",
      hp: ENEMY_TYPES.fast.hp,
      speed: ENEMY_TYPES.fast.speed,
      shootTimer: 0,
    },
    {
      x: 200,
      y: 200,
      type: "tank",
      hp: ENEMY_TYPES.tank.hp,
      speed: ENEMY_TYPES.tank.speed,
      shootTimer: 0,
    },
  ],
  [
    {
      x: 100,
      y: 100,
      type: "fast",
      hp: ENEMY_TYPES.fast.hp,
      speed: ENEMY_TYPES.fast.speed,
      shootTimer: 0,
    },
    {
      x: 500,
      y: 400,
      type: "tank",
      hp: ENEMY_TYPES.tank.hp,
      speed: ENEMY_TYPES.tank.speed,
      shootTimer: 0,
    },
  ],
];
let currentRoom = 0;
let gameStage = "playing";
let enemies = rooms[currentRoom];
let lastDirection = "right";
const speed = CONFIG.playerSpeed;
function updatePlayer(dt) {
  if (dashTime > 0) {
    dashTime -= dt;
    if (lastDirection === "right") playerX += CONFIG.dashSpeed * dt;
    if (lastDirection === "left") playerX -= CONFIG.dashSpeed * dt;
    if (lastDirection === "up") playerY -= CONFIG.dashSpeed * dt;
    if (lastDirection === "down") playerY += CONFIG.dashSpeed * dt;
  } else {
    if (keys.d) playerX += speed * dt;
    if (keys.a) playerX -= speed * dt;
    if (keys.w) playerY -= speed * dt;
    if (keys.s) playerY += speed * dt;
  }
  if (dashCooldownTimer > 0) {
    dashCooldownTimer -= dt;
  }
  if (invincibleTime > 0) {
    invincibleTime -= dt;
  }
}
function updateBullets(dt) {
  bullets = bullets.filter(function (bullet) {
    return (
      bullet.y > 0 &&
      bullet.y < canvas.height &&
      bullet.x > 0 &&
      bullet.x < canvas.width
    );
  });
  bullets.forEach(function (bullet) {
    bullet.x += bullet.dx * dt;
    bullet.y += bullet.dy * dt;
  });
}
function updateEnemies(dt) {
  enemies.forEach(function (enemy) {
    if (enemy.x < playerX) enemy.x += enemy.speed * dt;
    if (enemy.x > playerX) enemy.x -= enemy.speed * dt;
    if (enemy.y < playerY) enemy.y += enemy.speed * dt;
    if (enemy.y > playerY) enemy.y -= enemy.speed * dt;

    enemy.shootTimer -= dt;
    if (enemy.shootTimer <= 0) {
      let diffX = playerX - enemy.x;
      let diffY = playerY - enemy.y;
      let distance = Math.sqrt(diffX * diffX + diffY * diffY);
      let dx = (diffX / distance) * CONFIG.bulletSpeed;
      let dy = (diffY / distance) * CONFIG.bulletSpeed;
      enemyBullets.push({ x: enemy.x, y: enemy.y, dx: dx, dy: dy });
      enemy.shootTimer = 2;
    }
  });
}
function updateEnemyBullets(dt) {
  enemyBullets = enemyBullets.filter(function (bullet) {
    return (
      bullet.y > 0 &&
      bullet.y < canvas.height &&
      bullet.x > 0 &&
      bullet.x < canvas.width
    );
  });
  enemyBullets.forEach(function (bullet) {
    bullet.x += bullet.dx * dt;
    bullet.y += bullet.dy * dt;
  });
}
function checkCollisions() {
  if (
    Math.abs(playerX - healItem.x) < CONFIG.collisionThreshold &&
    Math.abs(playerY - healItem.y) < CONFIG.collisionThreshold
  ) {
    playerHP = Math.min(playerHP + 1, CONFIG.maxPlayerHP); // Tăng HP của người chơi khi nhặt vật phẩm
    healItem.x = -100; // Di chuyển vật phẩm ra khỏi màn hình sau khi được nhặt
  }
  let hitBullets = [];
  let hitEnemies = [];
  let hitEnemyBullets = [];
  bullets.forEach(function (bullet) {
    enemies.forEach(function (enemy) {
      if (
        Math.abs(bullet.x - enemy.x) < CONFIG.collisionThreshold &&
        Math.abs(bullet.y - enemy.y) < CONFIG.collisionThreshold
      ) {
        hitBullets.push(bullet);
        enemy.hp -= 1; // Giảm HP của kẻ thù khi trúng đạn
        if (enemy.hp <= 0) {
          hitEnemies.push(enemy);
        }
      }
    });
  });
  enemies.forEach(function (enemy) {
    if (
      Math.abs(enemy.x - playerX) < CONFIG.collisionThreshold &&
      Math.abs(enemy.y - playerY) < CONFIG.collisionThreshold &&
      invincibleTime <= 0
    ) {
      playerHP -= 1;
      invincibleTime = CONFIG.invincibleDuration; // Người chơi bất tử trong 1 giây sau khi bị trúng đòn
    }
    if (playerHP <= 0) {
      gameStage = "lose";
    }
  });
  enemyBullets.forEach(function (bullet) {
    if (
      Math.abs(bullet.x - playerX) < CONFIG.collisionThreshold &&
      Math.abs(bullet.y - playerY) < CONFIG.collisionThreshold &&
      invincibleTime <= 0
    ) {
      playerHP -= 1;
      invincibleTime = CONFIG.invincibleDuration;
      hitEnemyBullets.push(bullet);
    }
  });
  // Loại bỏ các viên đạn và kẻ thù đã bị trúng đạn
  bullets = bullets.filter(function (bullet) {
    return !hitBullets.includes(bullet);
  });
  enemies = enemies.filter(function (enemy) {
    return !hitEnemies.includes(enemy);
  });
}
function checkRoomTransition() {
  if (enemies.length === 0) {
    currentRoom++;
    if (currentRoom < rooms.length) {
      enemies = rooms[currentRoom];
    } else {
      gameStage = "won";
    }
  }
}
function drawHUD() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.fillText("HP: " + playerHP, 20, 30);
  if (gameStage === "won") {
    ctx.font = "40px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("You Win!", canvas.width / 2, canvas.height / 2);
  }
  if (gameStage === "lose") {
    ctx.font = "40px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  }
}
function resetGame() {
  playerX = 380;
  playerY = 280;
  playerHP = CONFIG.maxPlayerHP;
  dashTime = 0;
  invincibleTime = 0;
  dashCooldownTimer = 0;
  bullets = [];
  currentRoom = 0;
  gameStage = "playing";
  lastDirection = "right";
  rooms = [
    [
      {
        x: 600,
        y: 300,
        type: "fast",
        hp: ENEMY_TYPES.fast.hp,
        speed: ENEMY_TYPES.fast.speed,
        shootTimer: 0,
      },
      {
        x: 200,
        y: 200,
        type: "tank",
        hp: ENEMY_TYPES.tank.hp,
        speed: ENEMY_TYPES.tank.speed,
        shootTimer: 0,
      },
    ],
    [
      {
        x: 100,
        y: 100,
        type: "fast",
        hp: ENEMY_TYPES.fast.hp,
        speed: ENEMY_TYPES.fast.speed,
        shootTimer: 0,
      },
      {
        x: 500,
        y: 400,
        type: "tank",
        hp: ENEMY_TYPES.tank.hp,
        speed: ENEMY_TYPES.tank.speed,
        shootTimer: 0,
      },
    ],
  ];
  enemies = rooms[currentRoom];
}
function draw(timestamp) {
  if (lastTime === 0) lastTime = timestamp;
  let dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (gameStage === "playing") {
    updatePlayer(dt);
    updateBullets(dt);
    updateEnemies(dt);
    updateEnemyBullets(dt);
    checkCollisions();
    checkRoomTransition();
    // Giới hạn vị trí người chơi trong canvas
    playerX = Math.max(0, Math.min(canvas.width - CONFIG.playerSize, playerX));
    playerY = Math.max(0, Math.min(canvas.height - CONFIG.playerSize, playerY));
  }
  // Vẽ người chơi
  ctx.fillStyle = "blue";
  ctx.fillRect(playerX, playerY, CONFIG.playerSize, CONFIG.playerSize);
  // Vẽ viên đạn
  bullets.forEach(function (bullet) {
    ctx.fillStyle = "red";
    ctx.fillRect(bullet.x, bullet.y, 5, 10);
  });
  enemyBullets.forEach(function (bullet) {
    ctx.fillStyle = "orange";
    ctx.fillRect(bullet.x, bullet.y, 5, 10);
  });
  // Vẽ kẻ thù
  enemies.forEach(function (enemy) {
    ctx.fillStyle = "green";
    ctx.fillRect(enemy.x, enemy.y, CONFIG.enemySize, CONFIG.enemySize);
  });
  // Vẽ vật phẩm hồi máu
  ctx.fillStyle = "pink";
  ctx.fillRect(healItem.x, healItem.y, 20, 20);
  drawHUD();
  // Bắt đầu vòng lặp vẽ tiếp theo
  requestAnimationFrame(draw);
}
const keys = {
  d: false,
  a: false,
  w: false,
  s: false,
};
document.addEventListener("keydown", function (event) {
  if (event.key === " ") {
    if (dashCooldownTimer <= 0) {
      dashTime = CONFIG.dashDuration;
      dashCooldownTimer = CONFIG.dashCooldown;
    }
  }
  if (event.key.toLocaleLowerCase() === "d") {
    keys.d = true;
    lastDirection = "right";
  }
  if (event.key.toLocaleLowerCase() === "a") {
    keys.a = true;
    lastDirection = "left";
  }
  if (event.key.toLocaleLowerCase() === "w") {
    keys.w = true;
    lastDirection = "up";
  }
  if (event.key.toLocaleLowerCase() === "s") {
    keys.s = true;
    lastDirection = "down";
  }
  if (event.key === "Enter") {
    if (gameStage !== "playing") {
      resetGame();
    }
  }
});
document.addEventListener("keyup", function (event) {
  if (event.key.toLocaleLowerCase() === "d") keys.d = false;
  if (event.key.toLocaleLowerCase() === "a") keys.a = false;
  if (event.key.toLocaleLowerCase() === "w") keys.w = false;
  if (event.key.toLocaleLowerCase() === "s") keys.s = false;
});
canvas.addEventListener("click", function () {
  let dx = 0;
  let dy = 0;

  if (lastDirection === "right") {
    dx = CONFIG.bulletSpeed;
    dy = 0;
  } else if (lastDirection === "left") {
    dx = -CONFIG.bulletSpeed;
    dy = 0;
  } else if (lastDirection === "up") {
    dx = 0;
    dy = -CONFIG.bulletSpeed;
  } else if (lastDirection === "down") {
    dx = 0;
    dy = CONFIG.bulletSpeed;
  }

  bullets.push({ x: playerX + 17.5, y: playerY, dx: dx, dy: dy });
});
requestAnimationFrame(draw);
