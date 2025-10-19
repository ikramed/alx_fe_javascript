// ----- Quotes Array -----
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" }
];

// ----- Display Random Quote -----
const quoteDisplay = document.getElementById('quoteDisplay');
function displayQuote(filteredQuotes = quotes) {
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes to display.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `${filteredQuotes[randomIndex].text} — ${filteredQuotes[randomIndex].category}`;
}

// ----- Add New Quote -----
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
document.getElementById('addQuoteBtn').addEventListener('click', addQuote);

function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();
  if (!text || !category) return alert('Please enter both quote and category.');

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  displayQuote();
  newQuoteText.value = '';
  newQuoteCategory.value = '';
}

// ----- Save to LocalStorage -----
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// ----- Populate Categories -----
const categoryFilter = document.getElementById('categoryFilter');
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const lastFilter = localStorage.getItem('lastCategory') || 'all';
  categoryFilter.value = lastFilter;
  filterQuotes();
}

// ----- Filter Quotes -----
categoryFilter.addEventListener('change', filterQuotes);
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem('lastCategory', selected);
  if (selected === 'all') displayQuote();
  else {
    const filtered = quotes.filter(q => q.category === selected);
    displayQuote(filtered);
  }
}

// ----- JSON Export -----
document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
});

// ----- JSON Import -----
document.getElementById('importFile').addEventListener('change', importFromJsonFile);
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert('Quotes imported successfully!');
    } catch(err) {
      alert('Invalid JSON file');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ----- Event Listeners -----
document.getElementById('newQuote').addEventListener('click', () => displayQuote());

// ----- Initialize -----
populateCategories();
displayQuote();
