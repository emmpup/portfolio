// SafeSpace Project Wireframes Interactive Navigation

(function () {
  // State management
  const state = {
    screen: "home",
    fidelity: "lofi",
    fidelityOrder: ["lofi", "midfi", "hifi"],
  };

  // DOM elements
  const wireframesScreensContainer =
    document.getElementById("wireframes-screens");
  const wireframesFidelityContainer = document.getElementById(
    "wireframes-fidelity",
  );
  const imageElement = document.getElementById("wireframes-image");
  const arrowPrev = document.getElementById("arrow-prev");
  const arrowNext = document.getElementById("arrow-next");

  /**
   * Get current theme (dark or light)
   * Checks DOM theme class first (most reliable), then toggle state, then system preference
   */
  function getCurrentTheme() {
    const root = document.documentElement;

    // Check if DOM already has theme class applied by main.js
    if (root.classList.contains("dark-mode")) {
      return "dark";
    }
    if (root.classList.contains("light-mode")) {
      return "light";
    }

    // Fallback to toggle state
    const themeToggle = document.querySelector('[name="toggle-color-scheme"]');
    const isToggleChecked = themeToggle ? themeToggle.checked : false;

    // Final fallback to system preference
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const isDarkMode = themeToggle ? isToggleChecked : systemPrefersDark;

    return isDarkMode ? "dark" : "light";
  }

  /**
   * Generate image path based on current screen and fidelity
   */
  function getImagePath() {
    const theme = getCurrentTheme();
    return `../img/safeSpace/wireframes/${state.screen}-${state.fidelity}-${theme}.png`;
  }

  /**
   * Update the displayed image
   */
  function updateImage() {
    imageElement.src = getImagePath();
  }

  /**
   * Update active state on screen chips
   */
  function updateActiveScreenChips() {
    wireframesScreensContainer.querySelectorAll("button").forEach((button) => {
      if (button.dataset.screen === state.screen) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  /**
   * Update active state on fidelity chips
   */
  function updateActiveFidelityChips() {
    wireframesFidelityContainer.querySelectorAll("button").forEach((button) => {
      if (button.dataset.fidelity === state.fidelity) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  /**
   * Update all visual states
   */
  function updateUI() {
    updateImage();
    updateActiveScreenChips();
    updateActiveFidelityChips();
  }

  /**
   * Handle screen chip clicks
   */
  function handleScreenChipClick(event) {
    const button = event.target.closest("button[data-screen]");
    if (button) {
      state.screen = button.dataset.screen;
      updateUI();
    }
  }

  /**
   * Handle fidelity chip clicks
   */
  function handleFidelityChipClick(event) {
    const button = event.target.closest("button[data-fidelity]");
    if (button) {
      state.fidelity = button.dataset.fidelity;
      updateUI();
    }
  }

  /**
   * Navigate to previous fidelity level (lower fidelity)
   * Wraps around from lofi to hifi
   */
  function handlePrevArrow() {
    const currentIndex = state.fidelityOrder.indexOf(state.fidelity);
    const newIndex =
      currentIndex === 0 ? state.fidelityOrder.length - 1 : currentIndex - 1;
    state.fidelity = state.fidelityOrder[newIndex];
    updateUI();
  }

  /**
   * Navigate to next fidelity level (higher fidelity)
   * Wraps around from hifi to lofi
   */
  function handleNextArrow() {
    const currentIndex = state.fidelityOrder.indexOf(state.fidelity);
    const newIndex = (currentIndex + 1) % state.fidelityOrder.length;
    state.fidelity = state.fidelityOrder[newIndex];
    updateUI();
  }

  // Event listeners
  wireframesScreensContainer.addEventListener("click", handleScreenChipClick);
  wireframesFidelityContainer.addEventListener(
    "click",
    handleFidelityChipClick,
  );
  arrowPrev.addEventListener("click", handlePrevArrow);
  arrowNext.addEventListener("click", handleNextArrow);

  // Listen for color scheme changes from system preferences
  const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  themeMediaQuery.addEventListener("change", updateImage);

  // Listen for theme toggle button clicks
  const themeToggleDesktop = document.getElementById("theme-toggle");
  const themeToggleMobile = document.getElementById("theme-toggle-mobile");

  if (themeToggleDesktop) {
    themeToggleDesktop.addEventListener("change", updateImage);
  }
  if (themeToggleMobile) {
    themeToggleMobile.addEventListener("change", updateImage);
  }

  // Defer initialization to ensure theme classes are applied by main.js
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateUI);
  } else {
    // DOM is already loaded, use requestAnimationFrame to ensure theme is set
    requestAnimationFrame(updateUI);
  }
})();

document.querySelectorAll("nav button").forEach((btn, index) => {
  btn.addEventListener("click", () => {
    gsap.to(window, {
      duration: 1,
      scrollTo: { y: "#section" + (index + 1), offsetY: 120 },
    });
  });
});
