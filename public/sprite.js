const sprite = {
  SCALE: 2,
  WIDTH: 16,
  HEIGHT: 18,
  SCALED_WIDTH: 0, //SCALE * WIDTH,
  SCALED_HEIGHT: 0, //SCALE * HEIGHT,
  CYCLE_LOOP: [0, 1, 0, 2],
  FACING_DOWN: 0,
  FACING_UP: 1,
  FACING_LEFT: 2,
  FACING_RIGHT: 3,
  FRAME_LIMIT: 12, //instead of drawing 60 times a second we draw every 12 animate requests frames...
  MOVEMENT_SPEED: 5,
  imgLoaded: false,
};

//code is adapted/from here: https://dev.to/martyhimmel/moving-a-sprite-sheet-character-with-javascript-3adg

export { sprite };
