let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let tanggalMerah = {};

const monthYearEl = document.getElementById('month-year');
const calendarEl = document.getElementById('calendar');
const modal = document.getElementById('event-modal');
const selectedDateEl = document.getElementById('selected-date');
const eventTitleEl = document.getElementById('event-title');
const eventDescEl = document.getElementById('event-desc');
const eventLocationEl = document.getElementById('event-location');
const saveBtn = document.getElementById('save-event');
const closeBtn = document.getElementById('close-modal');

document.getElementById('btn-add').addEventListener('click', () => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  openModal(dateStr);
});

document.getElementById('btn-view').addEventListener('click', () => {
  alert('Tampilan: Month / Week / Year / Agenda (fitur ini akan segera hadir)');
});

document.getElementById('btn-settings').addEventListener('click', () => {
  alert('Pengaturan: Aktifkan fitur cuaca (fitur ini akan segera hadir)');
});

document.getElementById('prev-month').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
    fetchTanggalMerah(currentYear);
  }
  renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
    fetchTanggalMerah(currentYear);
  }
  renderCalendar();
});

async function fetchTanggalMerah(year) {
  const url = `https://api-harilibur.vercel.app/api?year=${year}`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    tanggalMerah = {};
    data.forEach(item => {
      if (item.is_national_holiday) {
        tanggalMerah[item.holiday_date] = item.holiday_name;
      }
    });

    renderCalendar();
  } catch (err) {
    console.error('Gagal ambil data tanggal merah:', err);
    tanggalMerah = {};
    renderCalendar();
  }
}

function renderCalendar() {
  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  monthYearEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  calendarEl.innerHTML = '';

  const startDay = (firstDay + 6) % 7;

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    calendarEl.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const events = getEvents(dateStr);

    cell.innerHTML = `<div class="day-number">${day}</div>`;

    if (tanggalMerah[dateStr]) {
      cell.classList.add('tanggal-merah');
      const libur = document.createElement('div');
      libur.textContent = `🟥 ${tanggalMerah[dateStr]}`;
      libur.style.fontSize = '12px';
      libur.style.color =
