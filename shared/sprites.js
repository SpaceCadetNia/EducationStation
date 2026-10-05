// Shared sprite-sheet helper. Each rect is [x, y, width, height] in sheet pixels,
// measured from the transparent gaps between sprites.
(function () {
  const script = document.currentScript || document.querySelector('script[src*="sprites.js"]');
  const base = new URL("../assets/images/", script.src).href;

  const SHEETS = {
    objects: "object_sprite_space_rows.png",
    figures: "figure_sprites.png"
  };

  // object_sprite_space_rows.png (the crate row is left out on purpose).
  const OBJECTS = {
    shipsA: [
      [18, 21, 119, 173], [162, 21, 123, 171], [316, 21, 117, 174], [468, 19, 111, 177],
      [610, 15, 125, 182], [760, 18, 119, 178], [911, 18, 116, 178], [1055, 21, 113, 175],
      [1187, 36, 95, 147], [1296, 22, 102, 167], [1416, 22, 106, 171]
    ],
    shipsB: [
      [18, 212, 118, 146], [159, 218, 130, 134], [315, 220, 118, 134], [463, 211, 117, 146],
      [613, 212, 119, 150], [760, 211, 119, 147], [909, 211, 119, 148], [1055, 222, 113, 129],
      [1185, 223, 97, 130], [1295, 225, 104, 127], [1413, 223, 111, 138]
    ],
    rocksLarge: [
      [29, 379, 120, 135], [204, 382, 131, 132], [380, 380, 134, 134], [566, 382, 119, 131],
      [738, 384, 120, 129], [902, 379, 140, 137], [1080, 385, 119, 129], [1241, 386, 108, 128],
      [1399, 387, 113, 122]
    ],
    rocksMedium: [
      [30, 539, 89, 95], [165, 542, 82, 92], [294, 539, 85, 94], [419, 539, 96, 96],
      [561, 544, 99, 88], [703, 539, 92, 97], [848, 550, 77, 82], [969, 541, 82, 91],
      [1092, 550, 75, 74], [1200, 548, 80, 83], [1314, 547, 77, 82], [1431, 544, 78, 87]
    ],
    rocksSmall: [
      [29, 653, 43, 52], [114, 657, 51, 46], [205, 657, 40, 47], [285, 661, 45, 49],
      [367, 656, 59, 56], [463, 654, 62, 58], [560, 667, 34, 37], [627, 658, 50, 50],
      [715, 656, 49, 51], [800, 661, 52, 50], [889, 656, 53, 54], [972, 665, 33, 37],
      [1034, 666, 32, 34], [1091, 656, 51, 53], [1180, 659, 50, 51], [1268, 659, 52, 52],
      [1352, 662, 30, 33], [1380, 678, 33, 36], [1450, 653, 57, 61]
    ],
    satellites: [
      [17, 728, 153, 138], [195, 735, 126, 121], [354, 734, 120, 130], [494, 742, 101, 116],
      [633, 725, 148, 142], [807, 730, 153, 137], [981, 728, 106, 140], [1124, 734, 102, 131],
      [1256, 736, 107, 124], [1392, 736, 123, 126]
    ]
  };

  // figure_sprites.png: 14 astronauts, all standing on the same baseline.
  const FIGURES = [
    [29, 234, 135, 236], [177, 242, 137, 228], [328, 235, 133, 235], [475, 242, 138, 228],
    [627, 240, 137, 230], [778, 240, 139, 230], [932, 224, 139, 246], [1091, 242, 136, 228],
    [1248, 224, 138, 246], [1400, 242, 138, 228], [1554, 240, 139, 230], [1708, 224, 141, 246],
    [1863, 240, 135, 230], [2012, 222, 136, 248]
  ];

  const sheetCache = {};

  function loadSheet(name) {
    if (!sheetCache[name]) {
      sheetCache[name] = new Promise(function (resolve, reject) {
        const image = new Image();
        image.addEventListener("load", function () { resolve(image); });
        image.addEventListener("error", reject);
        image.src = base + SHEETS[name];
      });
    }
    return sheetCache[name];
  }

  // Crop one rect into its own canvas. Faint alpha noise around the sprites
  // (and the sheet's thin cell lines) is cleared so edges stay crisp.
  function crop(image, rect) {
    const canvas = document.createElement("canvas");
    canvas.width = rect[2];
    canvas.height = rect[3];
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, rect[0], rect[1], rect[2], rect[3], 0, 0, rect[2], rect[3]);
    try {
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = pixels.data;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 40) data[i] = 0;
      }
      ctx.putImageData(pixels, 0, 0);
    } catch (error) {
      // file:// pages can't read pixels back; the uncleaned crop still works.
    }
    return canvas;
  }

  // Resolves to { group: [{ canvas, url, width, height }] }.
  function loadGroups(sheet, groups) {
    return loadSheet(sheet).then(function (image) {
      const out = {};
      Object.keys(groups).forEach(function (key) {
        out[key] = groups[key].map(function (rect) {
          const canvas = crop(image, rect);
          let url = "";
          try {
            url = canvas.toDataURL("image/png");
          } catch (error) {
            url = "";
          }
          return { canvas, url, width: rect[2], height: rect[3] };
        });
      });
      return out;
    });
  }

  window.EducationStationSprites = {
    loadObjects: function () { return loadGroups("objects", OBJECTS); },
    loadFigures: function () { return loadGroups("figures", { figures: FIGURES }).then((g) => g.figures); }
  };
})();
