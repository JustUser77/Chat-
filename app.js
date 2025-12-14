const SUPABASE_URL = "https://leidpjprupxslheuzqkj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlaWRwanBydXB4c2xoZXV6cWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MDA4NjQsImV4cCI6MjA4MTI3Njg2NH0.GNDKhRXQ8-hqu2prAKHwU7po09MFlSbbBmqdDhbJMyg";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const user = localStorage.getItem("user");
if (!user) location.href = "index.html";

const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("msg");
const fileInput = document.getElementById("fileInput");
const btnSend = document.getElementById("btnSend");
const btnFile = document.getElementById("btnFile");

async function loadMessages() {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at");

  if (error) console.error(error);

  chatBox.innerHTML = "";
  data.forEach(showMessage);
}
loadMessages();

supabase
  .channel("messages-realtime")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages" },
    payload => showMessage(payload.new)
  )
  .subscribe();

async function send() {
  const text = msgInput.value.trim();
  if (!text) return;

  await supabase.from("messages").insert({ user, text });
  msgInput.value = "";
}

function pickFile() { fileInput.click(); }

fileInput.onchange = async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const path = Date.now() + "_" + file.name;
  await supabase.storage.from("files").upload(path, file);
  const { data } = supabase.storage.from("files").getPublicUrl(path);

  await supabase.from("messages").insert({
    user,
    file_url: data.publicUrl,
    file_name: file.name
  });

  fileInput.value = "";
};

function showMessage(msg) {
  const div = document.createElement("div");
  div.className = "msg" + (msg.user === user ? " me" : "");
  
  if (msg.text) div.innerHTML = `<b>${msg.user}</b><br>${msg.text}`;
  else if (msg.file_url) {
    if (msg.file_url.match(/\.(jpg|jpeg|png|gif)$/i))
      div.innerHTML = `<b>${msg.user}</b><br><img src="${msg.file_url}">`;
    else
      div.innerHTML = `<b>${msg.user}</b><br><a href="${msg.file_url}" target="_blank">${msg.file_name}</a>`;
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

btnSend.addEventListener("click", send);
btnFile.addEventListener("click", pickFile);
window.send = send;
window.pickFile = pickFile;  const text = msgInput.value.trim();
  if (!text) return;

  await supabase.from("messages").insert({
    user: user,
    text: text
  });

  msgInput.value = "";
}

/*********************************
 * 7. KIRIM FILE
 *********************************/
function pickFile() {
  fileInput.click();
}

fileInput.onchange = async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const path = Date.now() + "_" + file.name;

  await supabase.storage
    .from("files")
    .upload(path, file);

  const { data } = supabase.storage
    .from("files")
    .getPublicUrl(path);

  await supabase.from("messages").insert({
    user: user,
    file_url: data.publicUrl,
    file_name: file.name
  });

  fileInput.value = "";
};

/*********************************
 * 8. TAMPILKAN PESAN
 *********************************/
function showMessage(msg) {
  const div = document.createElement("div");
  div.className = "msg" + (msg.user === user ? " me" : "");

  if (msg.text) {
    div.innerHTML = `<b>${msg.user}</b><br>${msg.text}`;
  } else if (msg.file_url) {
    if (msg.file_url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      div.innerHTML = `<b>${msg.user}</b><br><img src="${msg.file_url}">`;
    } else {
      div.innerHTML = `<b>${msg.user}</b><br>
        <a href="${msg.file_url}" target="_blank">${msg.file_name}</a>`;
    }
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

/*********************************
 * 9. EVENT LISTENER GLOBAL
 * Ini WAJIB agar tombol bisa di HP
 *********************************/
btnSend.addEventListener("click", send);
btnFile.addEventListener("click", pickFile);
window.send = send;
window.pickFile = pickFile;    console.error(error);
    return;
  }

  chatBox.innerHTML = "";
  data.forEach(showMessage);
}
loadMessages();

/*********************************
 * 5. REALTIME CHAT
 *********************************/
supabase
  .channel("messages-realtime")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
    },
    payload => showMessage(payload.new)
  )
  .subscribe();

/*********************************
 * 6. KIRIM TEKS
 *********************************/
async function send() {
  const text = msgInput.value.trim();
  if (!text) return;

  await supabase.from("messages").insert({
    user: user,
    text: text
  });

  msgInput.value = "";
}

/*********************************
 * 7. KIRIM FILE
 *********************************/
function pickFile() {
  fileInput.click();
}

fileInput.onchange = async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const path = Date.now() + "_" + file.name;

  await supabase.storage
    .from("files")
    .upload(path, file);

  const { data } = supabase.storage
    .from("files")
    .getPublicUrl(path);

  await supabase.from("messages").insert({
    user: user,
    file_url: data.publicUrl,
    file_name: file.name
  });

  fileInput.value = "";
};

/*********************************
 * 8. TAMPILKAN PESAN
 *********************************/
function showMessage(msg) {
  const div = document.createElement("div");
  div.className = "msg" + (msg.user === user ? " me" : "");

  if (msg.text) {
    div.innerHTML = `<b>${msg.user}</b><br>${msg.text}`;
  } 
  else if (msg.file_url) {
    if (msg.file_url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      div.innerHTML = `<b>${msg.user}</b><br><img src="${msg.file_url}">`;
    } else {
      div.innerHTML = `<b>${msg.user}</b><br>
        <a href="${msg.file_url}" target="_blank">${msg.file_name}</a>`;
    }
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
  const path = Date.now() + "_" + file.name;

  // Upload ke Supabase Storage
  await supabase.storage
    .from("files")
    .upload(path, file);

  // Ambil URL publik
  const { data } = supabase.storage
    .from("files")
    .getPublicUrl(path);

  // Simpan ke database
  await supabase.from("messages").insert({
    user: user,
    file_url: data.publicUrl,
    file_name: file.name,
  });

  fileInput.value = "";
};


/*********************************
 * 8. TAMPILKAN PESAN
 *********************************/
function showMessage(msg) {
  const div = document.createElement("div");
  div.className = "msg" + (msg.user === user ? " me" : "");

  if (msg.text) {
    div.innerHTML = `<b>${msg.user}</b><br>${msg.text}`;
  } 
  else if (msg.file_url) {
    if (msg.file_url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      div.innerHTML = `
        <b>${msg.user}</b><br>
        <img src="${msg.file_url}">
      `;
    } else {
      div.innerHTML = `
        <b>${msg.user}</b><br>
        <a href="${msg.file_url}" target="_blank">${msg.file_name}</a>
      `;
    }
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
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
  window.send = send;
window.pickFile = pickFile;
});
