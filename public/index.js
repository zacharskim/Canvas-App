import * as Events from "./events.js";
import * as Drawing from "./drawing.js";
import * as Nav from "./navigation.js";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.background = "#393434";
const words = [];
//just collections of word blurbs...
const images = [];
const drawings = [];

addEventListener("keydown", (e) => Events.handleKeyDown(e));
addEventListener("mousedown", (e) => Events.handleMouseDown(e));
addEventListener("mouseup", (e) => Events.handleMouseUp(e));
addEventListener("mousemove", (e) => Events.handleMouseMove(e));

//refactoring so that wordBlurbs move when the sprite is moved or when in
//caret mode...
//addEventListener("mousemove", (e) => Nav.handleMouseMove(e));
//come back to this after infintie scroll is implemented...
// window.addEventListener("resize", Drawing.resize);
// addEventListener("mousemove", Drawing.draw);
// addEventListener("mousedown", Drawing.setPosition);
// addEventListener("mouseenter", Drawing.setPosition);

export { canvas, ctx, words, images };

//create a custom event to listen for typing or not typing...take inspiration from the carota thing...need to weeve this into the broken selection functionality however..
