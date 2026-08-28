// ---------- Config ----------
const TRACKS_KEY = 'skillbridge_selected_tracks';
const APPLICATIONS_KEY = 'skillbridge_registrations';

// ---------- Elements (may not all exist on every page — guard before use) ----------
const drawerToggle = document.getElementById('drawerToggle');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const drawerClose = document.getElementById('drawerClose');
const drawerList = document.getElementById('drawerList');
const drawerTotal = document.getElementById('drawerTotal');
const trackCountEls = document.querySelectorAll('#trackCount');
const toast = document.getElementById('toast');

const courseGrid = document.getElementById('courseGrid');
const form = document.getElementById('registerForm');
const courseSelect = document.getElementById('courseSelect');
const myRegistrationsSection = document.getElementById('myRegistrations');
const registrationsList = document.getElementById('registrationsList');
const clearBtn = document.getElementById('clearRegistrations');
const selectedTracksNote = document.getElementById('selectedTracksNote');
const selectedTracksChips = document.getElementById('selectedTracksChips');

let toastTimer;

// ---------- Storage helpers ----------
function getTracks() {
  try { return JSON.parse(localStorage.getItem(TRACKS_KEY)) || []; }
  catch { return []; }
}
function saveTracks(list) {
  localStorage.setItem(TRACKS_KEY, JSON.stringify(list));
}
function getApplications() {
  try { return JSON.parse(localStorage.getItem(APPLICATIONS_KEY)) || []; }
  catch { return []; }
}
function saveApplications(list) {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(list));
}
function makeId() {
  return 'SB-' + Math.random().toString(36).slice(2, 7).toUpperCase();
}

// ---------- Toast ----------
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// ---------- Nav badge ----------
function updateTrackBadge() {
  const count = getTracks().length;
  trackCountEls.forEach(el => { el.textContent = count; });
}

// ---------- Drawer render ----------
function renderDrawer() {
  const tracks = getTracks();
  if (drawerTotal) drawerTotal.textContent = tracks.length;

  if (!drawerList) return;
  if (tracks.length === 0) {
    drawerList.innerHTML = `<p class="drawer-empty">No tracks added yet. Browse courses and tap "Add to My Tracks."</p>`;
    return;
  }
  drawerList.innerHTML = tracks.map(name => `
    <div class="drawer-item">
      <span>${name}</span>
      <button data-remove="${name}">Remove</button>
    </div>
  `).join('');

  drawerList.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.remove;
      const updated = getTracks().filter(t => t !== name);
      saveTracks(updated);
      renderDrawer();
      updateTrackBadge();
      renderSelectedNote();
      syncCourseButtons();
    });
  });
}

// ---------- Drawer open/close ----------
function openDrawer() {
  if (!drawer) return;
  drawer.classList.add('open');
  drawerOverlay.classList.add('show');
}
function closeDrawer() {
  if (!drawer) return;
  drawer.classList.remove('open');
  drawerOverlay.classList.remove('show');
}
if (drawerToggle) drawerToggle.addEventListener('click', () => { renderDrawer(); openDrawer(); });
if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

// ---------- Course card "Add to My Tracks" buttons ----------
function syncCourseButtons() {
  if (!courseGrid) return;
  const tracks = getTracks();
  courseGrid.querySelectorAll('.course-card').forEach(card => {
    const name = card.dataset.course;
    const btn = card.querySelector('.add-btn');
    if (!btn) return;
    if (tracks.includes(name)) {
      btn.textContent = 'ADDED ✓ — REMOVE';
      btn.classList.add('added');
    } else {
      btn.textContent = 'ADD TO MY TRACKS';
      btn.classList.remove('added');
    }
  });
}

if (courseGrid) {
  courseGrid.querySelectorAll('.course-card .add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.course-card');
      const name = card ? card.dataset.course : '';
      if (!name) return;

      let tracks = getTracks();
      if (tracks.includes(name)) {
        tracks = tracks.filter(t => t !== name);
        showToast(`Removed ${name} from your tracks`);
      } else {
        tracks.push(name);
        showToast(`Added ${name} to your tracks`);
      }
      saveTracks(tracks);
      syncCourseButtons();
      updateTrackBadge();
      renderDrawer();
      renderSelectedNote();
    });
  });
}

// ---------- "From your tracks list" chips above the application form ----------
function renderSelectedNote() {
  if (!selectedTracksNote || !selectedTracksChips) return;
  const tracks = getTracks();
  if (tracks.length === 0) {
    selectedTracksNote.hidden = true;
    return;
  }
  selectedTracksNote.hidden = false;
  selectedTracksChips.innerHTML = tracks.map(t => `<span class="chip">${t}</span>`).join('');

  // Pre-fill the dropdown with the first selected track if nothing chosen yet
  if (courseSelect && !courseSelect.value) {
    courseSelect.value = tracks[0];
  }
}

// ---------- Application form ----------
// NOTE FOR DEVELOPERS:
// This form currently saves applications to the browser's localStorage only —
// nothing is sent to a server. For a real deployment, replace the section
// marked below with a fetch() call to a form backend such as Formspree,
// Google Forms, or your own API endpoint. Example with Formspree:
//
//   fetch('https://formspree.io/f/your-form-id', {
//     method: 'POST',
//     headers: { 'Accept': 'application/json' },
//     body: new FormData(form)
//   });

function renderApplications() {
  if (!registrationsList || !myRegistrationsSection) return;
  const list = getApplications();
  if (list.length === 0) {
    myRegistrationsSection.hidden = true;
    return;
  }
  myRegistrationsSection.hidden = false;
  registrationsList.innerHTML = list.map(r => `
    <div class="reg-item">
      <span><strong>${r.fullName}</strong> — ${r.course}</span>
      <span class="reg-id">${r.id}</span>
    </div>
  `).join('');
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const entry = {
      id: makeId(),
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      course: courseSelect.value,
      why: document.getElementById('why').value.trim(),
      submittedAt: new Date().toISOString()
    };

    // ---- Local demo storage (swap for a real backend call when deploying) ----
    const list = getApplications();
    list.unshift(entry);
    saveApplications(list);
    renderApplications();
    // ---------------------------------------------------------------------

    showToast(`Application submitted for ${entry.course} — ID ${entry.id}`);
    form.reset();
  });
}

if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    localStorage.removeItem(APPLICATIONS_KEY);
    renderApplications();
  });
}

// ---------- Init ----------
updateTrackBadge();
syncCourseButtons();
renderSelectedNote();
renderApplications();
