import * as Caret from "./caret.js";
import * as Index from "./index.js";

//kinda starting a navigationsection here...
//random naviagtion thoughts: modes will be normal typing / caret naviagtion within a wordblurb/greaterBlurb
//then naviagtion 1 which will be a free roaming octopus which turns into the caret if it hits a wordBlurb
//then naviagtion 2 which will be a thing that just sends you to the nearestBlurb in either the up/down/left/right
//directions...it also centers the viewport on

const setNavMode = () => {};

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

//random thought...uncerttaintiy when it comes to coding makes me freeze up...
//similar to fear of failure etc....

export { handleArrowKey };

//known nav bugs right now...
