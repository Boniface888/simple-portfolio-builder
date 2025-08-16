/* =============== UTILS =============== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const debounce = (fn, delay = 300) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
};

const fileToDataURL = (file) => new Promise((resolve, reject) => {
  const fr = new FileReader();
  fr.onload = () => resolve(fr.result);
  fr.onerror = reject;
  fr.readAsDataURL(file);
});

const downloadFile = (filename, content, type = "text/html;charset=utf-8") => {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
};

/* =============== STATE =============== */

const EMPTY_STATE = {
  theme: "blue",
  font: "inter",
  profile: {
    name: "", role: "", email: "", phone: "", location: "",
    website: "", github: "", linkedin: "", about: "", photoData: ""
  },
  skills: [],
  projects: [] // {title, description, link, imageData}
};

let state = structuredClone(EMPTY_STATE);

/* =============== ELEMENTS =============== */

const previewRoot = $("#previewRoot");

const inpName = $("#inpName");
const inpRole = $("#inpRole");
const inpEmail = $("#inpEmail");
const inpPhone = $("#inpPhone");
const inpLocation = $("#inpLocation");
const inpWebsite = $("#inpWebsite");
const inpGithub = $("#inpGithub");
const inpLinkedin = $("#inpLinkedin");
const inpAbout = $("#inpAbout");
const inpPhoto = $("#inpPhoto");

const inpSkill = $("#inpSkill");
const btnAddSkill = $("#btnAddSkill");
const skillList = $("#skillList");

const projectForms = $("#projectForms");
const btnAddProject = $("#btnAddProject");

const themeSelect = $("#themeSelect");
const fontSelect = $("#fontSelect");

const btnSave = $("#btnSave");
const btnClear = $("#btnClear");
const btnExport = $("#btnExport");
const btnSample = $("#btnSample");

/* =============== RENDERERS =============== */

function renderPreview(){
  // theme + font classes
  previewRoot.classList.remove("theme-blue","theme-emerald","theme-purple","theme-warm");
  previewRoot.classList.remove("font-inter","font-poppins","font-merriweather","font-system");
  previewRoot.classList.add(`theme-${state.theme}`, `font-${state.font}`);

  // socials / meta line
  const meta = [
    state.profile.email && `✉️ ${state.profile.email}`,
    state.profile.phone && `📞 ${state.profile.phone}`,
    state.profile.location && `📍 ${state.profile.location}`,
    state.profile.website && `🔗 ${state.profile.website}`,
    state.profile.github && `🐙 ${state.profile.github}`,
    state.profile.linkedin && `💼 ${state.profile.linkedin}`
  ].filter(Boolean).join(" · ");

  // skills
  const skillsHTML = state.skills.map(s => `<span class="skill-pill">${escapeHTML(s)}</span>`).join("");

  // projects
  const projectsHTML = state.projects.map(p => `
    <article class="project">
      ${p.imageData ? `<img class="img" src="${p.imageData}" alt="Project image">` : `<div class="img"></div>`}
      <div class="body">
        <div class="title">${escapeHTML(p.title || "Untitled Project")}</div>
        <div class="desc">${escapeHTML(p.description || "")}</div>
        ${p.link ? `<a href="${escapeAttr(p.link)}" target="_blank" rel="noopener">Visit Project →</a>` : ``}
      </div>
    </article>
  `).join("");

  previewRoot.innerHTML = `
    <header class="hero">
      <h2 class="name">${escapeHTML(state.profile.name || "Your Name")}</h2>
      <div class="role">${escapeHTML(state.profile.role || "Your Role / Title")}</div>
      <div class="meta">${meta || ""}</div>
    </header>

    <div class="wrap">
      ${state.profile.about ? `
      <section class="section">
        <h4>About</h4>
        <p>${escapeHTML(state.profile.about)}</p>
      </section>` : ``}

      ${state.skills.length ? `
      <section class="section">
        <h4>Skills</h4>
        <div class="skills">${skillsHTML}</div>
      </section>` : ``}

      ${state.projects.length ? `
      <section class="section">
        <h4>Projects</h4>
        <div class="projects">${projectsHTML}</div>
      </section>` : ``}
    </div>
  `;
}

function renderSkills(){
  skillList.innerHTML = state.skills.map((s, i) => `
    <span class="chip">
      ${escapeHTML(s)}
      <button title="Remove" aria-label="Remove skill" data-skill-index="${i}">✕</button>
    </span>
  `).join("");
  $$("#skillList button").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.skillIndex);
      state.skills.splice(idx, 1);
      persist(); renderSkills(); renderPreview();
    });
  });
}

function renderProjectForms(){
  projectForms.innerHTML = state.projects.map((p, i) => `
    <div class="project-card" data-index="${i}">
      <div class="grid-2">
        <label>Title
          <input type="text" value="${escapeAttr(p.title || "")}" data-k="title">
        </label>
        <label>Link
          <input type="url" value="${escapeAttr(p.link || "")}" placeholder="https://..." data-k="link">
        </label>
        <label>Description
          <textarea rows="3" data-k="description">${escapeHTML(p.description || "")}</textarea>
        </label>
        <label>Image
          <input type="file" accept="image/*" data-k="image">
        </label>
      </div>
      <div class="project-actions">
        <button class="ghost" data-action="up">↑</button>
        <button class="ghost" data-action="down">↓</button>
        <button class="ghost" data-action="remove">Remove</button>
      </div>
    </div>
  `).join("");

  // bind project inputs
  $$(".project-card").forEach(card => {
    const idx = Number(card.dataset.index);

    $$('input[type="text"], input[type="url"], textarea', card).forEach(el => {
      el.addEventListener("input", () => {
        const k = el.dataset.k;
        state.projects[idx][k] = el.value;
        persistDebounced();
        renderPreview();
      });
    });

    $('input[type="file"][data-k="image"]', card).addEventListener("change", async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const dataURL = await fileToDataURL(f);
      state.projects[idx].imageData = dataURL;
      persist();
      renderPreview();
    });

    // actions
    $$("button[data-action]", card).forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        if (action === "remove"){
          state.projects.splice(idx, 1);
        } else if (action === "up" && idx > 0){
          [state.projects[idx-1], state.projects[idx]] = [state.projects[idx], state.projects[idx-1]];
        } else if (action === "down" && idx < state.projects.length - 1){
          [state.projects[idx+1], state.projects[idx]] = [state.projects[idx], state.projects[idx+1]];
        }
        persist(); renderProjectForms(); renderPreview();
      });
    });
  });
}

/* =============== EVENTS =============== */

function bindProfileInputs(){
  const map = [
    [inpName, "name"],
    [inpRole, "role"],
    [inpEmail, "email"],
    [inpPhone, "phone"],
    [inpLocation, "location"],
    [inpWebsite, "website"],
    [inpGithub, "github"],
    [inpLinkedin, "linkedin"],
  ];
  map.forEach(([el, key]) => {
    el.addEventListener("input", () => {
      state.profile[key] = el.value;
      persistDebounced();
      renderPreview();
    });
  });

  inpAbout.addEventListener("input", () => {
    state.profile.about = inpAbout.value;
    persistDebounced();
    renderPreview();
  });

  inpPhoto.addEventListener("change", async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataURL = await fileToDataURL(f);
    state.profile.photoData = dataURL;
    persist();
    // Not used in preview header (clean aesthetic), but included in export template (avatar)
    renderPreview();
  });
}

function bindSkillInputs(){
  function addSkillFromInput(){
    const v = inpSkill.value.trim();
    if (!v) return;
    state.skills.push(v);
    inpSkill.value = "";
    persist();
    renderSkills();
    renderPreview();
  }
  btnAddSkill.addEventListener("click", addSkillFromInput);
  inpSkill.addEventListener("keydown", (e) => {
    if (e.key === "Enter"){ e.preventDefault(); addSkillFromInput(); }
  });
}

btnAddProject.addEventListener("click", () => {
  state.projects.push({ title:"", description:"", link:"", imageData:"" });
  persist(); renderProjectForms(); renderPreview();
});

themeSelect.addEventListener("change", () => {
  state.theme = themeSelect.value;
  persistDebounced(); renderPreview();
});
fontSelect.addEventListener("change", () => {
  state.font = fontSelect.value;
  persistDebounced(); renderPreview();
});

btnSave.addEventListener("click", () => {
  persist();
  alert("Saved locally ✔");
});

btnClear.addEventListener("click", () => {
  if (!confirm("Reset everything? This will clear local data.")) return;
  state = structuredClone(EMPTY_STATE);
  localStorage.removeItem("spb_state");
  hydrateFormFromState();
  renderSkills();
  renderProjectForms();
  renderPreview();
});

btnSample.addEventListener("click", () => {
  loadSample();
  hydrateFormFromState();
  renderSkills();
  renderProjectForms();
  renderPreview();
  persist();
});

btnExport.addEventListener("click", async () => {
  const html = await buildExportHTML();
  const namePart = (state.profile.name || "portfolio").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  downloadFile(`${namePart}.html`, html, "text/html;charset=utf-8");
});

/* =============== PERSISTENCE =============== */

const persist = () => localStorage.setItem("spb_state", JSON.stringify(state));
const persistDebounced = debounce(persist, 500);

function restore(){
  const raw = localStorage.getItem("spb_state");
  if (!raw) return;
  try{
    const data = JSON.parse(raw);
    state = { ...structuredClone(EMPTY_STATE), ...data };
    // ensure arrays
    if (!Array.isArray(state.skills)) state.skills = [];
    if (!Array.isArray(state.projects)) state.projects = [];
  }catch{}
}

function hydrateFormFromState(){
  inpName.value = state.profile.name || "";
  inpRole.value = state.profile.role || "";
  inpEmail.value = state.profile.email || "";
  inpPhone.value = state.profile.phone || "";
  inpLocation.value = state.profile.location || "";
  inpWebsite.value = state.profile.website || "";
  inpGithub.value = state.profile.github || "";
  inpLinkedin.value = state.profile.linkedin || "";
  inpAbout.value = state.profile.about || "";
  themeSelect.value = state.theme || "blue";
  fontSelect.value = state.font || "inter";
}

/* =============== EXPORT =============== */

function getExportCSS(){
  // Minimal, clean CSS embedded in exported HTML (no external dependency)
  return `
  :root{
    --accent:#2563eb;
    --accent-600:#1d4ed8;
    --accent-50:#eff6ff;
    --text:#0b1220;
    --muted:#475569;
    --border:#e5e7eb;
  }
  body{ margin:0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; color:var(--text); }
  .hero{ background: linear-gradient(120deg, var(--accent) 0%, var(--accent-600) 100%); color:#fff; padding:40px 24px; display:flex; gap:16px; align-items:center; }
  .avatar{ width:72px; height:72px; border-radius:50%; background:#ffffff22; object-fit:cover; display:block; }
  .name{ margin:0; font-size:28px; font-weight:800; }
  .role{ margin:4px 0 0; font-weight:600; opacity:.95; }
  .meta{ margin-top:8px; font-size:14px; opacity:.95; display:flex; gap:10px; flex-wrap:wrap; }
  .wrap{ padding:24px; max-width:980px; margin:0 auto; }
  .section{ margin-bottom:20px; }
  .section h4{ margin:0 0 8px; font-size:18px; font-weight:800; }
  .skills{ display:flex; gap:8px; flex-wrap:wrap; }
  .pill{ border:1px solid var(--border); border-radius:999px; padding:6px 10px; font-size:13px; background:#fff; }
  .projects{ display:grid; gap:12px; grid-template-columns: 1fr 1fr; }
  .project{ border:1px solid var(--border); border-radius:12px; overflow:hidden; background:#fff; }
  .img{ width:100%; height:160px; background:#f1f5f9; object-fit:cover; display:block; }
  .body{ padding:12px; }
  .title{ margin:2px 0 0; font-weight:700; }
  .desc{ margin:6px 0 10px; color:var(--muted); }
  a{ color:var(--accent-600); text-decoration:none; font-weight:600; }
  a:hover{ text-decoration:underline; }
  @media (max-width:700px){ .projects{ grid-template-columns:1fr; } }
  `;
}

async function buildExportHTML(){
  // theme → color tokens
  const themeTokens = {
    blue:   {accent:"#2563eb", accent600:"#1d4ed8", accent50:"#eff6ff"},
    emerald:{accent:"#10b981", accent600:"#059669", accent50:"#ecfdf5"},
    purple: {accent:"#7c3aed", accent600:"#6d28d9", accent50:"#f5f3ff"},
    warm:   {accent:"#f97316", accent600:"#ea580c", accent50:"#fff7ed"}
  }[state.theme] || themeTokens?.blue;

  const css = getExportCSS()
    .replace("--accent:#2563eb;", `--accent:${themeTokens.accent};`)
    .replace("--accent-600:#1d4ed8;", `--accent-600:${themeTokens.accent600};`)
    .replace("--accent-50:#eff6ff;", `--accent-50:${themeTokens.accent50};`);

  // meta line
  const metaBits = [
    state.profile.email && `✉️ ${escapeHTML(state.profile.email)}`,
    state.profile.phone && `📞 ${escapeHTML(state.profile.phone)}`,
    state.profile.location && `📍 ${escapeHTML(state.profile.location)}`,
    state.profile.website && `🔗 ${escapeHTML(state.profile.website)}`,
    state.profile.github && `🐙 ${escapeHTML(state.profile.github)}`,
    state.profile.linkedin && `💼 ${escapeHTML(state.profile.linkedin)}`
  ].filter(Boolean).join(" · ");

  // projects HTML
  const projHTML = state.projects.map(p => `
    <article class="project">
      ${p.imageData ? `<img class="img" src="${p.imageData}" alt="Project image" />` : `<div class="img"></div>`}
      <div class="body">
        <div class="title">${escapeHTML(p.title || "Untitled Project")}</div>
        <div class="desc">${escapeHTML(p.description || "")}</div>
        ${p.link ? `<a href="${escapeAttr(p.link)}" target="_blank" rel="noopener">Visit Project →</a>` : ``}
      </div>
    </article>
  `).join("");

  // avatar image (optional)
  const avatarTag = state.profile.photoData
    ? `<img class="avatar" src="${state.profile.photoData}" alt="Profile photo" />`
    : `<div class="avatar" aria-hidden="true" style="display:none"></div>`;

  // final HTML
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHTML(state.profile.name || "Portfolio")}</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<header class="hero">
  ${avatarTag}
  <div>
    <h1 class="name">${escapeHTML(state.profile.name || "Your Name")}</h1>
    <div class="role">${escapeHTML(state.profile.role || "")}</div>
    <div class="meta">${metaBits}</div>
  </div>
</header>

<main class="wrap">
  ${state.profile.about ? `
    <section class="section">
      <h4>About</h4>
      <p>${escapeHTML(state.profile.about)}</p>
    </section>
  ` : ``}

  ${state.skills.length ? `
    <section class="section">
      <h4>Skills</h4>
      <div class="skills">
        ${state.skills.map(s => `<span class="pill">${escapeHTML(s)}</span>`).join("")}
      </div>
    </section>
  ` : ``}

  ${state.projects.length ? `
    <section class="section">
      <h4>Projects</h4>
      <div class="projects">
        ${projHTML}
      </div>
    </section>
  ` : ``}
</main>
</body>
</html>`;
}

/* =============== SAMPLE & BOOTSTRAP =============== */

function loadSample(){
  state = structuredClone(EMPTY_STATE);
  state.theme = "blue";
  state.font = "inter";
  state.profile = {
    name: "Emilia Riley",
    role: "Frontend Developer",
    email: "emilia@example.com",
    phone: "+233 55 123 4567",
    location: "Accra, Ghana",
    website: "https://emiliariley.dev",
    github: "https://github.com/emilia",
    linkedin: "https://linkedin.com/in/emilia",
    about: "I build clean, accessible interfaces with HTML, CSS, and JavaScript. Passionate about performance and delightful UX.",
    photoData: "" // you can upload
  };
  state.skills = ["HTML", "CSS", "JavaScript", "React", "Figma", "Git"];
  state.projects = [
    {
      title: "Campus Navigator",
      description: "A mini web app to find the shortest path between landmarks on campus.",
      link: "https://example.com/campus",
      imageData: ""
    },
    {
      title: "Budget Planner",
      description: "Simple monthly budget tracker with charts.",
      link: "https://example.com/budget",
      imageData: ""
    }
  ];
}

function escapeHTML(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function escapeAttr(str){
  // simple attr escaping
  return escapeHTML(str).replaceAll("`","&#x60;");
}

function init(){
  restore();
  bindProfileInputs();
  bindSkillInputs();
  hydrateFormFromState();
  renderSkills();
  renderProjectForms();
  renderPreview();
}

document.addEventListener("DOMContentLoaded", init);
