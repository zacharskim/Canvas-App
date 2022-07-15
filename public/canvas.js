import * as Index from "./index.js";
import * as Utils from "./utils.js";
import * as Caret from "./caret.js";
import { BoundingBox } from "./boundingBox.js";

const drawCanvas = () => {
  //clear the old canvas
  Index.ctx.clearRect(0, 0, Index.canvas.width, Index.canvas.height);

  //set context
  Index.ctx.font = "16px Times New Roman";
  Index.ctx.textBaseline = "hanging";

  //redraw all the word blurbs...might be a better way to do this...
  Index.words.forEach((blurb) => {
    blurb.boundingBox = new BoundingBox(blurb);
    //when we find a 'Enter' in the charlist we need to treat it differntly??
    //is there a more elegant way to look at this...?? draw this all out??
    //lots of connecting things rn....
    Index.ctx.fillText(blurb.str, blurb.startX, blurb.startY);
  });

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
      Caret.caret.currLocation.y,
      1,
      18
    );
  }
};

//draw cursor and draw selection should be drawn in similar ways...that makes sense...
const drawSelection = (currentBlurb) => {
  //selection should only be able to go to currLocation spots in the array... ***do this first after lunch...DONE

  if (typeof currentBlurb != "undefined") {
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
