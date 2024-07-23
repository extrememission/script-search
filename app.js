document.addEventListener('DOMContentLoaded', () => {
  const booksContainer = document.getElementById('books');
  const searchInput = document.getElementById('search');
  const bibleData = [];
  const loadingMessage = document.getElementById('loading-message');

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

  fetch('data/kjv.json')
    .then(response => response.json())
    .then(data => {
      bibleData.push(...data.resultset.row);
      loadingMessage.classList.add('hidden');
      displayBooks();

      searchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          searchHandler();
        }
      });
    })
    .catch(error => {
      console.error('Error fetching Bible data:', error);
      loadingMessage.textContent = 'Error loading data. Please try again later.';
    });

  function displayBooks() {
    booksContainer.innerHTML = '';
    for (const bookId in bookNames) {
      const bookName = bookNames[bookId];
      const bookBox = createBoxElement(bookName);
      bookBox.classList.add('book-box');
      bookBox.dataset.bookId = bookId;
      bookBox.addEventListener('click', () => toggleChapters(bookId));

      // Handle right-click and long press for books
      bookBox.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        displayBooks(); // Go back to the list of books
      });
      bookBox.addEventListener('touchstart', handleLongPress.bind(null, 'book'));

      booksContainer.appendChild(bookBox);
    }
  }

  function createBoxElement(text) {
    const box = document.createElement('div');
    box.className = 'box';
    box.innerHTML = text;
    return box;
  }

  function toggleChapters(bookId) {
    booksContainer.innerHTML = '';
    const chapters = getChaptersByBookId(bookId);
    chapters.forEach(chapter => {
      const chapterBox = createBoxElement(`Chapter ${chapter}`);
      chapterBox.classList.add('chapter-box');
      chapterBox.dataset.chapter = chapter;
      chapterBox.addEventListener('click', () => toggleVerses(bookId, chapter));

      // Handle right-click and long press for chapters
      chapterBox.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        displayBooks(); // Go back to the list of books
      });
      chapterBox.addEventListener('touchstart', handleLongPress.bind(null, 'chapter', bookId));

      booksContainer.appendChild(chapterBox);
    });
  }

  function getChaptersByBookId(bookId) {
    const chapters = new Set();
    bibleData.forEach(verse => {
      if (verse.field[1] === parseInt(bookId)) {
        chapters.add(verse.field[2]);
      }
    });
    return Array.from(chapters).sort((a, b) => a - b);
  }

  function toggleVerses(bookId, chapter, targetVerseNumber = null) {
    booksContainer.innerHTML = '';
    const verses = getVersesByBookAndChapter(bookId, chapter);
    verses.forEach(verse => {
      const verseText = `${verse.field[4]}<br>${bookNames[bookId]} ${chapter}:${verse.field[3]}`;
      const verseBox = createBoxElement(verseText);
      verseBox.classList.add('verse-box');
      verseBox.dataset.verse = verse.field[3];

      // Handle right-click and long press for verses
      verseBox.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(verseText).then(() => {
          alert('Verse copied to clipboard!');
        });
      });
      verseBox.addEventListener('touchstart', handleLongPress.bind(null, 'verse', verseText));

      booksContainer.appendChild(verseBox);
    });

    if (targetVerseNumber !== null) {
      const targetVerseBox = booksContainer.querySelector(`[data-verse="${targetVerseNumber}"]`);
      if (targetVerseBox) {
        targetVerseBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function getVersesByBookAndChapter(bookId, chapter) {
    return bibleData
      .filter(verse => verse.field[1] === parseInt(bookId) && verse.field[2] === chapter)
      .sort((a, b) => a.field[3] - b.field[3]);
  }

function searchHandler() {
  const searchTerm = searchInput.value.toLowerCase();

  if (!searchTerm) return;
  loadingMessage.classList.remove('hidden');
  booksContainer.innerHTML = '';
  setTimeout(() => {
    const results = bibleData.filter(verse => verse.field[4].toLowerCase().includes(searchTerm));
    const highlightTerm = new RegExp(`(${searchTerm})`, 'gi');

    alert(`Found ${results.length} results for "${searchTerm}"`);

    results.forEach(result => {
      const bookId = result.field[1];
      const bookName = bookNames[bookId];
      const chapter = result.field[2];
      const verseNumber = result.field[3];
      const verseText = result.field[4].replace(highlightTerm, '<span class="highlight">$1</span>');
      const fullText = `${verseText}<br>${bookName} ${chapter}:${verseNumber}`;
      const resultBox = createBoxElement(fullText);
      resultBox.classList.add('result-box');
      resultBox.addEventListener('click', () => {
        toggleChapters(bookId);
        toggleVerses(bookId, chapter, verseNumber);
      });
      booksContainer.appendChild(resultBox);
    });
    loadingMessage.classList.add('hidden');
  }, 500);
}

  function handleLongPress(type, data) {
    let timer;
    const threshold = 500;

    return function (e) {
      if (e.type === 'touchstart') {
        timer = setTimeout(() => {
          if (type === 'verse') {
            navigator.clipboard.writeText(data).then(() => {
              alert('Verse copied to clipboard!');
            });
          } else if (type === 'chapter') {
            displayBooks();
          }
        }, threshold);

        e.target.addEventListener('touchend', () => clearTimeout(timer), { once: true });
        e.target.addEventListener('touchcancel', () => clearTimeout(timer), { once: true });
      }
    };
  }
});
