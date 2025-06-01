const myCanvas = document.getElementById("myCanvas");
myCanvas.width = 600;
myCanvas.height = 600;
const ctx = myCanvas.getContext("2d");

// 直接每次都讀取 saves/yuntech.world
fetch('saves/yuntech.world')
  .then(response => response.text())
  .then(text => {
    const worldInfo = JSON.parse(text);
    startMain(worldInfo);
  })
  .catch(err => {
    alert("載入地圖失敗: " + err);
  });

function startMain(worldInfo) {
  window.world = World.load(worldInfo);
  let graph = world.graph;

  const viewport = new Viewport(myCanvas, world.zoom, world.offset);
  const graphEditor = new GraphEditor(viewport, graph);

  window.roadBorders;
  if (graphEditor.start && graphEditor.end) {
    world.generateCorridor(graphEditor.start, graphEditor.end);
    roadBorders = world.corridor.map((s) => [s.p1, s.p2]);
  } else {
    roadBorders = world.roadBorders.map((s) => [s.p1, s.p2]);
  }

  // 讀取車輛位置資料
  const carPosString = localStorage.getItem("carPos");
  const carPos = carPosString ? JSON.parse(carPosString) : null;
  let traffic = [];

  // 產生車輛
  const N = 100; 
  const cars = generateCars(N);
  window.myCar = cars[0];
  for (let i = 1; i < cars.length; i++) {
    PDNet.mutate(cars[i].brain, 0.3);
  }

  const target = new Point(14454.6, 11513.9);  // 你想設定的目標座標
  for (let i = 0; i < cars.length; i++) {
    cars[i].setEndPoint(target);
  }

  function generateCars(N) { 
    const cars = [];
    const bestBrainString = localStorage.getItem("bestBrain");
    const bestBrain = bestBrainString ? JSON.parse(bestBrainString) : null;
    console.log("bestBrain 載入狀態:", bestBrain ? "✅ 有載入" : "❌ 沒有載入");

    for (let i = 1; i <= N; i++) {
      const car = new Car(0, 0, 35, 45, "AI");
      if (carPos) {
        car.setPos(carPos);
      }
      car.acceleration = 0;
      if (bestBrain) {
        car.brain = PDNet.clone(bestBrain);
        if (i === 1) {
          PDNet.mutate(car.brain, 0.02);
        } else {
          PDNet.mutate(car.brain, 0.0000001);
        }
      }
      cars.push(car);
    }
    return cars;
  }

  let oldGraphHash = graph.hash(); 
  animate();

  function animate() {
    viewport.reset();
    if (graph.hash() !== oldGraphHash) {
      world.generate();
      oldGraphHash = graph.hash();  
    }
    const viewPoint = scale(viewport.getOffset(), -1);
    world.draw(ctx, viewPoint);
    ctx.globalAlpha = 0.3;
    graphEditor.display();
    myCar.update(roadBorders, traffic);
    myCar.draw(ctx);
    for (let i = 1; i < cars.length; i++) {
      cars[i].update(roadBorders, traffic);
      cars[i].draw(ctx);
    }
    requestAnimationFrame(animate);
  }

  // 初始化時從 localStorage 載入最佳車輛的 brain
  function initialize() {
    const savedBrain = localStorage.getItem("bestBrain");
    if (savedBrain) {
      console.log("從 localStorage 載入 bestBrain 片段:", savedBrain.slice(0, 100));
      try {
        cars[0].brain = JSON.parse(savedBrain); // 將 brain 應用到第一輛車
        console.log("已成功載入儲存的 bestBrain 到 cars[0]");
      } catch (error) {
        console.error("載入 bestBrain 時發生錯誤:", error);
      }
    } else {
      console.log("localStorage 中沒有儲存的 bestBrain 資料");
    }
  }

  function store() {
    let bestCar = cars[0];
    console.log(`car 0 distance: ${bestCar.getDistanceToTarget()}`);
    for (let i = 1; i < cars.length; i++) {
      console.log(`car ${i} distance: ${cars[i].getDistanceToTarget()}`);
      if (cars[i].getDistanceToTarget() < bestCar.getDistanceToTarget()) {
        bestCar = cars[i];
      }
    }
    console.log("儲存最佳車距離：", bestCar.getDistanceToTarget());
    console.log("儲存前 bestBrain 片段:", JSON.stringify(bestCar.brain).slice(0, 500));
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
    console.log("儲存後 localStorage bestBrain 片段:", localStorage.getItem("bestBrain").slice(0, 500));
    console.log("已儲存最佳車的 PDNet 參數");
  }

  function cancel() {
    localStorage.removeItem("bestBrain");
    console.log("🧹 已刪除儲存的 PDNet 參數");
  }

  initialize();

  function dispose() {
    graphEditor.dispose();
    world.buildings.length = 0;
    world.trees.length = 0;
    world.waters.length = 0;
    world.markings.length = 0;
    world.grass.length = 0;
    world.pitch.length = 0;
    world.park.length = 0;
    world.court.length = 0;
    cars.length = 0;              
  }

  function save() {
    world.zoom = viewport.zoom;
    world.offset = viewport.offset;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:application/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(world))
      );

    const fileName = "name.world";
    element.setAttribute("download", fileName);

    element.click();

    localStorage.setItem("world", JSON.stringify(world));
    const carPos = myCar.getPos();
    localStorage.setItem("carPos", JSON.stringify(carPos));
  }

  function load(event) {
    const file = event.target.files[0];
    if (!file) {
      alert("No file selected.");
      return;
    }
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = (evt) => {
      const fileContent = evt.target.result;
      const jsonData = JSON.parse(fileContent);
      world = World.load(jsonData);
      graphEditor.graph = world.graph;
      viewport.zoom = world.zoom;
      viewport.offset = world.offset;
      animate();
    }
  }

  // function polysIntersect(poly1, poly2) {
  //   for (let i = 0; i < poly1.length; i++) {
  //     for (let j = 0; j < poly2.length; j++) {
  //       const touch = segmentsIntersect(
  //         poly1[i],
  //         poly1[(i + 1) % poly1.length],
  //         poly2[j],
  //         poly2[(j + 1) % poly2.length]
  //       );
  //       if (touch) {
  //         return true;
  //       }
  //     }
  //   }
  //   return false;
  // }

  // function segmentsIntersect(p1, p2, q1, q2) {
  //   function ccw(a, b, c) {
  //     return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
  //   }
  //   return (
  //     ccw(p1, q1, q2) !== ccw(p2, q1, q2) &&
  //     ccw(p1, p2, q1) !== ccw(p1, p2, q2)
  //   );
  // }

  function setMode(mode) {
    graphEditor.setMode(mode);
    if (mode === "target") {
      document.getElementById("targetBtn").style.backgroundColor = "red";
    } else {
      document.getElementById("targetBtn").style.backgroundColor = "white";
    }
  }

  function placeCar() {
    graphEditor.placeCarFlag = !graphEditor.placeCarFlag;
    if (graphEditor.placeCarFlag) {
      document.querySelector("#btnCar").style.backgroundColor = "red";
    } else {
      document.querySelector("#btnCar").style.backgroundColor = "white";
    }
  }

  function dispOffsets() {
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      if (car.acceleration == 0) {
        car.acceleration = 0.1;
        console.log("bias2", car.brain.bias2, "bias3", car.brain.bias3);
      } else {
        carPaused = false;
        if (lastTarget) {
          console.log("🔄 恢復前往目標：", lastTarget);
          setTargetFromCar(lastTarget.x, lastTarget.y);
        }
        console.log("▶️ 車輛繼續前進");
      }
    }
  }

  function stopcar() {
    isStopped = true;
    for (let i = 0; i < cars.length; i++) {
      cars[i].acceleration = 0;
      cars[i].speed = 0;
    }
    console.log("🚗 車輛已停止");
  }

  // 學院對應目標座標點
  const pavilionTargets = {
    EM: {x: 14454.600000000013, y: 11513.899999999996}, 
    EL: {x: 14612.700000000017, y: 12469.299999999994}, 
    ES: {x: 15592.400000000014, y: 12631.399999999994}, 
    EC: {x: 16231.400000000014, y: 12457.399999999994}, 
    EB: {x: 15763.400000000012, y: 10576.399999999994}, 
    EN: {x: 16404.400000000016, y: 11502.299999999996}, 
    DC1: {x: 12676.300000000014, y: 14456.399999999992},
    DC2: {x: 12884.400000000014, y: 15542.299999999996},
    DA: {x: 14943.600000000017, y: 14198.299999999996},
    MA: {x: 11775.60000000002,  y: 12964.699999999995},
    MB: {x: 10758.600000000013, y: 13149.099999999995},
    MD: {x: 10312.100000000013, y: 12185.599999999993},
    DH: {x: 12573.100000000013, y: 13880.199999999997},
    DS: {x: 14817.700000000013, y: 13445.899999999994},
    FB: {x: 13089.100000000019, y: 16240.899999999998},
    FB2: {x: 17550.599999999984, y: 17901.19999999999},
    A: {x: 14809.100000000015, y: 16799.899999999994},
    B: {x: 13781.400000000014, y: 16971.9},
    C: {x: 13325.600000000015, y: 17539.5},
    D: {x: 13450.300000000014, y: 18184.500000000004},
    E: {x: 13738.400000000014, y: 17754.500000000004},
    F: {x: 13532.000000000015, y: 18429.600000000006},
    PD: {x: 15639.699999999983, y: 14991.199999999995},
    ASP: {x: 16297.499999999984, y: 15035.199999999992},
    BK: {x:14784.799999999983, y: 13244.799999999987},
    BS: {x: 16069.399999999987, y: 16917.999999999993},
    SR: {x: 16577.899999999983, y: 15587.499999999993},
    VB: {x: 14921.399999999981, y: 13982.99999999999},
    AC: {x: 12291.699999999988, y: 12184.199999999995},
    AD: {x: 13830.099999999984, y: 10924.799999999992},
    TL: {x: 12434.699999999986, y: 13015.799999999994},
    AS: {x: 14599.299999999985, y: 12283.499999999993},
    ART: {x: 13392.499999999984, y: 13317.799999999992},
    T: {x: 15617.899999999987, y: 13897.099999999995}
  };

  // 監聽下拉選單事件
  const selectEl = document.getElementById("subMapSelect");
  if (selectEl) {
    selectEl.addEventListener("change", (e) => {
      const key = e.target.value;
      if (!key) {
        console.log("尚未選擇目的地，車輛不動");
        return;
      }
      const destination = pavilionTargets[key];
      if (destination) {
        setTargetFromCar(destination.x, destination.y);
      }
    });
  }

  function setTargetFromCar(x, y) {
    if (typeof Target !== "undefined") {
      world.markings = world.markings.filter((m) => !(m instanceof Target));
      const newTarget = new Target(x, y);
      world.markings.push(newTarget);
    }
    const start = new Point(myCar.x, myCar.y);
    const end = new Point(x, y);
    graphEditor.start = start;
    graphEditor.end = end;
    for (let i = 0; i < cars.length; i++) {
      cars[i].setEndPoint(end);
    }
    world.generateCorridor(start, end);
    roadBorders = world.corridor.map((s) => [s.p1, s.p2]);
    console.log(
      `🚗 新目標設定：從 (${start.x}, ${start.y}) 到 (${end.x}, ${end.y})`
    );
  }

  // 將需要給外部呼叫的函式掛到 window
  window.store = store;
  window.cancel = cancel;
  window.dispose = dispose;
  window.animate = animate;
  window.save = save;
  window.load = load;
  window.setMode = setMode;
  window.placeCar = placeCar;
  window.dispOffsets = dispOffsets;
  window.stopcar = stopcar;
}
