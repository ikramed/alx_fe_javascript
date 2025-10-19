// ----- Quotes Array -----
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" }
];

// ----- Display Random Quote -----
const quoteDisplay = document.getElementById('quoteDisplay');
function showRandomQuote(filteredQuotes = quotes) {
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes to display.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `${filteredQuotes[randomIndex].text} — ${filteredQuotes[randomIndex].category}`;
}

// ----- Add New Quote -----
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();
  if (!text || !category) return alert('Please enter both quote and category.');

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showRandomQuote();
  textInput.value = '';
  categoryInput.value = '';
}

// ----- Create Add Quote Form -----
function createAddQuoteForm() {
  const container = document.getElementById('addQuoteContainer');

  const textInput = document.createElement('input');
  textInput.id = 'newQuoteText';
  textInput.type = 'text';
  textInput.placeholder = 'Enter a new quote';

  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote category';

  const addBtn = document.createElement('button');
  addBtn.id = 'addQuoteBtn';
  addBtn.textContent = 'Add Quote';
  addBtn.addEventListener('click', addQuote);

  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(addBtn);
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

  const lastFilter = localStorage.getItem('lastCategory') || 'all';
  categoryFilter.value = lastFilter;
  filterQuotes();
}

// ----- Filter Quotes -----
categoryFilter.addEventListener('change', filterQuotes);
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem('lastCategory', selected);
  if (selected === 'all') showRandomQuote();
  else {
    const filtered = quotes.filter(q => q.category === selected);
    showRandomQuote(filtered);
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

// ----- Server Sync & Conflict Resolution -----
async function fetchQuotesFromServer() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const data = await response.json();
  return data.slice(0,5).map(item => ({ text: item.title, category: 'Server' }));
}

// POST Quotes to Server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    const data = await response.json();
    console.log("Quote posted to server:", data);
  } catch (err) {
    console.error("Error posting quote to server:", err);
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let newQuotes = 0;
  let conflictsResolved = 0;

  serverQuotes.forEach(sq => {
    const existing = quotes.find(q => q.text === sq.text);
    if (!existing) {
      quotes.push(sq);
      newQuotes++;
    } else {
      if (existing.category !== sq.category) {
        existing.category = sq.category;
        conflictsResolved++;
      }
    }
  });

  // نشر الاقتباسات المحلية للسيرفر
  quotes.forEach(q => postQuoteToServer(q));

  if (newQuotes > 0 || conflictsResolved > 0) {
    saveQuotes();
    populateCategories();
    showRandomQuote();
    if (newQuotes > 0) alert(`${newQuotes} new quotes added from server.`);
    if (conflictsResolved > 0) alert(`${conflictsResolved} conflicts resolved based on server data.`);
  }
}

// ----- Event Listeners -----
document.getElementById('newQuote').addEventListener('click', () => showRandomQuote());

// ----- Initialize -----
createAddQuoteForm();
populateCategories();
showRandomQuote();
setInterval(syncQuotes, 30000); // Sync every 30 sec
