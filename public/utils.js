import * as Index from "./index.js";
import * as Caret from "./caret.js";
import { WordBlurb } from "./wordBlurb.js";
import { generateCursorLocations } from "./wordBlurbActions.js";

const getCurrentBlurb = () => {
  let currentBlurb = Index.words.filter((blurb) => blurb.currentBlurb);
  let currBlurbIndex = Index.words.findIndex(
    (blurb) => blurb.id == currentBlurb[0].id
  );

  return [currentBlurb[0], currBlurbIndex];
};

const binarySearch = (found, target) => {
  //console.log(target, found.cursorLocations);
  let l = 0;
  let r = found.cursorLocations.length - 1;

  while (l <= r) {
    var mid = Math.round((l + r) / 2);
    if (found.cursorLocations[mid] < target) {
      l = mid + 1;
    } else if (found.cursorLocations[mid] > target) {
      r = mid - 1;
    } else {
      return mid;
    }
  }
  //plus one to mid just makes sense for a text editor and seems a little more accurate on average tbh...
  return mid;
};

//TODO add something to find the nearest number given a target number...(might fix the funky cursor...)

const getClosestIndex = (target, arr) => {
  if (arr.length > 0) {
    const res = arr.reduce(function (prev, curr) {
      return Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;
    });

    return arr.indexOf(res);
  }
};

const getClosestInt = (target, arr) => {
  const res = arr.reduce(function (prev, curr) {
    return Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;
  });

  return res;
};

const adjustWordBlurbWidth = () => {
  //only allow greater wordBlurbs to be adjusted together...
  //indvidual wordblourbs can be adjusted by themselves...
};

//need to fix duplicate letters +
const handleLengthyOutsideText = () => {
  let tempCharList = Caret.caret.outsideText.split("");
  let i = 0;
  let tempStr = "";
  let output = [];
  while (i <= tempCharList.length) {
    tempStr += tempCharList[i];
    let textMetrics = Index.ctx.measureText(tempStr);

    //mostly just modify these lines of code to dynamically shape wordBlurb...
    if (textMetrics.width >= 400 && output.length == 0) {
      //create a wordBlurb with the first ~400 chunk
      //set tempstr to '' again

      //need to check for collisions at some point...
      output.push(
        new WordBlurb(Caret.caret.vimCaretLoc.x, Caret.caret.vimCaretLoc.y)
      );
      output.at(-1).str = tempStr;
      output.at(-1).charList = tempStr.split("");
      tempStr = "";
    } else if (textMetrics.width >= 400) {
      //console.log(output);
      output.push(
        new WordBlurb(output.at(-1).startX, output.at(-1).startY + 18)
      );
      output.at(-1).str = tempStr;
      output.at(-1).charList = tempStr.split("");
      tempStr = "";
    } else {
      i += 1;
    }
  }
  output.push(new WordBlurb(output.at(-1).startX, output.at(-1).startY + 18));
  output.at(-1).str = tempStr;
  output.at(-1).charList = tempStr.split("");

  determineWordBlurbMetrics(output);
  //set currentBlurb to false for all but last one...
  output.forEach((wb) => {
    wb.currentBlurb = false;
    Index.words.push(wb);
  });
  //making the very last most recently added wb true...
  Index.words.at(-1).currentBlurb = true;

  let len = output.length;

  for (let i = -1; 0 < len; i--) {
    len -= 1;
    //console.log(i);
    Index.words.at(i).prevBlurb = Index.words.at(i - 1);
    Index.words.at(i).nextBlurb = Index.words.at(i + 1);
  }
  Index.words.at(-1).nextBlurb = null;

  Index.words.at(-output.length).prevBlurb = null;
};

const determineWordBlurbMetrics = (arr) => {
  //edits wordblurb objects so they can then be sent to the global state...Index.words...
  //takes in an arr of wordblurb objects...

  //edits the array so all the objects are filled out now...
  arr.forEach((wb) => {
    let textMetrics = Index.ctx.measureText(wb.str);
    wb.length = textMetrics.width;

    let tempCharStr = wb.str;
    wb.charList.forEach((c) => {
      //width is dynamic...
      let textMetrics = Index.ctx.measureText(tempCharStr);
      wb.cursorLocations.push(textMetrics.width + wb.startX);
      tempCharStr = tempCharStr.slice(0, -1);
      // console.log("metrics for", wb.str);
      generateCursorLocations([wb]);
    });

    wb.endX = textMetrics.width + wb.startX;
    wb.endY = wb.startY;
  });
};

export {
  binarySearch,
  getCurrentBlurb,
  getClosestIndex,
  getClosestInt,
  handleLengthyOutsideText,
  determineWordBlurbMetrics,
};
