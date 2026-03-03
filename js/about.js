gsap.registerPlugin(MotionPathPlugin);

const cardDeck = document.getElementById("cardDeck");
const cards = document.querySelectorAll(".card--spread");
const totalCards = cards.length;

let isSpread = false;
const DECK_POSITION = 0;

function getSpreadPosition(i) {
  return i / (totalCards - 1);
}

cards.forEach((card) => {
  gsap.set(card, {
    motionPath: {
      path: ".curve-path",
      align: ".curve-path",
      alignOrigin: [0.5, 0.5],
      autoRotate: false,
      start: DECK_POSITION,
      end: DECK_POSITION,
    },
    rotation: 0,
  });
});

function spreadCards() {
  for (let i = cards.length - 1; i >= 0; i--) {
    const card = cards[i];
    const staggerIndex = cards.length - 1 - i;
    const endPos = getSpreadPosition(i);

    gsap
      .timeline({ delay: staggerIndex * 0.08 })
      .to(cardDeck, {
        rotation: -14,
        duration: 0.4,
        ease: "power2.inOut",
      })
      .to(card, {
        motionPath: {
          path: ".curve-path",
          align: ".curve-path",
          alignOrigin: [0.5, 0.5],
          autoRotate: true,
          start: DECK_POSITION,
          end: endPos,
        },
        duration: 1.2,
        ease: "power2.inOut",
      });
  }
  isSpread = true;
}

function resetCards() {
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const staggerIndex = cards.length - 1 - i;
    const startPos = getSpreadPosition(i);

    gsap
      .timeline({ delay: staggerIndex * 0.08 })
      .to(card, {
        motionPath: {
          path: ".curve-path",
          align: ".curve-path",
          alignOrigin: [0.5, 0.5],
          autoRotate: 180,
          start: startPos,
          end: DECK_POSITION,
        },
        duration: 1.2,
        ease: "power2.inOut",
      })
      .to(cardDeck, {
        rotation: 0,
        duration: 0.4,
        ease: "power2.inOut",
      });
  }
  isSpread = false;
}

cardDeck.addEventListener("click", () => {
  if (isSpread) {
    resetCards();
  } else {
    spreadCards();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isSpread) resetCards();
});
