gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

const cardDeck = document.getElementById("cardDeck");
const path = document.querySelector(".curve-path");
const cards = gsap.utils.toArray(".card--spread");
const totalCards = cards.length;

let isSpread = false;

function getStartValues(i, totalCards) {
  if (i + 1 === 1) {
    return 0.99;
  } else if (i + 1 === 7) {
    return 0;
  } else {
    return (totalCards - (i + 1)) * (1 / (totalCards - 1));
  }
}

function spreadCards() {
  // Animate from rightmost (index 6) to leftmost (index 0)
  for (let i = cards.length - 1; i >= 0; i--) {
    const card = cards[i];
    const staggerIndex = cards.length - 1 - i;
    const startPos = getStartValues(i);

    gsap.to(card, {
      motionPath: {
        path: ".curve-path",
        align: ".curve-path",
        alignOrigin: [0.5, 0.5],
        autoRotate: true,
        start: startPos,
        end: startPos,
      },
      duration: 1.5,
      ease: "power2.inOut",
      delay: staggerIndex * 0.08,
    });
  }

  isSpread = true;
}

cardDeck.addEventListener("click", () => {
  if (isSpread) {
    resetCards();
  } else {
    spreadCards();
  }
});

// for (let i = cards.length - 1; i >= 0; i--) {
//   const card = cards[i];
//   const staggerIndex = cards.length - 1 - i;
//   const startPos = getStartValues(i);

//   gsap.to(card, {
//     motionPath: {
//       path: ".curve-path",
//       align: ".curve-path",
//       alignOrigin: [0.5, 0.5],
//       autoRotate: true,
//       start: startPos,
//       end: startPos,
//     },
//     duration: 1.5,
//     ease: "power2.inOut",
//     delay: staggerIndex * 0.08,
//   });
// }

// isSpread = true;
