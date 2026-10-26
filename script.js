"use strict";
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;
const root = document.documentElement;
root.classList.add("js");

/* ---------- i18n (EN / TR) ---------- */
const TR = {
  skip: "İçeriğe geç", nav_home: "Ana sayfa", nav_features: "Özellikler", nav_app: "Uygulama", nav_exp: "Deneyim", nav_film: "Film", chip1: "Android 8.0+", chip2: "Açık kaynak · GPL-3.0", chip3: "Senkron sözler", v_eyebrow: "Film", v_h2: "<em>VYRA</em> ile tanış.", v_note: "42 saniyelik tanıtım. Ses yalnızca oynat'a bastığında çalar.", nav_about: "Hakkında", nav_get: "VYRA'yı indir",
  hero_eyebrow: "Android için açık kaynak müzik çalar",
  hero_h1: "Her frekansı<br><em>hisset.</em>",
  hero_lead: "Senin sesin. Senin atmosferin. Kendi ritmin. Dinleme şeklin etrafında tasarlanmış bir müzik deneyimi.",
  cta_dl: "Android için indir", cta_see: "Uygulamayı gör", cta_dl2: "Son APK'yı indir",
  rel_checking: "Son sürüm kontrol ediliyor…",
  f_eyebrow: "Özellikler", f_h2: "Bir çalardan fazlası.<br><em>Seni merkeze alır.</em>",
  f_sub: "Burada listelenen her özellik projenin kendi README dosyasında yer alır ve kaynak kodda karşılığı vardır.",
  c1_t: "Arka planda oynatma", c1_d: "Ekran kapalıyken veya başka bir uygulama açıkken dinlemeye devam et.",
  c2_t: "Canlı senkron sözler", c2_d: "Sözleri müzikle birlikte takip et; çeviri ve romanizasyon seçenekleriyle.",
  c3_t: "Yerel dosyalar ve YouTube Music", c3_d: "Cihazındaki dosyaları çal ya da YouTube Music kütüphaneni getirmek için giriş yap.",
  c4_t: "Ses kontrolleri", c4_d: "Ses seviyesi normalizasyonu, tempo, perde ve hız, geçişli çalma ve sistem ekolayzır entegrasyonu.",
  c5_t: "Spotify çalma listesi aktarımı", c5_d: "Çalma listeni elle yeniden kurmak yerine Spotify'dan taşı.",
  c6_t: "Scrobble ve durum paylaşımı", c6_d: "Last.fm scrobble, ListenBrainz geçmiş senkronu ve Discord rich presence.",
  c7_t: "Dinleme istatistikleri", c7_d: "En çok dinlediğin şarkıları, sanatçıları ve dinleme süreni istediğin zaman gör.",
  c8_t: "Material 3 ve dinamik renk", c8_d: "Albüm kapağından renkler, 9 farklı çalar stiline kadar ve derin özelleştirme.",
  s_eyebrow: "Uygulama", s_h2: "Telefonunda,<br><em>senin VYRA'n.</em>", s_sub: "Uygulamadan gerçek ekranlar. Yakından bakmak için birini seç.",
  s_note: "Ekran görüntüleri uygulama sürümüne göre biraz farklı olabilir.", s_fallback: "Ekran görüntüsü yüklenemedi.",
  e_eyebrow: "Deneyim", e_h2: "Senin ritmin için<br><em>yapıldı.</em>", e_note: "Dekoratif görsel — web sitesi ses çalmaz.",
  e1_t: "Görünüm", e1_d: "Koyu yüzeyler, albüm kapağı renkleri ve seçilebilir çalar stilleri.",
  e2_t: "Ses", e2_d: "Normalizasyon, geçiş, tempo ve perde — kendine göre ayarla.",
  e3_t: "Kontrol", e3_d: "Uygulamayı iş akışına göre şekillendiren hareket, animasyon ve düzen ayarları.",
  a_eyebrow: "VYRA hakkında", a_h2: "Müzik kendine ait<br><em>hissettirmeli.</em>",
  a_p1: "VYRA basit bir fikir etrafında kuruldu: çalar kaybolmalı, müzik kalmalı. Daha az dolambaç, daha çok atmosfer ve nasıl görüneceğine ve ses vereceğine senin karar vermeni sağlayan ayarlar.",
  a_p2: "GPL-3.0 lisansıyla açık kaynaktır; kodu okuyabilir, gelişimi takip edebilir ve katkıda bulunabilirsin.",
  d_eyebrow: "İndir", d_h2: "<em>VYRA'yı</em> edin.", d_sub: "Android 8.0 veya üzeri gerekir. Sürümler GitHub Releases üzerinden yayınlanır.",
  d_f1: "Android 8.0+ (API 26)", d_f2: "Açık kaynak · GPL-3.0", d_f3: "YouTube Music'in desteklenmediği bölgelerde VPN gerekebilir",
  d_all: "Tüm sürümler", d_src: "GitHub'da kaynak kod", f_priv: "Gizlilik", f_lic: "Lisans",
  rel_ready: "APK hazır", rel_page: "sürüm sayfasını aç", rel_pre: "ön sürüm", rel_fail: "Sürümleri GitHub Releases üzerinden kontrol et."
};
const EN = { rel_ready: "APK ready", rel_page: "open release page", rel_pre: "pre-release", rel_fail: "Check releases on GitHub." };
const SHOT_ALT = {
  en: ["VYRA home screen", "VYRA discover screen", "VYRA player screen", "VYRA library screen", "VYRA playlist screen"],
  tr: ["VYRA ana ekran", "VYRA keşfet ekranı", "VYRA çalar ekranı", "VYRA kitaplık ekranı", "VYRA çalma listesi ekranı"]
};
const TABS = { en: ["Home", "Discover", "Player", "Library", "Playlist"], tr: ["Ana ekran", "Keşfet", "Çalar", "Kitaplık", "Liste"] };
const stash = new Map();
$$("[data-i18n],[data-i18n-html]").forEach(el => stash.set(el, el.hasAttribute("data-i18n-html") ? el.innerHTML : el.textContent));
let lang = (navigator.language || "").toLowerCase().startsWith("tr") ? "tr" : "en";
try { const saved = localStorage.getItem("vyra-lang"); if (saved === "tr" || saved === "en") lang = saved; } catch (e) {}
const t = k => (lang === "tr" && TR[k]) || (EN[k] ?? TR[k] ?? k);
let relState = null;
function applyLang() {
  root.lang = lang;
  stash.forEach((orig, el) => {
    const key = el.dataset.i18n || el.dataset.i18nHtml;
    const val = lang === "tr" && TR[key] ? TR[key] : orig;
    if (el.hasAttribute("data-i18n-html")) el.innerHTML = val; else el.textContent = val;
  });
  $("#lang").textContent = lang === "tr" ? "EN" : "TR";
  $$("#tabs button").forEach((b, i) => (b.textContent = TABS[lang][i]));
  $("#shotImg").alt = SHOT_ALT[lang][current];
  renderRelease();
}
$("#lang").addEventListener("click", () => {
  lang = lang === "tr" ? "en" : "tr";
  try { localStorage.setItem("vyra-lang", lang); } catch (e) {}
  applyLang();
});

/* ---------- latest release ---------- */
const dlBtns = [$("#dl1"), $("#dl2")];
const verEls = [$("#ver1"), $("#ver2")];
function renderRelease() {
  if (!relState) return;
  const { tag, apk, pre, fail } = relState;
  const txt = fail ? t("rel_fail") : `${tag} · ${apk ? t("rel_ready") : t("rel_page")}${pre ? " · " + t("rel_pre") : ""}`;
  verEls.forEach(e => { e.removeAttribute("data-i18n"); e.textContent = txt; });
}
async function loadRelease() {
  const page = "https://github.com/mm2vault/VYRA/releases";
  try {
    const r = await fetch("https://api.github.com/repos/mm2vault/VYRA/releases?per_page=30", { headers: { Accept: "application/vnd.github+json" } });
    if (!r.ok) throw new Error(r.status);
    const list = (await r.json()).filter(x => !x.draft)
      .sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
    const rel = list.find(x => !x.prerelease) || list[0]; // prefer stable, else newest pre-release
    if (!rel) throw new Error("none");
    const apks = (rel.assets || []).filter(a => /\.apk$/i.test(a.name || ""));
    const apk = apks.find(a => /release|universal|arm64/i.test(a.name)) || apks[0];
    dlBtns.forEach(b => { b.href = apk ? apk.browser_download_url : rel.html_url; });
    relState = { tag: rel.tag_name || rel.name, apk: !!apk, pre: !!rel.prerelease };
  } catch (e) {
    dlBtns.forEach(b => (b.href = page));
    relState = { fail: true };
  }
  renderRelease();
}

/* ---------- nav ---------- */
const nav = $("#nav"), burger = $("#burger"), drawer = $("#drawer");
const setDrawer = open => {
  drawer.hidden = !open;
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
burger.addEventListener("click", () => setDrawer(drawer.hidden));
$$("a", drawer).forEach(a => a.addEventListener("click", () => setDrawer(false)));
document.addEventListener("keydown", e => { if (e.key === "Escape" && !drawer.hidden) { setDrawer(false); burger.focus(); } });
document.addEventListener("pointerdown", e => { if (!drawer.hidden && !drawer.contains(e.target) && !burger.contains(e.target)) setDrawer(false); });
matchMedia("(min-width:861px)").addEventListener("change", e => e.matches && setDrawer(false));

const prog = $("#progress");
let tick = false;
function onScroll() {
  if (tick) return; tick = true;
  requestAnimationFrame(() => {
    nav.classList.toggle("scrolled", scrollY > 12);
    const max = root.scrollHeight - innerHeight;
    prog.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + "%";
    tick = false;
  });
}
addEventListener("scroll", onScroll, { passive: true }); onScroll();

/* active link */
const secs = ["top", "features", "app", "film", "experience", "about", "download"].map(id => document.getElementById(id));
const links = $$(".links a");
const spy = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return;
  links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
secs.forEach(s => s && spy.observe(s));

/* ---------- reveal ---------- */
if ("IntersectionObserver" in window && !reduce) {
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: .12, rootMargin: "0px 0px -30px 0px" });
  $$(".reveal").forEach(el => io.observe(el));
} else $$(".reveal").forEach(el => el.classList.add("in"));

/* ---------- visualizer bars (decorative, paused off-screen) ---------- */
$$("[data-viz]").forEach(box => {
  const bars = $$("i", box), n = bars.length;
  bars.forEach((b, i) => {
    const x = i / (n - 1);
    const env = .35 + .65 * Math.sin(Math.PI * x);
    b.style.setProperty("--h", Math.round((22 + 70 * Math.abs(Math.sin(i * 1.7) * .6 + Math.sin(i * .6) * .4)) * env) + "%");
    b.style.setProperty("--d", (-(i * 0.11) % 2.4).toFixed(2) + "s");
  });
  if ("IntersectionObserver" in window) new IntersectionObserver(es => es.forEach(en => box.classList.toggle("paused", !en.isIntersecting))).observe(box);
});
const art = $("#heroArt");
if (art && "IntersectionObserver" in window) new IntersectionObserver(es => es.forEach(en => art.classList.toggle("paused", !en.isIntersecting))).observe(art);

/* ---------- hero / device pointer motion (desktop only) ---------- */
function tilt(el, strength, setter) {
  if (reduce || !fine || !el) return;
  let raf = 0;
  el.addEventListener("pointermove", e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setter(x * strength, y * strength));
  });
  el.addEventListener("pointerleave", () => setter(0, 0));
}
tilt(art, 14, (x, y) => (art.style.transform = `translate3d(${x}px,${y}px,0)`));
const stage = $("#stage"), device = $("#device");
tilt(stage, 1, (x, y) => { device.style.setProperty("--ry", (-8 + x * 18).toFixed(1) + "deg"); device.style.setProperty("--rx", (3 - y * 14).toFixed(1) + "deg"); });

/* ---------- screenshot tabs ---------- */
const SHOTS = ["QtuxYWK", "xReSL3X", "2T3pYsK", "3o4hIif", "vT8892A"].map(id => `https://i.imgur.com/${id}.jpeg`);
const img = $("#shotImg"), fb = $("#shotFallback"), tabs = $$("#tabs button");
let current = 0;
function show(i, focus) {
  current = i;
  tabs.forEach((b, j) => { b.setAttribute("aria-selected", String(j === i)); b.tabIndex = j === i ? 0 : -1; });
  $("#shot").setAttribute("aria-labelledby", "t" + i);
  if (focus) tabs[i].focus();
  const n = SHOTS.length;
  $("#peekL").src = SHOTS[(i + n - 1) % n]; $("#peekR").src = SHOTS[(i + 1) % n];
  img.classList.add("swap");
  setTimeout(() => { fb.hidden = true; img.hidden = false; img.alt = SHOT_ALT[lang][i]; img.src = SHOTS[i]; }, reduce ? 0 : 160);
}
img.addEventListener("load", () => img.classList.remove("swap"));
img.addEventListener("error", () => { img.hidden = true; fb.hidden = false; });
tabs.forEach((b, i) => {
  b.tabIndex = i === 0 ? 0 : -1;
  b.addEventListener("click", () => show(i));
  b.addEventListener("keydown", e => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (k) { e.preventDefault(); show((i + k + tabs.length) % tabs.length, true); }
  });
});

$("#peekL").src = SHOTS[SHOTS.length - 1]; $("#peekR").src = SHOTS[1];

/* card spotlight */
if (fine && !reduce) $$(".card").forEach(c => c.addEventListener("pointermove", e => {
  const r = c.getBoundingClientRect();
  c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px");
}));

applyLang();
loadRelease();
