import './style.css'
import redUrl from '/red.png';
import blueUrl from '/blue.png';

//variables
let width = 512;
let staticX = 592;
let staticY = 200;
if (window.screen.width < 800) {
  width = width / 2;
  staticX = staticX / 2;
  staticY = staticY / 2;
}
const height = width / (4 / 3);
let video = null;
let canvas = null;
let redStatic = null;
let blueStatic = null;
let bookType = "red";
let bookColor = "red";

//preliminary setup
//grab webcam video, static, and canvas
video = document.getElementById('webcam');
canvas = document.querySelector('canvas');
redStatic = document.getElementById('redstatic');
blueStatic = document.getElementById('bluestatic');
//setup video
video.setAttribute("width", width);
video.setAttribute("height", height);
//setup canvas
const ctx = canvas.getContext('2d');
canvas.width = width * 2;
canvas.height = height * 2;
//setup static
redStatic.setAttribute("width", width);
redStatic.setAttribute("height", height);
blueStatic.setAttribute("width", width);
blueStatic.setAttribute("height", height);

//start webcam
navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then((stream) => {
    video.srcObject = stream;
    video.play;
  })
  .catch((err) => {
    console.error('Could not grab webcam');
  });

//start static
redStatic.play();
blueStatic.play();

//color settings
//bring me the red page
const redBook = new Image(500, 500);
redBook.src = redUrl;
const redColor = "#cd616a";

//no... always the blue pages... never the red pages...
const blueBook = new Image(500, 500);
blueBook.src = blueUrl;
const blueColor = "#6161cd";

//know what color static to draw
function drawStatic() {
  if (bookColor == "red") {
    ctx.drawImage(redStatic, staticX, staticY, redStatic.width / 1.74, redStatic.height / 1.74);
  } else {
    ctx.drawImage(blueStatic, staticX, staticY, blueStatic.width / 1.74, blueStatic.height / 1.74);
  }
}

//control settings
//swapping books
function swapBooks() {
  if (bookColor == "red") {
    bookColor = "blue";
    ctx.fillStyle = blueColor;
    bookType = blueBook;
    blueStatic.play();
    redStatic.pause();
  } else {
    bookColor = "red";
    ctx.fillStyle = redColor;
    bookType = redBook;
    redStatic.play();
    blueStatic.pause();
  }
}
const swapColors = document.getElementById('swapcolors');
swapColors.addEventListener('click', () => {
  swapBooks();
})

//record webm
const recordVideo = document.getElementById('recordvideo');
const download = document.getElementById('download');
const recordOptions = {
};

function saveWebm(mediaRecorder, recordData) {
  const blob = new Blob(recordData, { type: "video/webm" });
  download.innerHTML = `
    <a href="#" id="downloadwebm">DOWNLOAD .WEBM</a>
    `;
  swapColors.disabled = false;
  recordVideo.disabled = false;
  const downloadWebm = document.getElementById('downloadwebm');

  let recording = URL.createObjectURL(blob);
  downloadWebm.href = recording;
  downloadWebm.download = "pages.webm";
}

recordVideo.addEventListener('click', () => {
  let recordData = [];
  const stream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, recordOptions);
  mediaRecorder.ondataavailable = (event) => {
    recordData.push(event.data);
  }
  mediaRecorder.onstop = (event) => { saveWebm(mediaRecorder, recordData); }
  mediaRecorder.start();
  download.innerHTML = `
    RECORDING...
    `;
  swapColors.disabled = true;
  recordVideo.disabled = true;
  setTimeout(() => { mediaRecorder.stop(); }, 3000);
})

//putting it all together
//set defaults to red
ctx.fillStyle = redColor;
bookType = redBook;

//change static intensity
let staticIntensity = 0.6;
let ignoreShift = false;
function shiftStatic() {
  if (ignoreShift) {
    return;
  } else {
    ignoreShift = true;
    setTimeout(() => { staticIntensity -= 0.1 }, 1000);
    setTimeout(() => { staticIntensity -= 0.1 }, 2000);
    setTimeout(() => { staticIntensity -= 0.1 }, 3000);
    setTimeout(() => { staticIntensity -= 0.1 }, 4000);
    setTimeout(() => { staticIntensity -= 0.1 }, 5000);
    setTimeout(() => { staticIntensity += 0.2 }, 6000);
    setTimeout(() => { staticIntensity += 0.2 }, 7000);
    setTimeout(() => { staticIntensity = 0.6; ignoreShift = false; }, 8000);
  }
}

//main loop
function loop() {
  requestAnimationFrame(loop);
  drawStatic();
  shiftStatic();
  ctx.globalAlpha = staticIntensity;
  ctx.drawImage(video, staticX, staticY, video.width / 1.74, video.height / 1.74);
  ctx.globalAlpha = 0.5;
  ctx.fillRect(staticX, (staticY - 10), video.width / 1.74, video.height / 1.5);
  ctx.globalAlpha = 1;
  ctx.drawImage(bookType, 0, 0, canvas.width, canvas.height);
}

//drop the book in the fissure
loop();
