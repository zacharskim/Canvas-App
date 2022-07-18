import * as Caret from "./caret.js";
import * as Index from "./index.js";
import { sprite } from "./sprite.js";
//kinda starting a navigationsection here...
//random naviagtion thoughts: modes will be normal typing / caret naviagtion within a wordblurb/greaterBlurb
//then naviagtion 1 which will be a free roaming octopus which turns into the caret if it hits a wordBlurb
//then naviagtion 2 which will be a thing that just sends you to the nearestBlurb in either the up/down/left/right
//directions...it also centers the viewport on

//in the future will implement like a fixed sidebar that contains info on text size and stuff like that (nav mode etc..)
const setNavMode = (e) => {
  //hitting escape cycles you through the modes...
  //defualt mode is command mode...can navigate just like vim...well kinda...
  //can only switch modes from command mode too...

  if (e.key == "Escape") {
    //enter command mode
    Caret.caret.navMode = "command";

    console.log("removed eventlistner..");
    window.removeEventListener("keydown", keyDownListener);
    window.removeEventListener("keyup", keyUpListener);

    cancelAnimationFrame(requestId);
    cancelAnimationFrame(requestId2);
  } else if (e.keyCode == 73 && Caret.caret.navMode == "command") {
    //i or I
    //enter insert mode...
    Caret.caret.navMode = "insert";
  } else if (e.keyCode == 87 && Caret.caret.navMode == "command") {
    //w or W
    Caret.caret.navMode = "draw";
  } else if (e.keyCode == 79 && Caret.caret.navMode == "command") {
    //o or O
    Caret.caret.navMode = "octopus";
  }
};

//use the linked function from some other file??? NOTE...
//this has bugs right now,,, goes to nearest blurb but needs to go to nearest
//blurb in the direction that we're 'walking'
const getNearestBlurb = (wordBlurb, e) => {
  //so we are given a blurb, and it's assumed that we have the caret locaiton...
  //define the currentCursor location in terms of xy coords
  let currentCursor = {
    x: wordBlurb.cursorLocations[Caret.caret.index],
    y: wordBlurb.startY,
  };
  console.log(e);

  //check if currBlurb has a prevBlurb or nextBlurb
  //(we know up arrow sends us to prevBlurb and down arrow sends us to nextBlurb)
  //otherwise... we need to determine the closest to the currentCursor
  if (wordBlurb.nextBlurb && e.key == "ArrowDown") {
    //the following code is kinda copy and pastey and might not need to be split out but
    //it allows us to generate the next cursor location/nearest blurb quicker...
    let possibleCaretPositions = [];
    wordBlurb.nextBlurb.cursorLocations.forEach((loc) =>
      possibleCaretPositions.push({
        x: loc,
        y: wordBlurb.startY,
        wbId: wordBlurb.nextBlurb.id,
      })
    );

    let points = determineNearestxyPoints(
      currentCursor,
      possibleCaretPositions
    );

    //just double checking kinda not really needed but...
    let pointsFiltered = points.filter(
      (pointObj) => pointObj.wbId != wordBlurb.id
    );

    return pointsFiltered[0];
  } else if (wordBlurb.prevBlurb && e.key == "ArrowUp") {
    let possibleCaretPositions = [];
    wordBlurb.prevBlurb.cursorLocations.forEach((loc) =>
      possibleCaretPositions.push({
        x: loc,
        y: wordBlurb.startY,
        wbId: wordBlurb.prevBlurb.id,
      })
    );

    let points = determineNearestxyPoints(
      currentCursor,
      possibleCaretPositions
    );

    let pointsFiltered = points.filter(
      (pointObj) => pointObj.wbId != wordBlurb.id
    );

    return pointsFiltered[0];
  } else {
    //kinda just want to adapt this so it works w/ every wb??
    let possibleCaretPositions = [];
    Index.words.forEach((wb) => {
      wb.cursorLocations.forEach((loc) =>
        possibleCaretPositions.push({ x: loc, y: wb.startY, wbId: wb.id })
      );
    });

    let points = determineNearestxyPoints(
      currentCursor,
      possibleCaretPositions
    );
    let pointsFiltered = points.filter(
      (pointObj) => pointObj.wbId != wordBlurb.id
    );
    console.log(points, "points...");
    console.log(wordBlurb.id);
    return pointsFiltered[0];
  }
};

const handleArrowKey = (wordBlurb, e) => {
  //should this return the nearestBlurb id??
  let nearestBlurbObj = getNearestBlurb(wordBlurb, e);
  console.log(nearestBlurbObj, "DAT OBJECT");
  console.log(wordBlurb, "currBlurb");
  Index.words.forEach((wb) => (wb.currentBlurb = false));
  if (typeof nearestBlurbObj != "undefined") {
    let newBlurb = Index.words.filter((wb) => wb.id == nearestBlurbObj.wbId);
    let newCaretIndex = newBlurb[0].cursorLocations.indexOf(
      nearestBlurbObj.point.x
    );
    Caret.caret.index = newCaretIndex;
    newBlurb[0].currentBlurb = true;
  } else {
    wordBlurb.currentBlurb = true;
    console.log("easy fix lfg", Index.words);
  }

  //update these things so that the caret works correctly....
};

//just brute forcing this for now, might try to implement something more elgant/fun like a
//k-d tree at somepoint
const determineNearestxyPoints = (currentCursor, possibleCaretPositions) => {
  let distArr = [];
  possibleCaretPositions.forEach((possiblePoint) => {
    let dist =
      Math.pow(currentCursor.x - possiblePoint.x, 2) +
      Math.pow(currentCursor.y - possiblePoint.y, 2);
    distArr.push({
      distance: dist,
      point: { x: possiblePoint.x, y: possiblePoint.y },
      wbId: possiblePoint.wbId,
    });
  });
  distArr.sort((a, b) => a.distance - b.distance);
  return distArr;
};

//so a user might hit the up arrow key...we can register the caret location at that time
//and search for the closest point from there...

//ehh will refactor these to be more eloquent at a later date...
var panX = 0;
var panY = 0;
var oldMouseX = 0;
var oldMouseY = 0;

const handleMouseMove = (e) => {
  let bounds = Index.canvas.getBoundingClientRect();
  let mouseX = e.clientX - bounds.left;
  let mouseY = e.clientY - bounds.top;

  if (Caret.caret.mouseDown) {
    panX += oldMouseX - mouseX;
    panY += oldMouseY - mouseY;
  }
  oldMouseX = mouseX;
  oldMouseY = mouseY;
};

//sprite/octopus nav mode...

//tweak sprite
sprite.SCALED_HEIGHT = sprite.SCALE * sprite.HEIGHT;
sprite.SCALED_WIDTH = sprite.SCALE * sprite.WIDTH;
let currentDirection = sprite.FACING_DOWN;
let currentLoopIndex = 0;
let frameCount = 0;
let positionX = 0;
let positionY = 0;
let img = new Image();

let keyPresses = {};

const keyDownListener = (event) => {
  keyPresses[event.key] = true;
};

const keyUpListener = (event) => {
  keyPresses[event.key] = false;
};
let requestId;
const loadImage = () => {
  console.log("loading image...");
  img.src =
    "https://opengameart.org/sites/default/files/Green-Cap-Character-16x18.png";
  img.onload = function () {
    let requestId = window.requestAnimationFrame(gameLoop);
  };
  sprite.imgLoaded = true;
};

const deLoadImage = () => {
  sprite.imgLoaded = false;
  console.log("dawg...", positionX, positionY);
  Index.ctx.fillRect(
    positionX,
    positionY,
    sprite.WIDTH + 18,
    sprite.HEIGHT + 18
  );
};

const drawFrame = (frameX, frameY, canvasX, canvasY) => {
  console.log("drawing image...");
  Index.ctx.drawImage(
    img,
    frameX * sprite.WIDTH,
    frameY * sprite.HEIGHT,
    sprite.WIDTH,
    sprite.HEIGHT,
    canvasX,
    canvasY,
    sprite.SCALED_WIDTH,
    sprite.SCALED_HEIGHT
  );
};
let requestId2;
const gameLoop = () => {
  //only erase the canvas where the guy has been more or less...
  Index.ctx.clearRect(
    positionX,
    positionY,
    sprite.WIDTH + 18,
    sprite.HEIGHT + 18
  ); //ehh need to handle this...maybe only clear the sprite location??

  let hasMoved = false;

  if (keyPresses.w) {
    moveCharacter(0, -sprite.MOVEMENT_SPEED, sprite.FACING_UP);

    hasMoved = true;
  } else if (keyPresses.s) {
    moveCharacter(0, sprite.MOVEMENT_SPEED, sprite.FACING_DOWN);
    hasMoved = true;
  }

  if (keyPresses.a) {
    moveCharacter(-sprite.MOVEMENT_SPEED, 0, sprite.FACING_LEFT);
    hasMoved = true;
  } else if (keyPresses.d) {
    moveCharacter(sprite.MOVEMENT_SPEED, 0, sprite.FACING_RIGHT);
    hasMoved = true;
  }

  if (hasMoved) {
    frameCount++;

    if (frameCount >= sprite.FRAME_LIMIT) {
      frameCount = 0;
      currentLoopIndex++;
      if (currentLoopIndex >= sprite.CYCLE_LOOP.length) {
        currentLoopIndex = 0;
      }
    }
  }

  if (!hasMoved) {
    currentLoopIndex = 0;
  }

  drawFrame(
    sprite.CYCLE_LOOP[currentLoopIndex],
    currentDirection, //the y i guess...
    positionX,
    positionY
  );
  requestId2 = window.requestAnimationFrame(gameLoop);
};

//need to edit this too...
const moveCharacter = (deltaX, deltaY, direction) => {
  if (
    positionX + deltaX > 0 &&
    positionX + sprite.SCALED_WIDTH + deltaX < Index.canvas.width
  ) {
    positionX += deltaX;
  }
  if (
    positionY + deltaY > 0 &&
    positionY + sprite.SCALED_HEIGHT + deltaY < Index.canvas.height
  ) {
    positionY += deltaY;
  }
  currentDirection = direction;
};

export {
  handleArrowKey,
  handleMouseMove,
  panX,
  panY,
  setNavMode,
  keyDownListener,
  keyUpListener,
  loadImage,
  deLoadImage,
};

//known nav bugs right now...

//code from SO, maybe make the user hold for for a sec if they want to move a wordblurb...or we could just make them switch modes...duh...
//drawing mode? or?
// selector.addEventListener("mousedown", function (event) {
//   // simulating hold event
//   setTimeout(function () {
//     // You are now in a hold state, you can do whatever you like!
//   }, 500);
// });

//uhh spend some time writing and planning out your days remaing at RC this afternoon/later...
