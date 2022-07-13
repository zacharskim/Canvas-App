// let CurrMouseX;
// let CurrMouseY;
import * as Index from "./index.js";

const caret = {
  active: true,
  timeSinceLastActivity: 0,
  CurrMouseX: 0,
  CurrMouseY: 0,
  currLocation: { x: -100, y: -100 },
  index: 0,
  indexOfSelectionStart: -100,
  mouseDown: false,
  selectionStart: 0,
  selectionEnd: 0,
  selectionLength: 0,
  selectionActive: false,
  outsideText: "",
  selectedText: [],
  currLocationLive: { x: 0, y: 0 },
};

const getCaretLocation = () => {
  if (caret.index + 1 > caret.indexOfSelectionStart) {
    caret.index = caret.indexOfSelectionStart;
  } else if (caret.index - 1 < caret.indexOfSelectionStart) {
    caret.index = caret.indexOfSelectionStart;
  } else {
    //
  }
};

export { getCaretLocation, caret };
