// Keep the current year up to date without editing the HTML each January.
const yearElement = document.querySelector("#current-year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
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
