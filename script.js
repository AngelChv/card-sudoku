// --- Modos de depuración ---
const DebugMode = Object.freeze({
  OFF: "off",
  SOLVED: "solved",
  ONE_MOVE: "one-move"
});

// --- Configuración ---
let currentDebugMode = DebugMode.ONE_MOVE;

// Detectar si estamos en producción (GitHub Pages)
if (window.location.hostname === "angelchv.github.io") {
  currentDebugMode = DebugMode.OFF;
}

const SOLVED_DECK = [
  "AD", "QS", "KH", "JC",
  "KC", "JH", "AS", "QD",
  "JS", "KD", "QC", "AH",
  "QH", "AC", "JD", "KS"
];

const suits = ["S", "H", "D", "C"];
const ranks = ["A", "J", "Q", "K"];

const grid = document.getElementById("grid");
const message = document.getElementById("message");
const checkButton = document.getElementById("check");

let interactionLock = false; // bloquea multitouch / multi-click
let selectedCard = null;
let draggedCard = null;
let startX = 0, startY = 0;
const DRAG_THRESHOLD = 8;
let gameCompleted = false;

// --- Crear baraja ---
function createDeck() {
  switch (currentDebugMode) {
    case DebugMode.SOLVED:
      return [...SOLVED_DECK];
    case DebugMode.ONE_MOVE:
      const deck = [...SOLVED_DECK];
      [deck[0], deck[1]] = [deck[1], deck[0]];
      return deck;
    default:
      return shuffle(fullDeck());
  }
}

function fullDeck() {
  const deck = [];
  for (const s of suits) {
    for (const r of ranks) {
      deck.push(`${r}${s}`);
    }
  }
  return deck;
}

// --- Renderizar cartas ---
function render() {
  grid.innerHTML = "";
  const deck = createDeck();

  deck.forEach((cid, index) => {
    const card = document.createElement("playing-card");
    card.setAttribute("cid", cid);
    card.style.setProperty("--i", index);
    card.addEventListener("click", () => onCardClick(card));
    card.addEventListener("contextmenu", e => e.preventDefault());
    enableDrag(card);
    grid.appendChild(card);
  });
}

// --- Click para seleccionar y swap ---
function onCardClick(card) {
  if (interactionLock || draggedCard) return;

  if (!selectedCard) {
    clearSelection();
    selectedCard = card;
    card.classList.add("selected");
    return;
  }

  if (selectedCard === card) {
    clearSelection();
    return;
  }

  swapClickAnimation(selectedCard, card);
  checkVictory();
  clearSelection();
}

function clearSelection() {
  if (selectedCard) {
    selectedCard.classList.remove("selected");
    selectedCard = null;
  }
}

// --- Animación click → ambas cartas se mueven ---
function swapClickAnimation(el1, el2) {
  const tempCid = el1.getAttribute("cid");
  el1.setAttribute("cid", el2.getAttribute("cid"));
  el2.setAttribute("cid", tempCid);

  const r1 = el1.getBoundingClientRect();
  const r2 = el2.getBoundingClientRect();

  const dx = r2.left - r1.left;
  const dy = r2.top - r1.top;

  // Animamos ambas cartas hacia la posición de la otra
  el1.animate(
    [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
    { duration: 220, easing: "ease-out" }
  );

  el2.animate(
    [{ transform: `translate(${-dx}px, ${-dy}px)` }, { transform: "none" }],
    { duration: 220, easing: "ease-out" }
  );
}

// --- Animación drag → solo carta de destino se mueve ---
function swapDragAnimation(dragged, target) {
  const rDragged = dragged.getBoundingClientRect();
  const rTarget = target.getBoundingClientRect();

  const dx = rTarget.left - rDragged.left;
  const dy = rTarget.top - rDragged.top;

  target.animate([{ transform: `translate(${-dx}px, ${-dy}px)` }, { transform: "none" }], { duration: 220, easing: "ease-out" });

  const temp = dragged.getAttribute("cid");
  dragged.setAttribute("cid", target.getAttribute("cid"));
  target.setAttribute("cid", temp);
}

// --- Drag & Drop ---
function enableDrag(card) {
  card.addEventListener("pointerdown", onPointerDown);
  card.addEventListener("touchstart", onTouchStart, { passive: false });
}

// Pointer events
function onPointerDown(e) {
  e.preventDefault();
  startDrag(e.clientX, e.clientY, e.currentTarget);
  e.currentTarget.setPointerCapture(e.pointerId);
  e.currentTarget.addEventListener("pointermove", onPointerMove);
  e.currentTarget.addEventListener("pointerup", onPointerUp);
}

function onPointerMove(e) {
  moveDrag(e.clientX, e.clientY);
}

function onPointerUp(e) {
  e.currentTarget.releasePointerCapture(e.pointerId);
  endDrag(e.clientX, e.clientY);
  e.currentTarget.removeEventListener("pointermove", onPointerMove);
  e.currentTarget.removeEventListener("pointerup", onPointerUp);
}

// Touch events
function onTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  startDrag(touch.clientX, touch.clientY, e.currentTarget);
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  document.addEventListener("touchend", onTouchEnd);
}

function onTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  moveDrag(touch.clientX, touch.clientY);
}

function onTouchEnd(e) {
  const touch = e.changedTouches[0];
  endDrag(touch.clientX, touch.clientY);
  document.removeEventListener("touchmove", onTouchMove);
  document.removeEventListener("touchend", onTouchEnd);
}

// --- Drag helpers ---
function startDrag(x, y, card) {
  if (interactionLock) return;

  interactionLock = true;

  draggedCard = card;
  startX = x;
  startY = y;
  draggedCard.classList.add("dragging");
}

function moveDrag(x, y) {
  if (!draggedCard) return;

  clearSelection();

  const dx = x - startX;
  const dy = y - startY;
  draggedCard.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
}

function endDrag(x, y) {
  if (!draggedCard) return;

  const dx = x - startX;
  const dy = y - startY;
  const distance = Math.hypot(dx, dy);

  draggedCard.classList.remove("dragging");
  draggedCard.style.transform = "";

  // TAP (equivalente a click)
  if (distance < DRAG_THRESHOLD) {
    const card = draggedCard;
    draggedCard = null;
    interactionLock = false;
    onCardClick(card);
    return;
  }

  // DRAG real
  draggedCard.style.pointerEvents = 'none';
  const dropTarget = document.elementFromPoint(x, y)?.closest("playing-card");
  draggedCard.style.pointerEvents = '';

  if (dropTarget && dropTarget !== draggedCard) {
    swapDragAnimation(draggedCard, dropTarget);
    checkVictory();
  }

  draggedCard = null;
  interactionLock = false;
}

// --- Validación puzzle ---
function isSolved() {
  const cards = Array.from(grid.children).map(c => c.getAttribute("cid"));
  const getSuit = c => c[1];
  const getRank = c => c[0];

  const rows = [...Array(4)].map((_, r) => cards.slice(r*4, r*4+4));
  const cols = [...Array(4)].map((_, c) => cards.filter((_, i) => i % 4 === c));
  const diag1 = [0,5,10,15].map(i => cards[i]);
  const diag2 = [3,6,9,12].map(i => cards[i]);
  const groups = [...rows, ...cols, diag1, diag2];

  for (const g of groups) {
    const s = new Set(), r = new Set();
    for (const c of g) {
      if (s.has(getSuit(c)) || r.has(getRank(c))) return false;
      s.add(getSuit(c));
      r.add(getRank(c));
    }
  }

  return true;
}

function validate() {
  message.textContent = isSolved() ? showVictory() : "❌ Incorrecto";
}

function checkVictory() {
  if (gameCompleted) return;

  if (isSolved()) {
    gameCompleted = true;
    showVictory();

    checkButton.textContent = "🔄 Reiniciar";
    checkButton.onclick = resetGame;
  }
}

function showVictory() {
  message.textContent = "🎉 ¡Sudoku completado!";
  message.style.opacity = "1";

  grid.classList.add("victory");

  // desactivar interacción
  grid.querySelectorAll("playing-card").forEach(card => {
    card.style.pointerEvents = "none";
  });
}

// --- Shuffle Fisher-Yates ---
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function resetGame() {
  // Resetear estado
  gameCompleted = false;
  selectedCard = null;
  draggedCard = null;
  interactionLock = false;
  
  // Limpiar mensaje
  message.textContent = "";
  message.style.opacity = "1";

  // Limpiar grid
  grid.innerHTML = "";
  grid.classList.remove("victory");

  // Renderizar nuevas cartas
  render();

  // Restaurar botón
  checkButton.textContent = "Validar";
  checkButton.onclick = validate;
}

// --- Botón validar ---
checkButton.onclick = validate;

// --- Inicializar ---
render();
