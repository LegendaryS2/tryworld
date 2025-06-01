class Park {
   constructor(poly) {
      this.base = poly;
   }

   static load(info) {
      return new Park(Polygon.load(info.base));
   }

   draw(ctx) {
   this.base.draw(ctx, { fill: "#BBB", stroke: "rgb(255, 255, 255)", lineWidth: 10 });

   const pts = this.base.points;
   if (pts.length < 4) return;

   const [p0, p1, p2, p3] = pts;
   const lineCount = 6;
   ctx.save();
   ctx.strokeStyle = "white";
   ctx.lineWidth = 2;
   // 畫直線
   for (let i = 1; i < lineCount; i++) {
      if (i === 4 || i === 3) continue; // 跳過中間兩條直線
      const t = i / lineCount;
      const xL = p0.x + (p3.x - p0.x) * t;
      const yL = p0.y + (p3.y - p0.y) * t;
      const xR = p1.x + (p2.x - p1.x) * t;
      const yR = p1.y + (p2.y - p1.y) * t;
      ctx.beginPath();
      ctx.moveTo(xL, yL);
      ctx.lineTo(xR, yR);
      ctx.stroke();
   }
   // 畫橫線
   for (let i = 1; i < lineCount; i++) {
      if (i === 2 ) continue; // 跳過中間兩條橫線
      const t = i / lineCount;
      const xT = p0.x + (p1.x - p0.x) * t;
      const yT = p0.y + (p1.y - p0.y) * t;
      const xB = p3.x + (p2.x - p3.x) * t;
      const yB = p3.y + (p2.y - p3.y) * t;
      ctx.beginPath();
      ctx.moveTo(xT, yT);
      ctx.lineTo(xB, yB);
      ctx.stroke();
   }
   ctx.restore();
}
}