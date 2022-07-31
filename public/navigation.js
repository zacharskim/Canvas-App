import * as Caret from "./caret.js";
import * as Index from "./index.js";
import * as WBA from "./wordBlurbActions.js";
import { sprite } from "./sprite.js";
import { ViewPort } from "./viewport.js";
import * as Canvas from "./canvas.js";
import * as Utils from "./utils.js";

//kinda starting a navigationsection here...
//random naviagtion thoughts: modes will be normal typing / caret naviagtion within a wordblurb/greaterBlurb
//then naviagtion 1 which will be a free roaming octopus which turns into the caret if it hits a wordBlurb
//then naviagtion 2 which will be a thing that just sends you to the nearestBlurb in either the up/down/left/right
//directions...it also centers the viewport on

//in the future will implement like a fixed sidebar that contains info on text size and stuff like that (nav mode etc..)
const setNavMode = (e, currBlurbInfo) => {
  //hitting escape cycles you through the modes...
  //defualt mode is command mode...can navigate just like vim...well kinda...
  //can only switch modes from command mode too...
  //console.log(Caret.caret.navMode);
  if (e.key == "Escape") {
    //enter command mode
    Caret.caret.navMode = "command";
    Caret.caret.firstDraw = false;

    //console.log("ran??");
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
      pointsFiltered = points.filter(
        (pointObj) =>
          pointObj.wbId != wordBlurb.id && pointObj.point.x <= wordBlurb.startX
      );
      break;
    //should only fire when on edge...
    case "ArrowRight":
      pointsFiltered = points.filter(
        (pointObj) =>
          pointObj.wbId != wordBlurb.id && pointObj.point.x >= wordBlurb.endX
      );
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

const reCenter = () => {
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
    } else {
      //recenter....
      //console.log(currBlurbInfo[0]);
      let deltaX = currBlurbInfo[0].startX - window.innerWidth / 2;
      let deltaY = currBlurbInfo[0].startY - window.innerHeight / 2;
      console.log(deltaX, deltaY);
      currBlurbInfo[0].startX = window.innerWidth / 2;
      currBlurbInfo[0].startY = window.innerHeight / 2;

      //well for each wordBlurb except the one we just moved....
      let allButCurrBlurb = Index.words.filter((wb) => wb.currentBlurb != true);

      //console.log(Index.words);

      //i think deltay sign depends on if the wb is off the top or the bottom...
      //

      allButCurrBlurb.forEach((wb) => {
        wb.startX += deltaX;
        wb.startY += Math.abs(deltaY);
      });
      // console.log("post manipulation", Index.words);
    }
  }
};

export {
  handleArrowKey,
  setNavMode,
  moveCommandCaret,
  determineCollision,
  moveWordBlurbs,
  moveImages,
  moveImagesMouse,
  moveWordBlurbMouse,
  reCenter,
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

//ahh so right now the little guy moves and so do the wordBlurbs...

//i can have the little guy move and the wordblurbs stay still while he moves around them
//this is impossible...the viewport never really changes

//or i can have the little guy stay still and the wordBlurbs move around him...
//little guy must stay still pretty much forever...
//he can move as he get's close to wordBlurbs and then they must go still...
//otherwise they must be moving...

//i think i should take away the panable thing w/ the mouse...idk don't like 'moving' the canvas w/ the mouse...
