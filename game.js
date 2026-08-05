const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
    // Vị trí ban đầu của người chơi
let playerX = 380;
let playerY = 280;
    // Tốc độ di chuyển của người chơi
const speed = 3; 
    // Hàm vẽ và cập nhật vị trí người chơi
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Cập nhật vị trí dựa vào phím đang được giữ
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
  if (event.key.toLocaleLowerCase() === "d") keys.d = true;
  if (event.key.toLocaleLowerCase() === "a") keys.a = true;
  if (event.key.toLocaleLowerCase() === "w") keys.w = true;
  if (event.key.toLocaleLowerCase() === "s") keys.s = true;
});
    // Lắng nghe sự kiện thả phím
document.addEventListener("keyup", function (event) {
  if (event.key.toLocaleLowerCase() === "d") keys.d = false;
  if (event.key.toLocaleLowerCase() === "a") keys.a = false;
  if (event.key.toLocaleLowerCase() === "w") keys.w = false;
  if (event.key.toLocaleLowerCase() === "s") keys.s = false;
});
    // Bắt đầu vòng lặp vẽ
draw(); 