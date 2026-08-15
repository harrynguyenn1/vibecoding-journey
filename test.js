const THRESHOLD = 30;
let x1 = 10;
let x2 = 20;
let y1 = 30;
let y2 = 40;
function isColliding(x1,y1,x2,y2){
    if (Math.abs(x1 - x2) < THRESHOLD && Math.abs(y1 - y2) < THRESHOLD) 
        {return true;}
    else {return false};
} 
console.log(isColliding);
console.log(isColliding);