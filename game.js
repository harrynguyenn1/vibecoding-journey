    // Lấy canvas và context
const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
    // Vị trí ban đầu của người chơi
let playerX = 380;
let playerY = 280;
let playerHP = 10;
let healItem = {x: 650, y: 500, width: 20, height: 20};
// Mảng để lưu trữ các viên đạn và kẻ thù
let bullets = [];
// Mảng các phòng và kẻ thù trong từng phòng
let rooms = [
  [{x:600, y: 300, hp: 3}, {x: 200, y: 200, hp: 3}],
  [{x: 100, y: 100, hp: 3}, {x: 500, y: 400, hp: 3}]
];
let currentRoom = 0;
let enemies = rooms[currentRoom];
// Biến để lưu hướng di chuyển cuối cùng của người chơi
let lastDirection = "right";
    // Tốc độ di chuyển của người chơi
const speed = 3; 
    // Hàm vẽ và cập nhật vị trí người chơi
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Cập nhật vị trí người chơi dựa trên các phím được nhấn
  if (keys.d) playerX += speed;
  if (keys.a) playerX -= speed;
  if (keys.w) playerY -= speed;
  if (keys.s) playerY += speed;
  // Giới hạn vị trí người chơi trong canvas
  playerX = Math.max(0, Math.min(canvas.width - 40, playerX));
  playerY = Math.max(0, Math.min(canvas.height - 40, playerY));
  // Vẽ người chơi
  ctx.fillStyle = "blue";   
  ctx.fillRect(playerX, playerY, 40, 40);
  // Vẽ viên đạn
  bullets = bullets.filter(function (bullet) {
    return bullet.y > 0;
  });
  bullets.forEach(function (bullet) {
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;
    ctx.fillStyle = "red";
    ctx.fillRect(bullet.x, bullet.y, 5, 10);
  });
  // Vẽ kẻ thù
  enemies.forEach(function (enemy) {
    ctx.fillStyle = "green";
    ctx.fillRect(enemy.x, enemy.y, 40, 40);
  });
  // Vẽ vật phẩm hồi máu
  ctx.fillStyle = "pink";
  ctx.fillRect(healItem.x, healItem.y, 20, 20);
  // Kiểm tra va chạm giữa người chơi và vật phẩm hồi máu
  if (Math.abs(playerX - healItem.x) < 30 && Math.abs(playerY - healItem.y) < 30) {
    playerHP = Math.min(playerHP + 1, 10);
    healItem.x = -100; // Di chuyển vật phẩm ra khỏi màn hình sau khi được nhặt
  }
  // Kiểm tra va chạm giữa viên đạn và kẻ thù
  let hitBullets = [];
  let hitEnemies = [];
  bullets.forEach(function (bullet) {
    enemies.forEach(function (enemy)  {   
      if (Math.abs(bullet.x - enemy.x) < 30 && Math.abs(bullet.y - enemy.y) < 30) {
        hitBullets.push(bullet);
        // Giảm máu của kẻ thù khi bị trúng đạn
        enemy.hp -= 1;
        if (enemy.hp <= 0) {
          hitEnemies.push(enemy);
        }
      }
    });
  });
// Loại bỏ các viên đạn và kẻ thù đã bị trúng đạn
  bullets = bullets.filter(function (bullet) {
    return !hitBullets.includes(bullet);
  });
  enemies = enemies.filter(function (enemy) {
    return !hitEnemies.includes(enemy);
  });
  // Hiển thị máu của người chơi
  ctx.font = "20px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.fillText("HP: " + playerHP, 20, 30);
  // Hiển thị thông báo khi người chơi chiến thắng
  if (enemies.length === 0) {
    currentRoom++;
    if (currentRoom < rooms.length) {
      enemies = rooms[currentRoom];
    } else {
      ctx.font = "40px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText("You Win!", canvas.width / 2, canvas.height / 2);
    }
  }
  // Bắt đầu vòng lặp vẽ tiếp theo
  requestAnimationFrame(draw);
}   
    // Đối tượng để lưu trạng thái các phím
const keys = {
  d: false,
  a: false,
  w: false,
  s: false
};
    // Lắng nghe sự kiện nhấn phím     
document.addEventListener("keydown", function (event) {
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
  let pressedKey = event.key.toLocaleLowerCase(); 
});
    // Lắng nghe sự kiện thả phím
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
    dx = 5;
    dy = 0;
  } else if (lastDirection === "left") {
    dx = -5;
    dy = 0;
  } else if (lastDirection === "up") {
    dx = 0;
    dy = -5;
  } else if (lastDirection === "down") {
    dx = 0;
    dy = 5;
  }

  bullets.push({ x: playerX + 17.5, y: playerY, dx: dx, dy: dy });
}); 
    // Bắt đầu vòng lặp vẽ
draw(); 