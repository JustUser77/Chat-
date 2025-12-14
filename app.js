// ================= KONFIGURASI SUPABASE =================
const SUPABASE_URL = "https://leidpjprupxslheuzqkj.supabase.co"; // ganti dengan milikmu
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlaWRwanBydXB4c2xoZXV6cWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MDA4NjQsImV4cCI6MjA4MTI3Njg2NH0.GNDKhRXQ8-hqu2prAKHwU7po09MFlSbbBmqdDhbJMyg"; // ganti dengan anon key

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= CEK LOGIN =================
const user = localStorage.getItem("user") || prompt("Masukkan nama kamu:");
localStorage.setItem("user", user);

// ================= ELEMEN HTML =================
const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("msg");
const fileInput = document.getElementById("fileInput");
const btnSend = document.getElementById("btnSend");
const btnFile = document.getElementById("btnFile");

// ================= LOAD PESAN AWAL =================
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

// ================= REALTIME =================
supabase.channel("messages-realtime")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages" },
    payload => showMessage(payload.new)
  )
  .subscribe();

// ================= KIRIM PESAN TEKS =================
async function send() {
  const text = msgInput.value.trim();
  if (!text) return;

  await supabase.from("messages").insert({ user, text });
  msgInput.value = "";
}

// ================= KIRIM FILE =================
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

// ================= TAMPILKAN PESAN =================
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

// ================= EVENT LISTENER =================
btnSend.addEventListener("click", send);
btnFile.addEventListener("click", pickFile);
window.send = send;
window.pickFile = pickFile;
