document.addEventListener('DOMContentLoaded', () => { // Wait for the DOM to load
  const booksContainer = document.getElementById('books'); // Get the container for displaying books
  const searchInput = document.getElementById('search'); // Get the search input field
  const bibleData = []; // Initialize an array to store Bible data
  const loadingMessage = document.getElementById('loading-message'); // Get the loading message element

  // Mapping of book IDs to book names
  const bookNames = {
    1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
    6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
    11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles',
    15: 'Ezra', 16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms',
    20: 'Proverbs', 21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah',
    24: 'Jeremiah', 25: 'Lamentations', 26: 'Ezekiel', 27: 'Daniel', 28: 'Hosea',
    29: 'Joel', 30: 'Amos', 31: 'Obadiah', 32: 'Jonah', 33: 'Micah',
    34: 'Nahum', 35: 'Habakkuk', 36: 'Zephaniah', 37: 'Haggai', 38: 'Zechariah',
    39: 'Malachi', 40: 'Matthew', 41: 'Mark', 42: 'Luke', 43: 'John',
    44: 'Acts', 45: 'Romans', 46: '1 Corinthians', 47: '2 Corinthians',
    48: 'Galatians', 49: 'Ephesians', 50: 'Philippians', 51: 'Colossians',
    52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy',
    55: '2 Timothy', 56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James',
    60: '1 Peter', 61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John',
    65: 'Jude', 66: 'Revelation'
  };

  // Fetch the Bible data from a JSON file
  fetch('data/kjv.json')
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {
      bibleData.push(...data.resultset.row); // Store the fetched data in bibleData array
      loadingMessage.classList.add('hidden'); // Hide the loading message
      displayBooks(); // Display the list of books
      searchInput.addEventListener('keydown', event => { // Add event listener for search input
        if (event.key === 'Enter') { // Check if the Enter key was pressed
          searchHandler(); // Call the search handler
        }
      });
    })
    .catch(error => { // Handle errors during data fetching
      console.error('Error fetching Bible data:', error); // Log the error to the console
      loadingMessage.textContent = 'Error loading data. Please try again later.'; // Show an error message
    });

  // Display the list of books
  function displayBooks() {
    booksContainer.innerHTML = ''; // Clear the books container
    for (const bookId in bookNames) { // Iterate over book names
      const bookName = bookNames[bookId]; // Get the book name
      const bookBox = createBoxElement(bookName); // Create a box element for the book
      bookBox.classList.add('book-box'); // Add a class to the book box
      bookBox.dataset.bookId = bookId; // Set the book ID as a data attribute
      bookBox.addEventListener('click', () => toggleChapters(bookId)); // Add click event to toggle chapters
      booksContainer.appendChild(bookBox); // Append the book box to the container
    }
  }

  // Create a box element with given text
  function createBoxElement(text) {
    const box = document.createElement('div'); // Create a div element
    box.className = 'box'; // Set the class name
    box.innerHTML = text; // Set the inner HTML to the provided text
    return box; // Return the created box element
  }

  // Toggle the display of chapters for a given book
  function toggleChapters(bookId) {
    booksContainer.innerHTML = ''; // Clear the books container
    const chapters = getChaptersByBookId(bookId); // Get the chapters for the book
    chapters.forEach(chapter => { // Iterate over chapters
      const chapterBox = createBoxElement(`Chapter ${chapter}`); // Create a box element for the chapter
      chapterBox.classList.add('chapter-box'); // Add a class to the chapter box
      chapterBox.dataset.chapter = chapter; // Set the chapter number as a data attribute
      chapterBox.addEventListener('click', () => toggleVerses(bookId, chapter)); // Add click event to toggle verses
      booksContainer.appendChild(chapterBox); // Append the chapter box to the container
    });
  }

  // Get the chapters for a given book ID
  function getChaptersByBookId(bookId) {
    const chapters = new Set(); // Create a set to store chapters
    bibleData.forEach(verse => { // Iterate over bible data
      if (verse.field[1] === parseInt(bookId)) { // Check if the verse belongs to the book
        chapters.add(verse.field[2]); // Add the chapter to the set
      }
    });
    return Array.from(chapters).sort((a, b) => a - b); // Return the sorted array of chapters
  }

  // Toggle the display of verses for a given book and chapter
  function toggleVerses(bookId, chapter, targetVerseNumber = null) {
    booksContainer.innerHTML = ''; // Clear the books container
    const verses = getVersesByBookAndChapter(bookId, chapter); // Get the verses for the book and chapter
    verses.forEach(verse => { // Iterate over verses
      const verseText = `${verse.field[4]}<br>${bookNames[bookId]} ${chapter}:${verse.field[3]}`; // Create the verse text
      const verseBox = createBoxElement(verseText); // Create a box element for the verse
      verseBox.classList.add('verse-box'); // Add a class to the verse box
      verseBox.dataset.verse = verse.field[3]; // Set the verse number as a data attribute
      booksContainer.appendChild(verseBox); // Append the verse box to the container
    });

    if (targetVerseNumber !== null) { // Check if a target verse number is provided
      const targetVerseBox = booksContainer.querySelector(`[data-verse="${targetVerseNumber}"]`); // Find the target verse box
      if (targetVerseBox) { // Check if the target verse box exists
        targetVerseBox.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Scroll the target verse box into view
      }
    }
  }

  // Get the verses for a given book and chapter
  function getVersesByBookAndChapter(bookId, chapter) {
    return bibleData
      .filter(verse => verse.field[1] === parseInt(bookId) && verse.field[2] === chapter) // Filter the verses by book and chapter
      .sort((a, b) => a.field[3] - b.field[3]); // Sort the verses by verse number
  }

  // Handle the search functionality
  function searchHandler() {
    // const searchTerm = searchInput.value.trim().toLowerCase(); // Get and trim the search term
    const searchTerm = searchInput.value.toLowerCase();

    if (!searchTerm) return; // Return if the search term is empty
    loadingMessage.classList.remove('hidden'); // Show the loading message
    booksContainer.innerHTML = ''; // Clear the books container
    setTimeout(() => {
      const results = bibleData.filter(verse => verse.field[4].toLowerCase().includes(searchTerm)); // Filter the verses by search term
      results.forEach(result => { // Iterate over search results
        const bookId = result.field[1]; // Get the book ID
        const bookName = bookNames[bookId]; // Get the book name
        const chapter = result.field[2]; // Get the chapter number
        const verseNumber = result.field[3]; // Get the verse number
        const verseText = `${result.field[4]}<br>${bookName} ${chapter}:${verseNumber}`; // Create the verse text
        const resultBox = createBoxElement(verseText); // Create a box element for the result
        resultBox.classList.add('result-box'); // Add a class to the result box
        resultBox.addEventListener('click', () => { // Add click event to handle search result click
          toggleChapters(bookId); // Toggle chapters for the book
          toggleVerses(bookId, chapter, verseNumber); // Toggle verses for the chapter and scroll to the verse
        });
        booksContainer.appendChild(resultBox); // Append the result box to the container
      });
      loadingMessage.classList.add('hidden'); // Hide the loading message
    }, 500);
  }
});
