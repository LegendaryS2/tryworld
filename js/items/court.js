class Court {
   constructor(courtpoly) {
      this.base = courtpoly;
   }

   static load(info) {
      return new Court(Polygon.load(info.base));
   }

  draw(ctx) {
   this.base.draw(ctx, { fill: "rgb(13, 133, 35)", stroke: "rgb(255, 255, 255)", lineWidth: 10 });

   const pts = this.base.points;
   if (pts.length < 4) return;
   ctx.save();
   ctx.strokeStyle = "white";
   ctx.lineWidth = 10;


   if (pts.length === 4) {
      const [p0, p1, p2, p3] = pts;

      const lenA = Math.hypot(p1.x - p0.x, p1.y - p0.y); 
      const lenB = Math.hypot(p2.x - p1.x, p2.y - p1.y); 


      if (lenA <= lenB) {
         ctx.beginPath();
         ctx.moveTo(
            (p0.x + p3.x) / 2,
            (p0.y + p3.y) / 2
         );
         ctx.lineTo(
            (p1.x + p2.x) / 2,
            (p1.y + p2.y) / 2
         );
         ctx.stroke();
      } else {
         ctx.beginPath();
         ctx.moveTo(
            (p0.x + p1.x) / 2,
            (p0.y + p1.y) / 2
         );
         ctx.lineTo(
            (p3.x + p2.x) / 2,
            (p3.y + p2.y) / 2
         );
         ctx.stroke();
      }
   }
   ctx.restore();
}
}