const $ = (id) => document.getElementById(id);

// Escape text from data.json before inserting it as HTML.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const chips = (items) => `<div class="chips">${items.map((i) => `<span class="chip">${esc(i)}</span>`).join("")}</div>`;
const bullets = (points) => `<ul>${points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`;

const ICONS = {
  github: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>`,
};

function render(d) {
  const p = d.profile;
  document.title = d.meta.title;
  document.querySelector('meta[name="description"]').content = d.meta.description;

  $("logo").textContent = p.name;
  $("hero-name").textContent = p.name;
  $("hero-headline").textContent = p.headline;
  $("footer").textContent = `© ${new Date().getFullYear()} ${p.name}`;

  $("stats").innerHTML = d.stats.map((s) => `<div class="stat"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join("");
  $("about-body").innerHTML = p.summary.map((t) => `<p>${esc(t)}</p>`).join("");

  $("skills-grid").innerHTML = d.skills.map((s) => `<div class="card reveal"><h3>${esc(s.category)}</h3>${chips(s.items)}</div>`).join("");

  $("timeline").innerHTML = d.experience.map((e) => `
    <div class="card reveal">
      <h3>${esc(e.role)} · ${esc(e.company)}</h3>
      <p class="sub">${esc(e.period)} · ${esc(e.location)}</p>
      ${bullets(e.points)}
    </div>`).join("");

  $("projects-grid").innerHTML = d.projects.map((pr) => `
    <div class="card reveal">
      <h3>${esc(pr.name)}</h3>
      <p class="sub">${esc(pr.subtitle)} · ${esc(pr.period)}</p>
      ${bullets(pr.points)}
      ${chips(pr.stack)}
    </div>`).join("");

  $("edu-list").innerHTML = d.education.map((e) => `
    <div class="card reveal">
      <h3>${esc(e.degree)}</h3>
      <p class="sub">${esc(e.institution)} – ${esc(e.location)} · ${esc(e.year)}</p>
    </div>`).join("");

  $("cert-list").innerHTML = d.certifications.map((c) => {
    const inner = `<h3>${esc(c.name)}</h3><p class="sub">${esc(c.issuer)}</p>`;
    return c.url
      ? `<a class="card reveal" style="display:block" href="${esc(c.url)}" target="_blank" rel="noopener">${inner}</a>`
      : `<div class="card reveal">${inner}</div>`;
  }).join("");

  $("contact-links").innerHTML = [
    [`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(p.email)}`, `✉ ${p.email}`],
    [`tel:${p.phone}`, `☎ ${p.phone}`],
    [p.github, `${ICONS.github} GitHub`],
    [p.linkedin, `${ICONS.linkedin} LinkedIn`],
  ].map(([href, label]) => `<a class="btn icon-btn" href="${esc(href)}" target="_blank" rel="noopener">${label}</a>`).join("")
    + `<span class="btn muted">📍 ${esc(p.location)}</span>`;

  typeRoles(p.roles);
  observeReveals();
}

function typeRoles(roles) {
  const el = $("typed");
  let r = 0, c = 0, deleting = false;
  (function tick() {
    const word = roles[r];
    el.textContent = word.slice(0, c);
    if (!deleting && c === word.length) { deleting = true; return setTimeout(tick, 1400); }
    if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; }
    c += deleting ? -1 : 1;
    setTimeout(tick, deleting ? 40 : 80);
  })();
}

function observeReveals() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

// Theme toggle, persisted.
const root = document.documentElement;
root.dataset.theme = localStorage.getItem("theme") || "dark";
$("theme-toggle").addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", root.dataset.theme);
});

render(window.PORTFOLIO_DATA);
