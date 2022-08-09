class ViewPort {
  constructor(canvas) {
    this.cx = canvas.width / 2;
    this.cy = canvas.height / 2;
    this.r = Math.sqrt((canvas.height * canvas.width * 0.5) / Math.PI);
  }

  draw(ctx) {
    ctx.strokeStyle = "white"; //#393434
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.r, 0, 2 * Math.PI);
    ctx.stroke();
  }

  hitBoundry(x, y, h, w) {
    //for points x,y | x+w,y | x, y-h | x+w,y-h determine if the dist from point to
    //center of the circle is < the radius....
    let dist = Math.sqrt(Math.pow(x - this.cx, 2) + Math.pow(y - this.cy, 2));
    let dist2 = Math.sqrt(
      Math.pow(x + w - this.cx, 2) + Math.pow(y - this.cy, 2)
    );
    let dist3 = Math.sqrt(
      Math.pow(x - this.cx, 2) + Math.pow(y + h - this.cy, 2)
    );
    let dist4 = Math.sqrt(
      Math.pow(x + w - this.cx, 2) + Math.pow(y + h - this.cy, 2)
    );

    if (
      (dist > this.r) |
      (dist2 > this.r) |
      (dist3 > this.r) |
      (dist4 > this.r)
    ) {
      return true;
    }

    return false;
  }
}

export { ViewPort };
