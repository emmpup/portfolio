(function () {
  function getCurrentTheme() {
    const root = document.documentElement;

    if (root.classList.contains("dark-mode")) {
      return "dark";
    }
    if (root.classList.contains("light-mode")) {
      return "light";
    }

    const themeToggle = document.querySelector('[name="toggle-color-scheme"]');
    const isToggleChecked = themeToggle ? themeToggle.checked : false;

    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const isDarkMode = themeToggle ? isToggleChecked : systemPrefersDark;

    return isDarkMode ? "dark" : "light";
  }

  function isMobileBreakpoint() {
    return window.innerWidth < 768;
  }

  function updateImageTheme() {
    const imageThemeElement = document.querySelector(
      ".project-detail__image-theme",
    );
    if (!imageThemeElement) return;

    const theme = getCurrentTheme();
    const isMobile = isMobileBreakpoint();
    const mobileSuffix = isMobile ? "-mobile" : "";
    const imagePath = `../img/montro/styleguide-${theme}${mobileSuffix}.png`;

    imageThemeElement.src = imagePath;
  }

  const themeToggleDesktop = document.getElementById("theme-toggle");
  const themeToggleMobile = document.getElementById("theme-toggle-mobile");

  if (themeToggleDesktop) {
    themeToggleDesktop.addEventListener("change", updateImageTheme);
  }
  if (themeToggleMobile) {
    themeToggleMobile.addEventListener("change", updateImageTheme);
  }

  const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  themeMediaQuery.addEventListener("change", updateImageTheme);

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateImageTheme, 150);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateImageTheme);
  } else {
    requestAnimationFrame(updateImageTheme);
  }
})();
