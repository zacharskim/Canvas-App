import * as Caret from "./caret.js";
import * as Index from "./index.js";
import * as Utils from "./utils.js";
import * as Canvas from "./canvas.js";
import * as DA from "./docActions.js";
import * as WBA from "./wordBlurbActions.js";
import * as Nav from "./navigation.js";
import { sprite } from "./sprite.js";
import * as Format from "./format.js";

const handleKeyDown = (e) => {
  let currBlurbInfo = Utils.getCurrentBlurb();

  //only changes anything if command is hit...

  if (Caret.caret.navMode == "insert") {
    switch (e.keyCode) {
      case 8: //backspace
        WBA.activateCaret();
        WBA.handleBackSpace(e, currBlurbInfo);
        WBA.moveCaret(e, currBlurbInfo);
        Canvas.drawCanvas();

        break;
      case 13: //enter
        WBA.activateCaret();
        DA.handleEnter(e, currBlurbInfo);
        WBA.moveCaret(e, currBlurbInfo);
        Canvas.drawCanvas();

        break;

      case 16: //shift...
        break;

      case 27: //hitting escape
        break;

      //left and right arrows only move through the blurb rn...modify so if
      //shift is being held or something you can leap from blurb to blurb...
      case 37:
        WBA.activateCaret();
        DA.handleLeftArrow(e);
        Canvas.drawCanvas();
        break;

      case 39:
        WBA.activateCaret();
        DA.handleRightArrow(e);
        Canvas.drawCanvas();
        break;

      case 38:
      case 40:
        WBA.activateCaret();
        Nav.handleArrowKey(currBlurbInfo[0], e);
        Nav.reCenter();
        Canvas.drawCanvas();
        break;

      case 85:
        DA.handleFormatText(e, currBlurbInfo);

      case 73: //i
      case 66: //b
        Format.handleFormat(e, currBlurbInfo);
        Canvas.drawCanvas();
        break;

      case 67: //c
      case 86: //v
      case 88: //x
        DA.handleTextEdit(e, currBlurbInfo);
        Canvas.drawCanvas();

        break;

      case 91: //meta
        break;

      case 187:
        console.log(Index.words);
        break;

      case 57: //9...just for testing...
        currBlurbInfo[0].boundingBox.draw(Index.ctx);
        break;

      default:
        WBA.activateCaret();
        WBA.handleNewChar(e, currBlurbInfo);
        WBA.moveCaret(e, currBlurbInfo);
        Canvas.drawCanvas();
        break;
    }
  } else if (Caret.caret.navMode == "octopus") {
    if (!sprite.imgLoaded) {
      Nav.loadImage();
    }
  } else if (Caret.caret.navMode == "command") {
    Nav.moveCommandCaret(e, currBlurbInfo[0]);
    WBA.activateCaret();
    Nav.determineCollision(currBlurbInfo[0]);
    Nav.moveWordBlurbs(e);
    Nav.moveImages(e);

    Canvas.drawCanvas();
  }
  Nav.setNavMode(e, currBlurbInfo);
};

const handleMouseDown = (e) => {
  Index.ctx.fillStyle = "white";
  //setting caret data on mousedown...should make this into a refresh caret function...
  Caret.caret.CurrMouseX = e.clientX;
  Caret.caret.CurrMouseY = e.clientY;
  Caret.caret.mouseDown = true;

  if (Caret.caret.navMode == "insert") {
    WBA.activateCaret();
    Caret.caret.indexOfSelectionStart = Caret.caret.index;

    //determining wheather or not to create a new blurb or set the currentBlurb or both
    //WBA.createBlurb(); //ehh this line will need to go in the morning...
    WBA.determineCurrBlurb();

    //determines caret index...
    WBA.insertCursor();
    Canvas.drawCanvas();
  }
};

const handleMouseUp = (e) => {
  Caret.caret.mouseDown = false;
  Caret.caret.imageSelected = false;
};

const handleMouseMove = (e) => {
  //determine wheather or not you are over a current word blurb (so you don't paste over another one...)
  let currBlurbInfo = Utils.getCurrentBlurb();
  //  console.log(e.clientX, Caret.caret.currLocationLive.x);

  Caret.caret.deltaX = e.clientX - Caret.caret.currLocationLive.x;
  Caret.caret.deltaY = e.clientY - Caret.caret.currLocationLive.y;

  //set 'live' mouse coords (used for paste function...)
  Caret.caret.currLocationLive.x = e.clientX;
  Caret.caret.currLocationLive.y = e.clientY;

  Nav.moveImagesMouse(e);
  Nav.moveWordBlurbMouse(e);

  //this dynamically sets the selection length so we can draw the rectangle in live time...
  if (typeof currBlurbInfo[0] != "undefined") {
    if (Caret.caret.mouseDown) {
      Caret.caret.selectionEnd = e.clientX;
      Caret.caret.active = true;
      Caret.caret.timeSinceLastActivity = 0;
      //find the nearest currsor location the below calc of the selection length...
      let target = Caret.caret.selectionEnd;

      let actualSelectionEnd;
      //find the nearest possible cursor location to the selection end determined by mousemove...
      if (currBlurbInfo[0].cursorLocations.length != 0) {
        //only happens on clicking and draging (mousemove, mousedown combo...)
        Caret.caret.index = Utils.getClosestIndex(
          target,
          currBlurbInfo[0].cursorLocations
        );

        Caret.caret.selectionLength =
          currBlurbInfo[0].cursorLocations.at(Caret.caret.index) -
          currBlurbInfo[0].cursorLocations.at(
            Caret.caret.indexOfSelectionStart
          );
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

//readme but for issues...hyperlink the
