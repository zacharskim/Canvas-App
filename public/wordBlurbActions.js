import * as Index from "./index.js";
import { getCurrentBlurb } from "./utils.js";
import * as Caret from "./caret.js";
import * as Utils from "./utils.js";
import * as Canvas from "./canvas.js";
import { WordBlurb } from "./wordBlurb.js";

const insertCursor = () => {
  //this function inserts the currsor into the current word blurb...
  //the currentBlurb may be brand new or it may have text in it...
  //only setting things needed to draw the cursor
  let currBlurbInfo = getCurrentBlurb();

  if (Caret.caret.index != 0) {
    Caret.caret.index = Utils.getClosestIndex(
      Caret.caret.CurrMouseX,
      Index.words[currBlurbInfo[1]].cursorLocations
    );
  } //else just leave it at zero...it will be changed by move caret...

  // yeah this is what i needed...to solve highlighitng issue...resting 
  //the caret to some degree,,, might be useful to abstract at a certain point...
  Caret.caret.indexOfSelectionStart = Caret.caret.index;
  Caret.caret.selectionLength = 0;

  Caret.caret.currLocation.y = Index.words[currBlurbInfo[1]].startY;
  //not needed to draw cursor but useful i think??
  Caret.caret.currLocation.x = Index.words[currBlurbInfo[1]].cursorLocations.at(
    Caret.caret.index
  );
  //  console.log(Caret.caret.index, "from insertCursor");
};

const moveCaret = (e) => {
  //this function move the caret along the word blurb as characters are inserted...

  if (e.keyCode == 8) {
    Caret.caret.index -= 1;
  } else {
    Caret.caret.index += 1;
  }
};

//dealing with displaying the cursor when it's active vs not active...
setInterval(() => {
  let typingCheck = new CustomEvent("typingCheck", {
    detail: {
      timeActive: 200,
    },
  });
  dispatchEvent(typingCheck);
}, 200);

addEventListener("typingCheck", (e) => {
  Caret.caret.timeSinceLastActivity += e.detail.timeActive;
  if (Caret.caret.timeSinceLastActivity > 500) {
    if (Caret.caret.timeSinceLastActivity % 3 == 0) {
      Caret.caret.active = !Caret.caret.active;
    }
  } else {
    // Caret.caret.active = true;
  }
  Canvas.drawCanvas();
});

//this is more like set currBlurb...
const determineCurrBlurb = () => {
  //this function determines if a preexisting blurb was set...
  let blurbsWithText = Index.words.filter((wordblurb) => wordblurb.str != "");
  //two filters are needed to avoid an error...
  let found = blurbsWithText.filter((boxes) =>
    boxes.boundingBox.contains(Caret.caret.CurrMouseX, Caret.caret.CurrMouseY)
  );
  console.log(found);

  if (found.length > 0) {
    let indexOfCurrBlurb = Index.words.findIndex(
      (blurb) => blurb.id == found[0].id
    );
    //this causes it trigger something in insertCursor so it goes to the right spot...
    Caret.caret.index = -100;
    Index.words.forEach((word) => (word.currentBlurb = false));
    Index.words[indexOfCurrBlurb].currentBlurb = true;

    //by this point the currentBlurb is determined...

    //if you don't click on a blurb then you create a new one,
  }
  //  console.log(Caret.caret.index, "ran from determineCurrBlurb");
};

const createBlurb = (enterBool = false) => {
  //right now create a blurb on a new line is pretty basic
  //and hardcoded into the following lines of code..

  //this feels like it could be better...
  if (enterBool) {
    //console.log("rann from enterBool statment..");
    let currBlurbInfo = getCurrentBlurb();

    Index.words.forEach((word) => (word.currentBlurb = false));
    Index.words.push(
      new WordBlurb(currBlurbInfo[0].startX, currBlurbInfo[0].startY + 18)
    );

    Index.words.at(-1).prevBlurb = currBlurbInfo[0];
    if (Index.words.at(-3)) {
      Index.words.at(-3).nextBlurb = currBlurbInfo[0];
    }
  } else if (Index.words.length > 0 && Index.words.at(-1).str != "") {
    //console.log("first ??");
    Index.words.forEach((word) => (word.currentBlurb = false));
    Index.words.push(
      new WordBlurb(Caret.caret.vimCaretLoc.x, Caret.caret.vimCaretLoc.y)
    );
  } else if (Index.words.length > 0) {
    // console.log("ran??");
    Index.words.pop();
    Index.words.forEach((word) => (word.currentBlurb = false));
    Index.words.push(
      new WordBlurb(Caret.caret.vimCaretLoc.x, Caret.caret.vimCaretLoc.y)
    );

    //this may mess w/ the currentBlurb function just keep an eye on it...
  } else {
    //console.log("first no??");
    Index.words.push(
      new WordBlurb(Caret.caret.vimCaretLoc.x, Caret.caret.vimCaretLoc.y)
    );
  }
  //changing caret index here....

  Caret.caret.index = 0;
  //console.log(Index.words, "wordblurb list rn...");
  //console.log("bruhhh createBlurb ran", Caret.caret.index);
};

//need to account for caret movememnt here?? idk...or updating canvas or somethihng??
const handleBackSpace = (e, currBlurbInfo) => {
  deleteChar(e, currBlurbInfo);
  let textMetrics = Index.ctx.measureText(currBlurbInfo[0].str);
  Index.words[currBlurbInfo[1]].length = textMetrics.width;
  Index.words[currBlurbInfo[1]].endX =
    textMetrics.width + currBlurbInfo[0].startX;
  Index.words[currBlurbInfo[1]].endY = currBlurbInfo[0].startY;

  generateCursorLocations(currBlurbInfo);
};

const insertChar = (e, currBlurbInfo) => {
  //adding a char to the currentBlurb string...so glad finally go this working...
  //wish i had realized charList was there and easier to edit an array than a string most times...
  //not super clear you can build an array through splicing (but not replacing just inserting...)

  if (typeof currBlurbInfo[0] != "undefined") {
    Index.words[currBlurbInfo[1]].charList.splice(Caret.caret.index, 0, e.key);

    Index.words[currBlurbInfo[1]].str =
      Index.words[currBlurbInfo[1]].charList.join("");
  }
};

const deleteChar = (e, currBlurbInfo) => {
  //replaced the char behind the caret index with ''(prolly will not work for start of the string)

  Index.words[currBlurbInfo[1]].charList.splice(Caret.caret.index - 1, 1);

  //having to filter Enters out of charList now...uhh refactor after lunch / appointment...
  let toStr = Index.words[currBlurbInfo[1]].charList.filter(
    (el) => el != "Enter"
  );
  Index.words[currBlurbInfo[1]].str = toStr.join("");
};

const generateCursorLocations = (currBlurbInfo) => {
  //loop through and dynamically change the width to set the cursorLocations...
  // THIS WILL NEED TO ACCOUNT FOR ENTERs NOW...

  if (typeof currBlurbInfo[0] != "undefined") {
    let tempCharStr = currBlurbInfo[0].str;
    currBlurbInfo[0].cursorLocations = [];
    currBlurbInfo[0].charList.forEach((c) => {
      //width is dynamic...
      let textMetrics = Index.ctx.measureText(tempCharStr);
      currBlurbInfo[0].cursorLocations.push(
        textMetrics.width + currBlurbInfo[0].startX
      );
      tempCharStr = tempCharStr.slice(0, -1);
    });

    currBlurbInfo[0].cursorLocations =
      currBlurbInfo[0].cursorLocations.reverse();

    //add the first index

    currBlurbInfo[0].cursorLocations.unshift(currBlurbInfo[0].startX);
  }

  //adds the first index...not super elegant but works for now...also this fixes the cursor
  //not showing up while tpying error?? kinda...breaks insertion and deletions tho...
};

const handleNewChar = (e, currBlurbInfo) => {
  insertChar(e, currBlurbInfo);
  if (typeof currBlurbInfo[0] != "undefined") {
    let textMetrics = Index.ctx.measureText(currBlurbInfo[0].str);
    Index.words[currBlurbInfo[1]].length = textMetrics.width;
    Index.words[currBlurbInfo[1]].endX =
      textMetrics.width + currBlurbInfo[0].startX;
    Index.words[currBlurbInfo[1]].endY = currBlurbInfo[0].startY;
  }
  //need to update this in the right spot...then can just stirng letters together
  //idk why i didn't do that earlier it seems easier,,, just string the letters togehter.,...NO NEED TO EDIT STRING DIRECTLY>>>..

  generateCursorLocations(currBlurbInfo);
};

const activateCaret = () => {
  document.documentElement.style.cursor = "none";
  Caret.caret.active = true;
  Caret.caret.timeSinceLastActivity = 0;
};

export {
  createBlurb,
  determineCurrBlurb,
  insertCursor,
  moveCaret,
  activateCaret,
  handleNewChar,
  handleBackSpace,
  generateCursorLocations,
};

//push cursor along word blurb
// WBA.moveCaret();

// Canvas.updateTextArea();
