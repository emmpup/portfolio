const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 0) {
    navbar.classList.add("navbar--scrolled");
  } else {
    navbar.classList.remove("navbar--scrolled");
  }
});

// Accessibility: Update ARIA attributes for navigation toggle
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("navbar-mobile-menu");
if (navToggle) {
  navToggle.addEventListener("change", (e) => {
    navToggle.setAttribute(
      "aria-expanded",
      e.target.checked ? "true" : "false",
    );
  });
}

// Accessibility: Update ARIA attributes and sync theme toggles
const themeToggleDesktop = document.getElementById("theme-toggle");
const themeToggleMobile = document.getElementById("theme-toggle-mobile");

function updateThemeAttributes(isDark) {
  const pressed = isDark ? "true" : "false";
  if (themeToggleDesktop)
    themeToggleDesktop.setAttribute("aria-pressed", pressed);
  if (themeToggleMobile)
    themeToggleMobile.setAttribute("aria-pressed", pressed);
}

// Apply theme to DOM
function applyTheme(isDark) {
  const root = document.documentElement;
  if (isDark) {
    root.style.colorScheme = "dark";
    root.classList.add("dark-mode");
    root.classList.remove("light-mode");
  } else {
    root.style.colorScheme = "light";
    root.classList.add("light-mode");
    root.classList.remove("dark-mode");
  }
  updateThemeAttributes(isDark);
}

// Sync desktop and mobile theme toggles
function syncThemeToggles(source) {
  const checked = source.checked;
  const isDark = checked;

  if (source === themeToggleDesktop && themeToggleMobile) {
    themeToggleMobile.checked = checked;
  } else if (source === themeToggleMobile && themeToggleDesktop) {
    themeToggleDesktop.checked = checked;
  }

  applyTheme(isDark);
  // Save preference to localStorage
  localStorage.setItem("theme-preference", isDark ? "dark" : "light");
}

if (themeToggleDesktop) {
  themeToggleDesktop.addEventListener("change", (e) => {
    syncThemeToggles(e.target);
  });
}
if (themeToggleMobile) {
  themeToggleMobile.addEventListener("change", (e) => {
    syncThemeToggles(e.target);
  });
}

// Initialize theme state on page load
window.addEventListener("load", () => {
  const storedPreference = localStorage.getItem("theme-preference");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDarkMode =
    storedPreference === "dark" || (storedPreference === null && prefersDark);

  if (themeToggleDesktop) themeToggleDesktop.checked = isDarkMode;
  if (themeToggleMobile) themeToggleMobile.checked = isDarkMode;
  applyTheme(isDarkMode);

  // Initialize nav toggle ARIA state
  if (navToggle) {
    navToggle.setAttribute(
      "aria-expanded",
      navToggle.checked ? "true" : "false",
    );
  }
});

// Also apply theme on DOMContentLoaded in case load event doesn't fire in time
document.addEventListener("DOMContentLoaded", () => {
  const storedPreference = localStorage.getItem("theme-preference");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDarkMode =
    storedPreference === "dark" || (storedPreference === null && prefersDark);

  if (themeToggleDesktop) themeToggleDesktop.checked = isDarkMode;
  if (themeToggleMobile) themeToggleMobile.checked = isDarkMode;
  applyTheme(isDarkMode);
});

gsap.registerPlugin(SplitText);

console.clear();

document.fonts.ready.then(() => {
  gsap.set(".split", { opacity: 1 });

  let split;
  SplitText.create(".split", {
    type: "words,lines",
    linesClass: "line",
    autoSplit: true,
    mask: "words",
    onSplit: (self) => {
      split = gsap.from(self.lines, {
        duration: 1.5,
        yPercent: 100,
        opacity: 0,
        stagger: 0.1,
        ease: "expo.out",
      });
      return split;
    },
  });
});
