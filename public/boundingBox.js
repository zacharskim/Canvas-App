class BoundingBox {
  constructor(blurb) {
    this.x = blurb.startX - 10;
    this.y = blurb.startY - 4;
    this.width = blurb.length + 20;
    this.height = 24;
  }

  contains(x, y) {
    return (
      this.x <= x &&
      x <= this.x + this.width &&
      this.y <= y &&
      y <= this.y + this.height
    );
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.stroke();
  }
}

export { BoundingBox };
