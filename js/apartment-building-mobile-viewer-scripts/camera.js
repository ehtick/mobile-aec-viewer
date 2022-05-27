function readDrawImg(img, canvas, x, y, rad) {
  var w = img.width;
  var h = img.height;
  var resize = resizeWidthHeight(1024, w, h);
  drawImgOnCav(canvas, img, x, y, resize.w, resize.h, rad);
}

function readImg(reader) {
  var result_dataURL = reader.result;
  var img = new Image();
  img.src = result_dataURL;
  return img;
}


//端末がモバイルか
var _ua = (function (u) {
  var mobile = {
    0: (u.indexOf("windows") != -1 && u.indexOf("phone") != -1)
      || u.indexOf("iphone") != -1
      || u.indexOf("ipod") != -1
      || (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
      || (u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1)
      || u.indexOf("blackberry") != -1,
    iPhone: (u.indexOf("iphone") != -1),
    Android: (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
  };
  var tablet = (u.indexOf("windows") != -1 && u.indexOf("touch") != -1)
    || u.indexOf("ipad") != -1
    || (u.indexOf("android") != -1 && u.indexOf("mobile") == -1)
    || (u.indexOf("firefox") != -1 && u.indexOf("tablet") != -1)
    || u.indexOf("kindle") != -1
    || u.indexOf("silk") != -1
    || u.indexOf("playbook") != -1;
  var pc = !mobile[0] && !tablet;
  return {
    Mobile: mobile,
    Tablet: tablet,
    PC: pc
  };
})(window.navigator.userAgent.toLowerCase());

//キャンバスにImageを表示
function drawImgOnCav(canvas, img, x, y, w, h, rad) {
  var ctx = canvas.getContext('2d');
  canvas.width = w;
  canvas.height = h;
  var drawW = w;
  var drawH = h;
  ctx.drawImage(img, x, y, drawW, drawH);
}

function resizeWidthHeight(target_length_px, w0, h0) {
  //リサイズの必要がなければ元のwidth, heightを返す
  var length = Math.max(w0, h0);
  if (length <= target_length_px) {
    return {
      flag: false,
      w: w0,
      h: h0
    };
  }
  //リサイズの計算
  var w1;
  var h1;
  if (w0 >= h0) {
    w1 = target_length_px;
    h1 = h0 * target_length_px / w0;
  } else {
    w1 = w0 * target_length_px / h0;
    h1 = target_length_px;
  }
  return {
    flag: true,
    w: parseInt(w1),
    h: parseInt(h1)
  };
}

var cameraViews = [
  { "position": { "x": 328.9892746732946, "y": -4440.113348778601, "z": 10274.221148482955 }, "target": { "x": -57390.544831372696, "y": -3981.114426936313, "z": 2403.3047335136744 }, "up": { "x": -0.13510593301376134, "y": 0.0010743932456883268, "z": 0.9908305771137842 }, "width": 58255.527259584414, "height": 58255.527259584414, "projection": 1, "nearLimit": 0.01, "className": "Communicator.Camera" },
  { "position": { "x": -1621.0929764800508, "y": -461.1582265625445, "z": 10274.221148482955 }, "target": { "x": 56098.44112956594, "y": -920.1571484048254, "z": 2403.3047335136744 }, "up": { "x": 0.13510593301376136, "y": -0.0010743932456883105, "z": 0.9908305771137842 }, "width": 58255.527259584414, "height": 58255.527259584414, "projection": 1, "nearLimit": 0.01, "className": "Communicator.Camera" },
  { "position": { "x": 3050.5296577636177, "y": 1483.4157742880225, "z": 10274.221148482955 }, "target": { "x": 3509.528579605902, "y": 59202.94988033403, "z": 2403.3047335136225 }, "up": { "x": 0.0010743932456883246, "y": 0.1351059330137622, "z": 0.9908305771137841 }, "width": 58255.527259584414, "height": 58255.527259584414, "projection": 1, "nearLimit": 0.01, "className": "Communicator.Camera" },
  { "position": { "x": 4963.468497139266, "y": -6458.576430986766, "z": 10274.221148482955 }, "target": { "x": 5014.362473912823, "y": -552.5195490228033, "z": 9460.910475439015 }, "up": { "x": 0.0011754830025154264, "y": 0.1364104343334622, "z": 0.99065171056465 }, "width": 5962.010617100914, "height": 5962.010617100914, "projection": 1, "nearLimit": 0.01, "className": "Communicator.Camera" }
]