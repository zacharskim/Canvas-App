var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.strokeStyle = "lightgray";

var canvasOffset = $("#canvas").offset();
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top;

var mouseIsDown = false;
var lastX = 0;
var lastY = 0;

makeShip(20, 100, 30, 25, "skyblue");
makeShip(20, 170, 50, 25, "salmon");
makeShip(20, 240, 30, 25, "salmon");

function makeShip(x, y, width, height, fill) {
  var ship = {
    x: x,
    y: y,
    width: width,
    height: height,
    right: x + width,
    bottom: y + height,
    fill: fill,
  };
  ships.push(ship);
  return ship;
}

drawAllShips();

function drawAllShips() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < ships.length; i++) {
    var ship = ships[i];
    drawShip(ship);
    ctx.fillStyle = ship.fill;
    ctx.fill();
    ctx.stroke();
  }
}

function drawShip(ship) {
  ctx.beginPath();
  ctx.moveTo(ship.x, ship.y);
  ctx.lineTo(ship.right, ship.y);
  ctx.lineTo(ship.right + 10, ship.y + ship.height / 2);
  ctx.lineTo(ship.right, ship.bottom);
  ctx.lineTo(ship.x, ship.bottom);
  ctx.closePath();
}

function handleMouseDown(e) {
  mouseX = parseInt(e.clientX - offsetX);
  mouseY = parseInt(e.clientY - offsetY);

  // mousedown stuff here
  lastX = mouseX;
  lastY = mouseY;
  mouseIsDown = true;
}

function handleMouseUp(e) {
  mouseX = parseInt(e.clientX - offsetX);
  mouseY = parseInt(e.clientY - offsetY);

  // mouseup stuff here
  mouseIsDown = false;
}

function handleMouseMove(e) {
  if (!mouseIsDown) {
    return;
  }

  mouseX = parseInt(e.clientX - offsetX);
  mouseY = parseInt(e.clientY - offsetY);

  // mousemove stuff here
  for (var i = 0; i < ships.length; i++) {
    var ship = ships[i];
    drawShip(ship);
    //if (ctx.isPointInPath(lastX, lastY)) {
    ship.x += mouseX - lastX;
    ship.y += mouseY - lastY;
    ship.right = ship.x + ship.width;
    ship.bottom = ship.y + ship.height;
    // }
  }
  lastX = mouseX;
  lastY = mouseY;
  drawAllShips();
}

//jquery stuff i think...
$("#canvas").mousedown(function (e) {
  handleMouseDown(e);
});
$("#canvas").mousemove(function (e) {
  handleMouseMove(e);
});
$("#canvas").mouseup(function (e) {
  handleMouseUp(e);
});
