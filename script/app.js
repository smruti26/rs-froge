/**
 * ResumeForge — Application Logic
 * Author : Smruti Ranjan Behera
 * Role   : Principal Enterprise Architect – UI/UX · Enterprise Frontend Platforms · React Ecosystem
 *
 * Modules:
 *  1. State Management
 *  2. Bootstrap / Init
 *  3. Navigation
 *  4. Form Data Binding
 *  5. Entry Cards (Experience, Education, Projects, Certifications, Languages)
 *  6. Skills Tags
 *  7. Validation
 *  8. File Upload & Parsing
 *  9. Preview Builder
 * 10. PDF Export
 * 11. DOCX Export
 * 12. UI Helpers (toast, scroll-to-top, score)
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════
   1. STATE
   ═══════════════════════════════════════════════════════════════════ */
const resumeData = {
  personal: {
    firstName: '', lastName: '', title: '',
    email: '', phone: '', location: '',
    linkedin: '', website: '', github: ''
  },
  summary:  { text: '' },
  experience:     [],
  education:      [],
  skills:         [],
  projects:       [],
  certifications: [],
  languages:      []
};

/* ═══════════════════════════════════════════════════════════════════
   2. BOOTSTRAP
   ═══════════════════════════════════════════════════════════════════ */
// window.addEventListener('load', () => {
//   setTimeout(() => {
//     const overlay = document.getElementById('loading-overlay');
//     overlay.classList.add('fade-out');
//   }, 1600);

//   initScrollTop();
//   updateScore();
//   initDragDrop();
// });
/* ═══════════════════════════════════════════════════════════════════
   2. BOOTSTRAP (OPTIMIZED)
   ═══════════════════════════════════════════════════════════════════ */

const App = (() => {
  const WELCOME_KEY = 'welcome-shown';
  const FADE_DURATION = 600;
  const SHOW_DELAY = 1200;

  function init() {
    handleWelcomeScreen();
    runSafe([initScrollTop, updateScore, initDragDrop]);
  }

  /* ── Welcome Screen Controller ── */
  function handleWelcomeScreen() {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;

    // 🚀 Skip instantly if already seen (no layout shift)
    if (sessionStorage.getItem(WELCOME_KEY)) {
      overlay.remove(); // better than display:none
      return;
    }

    sessionStorage.setItem(WELCOME_KEY, 'true');

    // Use requestAnimationFrame for smoother paint timing
    requestAnimationFrame(() => {
      setTimeout(() => {
        overlay.classList.add('fade-out');

        // Remove after transition (no magic numbers)
        overlay.addEventListener(
          'transitionend',
          () => overlay.remove(),
          { once: true }
        );
      }, SHOW_DELAY);
    });
  }

  /* ── Safe Executor (batch execution) ── */
  function runSafe(fns = []) {
    fns.forEach(fn => {
      if (typeof fn !== 'function') return;
      try {
        fn();
      } catch (err) {
        console.error(`[Init Error] ${fn.name}`, err);
      }
    });
  }

  return { init };
})();

/* ── Init ── */
document.addEventListener('DOMContentLoaded', App.init);

/* ═══════════════════════════════════════════════════════════════════
   3. NAVIGATION
   ═══════════════════════════════════════════════════════════════════ */
function createNew() {
  document.getElementById('landing').style.display = 'none';
  const editor = document.getElementById('editor');
  editor.classList.add('active');
  showHeaderActions(true);
  switchSection('personal');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
  const confirmed = window.confirm('Return to home? Your current progress will remain if you come back.');
  if (!confirmed) return;
  document.getElementById('landing').style.display = '';
  document.getElementById('editor').classList.remove('active');
  showHeaderActions(false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showHeaderActions(show) {
  ['btn-back', 'btn-preview', 'btn-download-header'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? 'inline-flex' : 'none';
  });
}

function switchSection(name) {
  // Remove active from all panels + nav items
  document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

  const panel = document.getElementById('panel-' + name);
  if (panel) panel.classList.add('active');

  const navBtn = document.querySelector(`[data-section="${name}"]`);
  if (navBtn) navBtn.classList.add('active');

  // On mobile: scroll editor into view
  if (window.innerWidth <= 768) {
    const editorMain = document.querySelector('.editor-main');
    if (editorMain) editorMain.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  updateScore();
}

/* ═══════════════════════════════════════════════════════════════════
   4. FORM DATA BINDING
   ═══════════════════════════════════════════════════════════════════ */
function updateData(section, field, value) {
  resumeData[section][field] = value;
  updateNavDots();
  updateScore();
}

function updateNavDots() {
  const p = resumeData.personal;
  setDot('personal',       !!(p.firstName || p.email));
  setDot('summary',        !!resumeData.summary.text);
  setDot('experience',     resumeData.experience.length > 0);
  setDot('education',      resumeData.education.length > 0);
  setDot('skills',         resumeData.skills.length > 0);
  setDot('projects',       resumeData.projects.length > 0);
  setDot('certifications', resumeData.certifications.length > 0);
  setDot('languages',      resumeData.languages.length > 0);
}

function setDot(name, hasData) {
  const btn = document.querySelector(`[data-section="${name}"]`);
  if (btn) btn.classList.toggle('has-data', !!hasData);
}

function updateScore() {
  const checks = [
    !!(resumeData.personal.firstName && resumeData.personal.email),
    !!resumeData.summary.text,
    resumeData.experience.length > 0,
    resumeData.education.length > 0,
    resumeData.skills.length >= 3,
    resumeData.projects.length > 0,
    resumeData.certifications.length > 0,
    resumeData.languages.length > 0
  ];
  const filled = checks.filter(Boolean).length;
  const pct = Math.round((filled / checks.length) * 100);

  const fill  = document.getElementById('score-fill');
  const label = document.getElementById('score-pct');
  if (fill)  fill.style.width = pct + '%';
  if (label) label.textContent = pct + '%';

  updateNavDots();
}

/* ═══════════════════════════════════════════════════════════════════
   5. ENTRY CARDS
   ═══════════════════════════════════════════════════════════════════ */
const ENTRY_CONFIG = {
  experience: {
    listId: 'exp-list',
    defaultTitle: 'New Position',
    fields: [
      { key:'jobTitle',    label:'Job Title',                  placeholder:'Software Engineer',       required: true },
      { key:'company',     label:'Company',                    placeholder:'Acme Corp',               required: true },
      { key:'location',    label:'Location',                   placeholder:'San Francisco, CA' },
      { key:'startDate',   label:'Start Date',                 placeholder:'Jan 2021',                required: true },
      { key:'endDate',     label:'End Date',                   placeholder:'Present or Month Year' },
      { key:'description', label:'Responsibilities & Achievements', placeholder:'• Led development of…\n• Reduced load time by 40%…', type:'textarea', span:2 }
    ]
  },
  education: {
    listId: 'edu-list',
    defaultTitle: 'New Degree',
    fields: [
      { key:'degree',      label:'Degree / Certificate',       placeholder:'B.S. Computer Science',  required: true, span:2 },
      { key:'institution', label:'Institution',                 placeholder:'MIT',                     required: true },
      { key:'location',    label:'Location',                   placeholder:'Cambridge, MA' },
      { key:'startDate',   label:'Start Year',                 placeholder:'2016' },
      { key:'endDate',     label:'End Year',                   placeholder:'2020' },
      { key:'gpa',         label:'GPA (optional)',             placeholder:'3.9/4.0' },
      { key:'honors',      label:'Honors / Activities',        placeholder:'Magna Cum Laude, CS Club' }
    ]
  },
  projects: {
    listId: 'proj-list',
    defaultTitle: 'New Project',
    fields: [
      { key:'name',        label:'Project Name',               placeholder:'ResumeForge',             required: true },
      { key:'role',        label:'Your Role',                  placeholder:'Lead Developer' },
      { key:'url',         label:'URL (optional)',             placeholder:'github.com/you/project',  span:2 },
      { key:'description', label:'Description',               placeholder:'Built with React…',       type:'textarea', span:2 }
    ]
  },
  certifications: {
    listId: 'cert-list',
    defaultTitle: 'New Certification',
    fields: [
      { key:'name',   label:'Certification / Award',           placeholder:'AWS Solutions Architect', required: true, span:2 },
      { key:'issuer', label:'Issuing Organization',            placeholder:'Amazon Web Services' },
      { key:'date',   label:'Date',                            placeholder:'March 2023' },
      { key:'url',    label:'Credential URL (optional)',       placeholder:'credly.com/badges/…',    span:2 }
    ]
  },
  languages: {
    listId: 'lang-list',
    defaultTitle: 'New Language',
    fields: [
      { key:'language',    label:'Language',                   placeholder:'Spanish',                 required: true },
      { key:'proficiency', label:'Proficiency Level',          placeholder:'Professional Working Proficiency' }
    ]
  }
};

function addEntry(type) {
  const cfg   = ENTRY_CONFIG[type];
  const id    = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  const entry = { id };
  cfg.fields.forEach(f => { entry[f.key] = ''; });
  resumeData[type].push(entry);
  renderEntryList(type);

  // Auto-open the new card
  requestAnimationFrame(() => {
    const body = document.getElementById(`entry-body-${id}`);
    const chev = document.getElementById(`chev-${id}`);
    if (body) body.classList.add('open');
    if (chev) chev.classList.add('open');
  });
  updateScore();
}

function removeEntry(type, id) {
  resumeData[type] = resumeData[type].filter(e => e.id !== id);
  renderEntryList(type);
  updateScore();
  showToast('Entry removed', 'info');
}

function renderEntryList(type) {
  const cfg  = ENTRY_CONFIG[type];
  const list = document.getElementById(cfg.listId);
  if (!list) return;
  list.innerHTML = '';

  resumeData[type].forEach(entry => {
    const pk = cfg.fields[0].key;
    const sk = cfg.fields[1] ? cfg.fields[1].key : null;
    const title    = entry[pk] || cfg.defaultTitle;
    const subtitle = sk ? (entry[sk] || '') : '';

    let fieldsHTML = '<div class="form-grid">';
    cfg.fields.forEach(f => {
      const spanClass  = f.span === 2 ? 'full' : '';
      const reqStar    = f.required ? '<span class="req-star" aria-hidden="true">*</span>' : '';
      const isTextarea = f.type === 'textarea';
      const inputEl    = isTextarea
        ? `<textarea id="ef-${entry.id}-${f.key}" placeholder="${f.placeholder}" oninput="updateEntryField('${type}','${entry.id}','${f.key}',this.value)">${escHtml(entry[f.key] || '')}</textarea>`
        : `<input type="text" id="ef-${entry.id}-${f.key}" placeholder="${f.placeholder}" value="${escHtml(entry[f.key] || '')}" oninput="updateEntryField('${type}','${entry.id}','${f.key}',this.value)">`;
      fieldsHTML += `<div class="form-group ${spanClass}"><label>${escHtml(f.label)}${reqStar}</label>${inputEl}</div>`;
    });
    fieldsHTML += '</div>';

    const card = document.createElement('div');
    card.className = 'entry-card';
    card.id = `entry-${entry.id}`;
    card.innerHTML = `
      <div class="entry-header" onclick="toggleEntry('${entry.id}')">
        <div class="entry-title-group">
          <div class="entry-title" id="etitle-${entry.id}">${escHtml(title)}</div>
          <div class="entry-subtitle" id="esubt-${entry.id}">${escHtml(subtitle)}</div>
        </div>
        <div class="entry-actions" onclick="event.stopPropagation()">
          <button class="btn btn-icon btn-danger btn-sm" title="Remove entry" onclick="removeEntry('${type}','${entry.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
          </button>
        </div>
        <svg id="chev-${entry.id}" class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="entry-body" id="entry-body-${entry.id}">${fieldsHTML}</div>`;
    list.appendChild(card);
  });
}

function toggleEntry(id) {
  const body = document.getElementById(`entry-body-${id}`);
  const chev = document.getElementById(`chev-${id}`);
  if (body) body.classList.toggle('open');
  if (chev) chev.classList.toggle('open');
}

function updateEntryField(type, id, field, value) {
  const entry = resumeData[type].find(e => e.id === id);
  if (!entry) return;
  entry[field] = value;

  const cfg  = ENTRY_CONFIG[type];
  const pk   = cfg.fields[0].key;
  const sk   = cfg.fields[1] ? cfg.fields[1].key : null;
  const titleEl = document.getElementById(`etitle-${id}`);
  const subtEl  = document.getElementById(`esubt-${id}`);
  if (titleEl) titleEl.textContent = entry[pk] || cfg.defaultTitle;
  if (subtEl && sk) subtEl.textContent = entry[sk] || '';
  updateScore();
}

/* ═══════════════════════════════════════════════════════════════════
   6. SKILLS
   ═══════════════════════════════════════════════════════════════════ */
function addSkill() {
  const input = document.getElementById('skill-input');
  const raw   = input.value.trim();
  if (!raw) return;

  raw.split(',').forEach(s => {
    const sk = s.trim();
    if (sk && sk.length <= 50 && !resumeData.skills.includes(sk)) {
      resumeData.skills.push(sk);
    }
  });

  input.value = '';
  renderSkills();
  updateScore();
}

function skillKeyDown(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addSkill();
  }
}

function removeSkill(sk) {
  resumeData.skills = resumeData.skills.filter(s => s !== sk);
  renderSkills();
  updateScore();
}

function renderSkills() {
  const container = document.getElementById('skills-tags');
  if (!container) return;
  container.innerHTML = '';
  resumeData.skills.forEach(sk => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    const safeKey = sk.replace(/'/g, "\\'");
    tag.innerHTML = `${escHtml(sk)}<button onclick="removeSkill('${safeKey}')" title="Remove ${escHtml(sk)}" aria-label="Remove ${escHtml(sk)}">×</button>`;
    container.appendChild(tag);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   7. VALIDATION
   ═══════════════════════════════════════════════════════════════════ */
const FIELD_RULES = {
  'p-firstname': { required: true, label: 'First Name' },
  'p-lastname':  { required: true, label: 'Last Name' },
  'p-email':     { required: true, label: 'Email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMsg: 'Please enter a valid email address' },
  'p-phone':     { required: false, label: 'Phone' },
  's-summary':   { required: false, label: 'Summary', minLen: 20, minMsg: 'Please write at least 20 characters' }
};

function validateField(id) {
  const el    = document.getElementById(id);
  const rule  = FIELD_RULES[id];
  if (!el || !rule) return true;

  const val   = el.value.trim();
  const group = el.closest('.form-group');
  if (!group) return true;

  // Clear existing error
  clearFieldError(group);

  if (rule.required && !val) {
    setFieldError(group, `${rule.label} is required`);
    return false;
  }
  if (val && rule.pattern && !rule.pattern.test(val)) {
    setFieldError(group, rule.patternMsg);
    return false;
  }
  if (val && rule.minLen && val.length < rule.minLen) {
    setFieldError(group, rule.minMsg);
    return false;
  }

  if (val) {
    group.classList.remove('invalid');
    group.classList.add('valid');
  }
  return true;
}

function setFieldError(group, msg) {
  group.classList.add('invalid');
  group.classList.remove('valid');
  const errEl = document.createElement('span');
  errEl.className = 'field-error';
  errEl.setAttribute('role', 'alert');
  errEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>${escHtml(msg)}`;
  group.appendChild(errEl);
}

function clearFieldError(group) {
  group.classList.remove('invalid', 'valid');
  group.querySelectorAll('.field-error').forEach(e => e.remove());
}

function validatePersonalSection() {
  const ids = ['p-firstname', 'p-lastname', 'p-email'];
  return ids.map(id => validateField(id)).every(Boolean);
}

// Bind live validation to personal fields
document.addEventListener('DOMContentLoaded', () => {
  Object.keys(FIELD_RULES).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', () => validateField(id));
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════
   8. FILE UPLOAD & PARSING
   ═══════════════════════════════════════════════════════════════════ */
function triggerUpload() {
  document.getElementById('upload-input').click();
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  reader.onload = (ev) => {
    const text = ev.target.result || '';
    parseResumeText(text);
    createNew();
    showToast('Resume imported! Review and edit each section.', 'success');
  };

  if (['txt', 'doc', 'docx'].includes(ext)) {
    reader.readAsText(file);
  } else if (ext === 'pdf') {
    // Attempt text extraction from PDF (works for text-layer PDFs)
    reader.readAsText(file);
  } else {
    showToast('Unsupported file type. Please use .txt, .pdf, or .doc', 'error');
  }
  e.target.value = '';
}

function parseResumeText(text) {
  if (!text || text.length < 5) return;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // ── Name (heuristic: first non-contact-looking, non-short line)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line.length > 3 && line.length < 60 && !/[@\d|·•]/.test(line)) {
      const parts = line.split(/\s+/);
      resumeData.personal.firstName = parts[0] || '';
      resumeData.personal.lastName  = parts.slice(1).join(' ') || '';
      setInput('p-firstname', resumeData.personal.firstName);
      setInput('p-lastname',  resumeData.personal.lastName);
      break;
    }
  }

  // ── Email
  const emailM = text.match(/[\w.+\-]+@[\w.\-]+\.\w{2,}/);
  if (emailM) { resumeData.personal.email = emailM[0]; setInput('p-email', emailM[0]); }

  // ── Phone
  const phoneM = text.match(/(\+?\d[\d\s\-().]{7,15}\d)/);
  if (phoneM) { resumeData.personal.phone = phoneM[0].trim(); setInput('p-phone', phoneM[0].trim()); }

  // ── LinkedIn
  const liM = text.match(/linkedin\.com\/in\/[\w\-]+/i);
  if (liM) { resumeData.personal.linkedin = liM[0]; setInput('p-linkedin', liM[0]); }

  // ── GitHub
  const ghM = text.match(/github\.com\/[\w\-]+/i);
  if (ghM) { resumeData.personal.github = ghM[0]; setInput('p-github', ghM[0]); }

  // ── Website
  const webM = text.match(/(?:https?:\/\/)?(?:www\.)?[\w\-]+\.(?:io|com|dev|net|org|co)(?:\/[\w\-]*)?/gi);
  if (webM) {
    const filtered = webM.filter(u => !u.includes('linkedin') && !u.includes('github'));
    if (filtered[0]) { resumeData.personal.website = filtered[0]; setInput('p-website', filtered[0]); }
  }

  // ── Summary
  const sumM = text.match(/(?:SUMMARY|OBJECTIVE|PROFILE|ABOUT)[:\s\n]+([\s\S]{30,400}?)(?=\n[A-Z]{3,}|\n\n)/i);
  if (sumM) {
    const t = sumM[1].replace(/\s+/g, ' ').trim();
    resumeData.summary.text = t;
    setInput('s-summary', t);
  }

  // ── Skills
  const skillM = text.match(/(?:SKILLS?|TECHNICAL SKILLS?|TECHNOLOGIES|COMPETENCIES)[:\s\n]+([\s\S]{10,400}?)(?=\n[A-Z]{3,}|\n\n|$)/i);
  if (skillM) {
    skillM[1]
      .split(/[,\n•\-·|\/]+/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 45 && !/^\d+$/.test(s))
      .forEach(sk => {
        if (!resumeData.skills.includes(sk)) resumeData.skills.push(sk);
      });
    renderSkills();
  }

  // ── Professional Title (line after name, if short and no contact info)
  if (lines.length > 1) {
    const titleLine = lines[1];
    if (titleLine.length > 3 && titleLine.length < 80 && !/[@\d]/.test(titleLine)) {
      resumeData.personal.title = titleLine;
      setInput('p-title', titleLine);
    }
  }

  updateScore();
}

function setInput(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

/* ═══════════════════════════════════════════════════════════════════
   9. PREVIEW
   ═══════════════════════════════════════════════════════════════════ */
function openPreview() {
  buildResumeDoc();
  const overlay = document.getElementById('preview-view');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePreview() {
  document.getElementById('preview-view').classList.remove('active');
  document.body.style.overflow = '';
}

function buildResumeDoc() {
  const d = resumeData, p = d.personal;
  let html = '';

  const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name';
  html += `<div class="rdoc-name">${escHtml(name)}</div>`;
  if (p.title) html += `<div class="rdoc-title">${escHtml(p.title)}</div>`;

  // Contacts
  const contacts = [];
  if (p.email)    contacts.push(`<span>✉ ${escHtml(p.email)}</span>`);
  if (p.phone)    contacts.push(`<span>📞 ${escHtml(p.phone)}</span>`);
  if (p.location) contacts.push(`<span>📍 ${escHtml(p.location)}</span>`);
  if (p.linkedin) contacts.push(`<span>in ${escHtml(p.linkedin)}</span>`);
  if (p.website)  contacts.push(`<span>🌐 ${escHtml(p.website)}</span>`);
  if (p.github)   contacts.push(`<span>⌥ ${escHtml(p.github)}</span>`);
  if (contacts.length) html += `<div class="rdoc-contacts">${contacts.join('')}</div>`;

  // Summary
  if (d.summary.text) {
    html += section('Professional Summary', `<div class="rdoc-summary">${escHtml(d.summary.text)}</div>`);
  }

  // Experience
  if (d.experience.length) {
    let inner = '';
    d.experience.forEach(e => {
      const date = joinDates(e.startDate, e.endDate);
      inner += `<div class="rdoc-entry">
        <div class="rdoc-entry-header">
          <div>
            <div class="rdoc-entry-title">${escHtml(e.jobTitle || 'Position')}</div>
            <div class="rdoc-entry-org">${escHtml(e.company || '')}${e.location ? ` · ${escHtml(e.location)}` : ''}</div>
          </div>
          ${date ? `<div class="rdoc-entry-date">${escHtml(date)}</div>` : ''}
        </div>
        ${formatBullets(e.description)}
      </div>`;
    });
    html += section('Work Experience', inner);
  }

  // Education
  if (d.education.length) {
    let inner = '';
    d.education.forEach(e => {
      const date = joinDates(e.startDate, e.endDate);
      const sub = [e.location, e.gpa ? `GPA: ${e.gpa}` : '', e.honors].filter(Boolean).join(' · ');
      inner += `<div class="rdoc-entry">
        <div class="rdoc-entry-header">
          <div>
            <div class="rdoc-entry-title">${escHtml(e.degree || 'Degree')}</div>
            <div class="rdoc-entry-org">${escHtml(e.institution || '')}</div>
            ${sub ? `<div class="rdoc-entry-loc">${escHtml(sub)}</div>` : ''}
          </div>
          ${date ? `<div class="rdoc-entry-date">${escHtml(date)}</div>` : ''}
        </div>
      </div>`;
    });
    html += section('Education', inner);
  }

  // Skills
  if (d.skills.length) {
    const chips = d.skills.map(sk => `<span class="rdoc-skill-chip">${escHtml(sk)}</span>`).join('');
    html += section('Skills', `<div class="rdoc-skills-grid">${chips}</div>`);
  }

  // Projects
  if (d.projects.length) {
    let inner = '';
    d.projects.forEach(e => {
      inner += `<div class="rdoc-entry">
        <div class="rdoc-entry-header">
          <div>
            <div class="rdoc-entry-title">${escHtml(e.name || 'Project')}</div>
            ${e.role ? `<div class="rdoc-entry-org">${escHtml(e.role)}</div>` : ''}
            ${e.url ? `<div class="rdoc-entry-loc">${escHtml(e.url)}</div>` : ''}
          </div>
        </div>
        ${formatBullets(e.description)}
      </div>`;
    });
    html += section('Projects', inner);
  }

  // Certifications
  if (d.certifications.length) {
    const items = d.certifications.map(e => {
      const parts = [e.name, e.issuer, e.date, e.url].filter(Boolean);
      return `<li>${parts.map(escHtml).join(' — ')}</li>`;
    }).join('');
    html += section('Certifications & Awards', `<ul class="rdoc-awards-list">${items}</ul>`);
  }

  // Languages
  if (d.languages.length) {
    const chips = d.languages.map(e =>
      `<span class="rdoc-skill-chip">${escHtml(e.language || 'Language')}${e.proficiency ? `: ${escHtml(e.proficiency)}` : ''}</span>`
    ).join('');
    html += section('Languages', `<div class="rdoc-skills-grid">${chips}</div>`);
  }

  document.getElementById('resume-doc').innerHTML = html;
}

function section(title, inner) {
  return `<div class="rdoc-section"><div class="rdoc-section-title">${escHtml(title)}</div>${inner}</div>`;
}

function joinDates(start, end) {
  return [start, end].filter(Boolean).join(' – ');
}

function formatBullets(text) {
  if (!text) return '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return '';
  if (lines.length === 1) return `<div class="rdoc-entry-desc"><p>${escHtml(lines[0])}</p></div>`;
  const items = lines.map(l => `<li>${escHtml(l.replace(/^[•\-*]\s*/, ''))}</li>`).join('');
  return `<div class="rdoc-entry-desc"><ul>${items}</ul></div>`;
}

/* ═══════════════════════════════════════════════════════════════════
   10. PDF EXPORT
   ═══════════════════════════════════════════════════════════════════ */
function downloadPDF() {
  buildResumeDoc();
  const docContent = document.getElementById('resume-doc').innerHTML;
  const p = resumeData.personal;
  const name = [p.firstName, p.lastName].filter(Boolean).join('_') || 'Resume';

  const win = window.open('', '_blank');
  if (!win) {
    showToast('Pop-up blocked. Please allow pop-ups and try again.', 'error');
    return;
  }
  win.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>${name}_Resume</title>
<style>
@page { margin: 18mm 20mm; size: A4; }
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Georgia,serif;font-size:10.5pt;color:#1a1a1a;line-height:1.55;}
.rdoc-name{font-size:24pt;font-weight:bold;color:#0f172a;margin-bottom:4px;}
.rdoc-title{font-size:11.5pt;color:#2563eb;font-style:italic;margin-bottom:12px;}
.rdoc-contacts{display:flex;flex-wrap:wrap;gap:4px 20px;font-size:9.5pt;color:#475569;padding-bottom:18px;margin-bottom:20px;border-bottom:2px solid #2563eb;}
.rdoc-contacts span{display:inline-flex;align-items:center;gap:5px;}
.rdoc-section{margin-bottom:16px;page-break-inside:avoid;}
.rdoc-section-title{font-size:9.5pt;font-weight:bold;color:#1e3a5f;text-transform:uppercase;letter-spacing:.1em;border-bottom:1px solid #e2e8f0;padding-bottom:5px;margin-bottom:12px;}
.rdoc-entry{margin-bottom:14px;}
.rdoc-entry-header{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;}
.rdoc-entry-title{font-weight:bold;font-size:10.5pt;color:#111;}
.rdoc-entry-org{color:#2563eb;font-style:italic;font-size:10pt;}
.rdoc-entry-date{font-size:9pt;color:#64748b;white-space:nowrap;flex-shrink:0;}
.rdoc-entry-loc{font-size:9pt;color:#64748b;font-style:italic;}
.rdoc-entry-desc{margin-top:6px;font-size:10pt;color:#334155;line-height:1.65;}
.rdoc-entry-desc ul{padding-left:18px;margin-top:3px;}
.rdoc-entry-desc li{margin-bottom:3px;}
.rdoc-skills-grid{display:flex;flex-wrap:wrap;gap:5px;}
.rdoc-skill-chip{font-size:9.5pt;border:1px solid #bfdbfe;color:#1e40af;padding:2px 9px;border-radius:3px;}
.rdoc-summary{font-size:10.5pt;color:#334155;line-height:1.75;}
.rdoc-awards-list{padding-left:18px;}
.rdoc-awards-list li{margin-bottom:5px;font-size:10pt;}
</style>
</head><body>${docContent}</body></html>`);
  win.document.close();
  win.addEventListener('load', () => {
    setTimeout(() => { win.focus(); win.print(); }, 400);
  });
  showToast('Opening print dialog…', 'info');
}

/* ═══════════════════════════════════════════════════════════════════
   11. DOCX EXPORT
   ═══════════════════════════════════════════════════════════════════ */
function downloadDOCX() {
  showToast('Generating DOCX…', 'info');
  const d  = resumeData, p = d.personal;
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Resume';
  const file = name.replace(/\s+/g, '_') + '.docx';

  let body = '';

  // Header
  body += makePara(name, { bold:true, size:38, spaceAfter:60 });
  if (p.title) body += makePara(p.title, { italic:true, color:'2563EB', size:23, spaceAfter:60 });

  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.website, p.github].filter(Boolean);
  if (contactParts.length) body += makePara(contactParts.join('   |   '), { size:19, color:'475569', spaceAfter:80 });
  body += makeHRule();

  // Summary
  if (d.summary.text) {
    body += makeSectionHeading('PROFESSIONAL SUMMARY');
    body += makePara(d.summary.text, { size:21, spaceAfter:80 });
  }

  // Experience
  if (d.experience.length) {
    body += makeSectionHeading('WORK EXPERIENCE');
    d.experience.forEach(e => {
      body += makeEntryHeader(e.jobTitle || '', e.company || '', joinDates(e.startDate, e.endDate));
      if (e.location) body += makePara(e.location, { italic:true, size:19, color:'64748B', spaceAfter:30 });
      if (e.description) e.description.split('\n').filter(Boolean).forEach(l => body += makeBullet(l.replace(/^[•\-*]\s*/, '')));
    });
  }

  // Education
  if (d.education.length) {
    body += makeSectionHeading('EDUCATION');
    d.education.forEach(e => {
      body += makeEntryHeader(e.degree || '', e.institution || '', joinDates(e.startDate, e.endDate));
      const sub = [e.location, e.gpa ? `GPA: ${e.gpa}` : '', e.honors].filter(Boolean).join(' · ');
      if (sub) body += makePara(sub, { italic:true, size:19, color:'64748B', spaceAfter:30 });
    });
  }

  // Skills
  if (d.skills.length) {
    body += makeSectionHeading('SKILLS');
    body += makePara(d.skills.join('  ·  '), { size:20, spaceAfter:80 });
  }

  // Projects
  if (d.projects.length) {
    body += makeSectionHeading('PROJECTS');
    d.projects.forEach(e => {
      const sub2 = [e.role, e.url].filter(Boolean).join(' · ');
      body += makeEntryHeader(e.name || '', sub2 || '', '');
      if (e.description) e.description.split('\n').filter(Boolean).forEach(l => body += makeBullet(l.replace(/^[•\-*]\s*/, '')));
    });
  }

  // Certifications
  if (d.certifications.length) {
    body += makeSectionHeading('CERTIFICATIONS & AWARDS');
    d.certifications.forEach(e => {
      body += makeBullet([e.name, e.issuer, e.date, e.url].filter(Boolean).join(' — '));
    });
  }

  // Languages
  if (d.languages.length) {
    body += makeSectionHeading('LANGUAGES');
    body += makePara(d.languages.map(l => l.language + (l.proficiency ? `: ${l.proficiency}` : '')).join('   ·   '), { size:20, spaceAfter:80 });
  }

  const xml  = buildDocxXML(body);
  const blob = new Blob([xml], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: file });
  a.click();
  URL.revokeObjectURL(url);
  showToast('DOCX downloaded successfully!', 'success');
}

/* ── OOXML helpers ── */
function xmlEsc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"')
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '--');
}

function makePara(text, opts = {}) {
  const { bold=false, italic=false, size=20, color='1a1a1a', spaceAfter=80, indent=0 } = opts;
  return `<w:p>
    <w:pPr><w:spacing w:after="${spaceAfter}"/>${indent ? `<w:ind w:left="${indent}"/>` : ''}</w:pPr>
    <w:r><w:rPr>${bold ? '<w:b/>' : ''}${italic ? '<w:i/>' : ''}<w:sz w:val="${size}"/><w:color w:val="${color}"/></w:rPr>
    <w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r></w:p>`;
}

function makeSectionHeading(text) {
  return `<w:p>
    <w:pPr><w:spacing w:before="140" w:after="80"/>
      <w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="E2E8F0"/></w:pBdr></w:pPr>
    <w:r><w:rPr><w:b/><w:sz w:val="19"/><w:color w:val="1E3A5F"/><w:caps/><w:spacing w:val="80"/></w:rPr>
    <w:t>${xmlEsc(text)}</w:t></w:r></w:p>`;
}

function makeEntryHeader(left, org, right) {
  return `<w:p>
    <w:pPr><w:spacing w:after="40"/><w:tabs><w:tab w:val="right" w:pos="9360"/></w:tabs></w:pPr>
    <w:r><w:rPr><w:b/><w:sz w:val="21"/></w:rPr><w:t xml:space="preserve">${xmlEsc(left)}</w:t></w:r>
    ${org ? `<w:r><w:rPr><w:i/><w:sz w:val="20"/><w:color w:val="2563EB"/></w:rPr><w:t xml:space="preserve"> · ${xmlEsc(org)}</w:t></w:r>` : ''}
    ${right ? `<w:r><w:rPr><w:sz w:val="19"/><w:color w:val="64748B"/></w:rPr><w:tab/><w:t>${xmlEsc(right)}</w:t></w:r>` : ''}
  </w:p>`;
}

function makeBullet(text) {
  return `<w:p>
    <w:pPr><w:spacing w:after="40"/><w:ind w:left="360" w:hanging="360"/></w:pPr>
    <w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">• ${xmlEsc(text)}</w:t></w:r></w:p>`;
}

function makeHRule() {
  return `<w:p><w:pPr><w:spacing w:after="100"/>
    <w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="2563EB"/></w:pBdr></w:pPr></w:p>`;
}

function buildDocxXML(bodyContent) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  mc:Ignorable="w14 w15">
  <w:body>
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1080" w:right="1134" w:bottom="1080" w:left="1134" w:header="709" w:footer="709" w:gutter="0"/>
    </w:sectPr>
    ${bodyContent}
  </w:body>
</w:document>`;
}

/* ═══════════════════════════════════════════════════════════════════
   12. UI HELPERS
   ═══════════════════════════════════════════════════════════════════ */

/* ── Toast ── */
let toastTimer = null;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  clearTimeout(toastTimer);
  t.textContent = msg;
  t.className = 'show' + (type ? ` ${type}` : '');
  toastTimer = setTimeout(() => { t.classList.remove('show'); }, 3000);
}

/* ── Scroll-to-top ── */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 280);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Drag & drop on landing ── */
function initDragDrop() {
  const card = document.querySelector('.card-upload');
  if (!card) return;
  card.addEventListener('dragover', e => { e.preventDefault(); card.classList.add('drag-over'); });
  card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
  card.addEventListener('drop', e => {
    e.preventDefault();
    card.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      parseResumeText(ev.target.result || '');
      createNew();
      showToast('Resume imported successfully!', 'success');
    };
    reader.readAsText(file);
  });
}

/* ── Escape key closes preview ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePreview();
});

/* ── HTML escape ── */
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
