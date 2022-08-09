
sprite.SCALED_HEIGHT = sprite.SCALE * sprite.HEIGHT;
sprite.SCALED_WIDTH = sprite.SCALE * sprite.WIDTH;
let currentDirection = sprite.FACING_DOWN;
let currentLoopIndex = 0;
let frameCount = 0;
// let positionX = Caret.caret.currLocationLive.x;
// let positionY = Caret.caret.currLocationLive.y;
let img = new Image();
let img2 = new Image();

//see definitions vscode...extension?
let keyPresses = {};

const keyDownListener = (event) => {
  keyPresses[event.key] = true;
};

const keyUpListener = (event) => {
  keyPresses[event.key] = false;
};

let requestId;
const loadImage = () => {
  //  console.log("loading image...");
  img.src =
    "https://opengameart.org/sites/default/files/Green-Cap-Character-16x18.png";

  //source https://opengameart.org/content/grass-tileset-16x16
  img2.src =
    "https://opengameart.org/sites/default/files/grass_tileset_16x16_preview2_0.png";

  img.onload = function () {
    firstLoad();
    let requestId = window.requestAnimationFrame(gameLoop);
  };
  sprite.imgLoaded = true;
};

const firstLoad = () => {
  //might iterate on this so it's at the closest active word blurb or near the cursor...
  sprite.currLocation.x = Caret.caret.currLocationLive.x;
  sprite.currLocation.y = Caret.caret.currLocationLive.y;
  drawFrame(
    sprite.CYCLE_LOOP[currentLoopIndex],
    currentDirection, //the y i guess...
    Caret.caret.currLocationLive.x,
    Caret.caret.currLocationLive.y
  );
};

let nums = [];
for (let index = 0; index < 300; index++) {
  nums.push([
    Math.floor(Math.random() * 5000),
    Math.floor(Math.random() * 5000),
  ]);
}

const generatePlants = () => {
  for (let index = 0; index < 300; index++) {
    Index.ctx.drawImage(
      img2,
      195,
      10,
      80,
      125,
      nums[index][0],
      nums[index][1],
      80,
      80
    );
  }
};

const drawFrame = (frameX, frameY, canvasX, canvasY) => {
  //making canvasx and canvasy moot for the beginning???
  sprite.currLocation.x = canvasX;
  sprite.currLocation.y = canvasY;
  generatePlants();

  //Index.ctx.drawImage(img2, 195, 10, 80, 125, 100, 100, 80, 80);

  if (!sprite.hitBoundry)
    Index.ctx.drawImage(
      img,
      frameX * sprite.WIDTH,
      frameY * sprite.HEIGHT,
      sprite.WIDTH,
      sprite.HEIGHT,
      sprite.currLocation.x,
      sprite.currLocation.y,
      sprite.SCALED_WIDTH,
      sprite.SCALED_HEIGHT
    );
  //make it so this waits to fire until you release the wasd keys...
  else if (
    (sprite.hitBoundry || sprite.recentering) &&
    !Object.values(keyPresses).includes(true)
  ) {
    recenterViewPort();
    generatePlants();
    //    console.log("recentering..");
    Index.ctx.drawImage(
      img,
      frameX * sprite.WIDTH,
      frameY * sprite.HEIGHT,
      sprite.WIDTH,
      sprite.HEIGHT,
      sprite.currLocation.x,
      sprite.currLocation.y,
      sprite.SCALED_WIDTH,
      sprite.SCALED_HEIGHT
    );
    //lot of copy and paste but could get it to work without these 3 statments...
  } else {
    //lfg it was just an ordering thing...
    moveWordBlurbs(keyPresses);
    generatePlants();
    movePlants(keyPresses);

    Index.ctx.drawImage(
      img,
      frameX * sprite.WIDTH,
      frameY * sprite.HEIGHT,
      sprite.WIDTH,
      sprite.HEIGHT,
      sprite.currLocation.x,
      sprite.currLocation.y,
      sprite.SCALED_WIDTH,
      sprite.SCALED_HEIGHT
    );
    //this erases the sprite...in order to make the text move smoothly...
  }
};
let requestId2;
const gameLoop = () => {
  //only erase the canvas where the guy has been more or less...
  Index.ctx.clearRect(
    sprite.currLocation.x,
    sprite.currLocation.y,
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
    sprite.currLocation.x,
    sprite.currLocation.y
  );
  requestId2 = window.requestAnimationFrame(gameLoop);
};
//should button up this code at some point...

//
const moveCharacter = (deltaX, deltaY, direction) => {
  let vp = new ViewPort(Index.canvas);

  //edit panX and panY here then....
  let hitBoundry = vp.hitBoundry(
    sprite.currLocation.x,
    sprite.currLocation.y,
    sprite.SCALED_WIDTH,
    sprite.SCALED_HEIGHT
  );
  //don't allow movmemnt if hitting the viewport...
  if (sprite.currLocation.x + deltaX > 0 && !hitBoundry) {
    sprite.currLocation.x += deltaX;
  }
  if (sprite.currLocation.y + deltaY > 0 && !hitBoundry) {
    sprite.currLocation.y += deltaY;
  }
  sprite.hitBoundry = hitBoundry;
  sprite.direction = direction;
  currentDirection = direction;
};
//this function will put the sprite/nav mode back into the center of the
//viewport if the user hits the border of the view port...

//camera has a position and a viewport...

const EAST = { dx: 1, dy: 0 };
const WEST = { dx: -1, dy: 0 };
const SOUTH = { dx: 0, dy: 1 };
const NORTH = { dx: 0, dy: -1 };

const recenterViewPort = () => {
  //this function alctually moves the sprite and the plants too
  //and the wordBlurbs so that's kinda an issue...
  //actually recentering the sprite here to make it look like the viewport
  //is recentering...

  let vp = new ViewPort(Index.canvas);

  if (vp.cx - 16 > sprite.currLocation.x) {
    sprite.currLocation.x += 1;

    moveWorld(EAST);
  } else if (vp.cx - 16 < sprite.currLocation.x) {
    sprite.currLocation.x -= 1;

    moveWorld(WEST);
  } else {
  }
  if (vp.cy - 36 > sprite.currLocation.y) {
    sprite.currLocation.y += 1;
    moveWorld(SOUTH);
  } else if (vp.cy - 36 < sprite.currLocation.y) {
    sprite.currLocation.y -= 1;
    moveWorld(NORTH);
  } else {
  }

  //recenter accounting for sprite height and width etc..
  if (
    sprite.currLocation.x == Math.round(vp.cx - 16) &&
    sprite.currLocation.y == Math.round(vp.cy - 36)
  ) {
    sprite.hitBoundry = false;
    sprite.recentering = false;
  } else {
    sprite.recentering = true;
  }
  //lmao just threw this line in there,,, not really sure why it works
  //or if it breaks other things but it makes the bushes stop being blurry!

  //may abstract this function at some point, also sitll unsure if I'm using
  //abstract in the right way....
  Canvas.drawCanvas();
};

const moveWordBlurbs = (keyPresses) => {
  //write out more to determine how this function will work...

  //wb will always move, just the sprite will  move around the one's in the circle?
  //idk, write this out and figure out the implementation....

  if (keyPresses.w) {
    Index.words.forEach((wb) => {
      wb.startY += 1;
    });
  } else if (keyPresses.s) {
    Index.words.forEach((wb) => {
      wb.startY -= 1;
    });
  }
  if (keyPresses.a) {
    Index.words.forEach((wb) => {
      wb.startX += 1;
    });
  } else if (keyPresses.d) {
    Index.words.forEach((wb) => {
      wb.startX -= 1;
    });
  }

  //this is prolly erasing the sprite...this smooths out the wordblurbs...
  Canvas.drawCanvas();
};

const movePlants = (keyPresses) => {
  if (keyPresses.w) {
    for (let index = 0; index < 300; index++) {
      nums[index][1] += 1;
    }
  } else if (keyPresses.s) {
    for (let index = 0; index < 300; index++) {
      nums[index][1] -= 1;
    }
  }
  if (keyPresses.a) {
    for (let index = 0; index < 300; index++) {
      nums[index][0] += 1;
    }
  } else if (keyPresses.d) {
    for (let index = 0; index < 300; index++) {
      nums[index][0] -= 1;
    }
  }
};

const moveWorld = ({ dx, dy }) => {
  //moving bushes...
  for (let index = 0; index < 300; index++) {
    nums[index][0] += dx;
    nums[index][1] += dy;
  }
  //moving wordBlurbs....
  Index.words.forEach((wb) => {
    wb.startX += dx;
    wb.startY += dy;
  });
};