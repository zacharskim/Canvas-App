import * as Caret from "./caret.js";
import * as Index from "./index.js";
import * as WBA from "./wordBlurbActions.js";
import * as Utils from "./utils.js";

const setNavMode = (e, currBlurbInfo) => {
  //hitting escape cycles you through the modes...
  //defualt mode is command mode...can navigate just like vim...well kinda...
  //can only switch modes from command mode too...
  //console.log(Caret.caret.navMode);
  if (e.key == "Escape") {
    //enter command mode
    Caret.caret.navMode = "command";
    Caret.caret.firstDraw = false;

    Index.ctx.font = "16px Times New Roman";
    Index.ctx.fillStyle = "white";
    Index.ctx.textBaseline = "hanging";
    //hide cursor
    document.documentElement.style.cursor = "none";
  } else if (e.keyCode == 73 && Caret.caret.navMode == "command") {
    //i or I
    //enter insert mode...
    Caret.caret.navMode = "insert";
    Caret.caret.firstDraw = false;
    //not the best way to create a blurb but i guess it works...
    WBA.createBlurb();
  } else if (e.keyCode == 87 && Caret.caret.navMode == "command") {
    //w or W
    Caret.caret.navMode = "draw";
    //will need to spend some time determining how to make the drawing persist, how to erase the drawing, and how to
  } else if (e.keyCode == 77 && Caret.caret.navMode == "command") {
    //o or O
    Caret.caret.navMode = "mouse";

    document.documentElement.style.cursor = "default";
  }
};

//use the linked function from some other file??? NOTE...
//this has bugs right now,,, goes to nearest blurb but needs to go to nearest
//blurb in the direction that we're 'walking'

//consider using a modifier key to move l and r from wordBlurbs
const getNearestBlurb = (wordBlurb, e) => {
  //so we are given a blurb, and it's assumed that we have the caret locaiton...
  //define the currentCursor location in terms of xy coords
  let currentCursor = {
    x:
      typeof wordBlurb.cursorLocations[Caret.caret.index] != "undefined"
        ? wordBlurb.cursorLocations[Caret.caret.index]
        : wordBlurb.startX,
    y: wordBlurb.startY,
  };

  //console.log("starting point blurb..", currentCursor);

  let possibleCaretPositions = [];
  Index.words.forEach((wb) => {
    wb.cursorLocations.forEach((loc) =>
      possibleCaretPositions.push({ x: loc, y: wb.startY, wbId: wb.id })
    );
  });

  let points = determineNearestxyPoints(currentCursor, possibleCaretPositions);
  let pointsFiltered = [];

  //only consider wordBlurbs in certain directions....
  switch (e.key) {
    case "ArrowUp":
      pointsFiltered = points.filter(
        (pointObj) =>
          pointObj.wbId != wordBlurb.id && pointObj.point.y <= wordBlurb.startY
      );
      break;

    case "ArrowDown":
      pointsFiltered = points.filter(
        (pointObj) =>
          pointObj.wbId != wordBlurb.id && pointObj.point.y >= wordBlurb.startY
      );
      break;

    case "ArrowLeft":
      //console.log("ran???");
      if (e.altKey) {
        pointsFiltered = points.filter(
          (pointObj) =>
            pointObj.wbId != wordBlurb.id &&
            pointObj.point.x <= wordBlurb.startX
        );
      }
      break;
    //should only fire when on edge...
    case "ArrowRight":
      if (e.altKey) {
        pointsFiltered = points.filter(
          (pointObj) =>
            pointObj.wbId != wordBlurb.id && pointObj.point.x >= wordBlurb.endX
        );
      }
      break;

    default:
      break;
  }
  //console.log(pointsFiltered, "these points are filted now...");
  return pointsFiltered[0];
};

//only handles up and down arrows right now....
const handleArrowKey = (wordBlurb, e) => {
  //should this return the nearestBlurb id??
  let nearestBlurbObj = getNearestBlurb(wordBlurb, e);
  console.log("ran...");
  //console.log(nearestBlurbObj, "apprently the nearest blurb...");
  //console.log(wordBlurb, "currBlurb");
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
    //console.log("easy fix lfg", Index.words);
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

const moveCommandCaret = (e) => {
  if (!Caret.caret.vimCaretinBlurb) {
    switch (e.key) {
      case "h":
        Caret.caret.vimCaretLoc.x -= 8;
        break;

      case "j":
        Caret.caret.vimCaretLoc.y += 18;
        break;

      case "k":
        Caret.caret.vimCaretLoc.y -= 18;
        break;
      case "l":
        Caret.caret.vimCaretLoc.x += 8;
        break;

      default:
        break;
    }
  } else {
    //get the nearest point...then start moving around list that way...
    switch (e.key) {
      case "h":
        Caret.caret.vimIndex -= 1;
        break;

      case "j":
        Caret.caret.vimCaretLoc.y += 18;
        break;

      case "k":
        Caret.caret.vimCaretLoc.y -= 18;
        break;
      case "l":
        Caret.caret.vimIndex += 1;
        break;

      default:
        break;
    }
  }
};

const determineCollision = (currBlurb) => {
  //this neeeds a little work...
  //console.log(currBlurb);
  if (typeof currBlurb != "undefined") {
    Caret.caret.vimCaretinBlurb = currBlurb.boundingBox.contains(
      Caret.caret.vimCaretLoc.x,
      Caret.caret.vimCaretLoc.y
    );
  }
};

const moveWordBlurbs = (e) => {
  if (e.shiftKey && Caret.caret.navMode == "command") {
    switch (e.keyCode) {
      case 75: //k
        Index.words.forEach((wb) => {
          wb.startX += 0;
          wb.startY += 18;
        });

        break;
      case 74: //j
        Index.words.forEach((wb) => {
          wb.startX += 0;
          wb.startY -= 18;
        });

        break;
      case 72: //h
        Index.words.forEach((wb) => {
          wb.startX += 9;
          wb.startY += 0;
        });

        break;
      case 76: //l
        Index.words.forEach((wb) => {
          wb.startX -= 9;
          wb.startY += 0;
        });

        break;

      default:
        break;
    }
    Utils.determineWordBlurbMetrics(Index.words);
  }
  //need to consider implications now...the word blurbs stats need to be updated...
};

const moveImages = (e) => {
  if (e.shiftKey && Caret.caret.navMode == "command") {
    switch (e.keyCode) {
      case 75: //k
        Index.images.forEach((imgObj) => {
          imgObj.x += 0;
          imgObj.y += 18;
        });

        break;
      case 74: //j
        Index.images.forEach((imgObj) => {
          imgObj.x += 0;
          imgObj.y -= 18;
        });

        break;
      case 72: //h
        Index.images.forEach((imgObj) => {
          imgObj.x += 9;
          imgObj.y += 0;
        });

        break;
      case 76: //l
        Index.images.forEach((imgObj) => {
          imgObj.x -= 9;
          imgObj.y += 0;
        });

        break;

      default:
        break;
    }
    Utils.determineWordBlurbMetrics(Index.words);
  }
};

const determineCurrImage = () => {
  let currImage;

  Index.images.forEach((imgObj) => {
    if (
      imgObj.x <= Caret.caret.currLocationLive.x &&
      Caret.caret.currLocationLive.x <= imgObj.x + imgObj.img.naturalWidth &&
      imgObj.y <= Caret.caret.currLocationLive.y &&
      Caret.caret.currLocationLive.y <= imgObj.y + imgObj.img.naturalHeight
    ) {
      currImage = imgObj;
      Caret.caret.imageSelected = true;
    }
  });
  return currImage;
};

const moveImagesMouse = (e) => {
  let currImage = determineCurrImage();

  if (
    Caret.caret.mouseDown &&
    Caret.caret.navMode == "mouse" &&
    typeof currImage != "undefined"
  ) {
    //move image coords depending on where mouse moves...
    currImage.x += Caret.caret.deltaX;
    currImage.y += Caret.caret.deltaY;
  }
};

const moveWordBlurbMouse = (e) => {
  let currBlurbInfo = Utils.getCurrentBlurb();

  if (
    Caret.caret.mouseDown &&
    Caret.caret.navMode == "mouse" &&
    typeof currBlurbInfo[0] != "undefined"
  ) {
    let newCursorLocations = currBlurbInfo[0].cursorLocations.map(
      (loc) => loc + Caret.caret.deltaX
    );

    currBlurbInfo[0].cursorLocations = newCursorLocations;
    currBlurbInfo[0].startX += Caret.caret.deltaX;
    currBlurbInfo[0].startY += Caret.caret.deltaY;
  }
};

//use this to determine what to draw....
const determineObjectsOnScreen = () => {
  let onScreenObj = [];
  Index.words.forEach((wb) => {
    //check if
  });

  Index.images.forEach((imgObj) => {});
};

const reCenterAll = () => {
  //if the user attempts to move the cursor to a wordBlurb off screen,
  //then we  will recenter the screen so that wordBlurb is now in the center...
  let currBlurbInfo = Utils.getCurrentBlurb();

  if (typeof currBlurbInfo[0] != "undefined") {
    if (
      0 <= currBlurbInfo[0].cursorLocations[Caret.caret.index] &&
      currBlurbInfo[0].cursorLocations[Caret.caret.index] <=
        window.innerWidth &&
      0 <= currBlurbInfo[0].startY &&
      currBlurbInfo[0].startY <= window.innerHeight
    ) {
      //do nothing if the wb is on the screen....
    } else {
      //recenter....might change from center to like top left so
      //it is more like a normal piece of paper etc...
      let deltaX = window.innerWidth / 2 - currBlurbInfo[0].startX;
      let deltaY = window.innerHeight / 2 - currBlurbInfo[0].startY;

      Index.words.forEach((wb) => {
        wb.startX += deltaX;
        wb.startY += deltaY;
      });

      Utils.determineWordBlurbMetrics(Index.words);
    }
  }
};

const reCenter = (e, currBlurbInfo) => {
  if (typeof currBlurbInfo[0] != "undefined" && e.metaKey && e.key == "z") {
    let deltaX = window.innerWidth / 2 - currBlurbInfo[0].startX;
    let deltaY = window.innerHeight / 2 - currBlurbInfo[0].startY;

    Index.words.forEach((wb) => {
      wb.startX += deltaX;
      wb.startY += deltaY;
    });
  }
  Utils.determineWordBlurbMetrics(Index.words);
};

//8/4 most recent todo list....

//consider refactoring /updating the nav system? Do i want a viewport scroll or
// ? maybe just a way to visualize the map...

//have a way to group wordblurbs withn a document...and like easily nav between groups
//have a way to move nav quicker than 18px at a time...

//fix formatting in the future...spend some time diagramming this out/planning it...
//add in cut
//fix selection
//add in undo/redo..
//handle enter mid wordblurb
//handle double click on wordblurb...(selection etc...)
//fix selection being off by one...
//move in x direction with a modifier key...
//pasting bug: does not paste into a wordblurb but creates it's own...

//random thought - remove mousemode? just toggle on and off mouse?? This seems like a good direction
//to move in....

export {
  handleArrowKey,
  setNavMode,
  moveCommandCaret,
  determineCollision,
  moveWordBlurbs,
  moveImages,
  moveImagesMouse,
  moveWordBlurbMouse,
  reCenterAll,
  reCenter,
};

//app that visualizes current citi bike locations etc on a map and then text you when an e-bike is availbe maybe?? idk...
