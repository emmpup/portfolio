// Posters Project Carousel Navigation

(function () {
  // State management
  const state = {
    currentIndex: 0,
    totalImages: 3,
  };

  // DOM elements
  const carouselContainer = document.querySelector(".project-detail__carousel");
  const carouselImages = document.querySelectorAll(
    ".project-detail__carousel__image",
  );
  const buttonPrev = document.getElementById("carousel-prev");
  const buttonNext = document.getElementById("carousel-next");
  const dotsContainer = document.getElementById("carousel-dots");
  const dots = document.querySelectorAll(".project-detail__carousel__dot");

  /**
   * Update carousel position based on current index
   * Scrolls to the active image (only when user interacts, not on init)
   */
  function updateCarouselPosition(shouldScroll = true) {
    const activeImage = carouselImages[state.currentIndex];
    if (shouldScroll) {
      activeImage.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }

  /**
   * Update active state on dots
   */
  function updateActiveDots() {
    dots.forEach((dot) => {
      if (parseInt(dot.dataset.index) === state.currentIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  /**
   * Update all visual states
   */
  function updateUI(shouldScroll = true) {
    updateCarouselPosition(shouldScroll);
    updateActiveDots();
  }

  /**
   * Handle previous button click
   * Goes to previous image with infinite looping
   */
  function handlePrevClick() {
    state.currentIndex =
      state.currentIndex === 0 ? state.totalImages - 1 : state.currentIndex - 1;
    updateUI();
  }

  /**
   * Handle next button click
   * Goes to next image with infinite looping
   */
  function handleNextClick() {
    state.currentIndex = (state.currentIndex + 1) % state.totalImages;
    updateUI();
  }

  /**
   * Handle dot click
   * Navigates directly to clicked image
   */
  function handleDotClick(event) {
    const dot = event.target.closest("[data-index]");
    if (dot) {
      state.currentIndex = parseInt(dot.dataset.index);
      updateUI();
    }
  }

  // Event listeners
  if (buttonPrev) {
    buttonPrev.addEventListener("click", handlePrevClick);
  }
  if (buttonNext) {
    buttonNext.addEventListener("click", handleNextClick);
  }
  if (dotsContainer) {
    dotsContainer.addEventListener("click", handleDotClick);
  }

  // Initialize UI (don't scroll on page load)
  updateUI(false);
})();
