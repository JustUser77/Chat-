const supabase = supabase.createClient('https://ekolvbeudjgzmigdvlzy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2x2YmV1ZGpnem1pZ2R2bHp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MDgxNDcsImV4cCI6MjA4MTI4NDE0N30.Ra4guL_6M5xeMtfhaK0WcMNwvV46Xug2JYfUYRTE7yY');
let currentUser = null;

// Inisialisasi
async function init() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert('Belum login!');
    window.location.href = 'index.html';
    return;
  }
  currentUser = user;
  loadMessages();
  listenForMessages();
}

// Load pesan dari Supabase
async function loadMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('content, image_url, created_at, profiles(display_name)')
    .order('created_at', { ascending: true });

  const box = document.getElementById('chat-box');
  box.innerHTML = '';
  data.forEach(msg => {
    const el = document.createElement('div');
    el.className = 'message';
    el.innerHTML = `<strong>${msg.profiles?.display_name || 'Anon'}:</strong> ${msg.content || ''}`;
    if (msg.image_url) el.innerHTML += `<br><img src="${msg.image_url}" />`;
    box.appendChild(el);
  });
  box.scrollTop = box.scrollHeight;
}

// Kirim pesan
document.getElementById('message-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = document.getElementById('message-input').value;
  const imageFile = document.getElementById('image-input').files[0];
  let imageUrl = null;

  if (imageFile) {
    const fileName = `${Date.now()}-${imageFile.name}`;
    const { error: uploadError } = await supabase.storage.from('chat-img').upload(fileName, imageFile);
    if (uploadError) return alert('Gagal upload gambar');
    const { data: publicUrl } = supabase.storage.from('chat-img').getPublicUrl(fileName);
    imageUrl = publicUrl.publicUrl;
  }

  const { error } = await supabase.from('messages').insert([{
    user_id: currentUser.id,
    content,
    image_url: imageUrl
  }]);

  if (error) alert('Gagal kirim pesan: ' + error.message);
  else {
    document.getElementById('message-input').value = '';
    document.getElementById('image-input').value = '';
  }
});

// Realtime update
function listenForMessages() {
  supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      const msg = payload.new;
      const box = document.getElementById('chat-box');
      const el = document.createElement('div');
      el.className = 'message';
      el.innerHTML = `<strong>${msg.user_id}:</strong> ${msg.content || ''}`;
      if (msg.image_url) el.innerHTML += `<br><img src="${msg.image_url}" />`;
      box.appendChild(el);
      box.scrollTop = box.scrollHeight;
    })
    .subscribe();
}

init();
