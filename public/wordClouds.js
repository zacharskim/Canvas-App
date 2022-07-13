let id = 0;

class WordCloud {
  constructor(initialWB) {
    this.currCloud = true;
    this.firstBlurb = initialWB;
    this.lastBlurb = initialWB;
    this.cloudMakeUp = []; //list of wordBlurbs here...
    this.startX = initialWB.startX;
    this.startY = initialWB.startY;
    this.length = initialWB.length;
    this.str = ""; //may not be needed...
    this.cloudCursorLocations = []; //all memeber WB currsorlocations + y coords here...
    this.cloudId = id++; //idk need to do some more planning on this...
    this.charList = []; //also may not be needed...
  }
}

export { WordCloud };
