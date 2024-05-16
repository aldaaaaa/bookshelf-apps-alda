const books = [];
let bookCount = 0;

const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const MOVED_EVENT = "moved-book";
const DELETED_EVENT = "deleted-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function generateId() {
    return +new Date();
}

function createBook(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete,
    };
}

function findBook(bookId) {
    return books.find((book) => book.id === bookId);
}

function findBookIndex(bookId) {
    return books.findIndex((book) => book.id === bookId);
}

function isStorageExist() {
    if (typeof Storage === undefined) {
        alert("Browser kamu tidak mendukung local storage");
        return false;
    }
    return true;
}

document.addEventListener("DOMContentLoaded", () => {
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    document.dispatchEvent(new Event(SAVED_EVENT));
}

document.addEventListener(SAVED_EVENT, () => {
    console.log("Data berhasil disimpan.");
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData) {
        books.push(...JSON.parse(serializedData));
        bookCount = books.length;
        updateBookCount();
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function updateBookCount() {
    const bookCountElement = document.getElementById("bookCount");
    bookCountElement.textContent = `Jumlah Seluruh Buku: ${bookCount}`;
}
updateBookCount();

function addBook(title, author, year, isComplete) {
    const id = generateId();
    const newBook = createBook(id, title, author, year, isComplete);
    books.push(newBook);
    document.dispatchEvent(new Event(MOVED_EVENT));
    saveData();
    bookCount++;
    updateBookCount();
}

function showSuccessMessage() {
    const successMessage = document.querySelector(".success-message");
    successMessage.style.display = "block"; 
    setTimeout(() => {
        successMessage.style.display = "none"; 
    }, 3000);
}

const inputBookForm = document.getElementById("inputBook");
inputBookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("inputBookTitle").value;
    const author = document.getElementById("inputBookAuthor").value;
    const year = parseInt(document.getElementById("inputBookYear").value);
    const isComplete = document.getElementById("inputBookIsComplete").checked;

    if (title && author && !isNaN(year)) {
        addBook(title, author, year, isComplete);
        inputBookForm.reset();
        showSuccessMessage();
    } else {
        console.log("Mohon isi semua field dengan benar.");
    }
});

function createBookCard(book) {
    const { id, title, author, year, isComplete } = book;
  
    const card = document.createElement("div");
    card.classList.add("book-card");
  
    const titleElement = document.createElement("h3");
    titleElement.textContent = title;
  
    const authorElement = document.createElement("p");
    authorElement.textContent = `Penulis: ${author}`;
  
    const yearElement = document.createElement("p");
    yearElement.textContent = `Tahun: ${year}`;
  
    const actionButtons = document.createElement("div");
    actionButtons.classList.add("action-buttons");
  
    const moveButton = document.createElement("button");
    if (isComplete) {
        moveButton.innerHTML = '<img src="assets/go-back-arrow.png" alt="Selesai Dibaca">';
        moveButton.classList.add("move-button-incomplete");
    } else {
        moveButton.innerHTML = '<img src="assets/check.png" alt="Belum Selesai Dibaca">';
        moveButton.classList.add("move-button-complete");
    }
    moveButton.addEventListener("click", () => moveBook(id));


    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<img src="assets/trash-can.png" alt="Hapus">';
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => {
        const deleteConfirmationDialog = document.getElementById("deleteConfirmationDialog");
        const overlay = document.getElementById("overlay");
        deleteConfirmationDialog.style.display = "block";
        overlay.style.display = "block";

        const confirmDeleteButton = document.getElementById("confirmDeleteButton");
        const cancelDeleteButton = document.getElementById("cancelDeleteButton");

        confirmDeleteButton.addEventListener("click", () => {
            deleteBook(id);
            deleteConfirmationDialog.style.display = "none";
            overlay.style.display = "none";
        });

        cancelDeleteButton.addEventListener("click", () => {
            deleteConfirmationDialog.style.display = "none";
            overlay.style.display = "none";
        });
    });

    actionButtons.appendChild(moveButton);
    actionButtons.appendChild(deleteButton);
    
    card.appendChild(titleElement);
    card.appendChild(authorElement);
    card.appendChild(yearElement);
    card.appendChild(actionButtons);
    
    return card;
}

function moveBook(bookId) {
    const book = findBook(bookId);
    if (!book) return;
  
    book.isComplete = !book.isComplete;
    document.dispatchEvent(new Event(MOVED_EVENT));
    saveData();
}

document.addEventListener(MOVED_EVENT, () => {
    renderBooks();
});
  
function deleteBook(bookId) {
    const index = findBookIndex(bookId);
    if (index === -1) return;
  
    books.splice(index, 1);
    document.dispatchEvent(new Event(DELETED_EVENT));
    saveData();

    bookCount--;
    updateBookCount();
}

document.addEventListener(DELETED_EVENT, () => {
    renderBooks();
});

const searchBookForm = document.getElementById("searchBook");
searchBookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTitle = document.getElementById("searchBookTitle").value.toLowerCase();

    if (searchTitle) {
        const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(searchTitle)
        );

        renderFilteredBooks(filteredBooks);
    }
});

const resetButton = document.querySelector(".reset-btn");
resetButton.addEventListener("click", () => {
    searchBookForm.reset();
    renderBooks();
});

document.addEventListener(RENDER_EVENT, () => {
    renderBooks();
});

function renderBooks() {
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const completeBookshelfList = document.getElementById("completeBookshelfList");

    incompleteBookshelfList.innerHTML = "";
    completeBookshelfList.innerHTML = "";

    for (const book of books) {
        const bookCard = createBookCard(book);
        if (book.isComplete) {
            completeBookshelfList.appendChild(bookCard);
        } else {
            incompleteBookshelfList.appendChild(bookCard);
        }
    }
}

function renderFilteredBooks(filteredBooks) {
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const completeBookshelfList = document.getElementById("completeBookshelfList");
  
    incompleteBookshelfList.innerHTML = "";
    completeBookshelfList.innerHTML = "";
  
    for (const book of filteredBooks) {
        const bookCard = createBookCard(book);
        if (book.isComplete) {
            completeBookshelfList.appendChild(bookCard);
        } else {
            incompleteBookshelfList.appendChild(bookCard);
        }
    }
}