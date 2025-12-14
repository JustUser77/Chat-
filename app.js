
// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAajUtZT27EkqVWJdplMwxkt-OgFIVMMpk",
  authDomain: "chat--666.firebaseapp.com",
  databaseURL: "https://chat--666-default-rtdb.firebaseio.com",
  projectId: "chat--666",
  storageBucket: "chat--666.appspot.com",
  messagingSenderId: "383947451184",
  appId: "1:383947451184:web:dc55c75651081f037336f5"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const storage = firebase.storage();

const user = localStorage.getItem("user");
if(!user) location.href = "index.html";

const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("msg");
const fileInput = document.getElementById("fileInput");

// ================= TEXT =================
function send(){
  const text = msgInput.value.trim();
  if(!text) return;

  db.ref("messages").push({
    user,
    text
  });

  msgInput.value = "";
}

// ================= FILE =================
function pickFile(){
  fileInput.click();
}

fileInput.onchange = () => {
  const file = fileInput.files[0];
  if(!file) return;

  const ref = storage.ref("files/" + Date.now() + "_" + file.name);
  ref.put(file).then(() => {
    ref.getDownloadURL().then(url => {
      db.ref("messages").push({
        user,
        file: url,
        name: file.name,
        type: file.type
      });
    });
  });
};

// ================= VOICE =================
let recorder, chunks = [];

function record(){
  if(recorder && recorder.state === "recording"){
    recorder.stop();
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    recorder = new MediaRecorder(stream);
    recorder.start();
    chunks = [];

    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const ref = storage.ref("audio/" + Date.now() + ".webm");

      ref.put(blob).then(() => {
        ref.getDownloadURL().then(url => {
          db.ref("messages").push({
            user,
            audio: url
          });
        });
      });
    };
  });
}

// ================= DISPLAY =================
db.ref("messages").on("child_added", snap => {
  const d = snap.val();
  const div = document.createElement("div");
  div.className = "msg" + (d.user === user ? " me" : "");

  if(d.text){
    div.innerHTML = `<b>${d.user}</b><br>${d.text}`;
  }
  else if(d.file){
    if(d.type.startsWith("image")){
      div.innerHTML = `<b>${d.user}</b><br><img src="${d.file}">`;
    } else {
      div.innerHTML = `<b>${d.user}</b><br><a href="${d.file}" target="_blank">${d.name}</a>`;
    }
  }
  else if(d.audio){
    div.innerHTML = `<b>${d.user}</b><br><audio controls src="${d.audio}"></audio>`;
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});
