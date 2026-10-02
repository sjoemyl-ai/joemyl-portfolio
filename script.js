// Keep the current year up to date without editing the HTML each January.
const yearElement = document.querySelector("#current-year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
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
