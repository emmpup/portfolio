gsap.registerPlugin(MotionPathPlugin);

const cardDeck = document.getElementById("cardDeck");
const cards = document.querySelectorAll(".card--spread");
const totalCards = cards.length;

let isSpread = false;

// cards.forEach((card) => {
//   gsap.set(card, {
//     motionPath: {
//       path: ".curve-path",
//       align: ".curve-path",
//       alignOrigin: [0.5, 0.5],
//       start: 0,
//       end: 0,
//     },
//     rotation: 0, // ← override the autoRotate rotation
//   });
// });

function getPathAngle(pos) {
  const pathEl = document.querySelector(".curve-path");
  const pathLength = pathEl.getTotalLength();
  const p1 = pathEl.getPointAtLength(pos * pathLength);
  const p2 = pathEl.getPointAtLength((pos + 0.001) * pathLength);
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
}

// Calculate start position for each card on the path (0 to 1)
function getStartValues(i) {
  if (i === totalCards - 1) {
    // Last card (rightmost)
    return 0.99;
  } else if (i === 0) {
    // First card (leftmost)
    return 0;
  } else {
    // Middle cards distributed evenly
    return i * (1 / (totalCards - 1));
  }
}

// Spread animation
function spreadCards() {
  // Animate from rightmost (index 6) to leftmost (index 0)
  for (let i = cards.length - 1; i >= 0; i--) {
    const card = cards[i];
    const staggerIndex = cards.length - 1 - i;
    const startPos = getStartValues(i);
    const targetAngle = getPathAngle(startPos);

    gsap.to(card, {
      motionPath: {
        path: ".curve-path",
        align: ".curve-path",
        alignOrigin: [0.5, 0.5],
        autoRotate: false,
        start: 0,
        end: startPos,
      },
      duration: 1.5,
      ease: "power2.inOut",
      delay: staggerIndex * 0.08,
    });
    gsap.to(card, {
      rotation: targetAngle,
      duration: 1.5,
      ease: "power2.inOut",
      delay: staggerIndex * 0.08 + 0.3, // ← starts slightly after movement
    });
  }

  isSpread = true;
}

// Reset animation
function resetCards() {
  // Reset from rightmost (index 6) to leftmost (index 0)
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const staggerIndex = cards.length - 1 - i;
    const startPos = getStartValues(i);

    gsap.to(card, {
      rotation: 0,
      duration: 0.8,
      ease: "power2.inOut",
      delay: staggerIndex * 0.08,
    });

    gsap.to(card, {
      motionPath: {
        path: ".curve-path",
        align: ".curve-path",
        alignOrigin: [0.5, 0.5],
        autoRotate: false,
        start: startPos,
        end: 0,
      },
      // rotation: 0,
      duration: 1.5,
      ease: "power2.inOut",
      delay: staggerIndex * 0.08,
      // onComplete: () => {
      //   gsap.set(card, { rotation: 0, clearProps: "rotation" }); // ← clean up rotation at end
      // },
    });
  }

  isSpread = false;
}

// Click handler
cardDeck.addEventListener("click", () => {
  if (isSpread) {
    resetCards();
  } else {
    spreadCards();
  }
});

// Optional: Close on escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isSpread) {
    resetCards();
  }
});
