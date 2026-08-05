const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "blue";   
  ctx.fillRect(380, 280, 40, 40);
  requestAnimationFrame(draw);
}    
draw(); 