gsap.registerPlugin(MotionPathPlugin);

const cardDeck = document.getElementById("cardDeck");
const cards = document.querySelectorAll(".card__item");
const totalCards = cards.length;

let isSpread = false;
const DECK_POSITION = 0;

const HOVER_LIFT_DISTANCE = 20;
const NEIGHBOUR_FAN_OFFSET = 16;
const HOVER_DURATION = 0.3;
const FLIP_LIFT_DISTANCE = 80;
const FLIP_DURATION = 0.5;

const TILT_MAX_ROTATION = 15;
const TILT_DURATION = 0.6;

const MODAL_ROTATION_OFFSET = 15;

const cardBaselines = new Map();
let flippedCard = null;
let isAnimatingFlip = false;

let activeTiltMove = null;
let activeTiltLeave = null;

// Track currently touched card for mobile drag
let currentlyTouchedCard = null;

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

function getViewportCenterOffset(card) {
  const base = cardBaselines.get(card);

  const container = card.parentElement;
  const containerRect = container.getBoundingClientRect();

  const cardScreenX = containerRect.left + base.x;
  const cardScreenY = containerRect.top + base.y;

  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;

  const cardRect = card.getBoundingClientRect();
  const cardWidth = cardRect.width;
  const cardHeight = cardRect.height;

  const dx = viewportCenterX - (cardScreenX + cardWidth / 2);
  // Use different centering for mobile vs desktop
  const isMobile = window.innerWidth < 768;
  const dy = isMobile 
    ? viewportCenterY - (cardScreenY + cardHeight / 2)
    : viewportCenterY - cardScreenY;

  return { dx, dy };
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

function addTiltListeners(card) {
  const inner = card.querySelector(".card");

  const tiltX = gsap.quickTo(inner, "rotationX", {
    duration: TILT_DURATION,
    ease: "power3",
  });
  const tiltY = gsap.quickTo(inner, "rotationY", {
    duration: TILT_DURATION,
    ease: "power3",
  });

  activeTiltMove = (e) => {
    // Prevent scrolling on touch events
    if (e.touches) {
      e.preventDefault();
    }
    
    const rect = card.getBoundingClientRect();
    // Get clientX/clientY, handling both mouse and touch events
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches?.[0]?.clientX ?? 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches?.[0]?.clientY ?? 0);
    const px = ((clientX - rect.left) / rect.width) * 2 - 1;
    const py = ((clientY - rect.top) / rect.height) * 2 - 1;
    tiltX(-py * TILT_MAX_ROTATION);
    tiltY(180 + px * TILT_MAX_ROTATION);
  };

  activeTiltLeave = () => {
    tiltX(0);
    tiltY(180);
  };

  card.addEventListener("pointermove", activeTiltMove);
  card.addEventListener("pointerleave", activeTiltLeave);
  // Touch events for mobile (passive: false allows preventDefault)
  card.addEventListener("touchmove", activeTiltMove, { passive: false });
  card.addEventListener("touchend", activeTiltLeave);
}

function removeTiltListeners(card) {
  if (activeTiltMove) {
    card.removeEventListener("pointermove", activeTiltMove);
    card.removeEventListener("touchmove", activeTiltMove);
  }
  if (activeTiltLeave) {
    card.removeEventListener("pointerleave", activeTiltLeave);
    card.removeEventListener("touchend", activeTiltLeave);
  }
  activeTiltMove = null;
  activeTiltLeave = null;

  const inner = card.querySelector(".card");
  if (inner)
    gsap.to(inner, {
      rotationX: 0,
    });
}

function modalClickHandler(e) {
  if (flippedCard && !flippedCard.contains(e.target)) {
    closeFlippedCard();
  }
}

function openCard(card) {
  if (isAnimatingFlip) return;
  isAnimatingFlip = true;

  removeHoverListeners();
  gsap.set(card, { zIndex: 10 });

  const base = cardBaselines.get(card);
  const { dx, dy } = getViewportCenterOffset(card);

  gsap
    .timeline({
      onComplete: () => {
        isAnimatingFlip = false;
        flippedCard = card;
        const closeBtn = card.querySelector(".card-close-btn");
        if (closeBtn) closeBtn.classList.add("card-close-btn--visible");
        addTiltListeners(card);
        document.addEventListener("click", modalClickHandler);
      },
    })
    .to(
      card,
      {
        x: base.x + dx,
        y: base.y + dy,
        rotation: MODAL_ROTATION_OFFSET,
        duration: FLIP_DURATION,
        ease: "power2.out",
      },
      0,
    )
    .to(
      card.querySelector(".card"),
      {
        rotateY: 180,
        duration: FLIP_DURATION,
        ease: "power2.inOut",
      },
      0,
    );
}

function closeFlippedCard(onComplete) {
  if (!flippedCard || isAnimatingFlip) return;
  isAnimatingFlip = true;

  const card = flippedCard;
  const base = cardBaselines.get(card);

  const closeBtn = card.querySelector(".card-close-btn");
  if (closeBtn) closeBtn.classList.remove("card-close-btn--visible");

  removeTiltListeners(card);
  document.removeEventListener("click", modalClickHandler);

  gsap
    .timeline({
      onComplete: () => {
        gsap.set(card, { zIndex: "auto" });
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
        rotation: base.rotation,
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
    closeFlippedCard();
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

// ============================================================================
// TOUCH/DRAG HANDLERS FOR MOBILE
// ============================================================================

/**
 * Handle touch start - trigger hover on touched card
 */
function onCardTouchStart(e) {
  if (flippedCard || !isSpread) return;
  
  currentlyTouchedCard = e.currentTarget;
  // Simulate enter with synthetic event
  onCardEnter({ currentTarget: currentlyTouchedCard });
}

/**
 * Handle touch move - update hovered card as user drags
 */
function onCardTouchMove(e) {
  if (flippedCard || !isSpread) return;
  
  const touch = e.touches[0];
  const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  const cardElement = elementBelow?.closest(".card__item");
  
  // If we moved to a different card, trigger leave on old and enter on new
  if (cardElement && cardElement !== currentlyTouchedCard) {
    if (currentlyTouchedCard) {
      onCardLeave();
    }
    currentlyTouchedCard = cardElement;
    onCardEnter({ currentTarget: cardElement });
  }
}

/**
 * Handle touch end - open the touched card on mobile
 */
function onCardTouchEnd(e) {
  if (flippedCard || !currentlyTouchedCard) return;
  
  // Open the card that was being touched
  openCard(currentlyTouchedCard);
  currentlyTouchedCard = null;
}

function addHoverListeners() {
  cards.forEach((card) => {
    // Mouse events for desktop
    card.addEventListener("mouseenter", onCardEnter);
    card.addEventListener("mouseleave", onCardLeave);
    
    // Touch events for mobile
    card.addEventListener("touchstart", onCardTouchStart);
    card.addEventListener("touchmove", onCardTouchMove, { passive: true });
    card.addEventListener("touchend", onCardTouchEnd);
  });
}

function removeHoverListeners() {
  cards.forEach((card) => {
    // Mouse events
    card.removeEventListener("mouseenter", onCardEnter);
    card.removeEventListener("mouseleave", onCardLeave);
    
    // Touch events
    card.removeEventListener("touchstart", onCardTouchStart);
    card.removeEventListener("touchmove", onCardTouchMove);
    card.removeEventListener("touchend", onCardTouchEnd);
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
    removeTiltListeners(flippedCard);
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
  if (flippedCard) return;
  if (!isSpread) spreadCards();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (flippedCard) closeFlippedCard();
    else if (isSpread) resetCards();
  }
});
