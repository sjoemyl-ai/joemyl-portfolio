// Keep the current year up to date without editing the HTML each January.
const yearElement = document.querySelector("#current-year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const visitCountElement = document.querySelector("#visit-count");

if (visitCountElement && (window.location.protocol === "http:" || window.location.protocol === "https:")) {
  fetch("/api/visits", {
    headers: { Accept: "application/json" },
    cache: "no-store"
  })
    .then((response) => {
      if (!response.ok) throw new Error("Visit counter unavailable");
      return response.json();
    })
    .then(({ visits }) => {
      if (Number.isSafeInteger(visits) && visits > 0) {
        visitCountElement.textContent = visits.toLocaleString();
      }
    })
    .catch(() => {});
}

// Switch the page color palette and keep the button label action-oriented.
const themeToggle = document.querySelector("#theme-toggle");

if (themeToggle) {
  const setTheme = (theme) => {
    const isDark = theme === "dark";
    const actionLabel = isDark ? "Switch to light mode" : "Switch to dark mode";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    themeToggle.querySelector(".theme-icon").textContent = isDark ? "☼" : "☾";
    themeToggle.setAttribute("aria-label", actionLabel);
    themeToggle.title = actionLabel;
    themeToggle.setAttribute("aria-pressed", String(isDark));
  };

  setTheme("light");
  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    setTheme(isDark ? "light" : "dark");
  });
}

// Canva design links are kept here so each portfolio action has one clear destination.
const canvaDesignUrls = [
  "https://canva.link/7e6p308ebsj3wic",
  "https://canva.link/y6g6yz8tglq14st"
];

document.querySelectorAll(".project-preview-canva img").forEach((image, index) => {
  const url = canvaDesignUrls[index];
  if (!url) return;

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `Open Canva Design ${index + 1} in a new tab`);
  image.replaceWith(link);
  link.append(image);
});

const worksDialog = document.querySelector("#works-dialog");
const workDialogGallery = document.querySelector("#work-dialog-gallery");
const designLinks = document.querySelector("#design-links");
const excelLinks = document.querySelector("#excel-links");
const workDialogType = document.querySelector("#works-dialog-type");

if (worksDialog && typeof worksDialog.showModal === "function") {
  document.querySelectorAll("[data-open-work]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".project-card");
      const tool = card.dataset.workTool;
      const images = card.querySelectorAll(".project-preview img");
      const workType = card.dataset.workType || "";

      document.querySelector("#works-dialog-title").textContent = card.dataset.workTitle;
      document.querySelector("#works-dialog-description").textContent = card.dataset.workDescription;
      document.querySelector("#works-dialog-tool").textContent = tool;
      workDialogType.textContent = workType;
      workDialogType.hidden = !workType;
      workDialogGallery.dataset.count = String(images.length);
      worksDialog.classList.toggle("works-dialog-single", images.length === 1);
      workDialogGallery.replaceChildren(...Array.from(images, (image, index) => {
        const preview = image.cloneNode();
        preview.loading = "eager";
        if (tool !== "Canva" || !canvaDesignUrls[index]) return preview;

        const link = document.createElement("a");
        link.href = canvaDesignUrls[index];
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `Open Canva Design ${index + 1} in a new tab`);
        link.append(preview);
        return link;
      }));
      designLinks.hidden = tool !== "Canva";
      excelLinks.hidden = tool !== "Microsoft Excel";
      worksDialog.showModal();
    });
  });

  document.querySelectorAll("[data-design-index]").forEach((button) => {
    const url = canvaDesignUrls[Number(button.dataset.designIndex)];
    button.disabled = !url;
    button.addEventListener("click", () => {
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    });
  });

  worksDialog.addEventListener("click", (event) => {
    if (event.target === worksDialog) worksDialog.close();
  });
}

const heroSection = document.querySelector("#home");
const heroReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (heroSection && !heroReduceMotion.matches) {
  let heroAnimationFrame = 0;

  const updateHeroScroll = () => {
    const heroHeight = Math.max(heroSection.offsetHeight, window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / (heroHeight * 0.82)));
    const isMobileHero = window.matchMedia("(max-width: 760px)").matches;
    const panelProgress = isMobileHero
      ? Math.min(1, Math.max(0, (window.scrollY / heroHeight - 0.35) / 1.2))
      : progress;
    const panelFade = isMobileHero ? 0.55 : 0.82;
    const rootStyle = document.documentElement.style;

    rootStyle.setProperty("--hero-content-shift", `${-24 * progress}px`);
    rootStyle.setProperty("--hero-content-opacity", String(1 - progress * 0.78));
    rootStyle.setProperty("--hero-photo-shift", `${-42 * progress}px`);
    rootStyle.setProperty("--hero-panel-shift", `${-14 * progress}px`);
    rootStyle.setProperty("--hero-panel-opacity", String(1 - panelProgress * panelFade));
    rootStyle.setProperty("--hero-background-shift", `${-30 * progress}px`);
  };

  const requestHeroUpdate = () => {
    if (heroAnimationFrame) return;

    heroAnimationFrame = window.requestAnimationFrame(() => {
      heroAnimationFrame = 0;
      updateHeroScroll();
    });
  };

  window.addEventListener("scroll", requestHeroUpdate, { passive: true });
  window.addEventListener("resize", requestHeroUpdate);
  updateHeroScroll();
}

// Highlight the navigation link for the section closest to the top of the page.
const pageSections = document.querySelectorAll("main .page-section");
const navigationLinks = document.querySelectorAll('.site-nav a[href^="#"]');

const updateCurrentLink = () => {
  const activationPoint = window.innerHeight * 0.35;
  let currentSection = pageSections[0];

  pageSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= activationPoint) {
      currentSection = section;
    }
  });

  navigationLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${currentSection.id}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

window.addEventListener("scroll", updateCurrentLink, { passive: true });
window.addEventListener("resize", updateCurrentLink);
updateCurrentLink();

// Reveal future project cards as they enter the viewport.
const projectCards = document.querySelectorAll(".project-card");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion || !("IntersectionObserver" in window)) {
  projectCards.forEach((card) => card.classList.add("is-visible"));
} else {
  const cardObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  projectCards.forEach((card) => cardObserver.observe(card));
}
