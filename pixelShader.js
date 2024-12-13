/*
To do:
Review entire code base to understand functionality
Choose better default video (Tokyo train video -- downsize and optimize first)
Add more color palettes
Write about section, footer section, site OG tags
Clean up code / remove commented out code
Review CSS / page layout / margins
Fix upload video on mobile (follow example from ASCII)
Rename page title, github repo, etc...
Upon video record, rewind user video and default video to 0 time (see ASCII example)
*/

// DOM Elements
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl', {preserveDrawingBuffer: false}) || canvas.getContext('experimental-webgl');
const fileInput = document.getElementById('fileInput');
const inputToggle = document.getElementById('inputToggle');
let currentVideo = null;
let isWebcam = true;
let animationPlayToggle = false;
let animationRequest;
let isMobileFlag = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
console.log("Mobile?: "+isMobileFlag);

let userVideo = document.getElementById('userVideo');
let defaultVideo = document.getElementById('defaultVideo');
let defaultVideoWidth = 480;
let defaultVideoHeight = 848;

if (!gl) {
  alert('WebGL not supported');
  throw new Error('WebGL not supported');
}

// Event listeners for controls
fileInput.addEventListener('change', (e) => {
  cleanupVideoSource();
  if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // document.getElementById('fileName').textContent = file.name;
      //handleVideoUpload(file);

      const url = URL.createObjectURL(file);
      userVideo.src = url;
      userVideo.addEventListener('loadedmetadata', () => {
          
          userVideo.width = userVideo.videoWidth;
          userVideo.height = userVideo.videoHeight;
          console.log("user video width/height: "+userVideo.width+", "+userVideo.height);

          canvas.width = userVideo.width;
          canvas.height = userVideo.height;
          gl.viewport(0, 0, canvas.width, canvas.height);

      });
      
      // Wait for video to be loaded before playing
      userVideo.oncanplay = () => {
          userVideo.play();
          currentVideo = userVideo;
          // animationRequest = render(currentVideo);
          render();
      };
  }
    
});

//add gui
let obj = {
  pixelSize: 8,
  colorPalette: "field",
};

let gui = new dat.gui.GUI( { autoPlace: false } );
// gui.close();
let guiOpenToggle = true;

obj['useWebcam'] = function () {
  useWebcam();
};
gui.add(obj, 'useWebcam').name('Use Webcam');

obj['uploadVideo'] = function () {
  fileInput.click();
};
gui.add(obj, 'uploadVideo').name('Upload Video');

gui.add(obj, "pixelSize").min(1).max(32).step(1).name('Pixel Size');
gui.add(obj, "colorPalette", ["field","underwater","forest","flame","dusk","grayscale"]);

obj['pausePlay'] = function () {
  toggleAnimationPlay();
};
gui.add(obj, 'pausePlay').name("Pause/Play (p)");

obj['saveImage'] = function () {
  saveImage();
};
gui.add(obj, 'saveImage').name("Save Image (s)");

obj['saveVideo'] = function () {
  toggleVideoRecord();
};
gui.add(obj, 'saveVideo').name("Video Export (v)");

customContainer = document.getElementById( 'gui' );
customContainer.appendChild(gui.domElement);

// Define color palettes
const palettes = {
    field: [
        [0.950, 0.950, 0.950], // White clouds
        [0.529, 0.808, 0.922], // Sky blue
        [0.275, 0.510, 0.706], // Dark blue
        [0.463, 0.635, 0.439], // Forest green
        [0.322, 0.424, 0.314], // Dark green
        [0.957, 0.843, 0.647], // Wheat yellow
        [0.839, 0.678, 0.427], // Dark wheat
        [0.682, 0.506, 0.427], // Brown
        [0.408, 0.302, 0.294], // Dark brown
        [0.216, 0.216, 0.216]  // Shadow
    ],
    underwater: [
        [0.118, 0.471, 0.706], // Deep blue
        [0.173, 0.612, 0.620], // Teal
        [0.255, 0.757, 0.678], // Light teal
        [1.000, 0.412, 0.380], // Coral red
        [0.957, 0.643, 0.376], // Coral orange
        [0.824, 0.369, 0.584], // Purple coral
        [0.467, 0.745, 0.851], // Light blue
        [0.298, 0.180, 0.247], // Deep purple
        [0.925, 0.941, 0.945], // White
        [0.078, 0.110, 0.141]  // Dark blue
    ],
    forest: [
        [0.133, 0.184, 0.133], // Dark green
        [0.255, 0.369, 0.196], // Mid green
        [0.475, 0.557, 0.286], // Light green
        [0.702, 0.639, 0.298], // Yellow-green
        [0.408, 0.314, 0.235], // Brown
        [0.573, 0.439, 0.322], // Light brown
        [0.765, 0.765, 0.847], // Light blue
        [0.631, 0.631, 0.737], // Misty blue
        [0.871, 0.886, 0.894], // White
        [0.424, 0.459, 0.404]  // Gray green
    ],
    flame: [
        [1.000, 0.439, 0.122], // Bright orange
        [0.961, 0.647, 0.263], // Light orange
        [1.000, 0.843, 0.000], // Sun yellow
        [0.702, 0.341, 0.165], // Dark orange
        [0.529, 0.220, 0.196], // Dark red
        [0.231, 0.184, 0.235], // Dark purple
        [0.333, 0.278, 0.365], // Mountain purple
        [0.455, 0.376, 0.490], // Light purple
        [0.098, 0.098, 0.137], // Near black
        [0.835, 0.584, 0.310]  // Gold
    ],
    dusk: [
        [0.039, 0.039, 0.078], // Night blue
        [0.118, 0.157, 0.275], // Deep blue
        [0.275, 0.196, 0.408], // Purple blue
        [0.839, 0.424, 0.400], // Coral
        [0.957, 0.576, 0.447], // Light coral
        [1.000, 0.871, 0.678], // Light yellow
        [0.173, 0.220, 0.369], // City blue
        [0.471, 0.349, 0.557], // Mid purple
        [1.000, 1.000, 1.000], // White
        [0.557, 0.612, 0.722]  // Light blue
    ],
    grayscale: [
        [0.000, 0.000, 0.000], // Black
        [0.111, 0.111, 0.111],
        [0.222, 0.222, 0.222],
        [0.333, 0.333, 0.333],
        [0.444, 0.444, 0.444],
        [0.556, 0.556, 0.556],
        [0.667, 0.667, 0.667],
        [0.778, 0.778, 0.778],
        [0.889, 0.889, 0.889],
        [1.000, 1.000, 1.000]  // White
    ]
};

// Helper function to generate shader color definitions
function createPaletteDefinitions() {
    let defs = '';
    Object.entries(palettes).forEach(([name, colors], index) => {
        colors.forEach((color, i) => {
            defs += `const vec3 c${index}_${i} = vec3(${color[0].toFixed(3)}, ${color[1].toFixed(3)}, ${color[2].toFixed(3)});\n`;
        });
        defs += '\n';
    });
    return defs;
}

const vertexShaderSource = `
    attribute vec2 position;
    attribute vec2 texCoord;
    varying vec2 vTexCoord;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        vTexCoord = texCoord;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform sampler2D uTexture;
    uniform vec2 resolution;
    uniform float pixelSize;
    uniform int paletteChoice;

    ${createPaletteDefinitions()}

    vec3 findClosestColor(vec3 color) {
        float minDist = 1000.0;
        vec3 closestColor;
        float dist;

        if (paletteChoice == 0) {
            // field palette
            dist = distance(color, c0_0); if(dist < minDist) { minDist = dist; closestColor = c0_0; }
            dist = distance(color, c0_1); if(dist < minDist) { minDist = dist; closestColor = c0_1; }
            dist = distance(color, c0_2); if(dist < minDist) { minDist = dist; closestColor = c0_2; }
            dist = distance(color, c0_3); if(dist < minDist) { minDist = dist; closestColor = c0_3; }
            dist = distance(color, c0_4); if(dist < minDist) { minDist = dist; closestColor = c0_4; }
            dist = distance(color, c0_5); if(dist < minDist) { minDist = dist; closestColor = c0_5; }
            dist = distance(color, c0_6); if(dist < minDist) { minDist = dist; closestColor = c0_6; }
            dist = distance(color, c0_7); if(dist < minDist) { minDist = dist; closestColor = c0_7; }
            dist = distance(color, c0_8); if(dist < minDist) { minDist = dist; closestColor = c0_8; }
            dist = distance(color, c0_9); if(dist < minDist) { minDist = dist; closestColor = c0_9; }
        } else if (paletteChoice == 1) {
            // Underwater palette
            dist = distance(color, c1_0); if(dist < minDist) { minDist = dist; closestColor = c1_0; }
            dist = distance(color, c1_1); if(dist < minDist) { minDist = dist; closestColor = c1_1; }
            dist = distance(color, c1_2); if(dist < minDist) { minDist = dist; closestColor = c1_2; }
            dist = distance(color, c1_3); if(dist < minDist) { minDist = dist; closestColor = c1_3; }
            dist = distance(color, c1_4); if(dist < minDist) { minDist = dist; closestColor = c1_4; }
            dist = distance(color, c1_5); if(dist < minDist) { minDist = dist; closestColor = c1_5; }
            dist = distance(color, c1_6); if(dist < minDist) { minDist = dist; closestColor = c1_6; }
            dist = distance(color, c1_7); if(dist < minDist) { minDist = dist; closestColor = c1_7; }
            dist = distance(color, c1_8); if(dist < minDist) { minDist = dist; closestColor = c1_8; }
            dist = distance(color, c1_9); if(dist < minDist) { minDist = dist; closestColor = c1_9; }
        } else if (paletteChoice == 2) {
            // Forest palette
            dist = distance(color, c2_0); if(dist < minDist) { minDist = dist; closestColor = c2_0; }
            dist = distance(color, c2_1); if(dist < minDist) { minDist = dist; closestColor = c2_1; }
            dist = distance(color, c2_2); if(dist < minDist) { minDist = dist; closestColor = c2_2; }
            dist = distance(color, c2_3); if(dist < minDist) { minDist = dist; closestColor = c2_3; }
            dist = distance(color, c2_4); if(dist < minDist) { minDist = dist; closestColor = c2_4; }
            dist = distance(color, c2_5); if(dist < minDist) { minDist = dist; closestColor = c2_5; }
            dist = distance(color, c2_6); if(dist < minDist) { minDist = dist; closestColor = c2_6; }
            dist = distance(color, c2_7); if(dist < minDist) { minDist = dist; closestColor = c2_7; }
            dist = distance(color, c2_8); if(dist < minDist) { minDist = dist; closestColor = c2_8; }
            dist = distance(color, c2_9); if(dist < minDist) { minDist = dist; closestColor = c2_9; }
        } else if (paletteChoice == 3) {
            // Flame palette
            dist = distance(color, c3_0); if(dist < minDist) { minDist = dist; closestColor = c3_0; }
            dist = distance(color, c3_1); if(dist < minDist) { minDist = dist; closestColor = c3_1; }
            dist = distance(color, c3_2); if(dist < minDist) { minDist = dist; closestColor = c3_2; }
            dist = distance(color, c3_3); if(dist < minDist) { minDist = dist; closestColor = c3_3; }
            dist = distance(color, c3_4); if(dist < minDist) { minDist = dist; closestColor = c3_4; }
            dist = distance(color, c3_5); if(dist < minDist) { minDist = dist; closestColor = c3_5; }
            dist = distance(color, c3_6); if(dist < minDist) { minDist = dist; closestColor = c3_6; }
            dist = distance(color, c3_7); if(dist < minDist) { minDist = dist; closestColor = c3_7; }
            dist = distance(color, c3_8); if(dist < minDist) { minDist = dist; closestColor = c3_8; }
            dist = distance(color, c3_9); if(dist < minDist) { minDist = dist; closestColor = c3_9; }
        } else if (paletteChoice == 4) {
            // Dusk palette
            dist = distance(color, c4_0); if(dist < minDist) { minDist = dist; closestColor = c4_0; }
            dist = distance(color, c4_1); if(dist < minDist) { minDist = dist; closestColor = c4_1; }
            dist = distance(color, c4_2); if(dist < minDist) { minDist = dist; closestColor = c4_2; }
            dist = distance(color, c4_3); if(dist < minDist) { minDist = dist; closestColor = c4_3; }
            dist = distance(color, c4_4); if(dist < minDist) { minDist = dist; closestColor = c4_4; }
            dist = distance(color, c4_5); if(dist < minDist) { minDist = dist; closestColor = c4_5; }
            dist = distance(color, c4_6); if(dist < minDist) { minDist = dist; closestColor = c4_6; }
            dist = distance(color, c4_7); if(dist < minDist) { minDist = dist; closestColor = c4_7; }
            dist = distance(color, c4_8); if(dist < minDist) { minDist = dist; closestColor = c4_8; }
            dist = distance(color, c4_9); if(dist < minDist) { minDist = dist; closestColor = c4_9; }
        } else {
            // Grayscale palette
            dist = distance(color, c5_0); if(dist < minDist) { minDist = dist; closestColor = c5_0; }
            dist = distance(color, c5_1); if(dist < minDist) { minDist = dist; closestColor = c5_1; }
            dist = distance(color, c5_2); if(dist < minDist) { minDist = dist; closestColor = c5_2; }
            dist = distance(color, c5_3); if(dist < minDist) { minDist = dist; closestColor = c5_3; }
            dist = distance(color, c5_4); if(dist < minDist) { minDist = dist; closestColor = c5_4; }
            dist = distance(color, c5_5); if(dist < minDist) { minDist = dist; closestColor = c5_5; }
            dist = distance(color, c5_6); if(dist < minDist) { minDist = dist; closestColor = c5_6; }
            dist = distance(color, c5_7); if(dist < minDist) { minDist = dist; closestColor = c5_7; }
            dist = distance(color, c5_8); if(dist < minDist) { minDist = dist; closestColor = c5_8; }
            dist = distance(color, c5_9); if(dist < minDist) { minDist = dist; closestColor = c5_9; }
        }
        
        return closestColor;
    }

    void main() {
        vec2 pixelatedCoord = floor(vTexCoord * resolution / pixelSize) * pixelSize / resolution;
        vec4 color = texture2D(uTexture, pixelatedCoord);
        vec3 quantizedColor = findClosestColor(color.rgb);
        gl_FragColor = vec4(quantizedColor, 1.0);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    throw new Error('Failed to link program');
}

// Set up geometry
const positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1,
]);

const texCoords = new Float32Array([
    0, 1,
    1, 1,
    0, 0,
    1, 0,
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, 'position');
const texCoordLocation = gl.getAttribLocation(program, 'texCoord');
const resolutionLocation = gl.getUniformLocation(program, 'resolution');
const pixelSizeLocation = gl.getUniformLocation(program, 'pixelSize');
const paletteChoiceLocation = gl.getUniformLocation(program, 'paletteChoice');

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
// Initialize with empty texture
gl.texImage2D(
    gl.TEXTURE_2D, 
    0, 
    gl.RGBA, 
    1, 
    1, 
    0, 
    gl.RGBA, 
    gl.UNSIGNED_BYTE, 
    new Uint8Array([0, 0, 0, 255])
);

// Add initialization code
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);

async function setupWebcam() {
  const video = document.createElement('video');

  if(isMobileFlag){
    video.setAttribute('playsinline', '');  // Required for iOS
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('autoplay', '');
    video.style.transform = 'scaleX(-1)';  // Mirror the video
  }

  try {
      const constraints = {
          video: {
              width: { ideal: 1280 },
              height: { ideal: 720 }
          }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
          video.onloadedmetadata = () => {
              video.play().then(() => resolve());
          };
      });
      
      // Set canvas size after video is ready
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      
      return video;
  } catch (err) {
      console.error('Error accessing camera:', err);
      throw err;
  }
}

function render() {
  drawScene();
  animationRequest = requestAnimationFrame(render);
}

function drawScene(){
  // if (!currentVideo || currentVideo.readyState < currentVideo.HAVE_CURRENT_DATA) {
  //   // animationRequest = requestAnimationFrame(() => render(video));
  //   return;
  // }

  if (!currentVideo.paused) {
      animationPlayToggle = true;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      
      try {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, currentVideo);
      } catch (e) {
          console.error('Error updating texture:', e);
          // animationRequest = requestAnimationFrame(() => render(video));
          return;
      }

      gl.useProgram(program);

      // Set uniforms
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(pixelSizeLocation, parseFloat(obj.pixelSize));

      let paletteValue;
      switch(obj.colorPalette) {
          case 'field': paletteValue = 0; break;
          case 'underwater': paletteValue = 1; break;
          case 'forest': paletteValue = 2; break;
          case 'flame': paletteValue = 3; break;
          case 'dusk': paletteValue = 4; break;
          case 'grayscale': paletteValue = 5; break;
          default: paletteValue = 0;
      }
      gl.uniform1i(paletteChoiceLocation, paletteValue);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

// Handle video source cleanup
function cleanupVideoSource() {
  if (currentVideo) {
      currentVideo.pause();
      if (currentVideo.srcObject) {
          // Stop webcam stream
          const tracks = currentVideo.srcObject.getTracks();
          tracks.forEach(track => track.stop());
          currentVideo.srcObject = null;
      } else if (currentVideo.src) {
          // Clean up uploaded video
          URL.revokeObjectURL(currentVideo.src);
          currentVideo.src = '';
      }
      currentVideo = null;
  }
}

function useWebcam(){
  cleanupVideoSource();
  setupWebcam().then(video => {
      currentVideo = video;
      animationPlayToggle = true;
      // animationRequest = render(video);
      render();
  }).catch(err => {
      console.error('Failed to start webcam:', err);
  });
}

function handleVideoUpload(file) {
  cleanupVideoSource();
  
  const video = document.createElement('video');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('crossorigin', 'anonymous');
  
  // Create object URL for the uploaded file
  const objectURL = URL.createObjectURL(file);
  video.src = objectURL;
  video.loop = true;
  
  // Set up video loading handlers
  video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
  };
  
  // Wait for video to be loaded before playing
  video.oncanplay = () => {
      video.play();
      currentVideo = video;
      // animationRequest = render(currentVideo);
      render();
  };
}

function useDefaultVideo() {
  cleanupVideoSource();
  console.log("start default video");
  // video.setAttribute('playsinline', 'playsinline');
  // video.setAttribute('webkit-playsinline', 'webkit-playsinline');
  defaultVideo.setAttribute('crossorigin', 'anonymous');

  if(isMobileFlag){
    video.setAttribute('playsinline', '');  // Required for iOS
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('autoplay', '');
    video.style.transform = 'scaleX(-1)';  // Mirror the video
  }
  
  // Create object URL for the uploaded file
  // const objectURL = URL.createObjectURL(file);
  // video.src = objectURL;
  // defaultVideo.loop = true;

  // Set up video loading handlers
  defaultVideo.onloadedmetadata = () => {
      canvas.width = defaultVideo.videoWidth;
      canvas.height = defaultVideo.videoHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      defaultVideo.play();
      currentVideo = defaultVideo;
      render();
  };
  
  // Wait for video to be loaded before playing
  // defaultVideo.oncanplay = () => {

  // };
}

function startDefaultVideo(){
  if(animationPlayToggle==true){
      playAnimationToggle = false;
      cancelAnimationFrame(animationRequest);
      console.log("cancel animation");
  }

  canvasWidth = defaultVideoWidth;
  canvasHeight = defaultVideoHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  defaultVideo.play();

  gl.viewport(0, 0, canvas.width, canvas.height);
  playAnimationToggle = true;

  currentVideo = defaultVideo;
  render();
}

function toggleAnimationPlay(){
  if(animationPlayToggle){
    currentVideo.pause();
    cancelAnimationFrame(animationRequest);
  } else {
    currentVideo.play();
    // animationRequest = render(currentVideo);
    render();
  }
  animationPlayToggle = !animationPlayToggle;
}

function toggleGUI(){
  if(guiOpenToggle == false){
      gui.open();
      guiOpenToggle = true;
  } else {
      gui.close();
      guiOpenToggle = false;
  }
}
  
//shortcut hotkey presses
document.addEventListener('keydown', function(event) {
  
  if (event.key === 's') {
      saveImage();
  } else if (event.key === 'v') {
      toggleVideoRecord();
  } else if (event.key === 'o') {
      toggleGUI();
  } else if (event.key === 'p') {
    toggleAnimationPlay();
  }
  
});

//MAIN METHOD
setInterval(startDefaultVideo(),1000);