import * as Events from "./events.js";
import * as Drawing from "./drawing.js";
import * as Nav from "./navigation.js";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const words = [];
//just collections of word blurbs...
const clouds = [];

addEventListener("keydown", (e) => Events.handleKeyDown(e));
addEventListener("mousedown", (e) => Events.handleMouseDown(e));
addEventListener("mouseup", (e) => Events.handleMouseUp(e));
addEventListener("mousemove", (e) => Events.handleMouseMove(e));

addEventListener("mousemove", (e) => Nav.handleMouseMove(e));

//come back to this after infintie scroll is implemented...
// window.addEventListener("resize", Drawing.resize);
// addEventListener("mousemove", Drawing.draw);
// addEventListener("mousedown", Drawing.setPosition);
// addEventListener("mouseenter", Drawing.setPosition);

export { canvas, ctx, words };

//create a custom event to listen for typing or not typing...take inspiration from the carota thing...need to weeve this into the broken selection functionality however..
