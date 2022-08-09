import * as Index from "./index.js";
import * as Utils from "./utils.js";
import * as Caret from "./caret.js";
import { BoundingBox } from "./boundingBox.js";
import * as Format from "./format.js";

//undo/redo....
const drawCanvas = () => {
  //these following two lines of code reset the canvas context etc...
  Index.canvas.width = window.innerWidth;
  Index.canvas.height = window.innerHeight;
  Index.ctx.fillRect(Index.canvas.width / 2, Index.canvas.height / 2, 10, 10);

  Index.ctx.font = "16px Times New Roman";
  Index.ctx.fillStyle = "white";
  Index.ctx.textBaseline = "hanging";

  let currBlurbInfo = Utils.getCurrentBlurb();
  drawText(currBlurbInfo);

  drawImages();
  //drawFormatting();

  drawCursor(currBlurbInfo[0]);

  drawSelection(currBlurbInfo[0]);

  //Format.underline(currBlurbInfo[0]);
};

const drawText = (currBlurbInfo) => {
  //for each wordBlurb
  //draw the wordblurb...

  //this is where formatting will need to be implemented for every Character
  //i think...
  Index.words.forEach((blurb) => {
    blurb.boundingBox = new BoundingBox(blurb);

    let index = 0;
    blurb.cursorLocations.forEach((loc) => {
      //for each space between cursorLocations, we assign a
      //specfic formatting rules based on each indvidual character
      //allows us to bold some parts of a wordBlurb but not the whole thing

      Format.setFormat(loc, blurb, index);

      if (typeof blurb.charList[index] != "undefined") {
        //make this so it only temporary changes the context???

        Format.setIndividualCharFormat(index, blurb);
        //console.log(blurb.startX, blurb.startY, blurb.str);
        Index.ctx.fillText(blurb.charList[index], loc, blurb.startY);
      }
      index++;
    });
  });
};

//const drawFormatting = () => {};

const drawImages = () => {
  Index.images.forEach((imgObj) => {
    Index.ctx.drawImage(imgObj.img, imgObj.x, imgObj.y);
  });
};

//TODO fix so that this draws when the user is typing first too.
//..need it to work w/o cursorLocations or index...
const drawCursor = (currentBlurb) => {
  //idea, use Caret.caret.currLocation.x and Caret.caret.currLocation.y to determine the closest cursorLocations
  //within this function or some helper function!!

  if (
    Caret.caret.navMode == "command" &&
    Caret.caret.firstDraw == false &&
    Caret.caret.active &&
    !Caret.caret.vimCaretinBlurb
  ) {
    if (typeof currentBlurb != "undefined") {
      //if there is a previous locaiton,, but the cursor there...
      //console.log("ran...");
      Caret.caret.vimCaretLoc.x = Caret.caret.currLocation.x;
      Caret.caret.vimCaretLoc.y = Caret.caret.currLocation.y;
      Index.ctx.fillRect(
        Caret.caret.currLocation.x,
        Caret.caret.currLocation.y,
        9,
        18
      );
    } else {
      Caret.caret.vimCaretLoc = {
        x: Caret.caret.currLocationLive.x,
        y: Caret.caret.currLocationLive.y,
      };
      Index.ctx.fillRect(
        Caret.caret.currLocationLive.x,
        //need to expandcursor locaitons to include y axis i think....
        Caret.caret.currLocationLive.y,
        9,
        18
      );
    }

    Caret.caret.firstDraw = true;
  } else if (
    Caret.caret.navMode == "command" &&
    Caret.caret.active &&
    !Caret.caret.vimCaretinBlurb
  ) {
    Index.ctx.fillRect(
      Caret.caret.vimCaretLoc.x,
      //need to expandcursor locaitons to include y axis i think....
      Caret.caret.vimCaretLoc.y,
      9,
      18
    );
  } else if (
    Caret.caret.navMode == "command" &&
    Caret.caret.active &&
    Caret.caret.vimCaretinBlurb
  ) {
    if (
      currentBlurb.cursorLocations.length - 1 == Caret.caret.vimIndex ||
      Caret.caret.vimIndex == 0
    ) {
      Index.ctx.save();
      Index.ctx.globalAlpha = 0.3;
      //console.log("run edge case.....", Caret.caret.vimIndex);
      Index.ctx.fillRect(
        currentBlurb.cursorLocations[Caret.caret.vimIndex - 1],
        currentBlurb.startY,
        9,
        18
      );
      Index.ctx.restore();
    } else {
      Index.ctx.save();
      Index.ctx.globalAlpha = 0.3;
      //console.log("run normally..", Caret.caret.vimIndex);
      Index.ctx.fillRect(
        currentBlurb.cursorLocations[Caret.caret.vimIndex],
        currentBlurb.startY,
        Index.ctx.measureText(currentBlurb.charList[Caret.caret.vimIndex])
          .width,
        18
      );
      Index.ctx.restore();
    }
  }
  if (
    typeof currentBlurb != "undefined" &&
    Caret.caret.active &&
    Caret.caret.navMode == "insert"
  ) {
    //clean this shit up,,, write about the logic etc...insert will always follow
    //command mode...
    //draw normal caret...

    //console.log("running...OKA??");
    if (currentBlurb.cursorLocations.length == Caret.caret.index) {
      Caret.caret.currLocation.x =
        currentBlurb.cursorLocations[Caret.caret.index - 1];
      Caret.caret.currLocation.y = currentBlurb.startY;
      Index.ctx.fillRect(
        currentBlurb.cursorLocations[Caret.caret.index - 1],
        currentBlurb.startY,
        1,
        18
      );
    } else {
      //console.log("running... hmmm??");
      Caret.caret.currLocation.x =
        currentBlurb.cursorLocations[Caret.caret.index];
      Caret.caret.currLocation.y = currentBlurb.startY;
      Index.ctx.fillRect(
        currentBlurb.cursorLocations[Caret.caret.index],
        currentBlurb.startY,
        1,
        18
      );
    }
  } else if (
    Caret.caret.firstDraw == false &&
    Caret.caret.navMode == "insert"
  ) {
    // console.log("running... MOOO??"); idk if this even runs lmao
    //refactor at some point....
    Caret.caret.initialCoords = {
      x: Caret.caret.vimCaretLoc.x,
      y: Caret.caret.vimCaretLoc.y,
    };
    Index.ctx.fillRect(
      Caret.caret.initialCoords.x,
      Caret.caret.initialCoords.y,
      1,
      18
    );
    Caret.caret.firstDraw = true;
  } else if (typeof currentBlurb != "undefined" && currentBlurb.str == "") {
    if (Caret.caret.initialCoords.x != 0) {
      // console.log("running... YEET");
      Index.ctx.fillRect(
        Caret.caret.initialCoords.x,
        Caret.caret.initialCoords.y,
        1,
        18
      );
    }
  }
};

//draw cursor and draw selection should be drawn in similar ways...that makes sense...
const drawSelection = (currentBlurb) => {
  //selection should only be able to go to currLocation spots in the array... ***do this first after lunch...DONE

  if (typeof currentBlurb != "undefined") {
    Index.ctx.save();
    Index.ctx.fillStyle = "#99CCFF";
    Index.ctx.globalAlpha = 0.3;
    Index.ctx.fillRect(
      currentBlurb.cursorLocations[Caret.caret.indexOfSelectionStart],
      Caret.caret.currLocation.y,
      Caret.caret.selectionLength,
      18
    );
    Index.ctx.restore();
  }
  //selection should only be able to go to currLocation spots in the array...is that not the case right now??
};
//bug - click and drag and shit does not draw...

//should draw selection go here??

export { drawCanvas, drawSelection };
