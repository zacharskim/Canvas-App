import * as Index from "./index.js";

// last known position
var pos = { x: 0, y: 0 };

// new position from mouse event
function setPosition(e) {
  pos.x = e.clientX;
  pos.y = e.clientY;
  console.log("this running?????");
}

// resize canvas
function resize() {
  Index.ctx.canvas.width = window.innerWidth;
  Index.ctx.canvas.height = window.innerHeight;
}

function draw(e) {
  // mouse left button must be pressed
  console.log("RUNNING???");
  if (e.buttons !== 1) return;

  Index.ctx.beginPath(); // begin

  Index.ctx.lineWidth = 5;
  Index.ctx.lineCap = "round";
  Index.ctx.strokeStyle = "#c0392b";

  Index.ctx.moveTo(pos.x, pos.y); // from
  setPosition(e);
  Index.ctx.lineTo(pos.x, pos.y); // to

  Index.ctx.stroke(); // draw it!
}

export { draw, resize, setPosition, pos };
