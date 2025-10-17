// script.js

const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API for simulation

// Load quotes from local storage or use default quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Inspiration" },
    { text: "The way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Load the last selected category from local storage
let lastSelectedCategory = localStorage.getItem("selectedCategory") || 'all';

// Function to display quotes based on the selected category
function displayQuotes(filteredQuotes) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '';

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available for this category.</p>';
        return;
    }

    // Select a random quote from the filtered quotes
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];

    quoteDisplay.innerHTML = `
        <p>${randomQuote.text}</p>
        <p><em>Category: ${randomQuote.category}</em></p>
    `;
}

// Function to show a random quote or filtered quotes
function showRandomQuote() {
    const filteredQuotes = quotes.filter(quote => 
        lastSelectedCategory === 'all' || quote.category === selectedCategory
    );
    displayQuotes(filteredQuotes);
}

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;

    if (newQuoteText && newQuoteCategory) {
        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        saveQuotes();  // Save to local storage
        populateCategories();  // Update categories in the dropdown
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        alert("Quote added!");
    } else {
        alert("Please enter both quote and category.");
    }
}

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to populate categories dynamically
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];

    // Clear existing options
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Set last selected category
    categoryFilter.value = lastSelectedCategory;
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const categoryFilter = document.getElementById('categoryFilter');
    lastSelectedCategory = categoryFilter.value;
    localStorage.setItem('lastSelectedCategory', lastSelectedCategory); // Save to local storage
    showRandomQuote();  // Show quotes based on the selected category
}

// Function to export quotes as JSON
function exportQuotes() {
    const jsonStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();  // Save updated quotes to local storage
        populateCategories();  // Update categories in the dropdown
        alert('Quotes imported successfully!');
        showRandomQuote();  // Refresh displayed quotes
    };
    fileReader.readAsText(event.target.files[0]);
}

// Function to sync quotes with the server
async function syncQuotes() {
    try {
        const response = await fetch(API_URL);
        const serverQuotes = await response.json();

        // Simulate conflict resolution: server data takes precedence
        const newQuotes = serverQuotes.map(quote => ({
            text: quote.title, // Assuming title is the quote text
            category: 'Imported' // Default category for imported quotes
        }));

        // Merge local quotes with server quotes, avoiding duplicates
        const mergedQuotes = [...new Set([...quotes, ...newQuotes].map(q => JSON.stringify(q)))].map(q => JSON.parse(q));

        // Update local storage and quotes list
        quotes = mergedQuotes;
        saveQuotes();
        populateCategories();
        showRandomQuote();

        // Notify user of successful sync
        document.getElementById('notification').innerText = 'Quotes synced successfully!';
    } catch (error) {
        console.error('Error syncing quotes:', error);
        document.getElementById('notification').innerText = 'Error syncing quotes.';
    }
}

// Set up periodic syncing every 30 seconds
setInterval(syncQuotes, 30000);

// Event listeners for buttons
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuoteButton').addEventListener('click', addQuote);
document.getElementById('exportQuotesButton').addEventListener('click', exportQuotes);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

// Populate categories and show a random quote on page load
populateCategories();
showRandomQuote();
