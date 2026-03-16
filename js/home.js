gsap.registerPlugin(SplitText, ScrollTrigger, ScrollSmoother);

console.clear();

// Initialize smooth scroll
let smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 1,
  effects: true,
});

document.fonts.ready.then(() => {
  gsap.set(".split", { opacity: 1 });

  let split;
  SplitText.create(".split", {
    type: "words,lines",
    linesClass: "line",
    autoSplit: true,
    mask: "lines",
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

gsap.utils.toArray(".fade").forEach((container) => {
  gsap.from(container.children, {
    scrollTrigger: {
      trigger: container,
      start: "top 80%",
      toggleActions: "play none none reset",
    },
    opacity: 0,
    y: 50,
    duration: 1,
    stagger: 0.1,
    ease: "expo.out",
  });
});

gsap.utils.toArray(".fade-element").forEach((elem) => {
  gsap.from(elem, {
    scrollTrigger: {
      trigger: elem,
      start: "top 80%",
      toggleActions: "play none none reset",
    },
    opacity: 0,
    y: 50,
    duration: 1,
    ease: "expo.out",
  });
});
