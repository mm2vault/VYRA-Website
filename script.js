const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

const downloadButtons = [$("#downloadBtn"), $("#downloadBtn2")].filter(Boolean);
const versionLabel = $("#version");
const releasesUrl = "https://api.github.com/repos/mm2vault/VYRA/releases?per_page=30";

function setReleaseFallback() {
  const releasesPage = "https://github.com/mm2vault/VYRA/releases";
  downloadButtons.forEach(button => {
    button.href = releasesPage;
    button.removeAttribute("download");
  });
  if (versionLabel) versionLabel.textContent = "Sürümleri GitHub Releases üzerinden kontrol et.";
}

async function loadLatestRelease() {
  try {
    const response = await fetch(releasesUrl, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!response.ok) throw new Error("GitHub Releases isteği başarısız.");

    const releases = await response.json();
    // Kararlı sürümleri tercih et; yalnızca prerelease varsa onu kullan.
    const published = releases
      .filter(release => !release.draft)
      .sort((a, b) =>
        new Date(b.published_at || b.created_at).getTime() -
        new Date(a.published_at || a.created_at).getTime()
      );
    const release = published.find(item => !item.prerelease) || published[0];

    if (!release) throw new Error("Yayınlanmış sürüm bulunamadı.");

    const assets = Array.isArray(release.assets) ? release.assets : [];
    const apk = assets.find(asset =>
      typeof asset.name === "string" &&
      asset.name.toLowerCase().endsWith(".apk") &&
      /release|universal|arm64/i.test(asset.name)
    ) || assets.find(asset =>
      typeof asset.name === "string" && asset.name.toLowerCase().endsWith(".apk")
    );

    const destination = apk?.browser_download_url || release.html_url;
    downloadButtons.forEach(button => {
      button.href = destination;
      button.target = "_blank";
      button.rel = "noopener noreferrer";
    });

    if (versionLabel) {
      const tag = release.tag_name || release.name || "Son sürüm";
      versionLabel.textContent = tag + (apk ? " · APK hazır" : " · APK bağlantısını aç");
    }
  } catch (error) {
    setReleaseFallback();
    console.warn("VYRA sürüm bilgisi alınamadı:", error);
  }
}
loadLatestRelease();

// Mobil menü
const menu = $(".mobile-menu");
const menuButton = $(".menu-btn");
const closeMenu = () => {
  menu?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Menüyü aç");
};
menuButton?.addEventListener("click", () => {
  if (!menu) return;
  const isOpen = menu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Menüyü kapat" : "Menüyü aç");
});
$$(".mobile-menu a").forEach(link => link.addEventListener("click", closeMenu));
document.addEventListener("pointerdown", event => {
  if (menu?.classList.contains("open") &&
      !menu.contains(event.target) &&
      !menuButton?.contains(event.target)) closeMenu();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeMenu();
});

// Animasyonlar: IntersectionObserver desteklenmiyorsa içeriği gizleme.
if (!reduceMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("js-ready");
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -25px 0px" });
  $$(".reveal").forEach(element => revealObserver.observe(element));
} else {
  $$(".reveal").forEach(element => element.classList.add("visible"));
}

// Sayfa ilerleme göstergesi
const progress = $("#progress");
const updateProgress = () => {
  if (!progress) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const percent = maxScroll > 0 ? window.scrollY / maxScroll * 100 : 0;
  progress.style.width = Math.min(100, Math.max(0, percent)) + "%";
};
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

// Masaüstü hero parallax
const stage = $("#heroStage");
if (stage && !reduceMotion && finePointer) {
  const phone = $(".phone", stage);
  stage.addEventListener("pointermove", event => {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height || !phone) return;
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    phone.style.transform = `rotate(4deg) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translate(${x * 4}px, ${y * 4}px)`;
  });
  stage.addEventListener("pointerleave", () => {
    if (phone) phone.style.transform = "rotate(4deg)";
  });
}

if (!reduceMotion && finePointer) {
  $$(".btn").forEach(button => {
    button.addEventListener("pointermove", event => {
      const rect = button.getBoundingClientRect();
      button.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * 0.05}px, ${(event.clientY - rect.top - rect.height / 2) * 0.05}px)`;
    });
    button.addEventListener("pointerleave", () => { button.style.transform = ""; });
  });
}

// Ekran görüntüsü lightbox'ı; Escape ve odak yönetimi dahil.
$$(".shot").forEach(shot => {
  shot.addEventListener("click", () => {
    const image = $("img", shot);
    if (!image) return;

    const overlay = document.createElement("div");
    overlay.className = "image-viewer";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", image.alt || "VYRA ekran görüntüsü");
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Görseli kapat");
    closeButton.textContent = "×";
    const enlarged = document.createElement("img");
    enlarged.src = image.currentSrc || image.src;
    enlarged.alt = image.alt;
    overlay.append(closeButton, enlarged);
    document.body.appendChild(overlay);
    closeButton.focus();

    const close = () => {
      overlay.remove();
      document.removeEventListener("keydown", onKeyDown);
      shot.focus();
    };
    const onKeyDown = event => {
      if (event.key === "Escape") close();
    };
    closeButton.addEventListener("click", close);
    overlay.addEventListener("click", event => {
      if (event.target === overlay) close();
    });
    document.addEventListener("keydown", onKeyDown);
  });
});

// Oynatıcı alanı yalnızca görsel demodur; gerçek ses oynatmaz.
const demoPlayer = $(".player-panel");
const demoPlay = demoPlayer && $(".play", demoPlayer);
const demoBar = demoPlayer && $(".player-progress i", demoPlayer);
const demoTimes = demoPlayer ? $$(".player-time span", demoPlayer) : [];

if (demoPlayer && demoPlay && demoBar && demoTimes.length >= 2) {
  const totalSeconds = 222;
  let isPlaying = false;
  let startTime = 0;
  let elapsedSeconds = 0;
  let animationFrame = 0;

  const paintTime = seconds => {
    const value = Math.max(0, Math.min(totalSeconds, seconds));
    demoBar.style.width = value / totalSeconds * 100 + "%";
    demoTimes[0].textContent =
      String(Math.floor(value / 60)).padStart(2, "0") + ":" +
      String(Math.floor(value % 60)).padStart(2, "0");
  };

  const renderDemo = () => {
    if (!isPlaying) return;
    const current = elapsedSeconds + (performance.now() - startTime) / 1000;
    paintTime(current);
    if (current >= totalSeconds) {
      isPlaying = false;
      elapsedSeconds = 0;
      paintTime(0);
      demoPlay.textContent = "▶";
      demoPlay.setAttribute("aria-label", "Görsel demoyu başlat");
      return;
    }
    animationFrame = requestAnimationFrame(renderDemo);
  };

  demoPlay.addEventListener("click", () => {
    if (isPlaying) {
      elapsedSeconds += (performance.now() - startTime) / 1000;
      isPlaying = false;
      cancelAnimationFrame(animationFrame);
      demoPlay.textContent = "▶";
      demoPlay.setAttribute("aria-label", "Görsel demoyu başlat");
    } else {
      if (elapsedSeconds >= totalSeconds) elapsedSeconds = 0;
      startTime = performance.now();
      isPlaying = true;
      demoPlay.textContent = "Ⅱ";
      demoPlay.setAttribute("aria-label", "Görsel demoyu duraklat");
      renderDemo();
    }
  });

  $$("[data-skip]", demoPlayer).forEach(button => {
    button.addEventListener("click", () => {
      const current = isPlaying
        ? elapsedSeconds + (performance.now() - startTime) / 1000
        : elapsedSeconds;
      elapsedSeconds = Math.max(0, Math.min(totalSeconds, current + Number(button.dataset.skip)));
      if (isPlaying) startTime = performance.now();
      paintTime(elapsedSeconds);
    });
  });
}
