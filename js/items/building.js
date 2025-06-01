class Building {
   constructor(poly, height = 200) {
      this.base = poly;
      this.height = height;
      this.img = null;
      this.imgScaler = 1;
      this.imgOffset = new Point(0, 0);
   }

   static load(info, index) {
      const b = new Building(Polygon.load(info.base), info.height);
      if (info.id) {
         b.id = info.id;
      } else {
         b.id = index;
      }
      switch (b.id) {
         case 31:
            b.img = new Image();
            b.img.src = "js/items/img/31.png";
            b.imgScaler = 1.5;
            b.imgOffset = new Point(-300, 0);
            b.img.onload = () => { if (window.requestAnimationFrame) window.requestAnimationFrame(()=>{}); };
            break;
         case 12:
            b.img = new Image();
            b.img.src = "js/items/img/12.png";
            b.imgScaler = 2;
            b.imgOffset = new Point(-220, 0);
            b.img.onload = () => { if (window.requestAnimationFrame) window.requestAnimationFrame(()=>{}); };
            break;
         case 32:
            b.img = new Image();
            b.img.src = "js/items/img/32.png";
            b.imgScaler = 2;
            b.imgOffset = new Point(-125, 0);
            b.img.onload = () => { if (window.requestAnimationFrame) window.requestAnimationFrame(()=>{}); };
            break;       
         case 33:
            b.img = new Image();
            b.img.src = "js/items/img/33.png";
            b.imgScaler = 1.5;
            b.imgOffset = new Point(150, 0);

            b.img2 = new Image();
            b.img2.src = "js/items/img/332.png";
            b.img2Scaler = 1;
            b.img2Offset = new Point(-400, 50);
            b.img.onload = () => { if (window.requestAnimationFrame) window.requestAnimationFrame(()=>{}); };
            break;
         case 34:
            b.img = new Image();
            b.img.src = "js/items/img/34.png";
            b.imgScaler = 1.5;
            b.imgOffset = new Point(50, 0);
            b.img.onload = () => { if (window.requestAnimationFrame) window.requestAnimationFrame(()=>{}); };
            break;
         case 35:
            b.img = new Image();
            b.img.src = "js/items/img/35.png";
            b.imgScaler = 1.5;
            b.imgOffset = new Point(100, -200);

            b.img2 = new Image();
            b.img2.src = "js/items/img/351.png";
            b.img2Scaler = 1.5   ;
            b.img2Offset = new Point(50, 400);
            b.img.onload = () => { if (window.requestAnimationFrame) window.requestAnimationFrame(()=>{}); };
            break;
      }
      return b;
   }

   draw(ctx, viewPoint) {
      const topPoints = this.base.points.map((p) =>
         getFake3dPoint(p, viewPoint, this.height * 0.6)
      );
      const ceiling = new Polygon(topPoints);

//房子中心點
      const minX = Math.min(...this.base.points.map((p) => p.x));
      const maxX = Math.max(...this.base.points.map((p) => p.x));
      const minY = Math.min(...this.base.points.map((p) => p.y));
      const maxY = Math.max(...this.base.points.map((p) => p.y));
      const center = add(
         this.imgOffset,
         new Point((minX + maxX) / 2, (minY + maxY) / 2)
      );
      ceiling.imgLoc = getFake3dPoint(center, viewPoint, this.height * 0.6);
      

      let rad = Number.MAX_SAFE_INTEGER;
      for (const seg of this.base.segments) {
         const d = seg.distanceToPoint(center);
         if (d < rad) {
            rad = d;
         }
      }
      rad /= Math.sqrt(2);
      rad *= 0.8;
      ceiling.imgSize = rad * 2 * this.imgScaler;
      

      this.base.draw(ctx, { fill: "white", stroke: "rgba(0,0,0,0.2)", lineWidth: 20 });


      const sides = [];
      for (let i = 0; i < this.base.points.length; i++) {
         const nextI = (i + 1) % this.base.points.length;
         const poly = new Polygon([
            this.base.points[i], this.base.points[nextI],
            topPoints[nextI], topPoints[i]
         ]);
         sides.push(poly);
      }
      sides.sort(
         (a, b) =>
            b.distanceToPoint(viewPoint) -
            a.distanceToPoint(viewPoint)
      );
      for (const side of sides) {
         side.draw(ctx, { fill: "#999", stroke: "#555", join: "round" });
      }


      ceiling.draw(ctx, { fill: "#DDD", stroke: "#555", join: "round" });

//圖片
      if (this.img && this.img.complete) {
         ctx.save();
         ctx.translate(ceiling.imgLoc.x, ceiling.imgLoc.y);
         ctx.drawImage(
            this.img,
            -ceiling.imgSize / 2,
            -ceiling.imgSize / 2,
            ceiling.imgSize,
            ceiling.imgSize
         );
         ctx.restore();
      }
      if (this.img2 && this.img2.complete) {
         ctx.save();
         ctx.translate(ceiling.imgLoc.x + (this.img2Offset?.x || 0), ceiling.imgLoc.y + (this.img2Offset?.y || 0));
         ctx.drawImage(
         this.img2,
         -ceiling.imgSize / 2,
         -ceiling.imgSize / 2,
         ceiling.imgSize * (this.img2Scaler || 1),
         ceiling.imgSize * (this.img2Scaler || 1)
      );
      ctx.restore();
   }
   }
}
