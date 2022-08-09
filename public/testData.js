import * as Index from "./index.js";
import { WordBlurb } from "./wordBlurb.js";
import { determineWordBlurbMetrics } from "./utils.js";
let testData = [
  {
    str: "this is some text",
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  },
  {
    str: "I was bored to tears",
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  },
  {
    str: "Some of the people on her block left their A/C units in the window until the end of December.",
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  },
  {
    str: "Tigers live at the zoo.",
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  },
  {
    str: "Money doesn't grow on trees.",
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  },
  {
    str: "Does he have a big family",
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  },
];

const generateTestData = () => {
  testData.forEach((obj) => {
    Index.words.push(new WordBlurb(obj.x, obj.y));
    console.log(Index.words);
    Index.words[Index.words.length - 1].str = obj.str;
    Index.words[Index.words.length - 1].charList =
      Index.words[Index.words.length - 1].str.split("");
  });
  determineWordBlurbMetrics(Index.words);
};

export { generateTestData };
