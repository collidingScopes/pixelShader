function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function tweakHexColor(hexColor, range){
  var rgbArray = hexToRgb(hexColor);

  var newRGBArray = [];

  newRGBArray.push(Math.floor(rgbArray[0]+range*Math.random()-range/2));
  newRGBArray.push(Math.floor(rgbArray[1]+range*Math.random()-range/2));
  newRGBArray.push(Math.floor(rgbArray[2]+range*Math.random()-range/2));

  var newHexColor = rgbToHex(newRGBArray[0],newRGBArray[1],newRGBArray[2]);
  return newHexColor;
}

function getHueFromHex(hex) {
  const rgb = hexToRgb(hex);
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;

  if (delta === 0) {
      hue = 0;
  } else if (max === r) {
      hue = (g - b) / delta;
  } else if (max === g) {
      hue = 2 + (b - r) / delta;
  } else {
      hue = 4 + (r - g) / delta;
  }

  hue *= 60;
  if (hue < 0) {
      hue += 360;
  }

  return hue;
}

function rgbToHue(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const hue = Math.atan2(Math.sqrt(3) * (gNorm - bNorm), 2 * rNorm - gNorm - bNorm);
  return hue * 180 / Math.PI;
  }

function rgbToSaturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return (max - min) / max;
}

function rgbToLightness(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return (max + min) / 2 / 255;
}

function interpolateHex(hex1,hex2,factor){
  hex1RGB = hexToRgb(hex1);
  hex2RGB = hexToRgb(hex2);

  var newR = Math.round(hex1RGB.r + (hex2RGB.r - hex1RGB.r)*factor);
  var newG = Math.round(hex1RGB.g + (hex2RGB.g - hex1RGB.g)*factor);
  var newB = Math.round(hex1RGB.b + (hex2RGB.b - hex1RGB.b)*factor);

  var rgbResult = "rgb("+newR+","+newG+","+newB+")";
  return rgbResult;
}

function rgbToHex(r, g, b) {
  return "#" + (
      (r.toString(16).padStart(2, "0")) +
      (g.toString(16).padStart(2, "0")) +
      (b.toString(16).padStart(2, "0"))
  );
}

function getAverageColor(chosenPixels) {
  var r = 0;
  var g = 0;
  var b = 0;
  var count = chosenPixels.length / 4;
  for (let i = 0; i < count; i++) {
      r += chosenPixels[i * 4];
      g += chosenPixels[i * 4 + 1];
      b += chosenPixels[i * 4 + 2];
  }
  return [r / count, g / count, b / count];
}

function randomWithinRange(value,range){
  return value-range+Math.random()*range*2;
}

function calcWeightedAverage(data,weights){
  var weightedAverage = 0;
  for(var i=0; i<data.length; i++){
      weightedAverage += data[i]*weights[i];
  }
  return weightedAverage;
}

//Color palette options
//Wes Anderson color palettes -- source: https://github.com/karthik/wesanderson/blob/master/R/colors.R
const colorPalettes = [
  {
    "name": "BottleRocket1",
    "palette": ["#A42820", "#5F5647", "#9B110E", "#3F5151", "#4E2A1E", "#550307", "#0C1707"],
  },
  {
    "name": "BottleRocket2",
    "palette": ["#FAD510", "#CB2314", "#273046", "#354823", "#1E1E1E"],
  },
  {
    "name": "Rushmore1",
    "palette": ["#E1BD6D", "#EABE94", "#0B775E", "#35274A" ,"#F2300F"],
  },
  {
    "name": "Rushmore",
    "palette": ["#E1BD6D", "#EABE94", "#0B775E", "#35274A" ,"#F2300F"],
  },
  {
    "name": "Royal1",
    "palette": ["#899DA4", "#C93312", "#FAEFD1", "#DC863B"],
  },
  {
    "name": "Royal2",
    "palette": ["#9A8822", "#F5CDB4", "#F8AFA8", "#FDDDA0", "#74A089"],
  },
  {
    "name": "Zissou1",
    "palette": ["#3B9AB2", "#78B7C5", "#EBCC2A", "#E1AF00", "#F21A00"],
  },
  {
    "name": "Zissou1Continuous",
    "palette": ["#3A9AB2", "#6FB2C1", "#91BAB6", "#A5C2A3", "#BDC881", "#DCCB4E", "#E3B710", "#E79805", "#EC7A05", "#EF5703", "#F11B00"],
  },
  {
    "name": "Darjeeling1",
    "palette": ["#FF0000", "#00A08A", "#F2AD00", "#F98400", "#5BBCD6"],
  },
  {
    "name": "Darjeeling2",
    "palette": ["#ECCBAE", "#046C9A", "#D69C4E", "#ABDDDE", "#000000"],
  },
  {
    "name": "Chevalier1",
    "palette": ["#446455", "#FDD262", "#D3DDDC", "#C7B19C"],
  },
  {
    "name": "FantasticFox1",
    "palette": ["#DD8D29", "#E2D200", "#46ACC8", "#E58601", "#B40F20"],
  },
  {
    "name": "Moonrise1",
    "palette": ["#F3DF6C", "#CEAB07", "#D5D5D3", "#24281A"],
  },
  {
    "name": "Moonrise2",
    "palette": ["#798E87", "#C27D38", "#CCC591", "#29211F"],
  },
  {
    "name": "Moonrise3",
    "palette": ["#85D4E3", "#F4B5BD", "#9C964A", "#CDC08C", "#FAD77B"],
  },
  {
    "name": "Cavalcanti1",
    "palette": ["#D8B70A", "#02401B", "#A2A475", "#81A88D", "#972D15"],
  },
  {
    "name": "GrandBudapest1",
    "palette": ["#F1BB7B", "#FD6467", "#5B1A18", "#D67236"],
  },
  {
    "name": "GrandBudapest2",
    "palette": ["#E6A0C4", "#C6CDF7", "#D8A499", "#7294D4"],
  },
  {
    "name": "IsleofDogs1",
    "palette": ["#9986A5", "#79402E", "#CCBA72", "#0F0D0E", "#D9D0D3", "#8D8680"],
  },
  {
    "name": "IsleofDogs2",
    "palette": ["#EAD3BF", "#AA9486", "#B6854D", "#39312F", "#1C1718"],
  },
  {
    "name": "FrenchDispatch",
    "palette": ["#90D4CC", "#BD3027", "#B0AFA2", "#7FC0C6", "#9D9C85"],
  },
  {
    "name": "AsteroidCity1",
    "palette": ["#0A9F9D", "#CEB175", "#E54E21", "#6C8645", "#C18748"],
  },
  {
    "name": "AsteroidCity2",
    "palette": ["#C52E19", "#AC9765", "#54D8B1", "#b67c3b", "#175149", "#AF4E24"],
  },
  {
    "name": "AsteroidCity3",
    "palette": ["#FBA72A", "#D3D4D8", "#CB7A5C", "#5785C1"],
  },
  {
    "name": "Beach",
    "palette": ["#151b42", "#2d5272", "#f9c485", "#d6936b", "#aaaaaa"],
  },
  {
    "name": "Viridis",
    "palette": ["#fde725", "#5ec962", "#21918c", "#3b528b", "#440154"],
  },
  {
    "name": "Inferno",
    "palette": ["#fcffa4", "#f98e09", "#bc3754", "#57106e", "#000004"],
  },
  {
    "name": "black&white",
    "palette": ["#ffffff", "#000000", "#ffffff", "#000000", "#ffffff"],
  },
  {
    "name": "dream",
    "palette": ["#0c0b10", "#ff71bb", "#ff294c", "#fec611", "#fff7b0", "#0520ff", "#5fc21a", "#0e0d12"],
  },
  {
    "name": "tangerine",
    "palette": ["#ea7f51", "#000000", "#e7934d", "#e39e34", "#ea7e24", "#f0521d", "#000000"],
  },
  {
    "name": "chrome",
    "palette": ["#ff470b", "#fb602b","#f9a26e","#173388", "#afcbe3"],
  },
  {
    "name": "retro",
    "palette": ["#fbf8e8", "#8cc2a9", "#cc7868", "#4b6967", "#507195", "#eac238",
    "#d57162", "#da692d", "#d2d8d4", "#dedbcc", "#686253",
    ],
  },
]