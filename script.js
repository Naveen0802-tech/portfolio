const $ = (id) => document.getElementById(id);

// Escape text from data.json before inserting it as HTML.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const chips = (items) => `<div class="chips">${items.map((i) => `<span class="chip">${esc(i)}</span>`).join("")}</div>`;
const bullets = (points) => `<ul>${points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`;

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
    [`mailto:${p.email}`, `✉ ${p.email}`],
    [`tel:${p.phone}`, `☎ ${p.phone}`],
    [p.linkedin, "in LinkedIn"],
  ].map(([href, label]) => `<a class="btn" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}</a>`).join("")
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
