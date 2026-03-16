gsap.registerPlugin(MotionPathPlugin);

const cardDeck = document.getElementById("cardDeck");
const cards = document.querySelectorAll(".card--spread");
const totalCards = cards.length;

let isSpread = false;
const DECK_POSITION = 0;

const HOVER_LIFT_DISTANCE = 20;
const NEIGHBOUR_FAN_OFFSET = 12;
const HOVER_DURATION = 0.25;

function getSpreadPosition(i) {
  return i / (totalCards - 1);
}

// Returns the current visual rotation of an element (degrees) from its matrix
function getComputedRotation(el) {
  const matrix = new DOMMatrix(getComputedStyle(el).transform);
  return Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
}

// Baseline x/y for each card after spreading — hover offsets are always
// applied on top of these absolute values, never accumulated with +=
const cardBaselines = new Map(); // card element → { x, y, rotation }

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

// Snapshot each card's x/y/rotation after the spread animation settles
function snapshotBaselines() {
  cards.forEach((card) => {
    cardBaselines.set(card, {
      x: gsap.getProperty(card, "x"),
      y: gsap.getProperty(card, "y"),
      rotation: getComputedRotation(card),
    });
  });
}

// ─── Hover handlers ──────────────────────────────────────────────────────────

function onCardEnter(e) {
  const hovered = e.currentTarget;
  const hoveredIndex = [...cards].indexOf(hovered);

  cards.forEach((card, i) => {
    const base = cardBaselines.get(card);
    if (!base) return;

    const offset = i - hoveredIndex; // -n … 0 … +n

    if (offset === 0) {
      // Lift the hovered card perpendicular to its face ("up" relative to card)
      const rad = (base.rotation - 90) * (Math.PI / 180);
      const dx = Math.cos(rad) * HOVER_LIFT_DISTANCE;
      const dy = Math.sin(rad) * HOVER_LIFT_DISTANCE;

      gsap.to(card, {
        x: base.x + dx,
        y: base.y + dy,
        duration: HOVER_DURATION,
        ease: "power2.out",
      });
    } else if (Math.abs(offset) <= 2) {
      const amount =
        Math.abs(offset) === 1
          ? NEIGHBOUR_FAN_OFFSET
          : NEIGHBOUR_FAN_OFFSET * 0.4;
      fanCard(card, base, i, hoveredIndex, amount);
    }
    // Cards further than ±2 stay put (they're already at their baseline)
  });
}

function fanCard(card, base, cardIndex, hoveredIndex, amount) {
  // Fan along the curve tangent, away from the hovered card
  const direction = cardIndex < hoveredIndex ? -1 : 1;
  const curveRad = (base.rotation - 90 + 90) * (Math.PI / 180); // tangent direction
  const dx = Math.cos(curveRad) * amount * direction;
  const dy = Math.sin(curveRad) * amount * direction;

  gsap.to(card, {
    x: base.x + dx,
    y: base.y + dy,
    duration: HOVER_DURATION,
    ease: "power2.out",
  });
}

function onCardLeave() {
  // Return every card to its exact baseline — no drift possible
  cards.forEach((card) => {
    const base = cardBaselines.get(card);
    if (!base) return;
    gsap.to(card, {
      x: base.x,
      y: base.y,
      duration: HOVER_DURATION,
      ease: "power2.inOut",
    });
  });
}

function addHoverListeners() {
  cards.forEach((card) => {
    card.addEventListener("mouseenter", onCardEnter);
    card.addEventListener("mouseleave", onCardLeave);
  });
}

function removeHoverListeners() {
  cards.forEach((card) => {
    card.removeEventListener("mouseenter", onCardEnter);
    card.removeEventListener("mouseleave", onCardLeave);
  });
}

// ─── Spread / reset ──────────────────────────────────────────────────────────

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

  // Enable hover only after all cards have finished spreading
  const longestDelay = (cards.length - 1) * 0.08 + 1.2 + 0.4;
  gsap.delayedCall(longestDelay, () => {
    snapshotBaselines();
    addHoverListeners();
  });
}

function resetCards() {
  // 1. Immediately stop hover listeners and kill any in-flight hover tweens
  removeHoverListeners();
  cards.forEach((card) => gsap.killTweensOf(card, "x,y"));

  // 2. Smoothly return each card's hover offset back to its baseline x/y,
  //    then kick off the motionPath return from that clean position.
  cards.forEach((card, i) => {
    const base = cardBaselines.get(card);
    const staggerIndex = cards.length - 1 - i;
    const startPos = getSpreadPosition(i);

    // If hover was never used, x/y are already 0
    const bx = base ? base.x : 0;
    const by = base ? base.y : 0;

    gsap
      .timeline({ delay: staggerIndex * 0.08 })
      // First: ease back to the card's clean spread position (no hover offset)
      .to(card, {
        x: bx,
        y: by,
        duration: HOVER_DURATION,
        ease: "power2.inOut",
      })
      // Then: travel back along the curve to the deck
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
  });

  cardBaselines.clear();
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
