let id = 0;

class WordBlurb {
  constructor(CurrMouseX, CurrMouseY) {
    this.length = 0;
    this.startX = CurrMouseX;
    this.startY = CurrMouseY;
    this.endX = 0;
    this.currentBlurb = true;
    this.endY = 0;
    this.str = "";
    this.cursorLocations = [];
    this.id = id++;
    this.charList = [];
    this.width = 0;
    this.greaterBlurbId = 0;
    this.prevBlurb = null;
    this.nextBlurb = null;
  }
}

export { WordBlurb };
