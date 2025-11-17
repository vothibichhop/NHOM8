let classifier;
let imageModelURL = "https://teachablemachine.withgoogle.com/models/k3-81IaOL/";

let video;
let label = "";
let lastLabel = "";

let started = false;

// Khi bấm nút mới bắt đầu nhận diện
document.getElementById("start-btn").onclick = () => {
  if (!started) {
    started = true;
    startAI();
  }
};

function startAI() {
  classifier = ml5.imageClassifier(imageModelURL + "model.json", () => {
    console.log("Model loaded!");
  });

  // Khởi tạo p5.js
  new p5((p) => {

    p.setup = function () {
      let c = p.createCanvas(320, 260);
      c.parent("canvas-container");

      video = p.createCapture(p.VIDEO);
      video.size(320, 260);
      video.hide();

      video.elt.onloadeddata = () => {
        classifyVideo();
      };
    };

    p.draw = function () {
      p.background(0);

      if (video && video.width > 0) {
        p.push();
        p.translate(p.width, 0);
        p.scale(-1, 1);
        p.image(video, 0, 0, p.width, p.height);
        p.pop();
      }

      p.fill(255);
      p.textSize(16);
      p.textAlign(p.CENTER);
      p.text(label, p.width / 2, p.height - 4);
    };
  });
}

function classifyVideo() {
  if (!classifier) return;
  classifier.classify(video, gotResult);
}

function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }

  label = results[0].label;
  updateInfo(label);
  classifyVideo();
}
let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();

  // Nếu có tiếng Việt thì chọn
  const vn = voices.find(v => v.lang === "vi-VN");
  if (vn) {
    console.log("Voice VI loaded:", vn.name);
  } else {
    console.log("Không tìm thấy giọng VI, đang chờ load...");
  }
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();   // chạy lần đầu

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "vi-VN";

  // Tìm voice tiếng Việt
  const vnVoice = voices.find(v => v.lang === "vi-VN");
  if (vnVoice) {
    utter.voice = vnVoice;
  }

  utter.rate = 1;
  utter.pitch = 1;

  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}
function updateInfo(label) {
const data = {
  "Lan can, rào chắn": {
    text: "Phía trước có vật chắn.",
    warn: "Cảnh báo! Phía trước có vật chắn, bạn không nên đi tiếp."
  },
  "Thùng rác": {
    text: "Phía trước có thùng rác.",
    warn: "Chú ý! Có thùng rác trước mặt bạn."
  },
  "Cột điện": {
    text: "Phía trước có cột điện.",
    warn: "Cẩn thận! Cột điện đang ở ngay trước bạn."
  },
};

  if (data[label]) {
    document.getElementById("object-desc").innerText = data[label].text;
    document.getElementById("object-warning").innerText = data[label].warn;

    if (label !== lastLabel) {
      speak(data[label].warn);
      lastLabel = label;
    }
  } else {
    document.getElementById("object-desc").innerText = "";
    document.getElementById("object-warning").innerText = "";
  }
}
teachablemachine.withgoogle.com

