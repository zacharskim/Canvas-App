import * as Caret from "./caret.js";
import * as Index from "./index.js";
import { WordBlurb } from "./wordBlurb.js";
import { BoundingBox } from "./boundingBox.js";
import * as Utils from "./utils.js";
import * as Canvas from "./canvas.js";
import * as DA from "./docActions.js";
import * as WBA from "./wordBlurbActions.js";

const handleKeyDown = (e) => {
  let currBlurbInfo = Utils.getCurrentBlurb();

  switch (e.keyCode) {
    case 8: //backspace
      WBA.activateCaret();
      WBA.handleBackSpace(e, currBlurbInfo);
      WBA.moveCaret(e, currBlurbInfo);
      //should prolly abstract a few thin...

      // let lastCharDeleted = currBlurbInfo[0].str.slice(0, -1);
      // currBlurbInfo[0].str = lastCharDeleted;

      // Index.words[currBlurbInfo[1]].charList.pop();

      // Index.words[currBlurbInfo[1]].cursorLocations.pop();
      // console.log(Index.words[currBlurbInfo[1]].cursorLocations.length);

      Canvas.updateTextArea();
      break;
    case 13: //enter
      WBA.activateCaret();
      DA.handleEnter(e, currBlurbInfo);
      WBA.moveCaret(e, currBlurbInfo);
      Canvas.updateTextArea();
      break;

    case 16:
      break;

    case 38:
      //console.log("up arrow..");
      //let bB = new boundingBox(words.at(-1));
      //words.at(-1).boundingBox = bB;
      currBlurbInfo[0].boundingBox.draw(Index.ctx);
      break;

    case 39: //right arrow
      WBA.activateCaret();
      DA.handleRightArrow(e); //here is where we'd check if the shift is pressed as well..
      //console.log(caret.currLocation.x);
      Canvas.drawCanvas();
      break;
    case 37: //left arrow
      WBA.activateCaret();
      DA.handleLeftArrow(e);
      //todo: make this bug free, and work on whichever blurb your currently click on...
      Canvas.drawCanvas();
      break;
    case 40: //down arrow
      break;

    //need to abstract these i think...
    case 67: //c
      if (e.metaKey) {
        DA.copy();
        Canvas.updateTextArea();
      } else {
        Index.words[currBlurbInfo[1]].str = currBlurbInfo[0].str + e.key;
        Index.words[currBlurbInfo[1]].charList.push(e.key);

        Canvas.updateTextArea();
      }

      break;

    case 86: //v
      if (e.metaKey) {
        DA.paste();
        Canvas.updateTextArea();
      } else {
        Index.words[currBlurbInfo[1]].str = currBlurbInfo[0].str + e.key;
        Index.words[currBlurbInfo[1]].charList.push(e.key);

        Canvas.updateTextArea();
      }
      break;

    case 88: //x
      if (e.metaKey) {
        DA.cut();
      } else {
        Index.words[currBlurbInfo[1]].str = currBlurbInfo[0].str + e.key;
        Index.words[currBlurbInfo[1]].charList.push(e.key);

        Canvas.updateTextArea();
      }
      break;

    case 91: //meta
      break;

    default: //popping the old string,,, adding the new one...
      WBA.activateCaret();
      WBA.handleNewChar(e, currBlurbInfo);
      //this changes everything the textarea is updated...(the width) we want  to store all the widths i think...

      //insert new character check out copy for inspo on how to structure this...

      // Index.words[currBlurbInfo[1]].str =
      //   currBlurbInfo[0].str.slice(0, Caret.caret.index) +
      //   e.key +
      //   currBlurbInfo[0].str.slice(Caret.caret.index);

      // Index.words[currBlurbInfo[1]].charList.push(e.key);
      // let textMetrics = Index.ctx.measureText(currBlurbInfo[0].str);
      // currBlurbInfo[0].length = textMetrics.width;

      // if (Index.words[currBlurbInfo[1]].cursorLocations.length == 0) {
      //   Index.words[currBlurbInfo[1]].cursorLocations.push(
      //     currBlurbInfo[0].startX
      //   );
      // }
      // //need to re-do this in order for the correct cursor locaitons to be generated...
      // Index.words[currBlurbInfo[1]].cursorLocations.push(
      //   textMetrics.width + currBlurbInfo[0].startX
      // );
      // //push cursor along word blurb
      WBA.moveCaret(e, currBlurbInfo);

      Canvas.updateTextArea();
      break;
  }
};

const handleMouseDown = (e) => {
  Index.ctx.fillStyle = "black";
  //setting caret data on mousedown...should make this into a refresh caret function...
  Caret.caret.CurrMouseX = e.clientX;
  Caret.caret.CurrMouseY = e.clientY;
  Caret.caret.mouseDown = true;

  WBA.activateCaret();
  //the above line might break highlighitng
  Caret.caret.indexOfSelectionStart = Caret.caret.index;

  console.log(Caret.caret.index, Caret.caret.indexOfSelectionStart);

  //determining wheather or not to create a new blurb or set the currentBlurb or both
  WBA.createBlurb();
  WBA.determineCurrBlurb();

  //determines caret index...
  WBA.insertCursor();
  Canvas.drawCanvas();
};

const handleMouseUp = (e) => {
  Caret.caret.mouseDown = false;
};

const handleMouseMove = (e) => {
  //determine wheather or not you are over a current word blurb (so you don't paste over another one...)
  let currBlurbInfo = Utils.getCurrentBlurb();

  //set 'live' mouse coords (used for paste function...)
  Caret.caret.currLocationLive.x = e.clientX;
  Caret.caret.currLocationLive.y = e.clientY;
  //this dynamically sets the selection length so we can draw the rectangle in live time...
  if (Caret.caret.mouseDown) {
    Caret.caret.selectionEnd = e.clientX;
    Caret.caret.active = true;
    Caret.caret.timeSinceLastActivity = 0;
    //find the nearest currsor location the below calc of the selection length...
    let target = Caret.caret.selectionEnd;

    let actualSelectionEnd;
    //find the nearest possible cursor location to the selection end determined by mousemove...
    if (currBlurbInfo[0].cursorLocations.length != 0) {
      Caret.caret.index = Utils.getClosestIndex(
        target,
        currBlurbInfo[0].cursorLocations
      );
      console.log("index is changing", Caret.caret.index);

      Caret.caret.selectionLength =
        currBlurbInfo[0].cursorLocations.at(Caret.caret.index) -
        currBlurbInfo[0].cursorLocations.at(Caret.caret.indexOfSelectionStart);
    }
    //if mousedown set the indexofselectionstart...
    Caret.caret.selectionActive = true;
    // Caret.caret.indexOfSelectionStart =
    //   //low key kinda clever ngl...
    //   Caret.caret.indexOfSelectionStart == -100
    //     ? Caret.caret.index
    //     : Caret.caret.indexOfSelectionStart;
  } else {
    //this neeeds to be fixed or something...
    // console.log(Caret.caret.selectionActive);
    // if (!Caret.caret.selectionActive) {
    //   Caret.caret.indexOfSelectionStart =
    //     Caret.caret.indexOfSelectionStart != -100
    //       ? -100
    //       : Caret.caret.indexOfSelectionStart;
    // }
  }

  Canvas.drawCanvas();
};

export { handleKeyDown, handleMouseDown, handleMouseUp, handleMouseMove };

//TODO let the user insert into text blurbs...DONE

//TODO handle enter and other misc items...(abstract this??)

//TODO implement deleting highlighitng selection...cut / delete...

//TODO fix the paste bugs...

//^^what i'm focusing on in this current 10:50ish focused pomodoaro...7/13

//TODO fix the highlighitng bugs...

//TODO implement selecting multiple lines of text

//TODO implement double clicking to highlight one word, or a whole line, or paragraph...(like control-a)

//TODO read about vim and text naviagtion w/ vim...navigation is the next step after the above 'tickets'

//would like to finish all the above tickets (except maybe naviagtion) by EOD 7/13...
//EOW 7/16 have naviagtion implemented to present on?? idk ...

//trying to make a modal editor...like vim in a way...
