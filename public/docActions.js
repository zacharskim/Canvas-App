import * as Index from "./index.js";
import {
  getCurrentBlurb,
  handleLengthyOutsideText,
  determineWordBlurbMetrics,
} from "./utils.js";
import * as Caret from "./caret.js";
import { WordBlurb } from "./wordBlurb.js";
import * as WBA from "./wordBlurbActions.js";
const copy = () => {
  determineSelectedData(Caret.caret.indexOfSelectionStart, Caret.caret.index);
  console.log("copy is running...");
};

const cut = () => {
  console.log("well cut is running i guess..");
};

//should this go somewhere else??
addEventListener("paste", (event) => {
  var clipText = event.clipboardData.getData("Text");
  Caret.caret.outsideText = clipText;
});

const paste = () => {
  //selectedText is from the determineSelectedData calll...
  if (Caret.caret.selectedText.length > 0) {
    //create the new blurb to paste....
    Index.words.forEach((word) => (word.currentBlurb = false));
    Index.words.push(
      new WordBlurb(
        Caret.caret.currLocationLive.x,
        Caret.caret.currLocationLive.y
      )
    );
    let currBlurbInfo = getCurrentBlurb();
    Index.words[currBlurbInfo[1]].str = Caret.caret.selectedText.join("");
    Index.words[currBlurbInfo[1]].charList = Caret.caret.selectedText;
    //editing the state directly,,, I don't think i've typically done this...
    determineWordBlurbMetrics([currBlurbInfo[0]]);
    Caret.caret.selectedText = [];
  } else {
    if (Index.ctx.measureText(Caret.caret.outsideText).width >= 400) {
      handleLengthyOutsideText();
    }

    Caret.caret.selectedText = "";
  }
};

const handleRightArrow = (e) => {
  let currBlurbInfo = getCurrentBlurb();

  console.log(Caret.caret.index);
  if (
    Caret.caret.index >= 0 &&
    Caret.caret.index <= currBlurbInfo[0].cursorLocations.length - 2
  ) {
    Caret.caret.index += 1;
  } else if (Caret.caret.index == currBlurbInfo[0].cursorLocations.length - 1) {
    Caret.caret.index = 0;
  } else {
    Caret.caret.index = Caret.caret.indexOfSelectionStart;
  }

  console.log(
    currBlurbInfo[0].cursorLocations.at(-1),
    "last index",
    "curr positions",
    currBlurbInfo[0].cursorLocations.at(Caret.caret.index)
  );

  //highlighting/selection area (seems like i've been slowling relaying on index more vs currlive.x or whatever so should just keep that up...)
  if (e.shiftKey) {
    console.log("running, right arrow...");
    //we should start changing the selection highlight now...
    Caret.caret.selectionActive = true;
    Caret.caret.indexOfSelectionStart =
      Caret.caret.indexOfSelectionStart == -100
        ? Caret.caret.index
        : Caret.caret.indexOfSelectionStart;

    //this part matters most...
    console.log(Caret.caret.indexOfSelectionStart, Caret.caret.index);
    Caret.caret.selectionLength =
      currBlurbInfo[0].cursorLocations.at(Caret.caret.index) -
      currBlurbInfo[0].cursorLocations.at(Caret.caret.indexOfSelectionStart);
  } else {
    console.log("arrow key??");
    Caret.caret.selectionActive = false;
    Caret.caret.selectionLength = 0;
    Caret.caret.indexOfSelectionStart =
      Caret.caret.indexOfSelectionStart != -100
        ? -100
        : Caret.caret.indexOfSelectionStart;
  }
};

const handleLeftArrow = (e) => {
  let currBlurbInfo = getCurrentBlurb();

  if (
    Caret.caret.index > 0 &&
    Caret.caret.index <= currBlurbInfo[0].cursorLocations.length - 1
  ) {
    Caret.caret.index -= 1;
  } else if (Caret.caret.index == 0) {
    Caret.caret.index = currBlurbInfo[0].cursorLocations.length - 1;
  } else {
    Caret.caret.index = Caret.caret.indexOfSelectionStart;
  }

  //TODO fix the skipping of a index on the highlighting...
  if (e.shiftKey) {
    console.log("arrow key??");
    //we should start changing the selection highlight now...
    Caret.caret.selectionActive = true;
    Caret.caret.indexOfSelectionStart =
      Caret.caret.indexOfSelectionStart == -100
        ? Caret.caret.index
        : Caret.caret.indexOfSelectionStart;

    determineSelectedData(Caret.caret.indexOfSelectionStart, Caret.caret.index);

    //this is what matters
    Caret.caret.selectionLength =
      currBlurbInfo[0].cursorLocations.at(Caret.caret.index) -
      currBlurbInfo[0].cursorLocations.at(Caret.caret.indexOfSelectionStart);
  } else {
    console.log("arrow key ran??");
    Caret.caret.selectionActive = false;
    Caret.caret.selectionLength = 0;
    Caret.caret.indexOfSelectionStart =
      Caret.caret.indexOfSelectionStart != -100
        ? -100
        : Caret.caret.indexOfSelectionStart;
  }
};

const determineSelectedData = (startIndex, endIndex) => {
  let currBlurbInfo = getCurrentBlurb();
  console.log(startIndex, endIndex, "indices of selection");

  if (startIndex > endIndex) {
    let copiedText = Index.words[currBlurbInfo[1]].charList.slice(
      endIndex + 1,
      startIndex + 1
    );
    Caret.caret.selectedText = copiedText;
    console.log(copiedText, "copied text");
  } else {
    let copiedText = Index.words[currBlurbInfo[1]].charList.slice(
      startIndex + 1,
      endIndex + 1
    );
    Caret.caret.selectedText = copiedText;
    console.log(copiedText, "copied text");
  }
};

const handleEnter = (e, currBlurbInfo) => {
  //set width of wordBlurb...reset width to zero when using the q+enter shortcut...
  //enter will just always add to the current Cloud, a mouseDown (for now, will create a new cloud)
  //the first entery in the first WB of each cloud will set the MaxLength of future WB into each cloud
  //this will be able to be tweaked at a latter date maybe...
  //hitting enter will 1. move the cursor to the startX verticle axis but like -10 startY or something...
  //create a new wordBlurb to be added, similar to mouse down...
  //words is becoming obsolute bc of the the new cloud array...adds a layer of structure...
  WBA.createBlurb(true); // EDIT THIS SO THAT IT CREATES A LINK BETWEEN BLURBS THAT OCCUR AFTER AN ENTER...
  //CONSIDER EDGE CASES THO BEFORE IMPLEMENTING....

  //Index.words.at(-1).greaterBlurbId = Index.words.at(-1).greaterBlurbId != null ?  Index.words.at(-1).greaterBlurbId :
};

const generateCloudID = () => {};

const linked = (wordBlurb) => {
  if (wordBlurb.nextBlurb || wordBlurb.prevBlurb) {
    return true;
  }
  return false;
};

export { copy, paste, cut, handleLeftArrow, handleRightArrow, handleEnter };
