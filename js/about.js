gsap.registerPlugin(MotionPathPlugin);

const cardDeck = document.getElementById("cardDeck");
const cards = document.querySelectorAll(".card--spread");
const totalCards = cards.length;

let isSpread = false;
const DECK_POSITION = 0;

const HOVER_LIFT_DISTANCE = 20;
const NEIGHBOUR_FAN_OFFSET = 16;
const HOVER_DURATION = 0.25;
const FLIP_LIFT_DISTANCE = 80;
const FLIP_DURATION = 0.5;

const cardBaselines = new Map();
let flippedCard = null;
let isAnimatingFlip = false;

const deckCloseBtn = document.createElement("button");
deckCloseBtn.className = "deck-close-btn";
deckCloseBtn.setAttribute("aria-label", "Collapse cards");
deckCloseBtn.innerHTML = "✕";
document.querySelector(".card-spread-container").appendChild(deckCloseBtn);

deckCloseBtn.addEventListener("click", () => {
  if (!isSpread) return;
  if (flippedCard) {
    closeFlippedCard(() => resetCards());
  } else {
    resetCards();
  }
});

function showDeckCloseBtn() {
  deckCloseBtn.classList.add("deck-close-btn--visible");
}

function hideDeckCloseBtn() {
  deckCloseBtn.classList.remove("deck-close-btn--visible");
}

function getSpreadPosition(i) {
  return i / (totalCards - 1);
}

function getComputedRotation(el) {
  const matrix = new DOMMatrix(getComputedStyle(el).transform);
  return Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
}

function snapshotBaselines() {
  cards.forEach((card) => {
    cardBaselines.set(card, {
      x: gsap.getProperty(card, "x"),
      y: gsap.getProperty(card, "y"),
      rotation: getComputedRotation(card),
    });
  });
}

function openCard(card) {
  if (isAnimatingFlip) return;
  isAnimatingFlip = true;

  removeHoverListeners();

  const base = cardBaselines.get(card);
  const rad = (base.rotation - 90) * (Math.PI / 180);
  const dx = Math.cos(rad) * FLIP_LIFT_DISTANCE;
  const dy = Math.sin(rad) * FLIP_LIFT_DISTANCE;

  gsap
    .timeline({
      onComplete: () => {
        isAnimatingFlip = false;
        flippedCard = card;
        const closeBtn = card.querySelector(".card-close-btn");
        if (closeBtn) closeBtn.classList.add("card-close-btn--visible");
      },
    })
    .to(card, {
      x: base.x + dx,
      y: base.y + dy,
      duration: FLIP_DURATION,
      ease: "power2.out",
    })
    .to(
      card.querySelector(".card"),
      {
        rotateY: 180,
        duration: FLIP_DURATION,
        ease: "power2.inOut",
      },
      "<0.1",
    );
}

function closeFlippedCard(onComplete) {
  if (!flippedCard || isAnimatingFlip) return;
  isAnimatingFlip = true;

  const card = flippedCard;
  const base = cardBaselines.get(card);

  const closeBtn = card.querySelector(".card-close-btn");
  if (closeBtn) closeBtn.classList.remove("card-close-btn--visible");

  gsap
    .timeline({
      onComplete: () => {
        flippedCard = null;
        isAnimatingFlip = false;
        if (onComplete) onComplete();
        else addHoverListeners();
      },
    })
    .to(card.querySelector(".card"), {
      rotateY: 0,
      duration: FLIP_DURATION,
      ease: "power2.inOut",
    })
    .to(
      card,
      {
        x: base.x,
        y: base.y,
        duration: FLIP_DURATION,
        ease: "power2.in",
      },
      "<0.1",
    );
}

function onCardClick(e) {
  if (!isSpread || isAnimatingFlip) return;

  const clicked = e.currentTarget;

  if (clicked === flippedCard) {
    closeFlippedCard();
    return;
  }

  if (flippedCard) {
    closeFlippedCard(() => openCard(clicked));
    return;
  }

  openCard(clicked);
}

function addCardClickListeners() {
  cards.forEach((card) => card.addEventListener("click", onCardClick));
}

function removeCardClickListeners() {
  cards.forEach((card) => card.removeEventListener("click", onCardClick));
}

function onCardEnter(e) {
  if (flippedCard) return;

  const hovered = e.currentTarget;
  const hoveredIndex = [...cards].indexOf(hovered);

  cards.forEach((card, i) => {
    const base = cardBaselines.get(card);
    if (!base) return;

    const offset = i - hoveredIndex;

    if (offset === 0) {
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
  });
}

function fanCard(card, base, cardIndex, hoveredIndex, amount) {
  const direction = cardIndex < hoveredIndex ? -1 : 1;
  const curveRad = base.rotation * (Math.PI / 180);
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
  if (flippedCard) return;
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
      .to(cardDeck, { rotation: -14, duration: 0.4, ease: "power2.inOut" })
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

  const longestDelay = (cards.length - 1) * 0.08 + 1.2 + 0.4;
  gsap.delayedCall(longestDelay, () => {
    snapshotBaselines();
    addHoverListeners();
    addCardClickListeners();
    showDeckCloseBtn();
  });
}

function resetCards() {
  removeHoverListeners();
  removeCardClickListeners();
  hideDeckCloseBtn();

  if (flippedCard) {
    const innerCard = flippedCard.querySelector(".card");
    if (innerCard) gsap.set(innerCard, { rotateY: 0 });
    const closeBtn = flippedCard.querySelector(".card-close-btn");
    if (closeBtn) closeBtn.classList.remove("card-close-btn--visible");
    flippedCard = null;
  }

  cards.forEach((card) => gsap.killTweensOf(card, "x,y"));

  cards.forEach((card, i) => {
    const base = cardBaselines.get(card);
    const staggerIndex = cards.length - 1 - i;
    const startPos = getSpreadPosition(i);
    const bx = base ? base.x : 0;
    const by = base ? base.y : 0;

    gsap
      .timeline({ delay: staggerIndex * 0.08 })
      .to(card, {
        x: bx,
        y: by,
        duration: HOVER_DURATION,
        ease: "power2.inOut",
      })
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
      .to(cardDeck, { rotation: 0, duration: 0.4, ease: "power2.inOut" });
  });

  cardBaselines.clear();
  isSpread = false;
}

cardDeck.addEventListener("click", () => {
  if (!isSpread) spreadCards();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (flippedCard) closeFlippedCard();
    else if (isSpread) resetCards();
  }
});
