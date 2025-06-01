class Grass {
   constructor(grasspoly, innerPolys=[]) {
      this.base = grasspoly;
      this.innerPolys = innerPolys;
   }

   static load(info) {
      return new Grass(Polygon.load(info.base), info.innerPolys);
   }

   draw(ctx) {
      this.base.draw(ctx, { fill: "rgba(7, 218, 42, 0.81)", stroke: "rgba(57, 253, 3, 0.82)", lineWidth: 10 });
   }
}