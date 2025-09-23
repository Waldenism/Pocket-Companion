console.log("index.js is loaded");

const BASE_URL = "http://localhost:3000";

  //FETCH WRAPPER
// Simple fetch wrapper with error handling
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API fetch error:", err);
    alert("Unable to communicate with server");
    throw err;
  }
}


/* ===========================
   Full asset directory object
   (based on the file list you provided)
   Update paths here if needed.
   =========================== */
const cardAssets = {
  "Promo-A": [
    "assets/cards/Promo-A/P-A_007_EN.png",
    "assets/cards/Promo-A/P-A_005_EN.png",
    "assets/cards/Promo-A/P-A_006_EN.webp",
    "assets/cards/Promo-A/P-A_001_EN.png"
  ],
  "A1": [
    "assets/cards/A1/A1_098_EN_SM.webp",
    "assets/cards/A1/A1_089_EN_SM.webp",
    "assets/cards/A1/A1_097_EN_SM.webp",
    "assets/cards/A1/A1_225_EN.png",
    "assets/cards/A1/A1_223_EN.png",
    "assets/cards/A1/A1_087_EN_SM.webp",
    "assets/cards/A1/A1_205_EN.png",
    "assets/cards/A1/A1_232_EN.webp",
    "assets/cards/A1/A1_056_EN.webp"
  ],
  "A1a": [
    "assets/cards/A1a/A1a_068_EN_SM.webp",
    "assets/cards/A1a/A1a_056_EN.webp"
  ],
  "A2": [
    "assets/cards/A2/A2_155_EN.png",
    "assets/cards/A2/A2_147_EN_SM.webp",
    "assets/cards/A2/A2_053_EN_SM.webp",
    "assets/cards/A2/A2_150_EN.png",
    "assets/cards/A2/A2_148_EN.webp",
    "assets/cards/A2/A2_146_EN_SM.webp",
    "assets/cards/A2/A2_050_EN.webp",
  ],
  "A2a": [
    "assets/cards/A2a/A2a_071_EN.webp",
    "assets/cards/A2a/A2a_073_EN.png",
    "assets/cards/A2a/A2a_072_EN_SM.webp"
  ],
  "A2b": [
    "assets/cards/A2b/A2b_111_EN.png",
    "assets/cards/A2b/A2b_035_EN_SM.webp",
    "assets/cards/A2b/A2b_070_EN_SM.webp",
    "assets/cards/A2b/A2b_071_EN.png",
    "assets/cards/A2b/A2b_088_EN.webp",
    "assets/cards/A2b/A2b_069_EN.webp"
  ],
  "A3": [
    "assets/cards/A3/A3_066_EN.png",
    "assets/cards/A3/A3_144_EN_SM.webp",
    "assets/cards/A3/A3_151_EN_SM.webp",
    "assets/cards/A3/A3_122_EN_SM.webp",
    "assets/cards/A3/A3_085_EN_SM.webp",
    "assets/cards/A3/A3_086_EN_SM.webp",
    "assets/cards/A3/A3_123_EN.png",
    "assets/cards/A3/A3_216_EN.webp",
    "assets/cards/A3/A3_215_EN.webp"
  ],
  "A3a": [
    "assets/cards/A3a/A3a_060_EN.png",
    "assets/cards/A3a/A3a_067_EN.png",
    "assets/cards/A3a/A3a_064_EN_SM.webp",
    "assets/cards/A3a/A3a_061_EN.png",
    "assets/cards/A3a/A3a_061_EN.png",
    "assets/cards/A3a/A3a_043_EN.png",
    "assets/cards/A3a/A3a_062_EN.png",
    "assets/cards/A3a/A3a_069_EN.png"
  ],
  "A3b": [
    "assets/cards/A3b/A3b_092_EN.png",
    "assets/cards/A3b/A3b_034_EN.png",
    "assets/cards/A3b/A3b_028_EN.png",
    "assets/cards/A3b/A3b_075_EN.png",
    "assets/cards/A3b/A3b_076_EN_SM.webp",
    "assets/cards/A3b/A3b_066_EN.webp",
    "assets/cards/A3b/A3b_078_EN.png",
    "assets/cards/A3b/A3b_033_EN.png"
  ],
  "A4": [
    "assets/cards/A4/A4_158_EN_SM.webp",
    "assets/cards/A4/A4_190_EN.png",
    "assets/cards/A4/A4_134_EN.png",
    "assets/cards/A4/A4_151_EN.webp",
    "assets/cards/A4/A4_032_EN.webp",
    "assets/cards/A4/A4_066_EN_SM.webp",
    "assets/cards/A4/A4_205_EN.png",
    "assets/cards/A4/A4_156_EN.png",
    "assets/cards/A4/A4_059_EN.webp"
  ],
  "A4a": [
    "assets/cards/A4a/A4a_070_EN.webp",
    "assets/cards/A4a/A4a_055_EN.webp",
    "assets/cards/A4a/A4a_020_EN_SM.webp",
    "assets/cards/A4a/A4a_064_EN.webp",
    "assets/cards/A4a/A4a_025_EN_SM.webp",
    "assets/cards/A4a/A4a_010_EN_SM.webp",
    "assets/cards/A4a/A4a_023_EN.webp"
  ]
};

/* ===========================
   Default decks (kept small here; stable2 kept demo decks)
   We are not auto-seeding your old decks; you'll rebuild or paste them.
   =========================== */
const defaultDecks = [
  { name: "Demo Deck 1", cards: Array(20).fill(null) },
  { name: "Demo Deck 2", cards: Array(20).fill(null) }
];

/* ===========================
   State and DOM refs
   =========================== */
let decks = [];
let selectedSlotIndex = null;
let editingIndex = null;

const deckSelect = document.getElementById("deckSelect");
const cardGrid = document.getElementById("cardGrid");
const builderGrid = document.getElementById("builderGrid");
const deckNameInput = document.getElementById("deckName");

const toBuilderBtn = document.getElementById("toBuilderBtn");
const toBattleBtn = document.getElementById("toBattleBtn");
const editDeckBtn = document.getElementById("editDeckBtn");
const deleteDeckBtn = document.getElementById("deleteDeckBtn");
const saveDeckBtn = document.getElementById("saveDeckBtn");
const resetBtn = document.getElementById("resetBtn");

const cardModal = document.getElementById("cardModal");
const modalThumbGrid = document.getElementById("modalThumbGrid");
const foldersBar = document.getElementById("foldersBar");
const closeModalBtn = document.getElementById("closeModalBtn");
const currentFolderName = document.getElementById("currentFolderName");

/* ===========================
   Utility: populate deck dropdown
   =========================== */
async function updateDeckDropdown() {
  try {
    const summaries = await apiFetch("/decks/summary"); // GET /decks/summary
    decks = summaries; // <--- keep local copy
    deckSelect.innerHTML = "";
    summaries.forEach((d, i) => {
      const opt = document.createElement("option");
      opt.value = d.id;  // or i if you want index, but using id is safer
      opt.textContent = d.name;
      deckSelect.appendChild(opt);
    });

    if (summaries.length > 0) {
      deckSelect.selectedIndex = 0;
      loadDeck(summaries[0].id);
    }
  } catch (err) {
    console.error("Failed to fetch deck summaries:", err);
    alert("Unable to communicate with server on page load");
  }
}



/* ===========================
   Battle page: load deck into grid
   =========================== */
async function loadDeck(deckId) {
  try {
    const deck = await apiFetch(`/decks/${deckId}`);
    if (!deck) return;

    cardGrid.innerHTML = "";

    deck.cards.forEach(src => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("card-wrapper");

      const card = document.createElement("div");
      card.classList.add("card");
      if (src) {
        const img = document.createElement("img");
        img.src = src;
        card.appendChild(img);
      } else {
        card.textContent = "+";
      }

      card.addEventListener("click", () => {
        card.classList.toggle("clicked");
        updateProbabilities();
      });

      wrapper.appendChild(card);

      const prob = document.createElement("div");
      prob.classList.add("probability");
      wrapper.appendChild(prob);

      cardGrid.appendChild(wrapper);
    });

    updateProbabilities();
  } catch (err) {
    console.error("Failed to load deck:", err);
    cardGrid.innerHTML = "<p>Error loading deck</p>";
  }
}


/* ===========================
   Probabilities logic
   =========================== */
function updateProbabilities(){
  const wrappers = Array.from(cardGrid.querySelectorAll(".card-wrapper"));
  const available = wrappers.filter(w => !w.querySelector(".card").classList.contains("clicked") && w.querySelector("img"));
  const counts = {};
  available.forEach(w => {
    const src = w.querySelector("img").src;
    counts[src] = (counts[src] || 0) + 1;
  });
  const total = available.length;

  wrappers.forEach(w => {
    const card = w.querySelector(".card");
    const probDiv = w.querySelector(".probability");
    if(card.classList.contains("clicked") || !w.querySelector("img")){
      probDiv.textContent = "";
    } else {
      const src = w.querySelector("img").src;
      probDiv.textContent = total > 0 ? ((counts[src] / total) * 100).toFixed(1) + "%" : "";
    }
  });
}

/* ===========================
   Reset button
   =========================== */
resetBtn.addEventListener("click", () => {
  cardGrid.querySelectorAll(".card").forEach(c => c.classList.remove("clicked"));
  updateProbabilities();
});

/* ===========================
   Deck Builder: init grid with always-included Promo-A
   =========================== */
function initBuilderGrid(){
  builderGrid.innerHTML = "";

  const alwaysIncluded = [
    "assets/cards/Promo-A/P-A_007_EN.png",
    "assets/cards/Promo-A/P-A_007_EN.png",
    "assets/cards/A2b/A2b_111_EN.png",
    "assets/cards/A2b/A2b_111_EN.png"
  ];

  for(let i=0;i<20;i++){
    const slot = document.createElement("div");
    slot.classList.add("card");
    slot.dataset.index = i;

    if(alwaysIncluded[i]){
      slot.dataset.card = alwaysIncluded[i];
      const img = document.createElement("img");
      img.src = alwaysIncluded[i];
      slot.appendChild(img);
      slot.setAttribute("draggable","true");
    } else {
      slot.textContent = "+";
      slot.setAttribute("draggable","false");
    }

    slot.addEventListener("click", () => openModalForSlot(i));

    // drag & drop handlers
    slot.addEventListener("dragstart", (e) => {
      if(!slot.dataset.card) return;
      e.dataTransfer.setData("text/plain", slot.dataset.index);
    });
    slot.addEventListener("dragover", (e) => { e.preventDefault(); slot.style.border = "2px dashed var(--accent)"; });
    slot.addEventListener("dragleave", () => { slot.style.border = ""; });
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.style.border = "";
      const sourceIndex = e.dataTransfer.getData("text/plain");
      const targetIndex = slot.dataset.index;
      if(sourceIndex === targetIndex) return;
      const sourceSlot = builderGrid.children[sourceIndex];
      swapSlots(sourceSlot, slot);
    });

    builderGrid.appendChild(slot);
  }
}

/* swap contents */
function swapSlots(slotA, slotB){
  const cardA = slotA.dataset.card || null;
  const cardB = slotB.dataset.card || null;
  slotA.dataset.card = cardB;
  slotB.dataset.card = cardA;
  updateSlotVisual(slotA);
  updateSlotVisual(slotB);
  slotA.setAttribute("draggable", cardB ? "true" : "false");
  slotB.setAttribute("draggable", cardA ? "true" : "false");
}

function updateSlotVisual(slot){
  slot.innerHTML = "";
  if(slot.dataset.card){
    const img = document.createElement("img");
    img.src = slot.dataset.card;
    slot.appendChild(img);
  } else {
    slot.textContent = "+";
  }
}

/* ===========================
   Modal: show folders and thumbnails
   =========================== */
let currentFolderKey = null;

function openModalForSlot(idx){
  selectedSlotIndex = idx;
  cardModal.classList.remove("hidden");
  cardModal.setAttribute("aria-hidden","false");
  renderFolderBar();
  // open first folder by default
  const first = Object.keys(cardAssets)[0];
  if(first) showFolder(first);
}

function renderFolderBar(){
  foldersBar.innerHTML = "";
  Object.keys(cardAssets).forEach(folder => {
    const btn = document.createElement("div");
    btn.classList.add("folder");
    btn.textContent = folder;
    btn.addEventListener("click", () => showFolder(folder));
    foldersBar.appendChild(btn);
  });
}

function showFolder(folderKey){
  currentFolderKey = folderKey;
  currentFolderName.textContent = folderKey;
  // highlight active
  Array.from(foldersBar.children).forEach(c => c.classList.toggle("active", c.textContent === folderKey));
  // render thumbnails
  modalThumbGrid.innerHTML = "";
  const imgs = cardAssets[folderKey] || [];
  imgs.forEach(src => {
    const thumb = document.createElement("div");
    thumb.classList.add("thumb");
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    thumb.appendChild(img);
    thumb.addEventListener("click", () => {
      const slot = builderGrid.children[selectedSlotIndex];
      if(!slot) return;
      slot.dataset.card = src;
      updateSlotVisual(slot);
      slot.setAttribute("draggable","true");
      cardModal.classList.add("hidden");
      cardModal.setAttribute("aria-hidden","true");
    });
    modalThumbGrid.appendChild(thumb);
  });
}

closeModalBtn.addEventListener("click", () => {
  cardModal.classList.add("hidden");
  cardModal.setAttribute("aria-hidden","true");
  selectedSlotIndex = null;
});

/* ===========================
   Save / Delete / Edit / Navigation
   =========================== */
saveDeckBtn.addEventListener("click", async () => {
  const name = deckNameInput.value.trim();
  if (!name) {
    alert("Enter deck name");
    return;
  }

  const cards = Array.from(builderGrid.children).map(s => s.dataset.card || null);
  const deckData = { name, cards };

  try {
    if (editingIndex !== null) {
      // Update existing deck
      const deckId = decks[editingIndex].id;
      await apiFetch(`/decks/${deckId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deckData)
      });
      alert("Deck updated!");
      editingIndex = null;
    } else {
      // Create new deck
      await apiFetch("/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deckData)
      });
      alert("Deck saved!");
    }

    // Refresh deck dropdown after save
    await updateDeckDropdown();
  } catch (err) {
    console.error("Failed to save deck:", err);
  }
});


deleteDeckBtn.addEventListener("click", async () => {
  const idx = deckSelect.selectedIndex;
  if(idx < 0) return;
  if(!confirm(`Delete deck "${decks[idx].name}"?`)) return;
  try {
    const deckId = decks[idx].id;
    await apiFetch(`/decks/${deckId}`, { method: "DELETE" });
    await updateDeckDropdown();
    if(decks.length > 0) {
      deckSelect.selectedIndex = 0;
      loadDeck(decks[0].id);
    } else {
      cardGrid.innerHTML = "";
    }
  } catch(err) {
    console.error("Failed to delete deck:", err);
  }
});

editDeckBtn.addEventListener("click", async () => {
  const deckId = deckSelect.value;
  if(!deckId) return;
  try {
    const deck = await apiFetch(`/decks/${deckId}`);
    if(!deck) return;

    editingIndex = decks.findIndex(d => d.id === deckId);
    deckNameInput.value = deck.name;

    document.getElementById("battlePage").classList.add("hidden");
    document.getElementById("builderPage").classList.remove("hidden");

    initBuilderGrid();
    deck.cards.forEach((src, i) => {
      if(src){
        const slot = builderGrid.children[i];
        slot.dataset.card = src;
        updateSlotVisual(slot);
        slot.setAttribute("draggable", "true");
      }
    });

  } catch (err) {
    console.error("Failed to load deck for editing:", err);
    alert("Could not load deck. Please try again.");
  }
});


/* Navigation buttons */
toBuilderBtn.addEventListener("click", () => {
  document.getElementById("battlePage").classList.add("hidden");
  document.getElementById("builderPage").classList.remove("hidden");
  editingIndex = null;
  initBuilderGrid();
});
toBattleBtn.addEventListener("click", async () => {
  document.getElementById("builderPage").classList.add("hidden");
  document.getElementById("battlePage").classList.remove("hidden");

  try {
    await updateDeckDropdown(); // fetch deck summaries from server

    if(decks.length > 0) {
      deckSelect.selectedIndex = 0;
      const firstDeckId = decks[0].id;
      await loadDeck(firstDeckId); // load full deck from server
    } else {
      cardGrid.innerHTML = ""; // no decks yet
    }
  } catch(err) {
    console.error("Failed to load decks:", err);
    cardGrid.innerHTML = ""; // fallback
  }
});


/* When dropdown changes */
deckSelect.addEventListener("change", (e) => {
  const deckId = e.target.value;
  if(deckId) loadDeck(deckId);
});


/* ===========================
   Init on first load
   =========================== */
// Load decks from backend and initialize first deck
async function initApp() {
  try {
    await updateDeckDropdown();

    if (decks.length > 0) {
      deckSelect.selectedIndex = 0;
      const firstDeckId = decks[0].id;
      await loadDeck(firstDeckId);
    } else {
      initBuilderGrid(); // fallback if no decks
    }
  } catch (err) {
    console.error("Failed to initialize app:", err);
    initBuilderGrid();
  }
}

// Run on page load
initApp();