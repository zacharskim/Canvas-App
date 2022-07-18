import * as Index from "./index.js";
import * as Utils from "./utils.js";
import * as Caret from "./caret.js";
import { BoundingBox } from "./boundingBox.js";
import * as Nav from "./navigation.js";

const drawCanvas = () => {
  //clear the old canvas
  //this line might be kinda moot but leaving it in for now...
  Index.ctx.clearRect(0, 0, Index.canvas.width, Index.canvas.height);

  //set context

  //these following two lines of code reset the canvas context etc...
  Index.canvas.width = window.innerWidth;
  Index.canvas.height = window.innerHeight;

  Index.ctx.font = "16px Times New Roman";
  Index.ctx.textBaseline = "hanging";

  Index.words.forEach((blurb) => {
    blurb.boundingBox = new BoundingBox(blurb);
    //when we find a 'Enter' in the charlist we need to treat it differntly??
    //is there a more elegant way to look at this...?? draw this all out??
    //lots of connecting things rn....

    //drawing the wordblurbs...

    Index.ctx.fillText(
      blurb.str,
      blurb.startX - Nav.panX,
      blurb.startY - Nav.panY
    );

    // if (
    //   xMax > 0 &&
    //   xMin < Index.canvas.width &&
    //   yMax > 0 &&
    //   yMin < Index.canvas.height
    // ) {
    //   Index.ctx.fillText(
    //     blurb.str,
    //     blurb.startX - Nav.panX,
    //     blurb.startY - Nav.panY
    //   );
    // }
  });

  // ctx.fillStyle = "black";
  // //for each box...draw it...each changes when panx or pany changes...
  // for (var i = 0; i < boxArray.length; ++i) {
  //   box = boxArray[i];

  //   //box no longer shows up if it's outside of the boundries of the viewport...
  //   if (xMax > 0 && xMin < imageWidth && yMax > 0 && yMin < imageHeight) {
  //     box.draw();
  //   }
  // }

  //let tmp = Index.canvas.width - 150;
  //console.log(Index.canvas.height);
  //ehh might just have this come and go...like somthing you can check...every so often...
  //Index.ctx.fillText("Navigation Mode: " + Caret.caret.navMode, tmp, 10);

  //console.log(Index.canvas.width, Index.canvas.height, Index.canvas);
  let currBlurbInfo = Utils.getCurrentBlurb();
  drawCursor(currBlurbInfo[0]);

  drawSelection(currBlurbInfo[0]);
};

const drawText = () => {
  //for each wordBlurb in a WordCloud
  //draw the wordblurb...
  Index.clouds.forEach((cloud) => {
    cloud.forEach((blurb) => {
      blurb.boundingBox = new BoundingBox(blurb);
      Index.ctx.fillText(blurb.str, blurb.startX, blurb.startY);
    });

    cloud.cloudBoundingBox = new BoundingBox(cloud);
  });
};

const updateTextArea = () => {
  let currBlurbInfo = Utils.getCurrentBlurb();

  if (currBlurbInfo[0].startX == 0 && currBlurbInfo[0].startY == 0) {
    currBlurbInfo[0].startX = CurrMouseX;
    currBlurbInfo[0].startY = CurrMouseY;
  }

  let textMetrics = Index.ctx.measureText(currBlurbInfo[0].str);

  currBlurbInfo[0].endX = textMetrics.width + currBlurbInfo[0].startX;
  currBlurbInfo[0].endY = currBlurbInfo[0].startY;

  //need to update the actual words array tho...
  Index.words[currBlurbInfo[1]] = currBlurbInfo[0];
  drawCanvas();
};

//TODO fix so that this draws when the user is typing first too.
//..need it to work w/o cursorLocations or index...
const drawCursor = (currentBlurb) => {
  //idea, use Caret.caret.currLocation.x and Caret.caret.currLocation.y to determine the closest cursorLocations
  //within this function or some helper function!!

  if (typeof currentBlurb != "undefined" && Caret.caret.active) {
    Index.ctx.fillRect(
      currentBlurb.cursorLocations[Caret.caret.index],
      //need to expandcursor locaitons to include y axis i think....
      currentBlurb.startY, //replace this line w/ currentBlurb.startY at some point...
      1,
      18
    );
  }
};

//draw cursor and draw selection should be drawn in similar ways...that makes sense...
const drawSelection = (currentBlurb) => {
  //selection should only be able to go to currLocation spots in the array... ***do this first after lunch...DONE

  if (typeof currentBlurb != "undefined") {
    //console.log(currentBlurb.width);
    //console.log(Caret.caret.indexOfSelectionStart, "index:", Caret.caret.index);
    //console.log("ran...");
    //console.log(Caret.caret.indexOfSelectionStart, Caret.caret.selectionLength);
    Index.ctx.save();
    Index.ctx.fillStyle = "#FF0000";
    Index.ctx.globalAlpha = 0.2;
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

export { drawCanvas, updateTextArea, drawCursor, drawSelection };
