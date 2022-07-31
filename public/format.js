import * as Caret from "./caret.js";
import * as Index from "./index.js";
import * as WBA from "./wordBlurbActions.js";

const underline = (currentBlurb) => {
  //static height to start...
  let underlineHeight = parseInt(16) / 15;

  if (underlineHeight < 1) {
    underlineHeight = 1;
  }

  //this should go into the draw canvas call or something...
  //spend time determinging the flow of this latter...just think about it
  //a little...
  Index.ctx.beginPath();
  Index.ctx.lineWidth = 0.8;
  Index.ctx.moveTo(currentBlurb.startX, currentBlurb.startY + 2);
  Index.ctx.lineTo(currentBlurb.endX, currentBlurb.endY + 2);
  Index.ctx.strokeStyle = "white"; //add a color var at some point...
  Index.ctx.stroke();
};

const strikethrough = () => {};

//not sure if i want to allow user to dynamically set text size or
//just allow them a few options...
//style could be bold, italize, etc...

//just hook up to events and maybe write a few handler functions or something
//should be pretty easy i bet...
const setFormat = (loc, currBlurbInfo, index) => {
  if (Caret.caret.bold && Caret.caret.italicize) {
    //only add it to the array if not already in there...
    if (
      currBlurbInfo[0].format.filter((formatObj) => formatObj.id == index)
        .length <= 0
    ) {
      currBlurbInfo[0].format.push({
        loc: loc,
        style: "italic bold",
        id: index,
      });
    }

    Index.ctx.font = "italic bold 16px Times New Roman";
  } else if (Caret.caret.italicize) {
    if (
      currBlurbInfo[0].format.filter((formatObj) => formatObj.id == index)
        .length <= 0
    ) {
      currBlurbInfo[0].format.push({ loc: loc, style: "italic", id: index });
    }

    Index.ctx.font = "italic 16px Times New Roman";
  } else if (Caret.caret.bold) {
    if (
      currBlurbInfo[0].format.filter((formatObj) => formatObj.id == index)
        .length <= 0
    ) {
      currBlurbInfo[0].format.push({ loc: loc, style: "bold", id: index });
    }
    Index.ctx.font = "bold 16px Times New Roman";
  } else {
    //note, objects that are made in two differnt locations, even with the same attributes,
    //are seen as differnt according to js...
    if (
      currBlurbInfo[0].format.filter((formatObj) => formatObj.id == index)
        .length <= 0
    ) {
      currBlurbInfo[0].format.push({ loc: loc, style: "", id: index });
    }
    Index.ctx.font = "16px Times New Roman";
  }
  Index.ctx.fillStyle = "white";
  Index.ctx.textBaseline = "hanging";
};

const setIndividualCharFormat = (index, currBlurbInfo) => {
  let charFormat = currBlurbInfo[0].format.filter(
    (formatObj) => formatObj.id == index
  );

  if (charFormat[0].style == "italic bold") {
    Index.ctx.font = "italic bold 16px Times New Roman";
  } else if (charFormat[0].style == "italic") {
    Index.ctx.font = "italic 16px Times New Roman";
  } else if (charFormat[0].style == "bold") {
    Index.ctx.font = "bold 16px Times New Roman";
  } else {
    Index.ctx.font = "16px Times New Roma";
  }
};

const handleFormat = (e, currBlurbInfo) => {
  if (e.key == "i" && e.metaKey) {
    Caret.caret.italicize = !Caret.caret.italicize;
  } else if (e.key == "b" && e.metaKey) {
    Caret.caret.bold = !Caret.caret.bold;
  } else {
    WBA.activateCaret();
    WBA.handleNewChar(e, currBlurbInfo);

    WBA.moveCaret(e, currBlurbInfo);
  }
};

//cases we need to consider...highlighitng then applying some formatting things
//applying some formatting thing then typing...
//removing some formatting thing...

export { underline, setFormat, handleFormat, setIndividualCharFormat };

//this is kinda a pain in the ass...

//got to iterate again....

//fuck...
