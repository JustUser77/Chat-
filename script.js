const supabaseUrl = 'https://ekolvbeudjgzmigdvlzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2x2YmV1ZGpnem1pZ2R2bHp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MDgxNDcsImV4cCI6MjA4MTI4NDE0N30.Ra4guL_6M5xeMtfhaK0WcMNwvV46Xug2JYfUYRTE7yY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let currentUser = null;

// REGISTER
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const displayName = document.getElementById('reg-name').value;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return alert('Gagal daftar: ' + error.message);

  // Tambahkan ke tabel profiles
  await supabase.from('profiles').insert([{ id: data.user.id, display_name: displayName }]);

  alert('Registrasi berhasil! Silakan login.');
});

// LOGIN
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return alert('Login gagal: ' + error.message);

  currentUser = data.user;
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('chat-section').style.display = 'block';
  loadMessages();
  listenForMessages();
});

// LOAD PESAN
async function loadMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('content, image_url, created_at, profiles(display_name)')
    .order('created_at', { ascending: true });

  if (error) return console.error('Gagal ambil pesan:', error);

  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML = '';
  data.forEach(msg => {
    const el = document.createElement('div');
    el.className = 'message';
    el.innerHTML = `<strong>${msg.profiles?.display_name || 'Anon'}:</strong> ${msg.content || ''}`;
    if (msg.image_url) {
      el.innerHTML += `<br><img src="${msg.image_url}" alt="gambar">`;
    }
    chatBox.appendChild(el);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

// KIRIM PESAN
document.getElementById('message-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = document.getElementById('message-input').value;
  const imageFile = document.getElementById('image-input').files[0];
  let imageUrl = null;

  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error: uploadError } = await supabase.storage
      .from('chat-img')
      .upload(fileName, imageFile);

    if (uploadError) return alert('Gagal upload gambar: ' + uploadError.message);

    const { data: publicUrl } = supabase.storage.from('chat-img').getPublicUrl(fileName);
    imageUrl = publicUrl.publicUrl;
  }

  const { error } = await supabase.from('messages').insert([{
    user_id: currentUser.id,
    content,
    image_url: imageUrl
  }]);

  if (error) return alert('Gagal kirim pesan: ' + error.message);

  document.getElementById('message-input').value = '';
  document.getElementById('image-input').value = '';
});

// REALTIME LISTENER
function listenForMessages() {
  supabase
    .channel('public:messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
    }, payload => {
      const msg = payload.new;
      const chatBox = document.getElementById('chat-box');
      const el = document.createElement('div');
      el.className = 'message';
      el.innerHTML = `<strong>${msg.user_id}:</strong> ${msg.content || ''}`;
      if (msg.image_url) {
        el.innerHTML += `<br><img src="${msg.image_url}" alt="gambar">`;
      }
      chatBox.appendChild(el);
      chatBox.scrollTop = chatBox.scrollHeight;
    })
    .subscribe();
}
