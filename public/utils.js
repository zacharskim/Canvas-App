import * as Index from "./index.js";

const getCurrentBlurb = () => {
  let currentBlurb = Index.words.filter((blurb) => blurb.currentBlurb);
  let currBlurbIndex = Index.words.findIndex(
    (blurb) => blurb.id == currentBlurb[0].id
  );

  if (typeof currentBlurb != "undefined") {
    return [currentBlurb[0], currBlurbIndex];
  } else {
    return "No currentBlurb";
  }
};

const binarySearch = (found, target) => {
  //console.log(target, found.cursorLocations);
  let l = 0;
  let r = found.cursorLocations.length - 1;

  while (l <= r) {
    var mid = Math.round((l + r) / 2);
    if (found.cursorLocations[mid] < target) {
      l = mid + 1;
    } else if (found.cursorLocations[mid] > target) {
      r = mid - 1;
    } else {
      return mid;
    }
  }
  //plus one to mid just makes sense for a text editor and seems a little more accurate on average tbh...
  return mid;
};

//TODO add something to find the nearest number given a target number...(might fix the funky cursor...)

const getClosestIndex = (target, arr) => {
  if (arr.length > 0) {
    const res = arr.reduce(function (prev, curr) {
      return Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;
    });

    return arr.indexOf(res);
  }
};

const getClosestInt = (target, arr) => {
  const res = arr.reduce(function (prev, curr) {
    return Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;
  });

  return res;
};

export { binarySearch, getCurrentBlurb, getClosestIndex, getClosestInt };
