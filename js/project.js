gsap.to(".projects__header", {
  backgroundPositionY: "130%", // or use a pixel value like "200px"
  ease: "none",
  scrollTrigger: {
    trigger: ".projects__header",
    start: "top top",
    end: "bottom top",
    scrub: 0.5, // Adding a slight delay (0.5-2) can make it feel smoother
  },
});
