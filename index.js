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


//empty object that gets loaded from assets folder
const cardAssets = {};

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

//loads cards into cardsAssets object from assets folder
async function loadCardAssets() {
  try {
    const res = await fetch(`${BASE_URL}/cards`);
    if (!res.ok) throw new Error("Failed to load card assets");
    const data = await res.json();

    // Transform into same structure as your old cardAssets object
    data.forEach(set => {
      cardAssets[set.set] = set.cards; // set.cards already includes the full path
    });

    console.log("Card assets loaded:", cardAssets);
  } catch (err) {
    console.error("Error loading card assets:", err);
    alert("Failed to load card assets");
  }
}


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

function openModalForSlot(idx) {
  selectedSlotIndex = idx;
  cardModal.classList.remove("hidden");
  cardModal.setAttribute("aria-hidden", "false");

  renderFolderBar();

  // Open first folder by default
  const firstFolder = Object.keys(cardAssets)[0];
  if (firstFolder) showFolder(firstFolder);
}


function renderFolderBar() {
  foldersBar.innerHTML = "";

  Object.keys(cardAssets).forEach(folderKey => {
    const btn = document.createElement("div");
    btn.classList.add("folder");
    btn.textContent = folderKey;
    btn.addEventListener("click", () => showFolder(folderKey));
    foldersBar.appendChild(btn);
  });
}


function showFolder(folderKey) {
  currentFolderKey = folderKey;
  currentFolderName.textContent = folderKey;

  // Highlight active folder
  Array.from(foldersBar.children).forEach(btn =>
    btn.classList.toggle("active", btn.textContent === folderKey)
  );

  // Render the thumbnails
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
      if (!slot) return;

      slot.dataset.card = src;
      updateSlotVisual(slot);
      slot.setAttribute("draggable", "true");

      // Close modal
      cardModal.classList.add("hidden");
      cardModal.setAttribute("aria-hidden", "true");
      selectedSlotIndex = null;
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
  resetBtn.classList.add("hidden");
});
toBattleBtn.addEventListener("click", async () => {
  document.getElementById("builderPage").classList.add("hidden");
  document.getElementById("battlePage").classList.remove("hidden");
  resetBtn.classList.remove("hidden");

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
deckSelect.addEventListener("change", async (e) => {
  const deckId = e.target.value;
  if (!deckId) return;

  // Load into battle view
  await loadDeck(deckId);

  // If builder page is visible, also populate builder grid
  const builderPage = document.getElementById("builderPage");
  if (!builderPage.classList.contains("hidden")) {
    try {
      const deck = await apiFetch(`/decks/${deckId}`); // fetch full deck
      if (!deck) return;

      editingIndex = decks.findIndex(d => d.id === deckId);
      deckNameInput.value = deck.name;

      initBuilderGrid();
      deck.cards.forEach((src, i) => {
        if (src) {
          const slot = builderGrid.children[i];
          slot.dataset.card = src;
          updateSlotVisual(slot);
          slot.setAttribute("draggable", "true");
        }
      });
    } catch (err) {
      console.error("Failed to load deck for builder:", err);
      alert("Could not load deck. Please try again.");
    }
  }
});

/* ===========================
   Init on first load
   =========================== */
// Load decks from backend and initialize first deck
async function initApp() {
  try {
    await loadCardAssets(); // load dynamic card assets
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