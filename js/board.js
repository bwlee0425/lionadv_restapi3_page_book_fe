import { fetchCategories, fetchBooks } from './api.js';

class BookBoard {
    constructor() {
        this.currentPage = 1;
        this.searchQuery = '';
        this.selectedCategory = '';
        this.sortOrder = 'title';

        this.initialize();
    }

    async initialize() {
        await this.loadCategories();
        await this.loadBooks();
        this.setupEventListeners();
    }

    async loadCategories() {
        try {
            const categories = await fetchCategories();
            const select = document.getElementById('categoryFilter');

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('카테고리 로드 실패:', error);
        }
    }
    // 카테고리id가 더미데이터를 여러번 생성하는 과정에서 1부터 40이 넘도록 설정되거나 null 로 설정이 됨.
    // book 의 카테고리id 를 제대로 설정해주어야 검색창에서 카테고리별로 책 제목을 볼 수 있음. 현재 코드수정이 안된상태.

    async loadBooks() {
        try {
            const params = {
                page: this.currentPage,
                search: this.searchQuery,
                ordering: this.sortOrder
            };

            if (this.selectedCategory) {
                params.category = this.selectedCategory;
            }

            const response = await fetchBooks(params);
            this.displayBooks(response.results);
            this.displayPagination(response);
        } catch (error) {
            console.error('도서 목록 로드 실패:', error);
        }
    }

    displayBooks(books) {
        const booksList = document.getElementById('booksList');
        booksList.innerHTML = '';

        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.category_name}</td>
                <td>${new Date(book.publication_date).toLocaleDateString()}</td>
                <td>${book.price.toLocaleString()}원</td>
                <td>${book.stock}</td>
            `;
            booksList.appendChild(row);
        });
    }

    displayPagination(data) {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        const totalPages = Math.ceil(data.count / 10);

        // 이전 페이지
        if (this.currentPage > 1) {
            pagination.innerHTML += `
                <button onclick="bookBoard.changePage(${this.currentPage - 1})">
                    이전
                </button>
            `;
        }

        // 페이지 번호
        for (let i = 1; i <= totalPages; i++) {
            pagination.innerHTML += `
                <button onclick="bookBoard.changePage(${i})"
                        ${i === this.currentPage ? 'disabled' : ''}>
                    ${i}
                </button>
            `;
        }

        // 다음 페이지
        if (this.currentPage < totalPages) {
            pagination.innerHTML += `
                <button onclick="bookBoard.changePage(${this.currentPage + 1})">
                    다음
                </button>
            `;
        }
    }

    changePage(page) {
        this.currentPage = page;
        this.loadBooks();
    }

    setupEventListeners() {
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.selectedCategory = e.target.value;
            this.currentPage = 1;
            this.loadBooks();
        });

        document.getElementById('searchButton').addEventListener('click', () => {
            this.searchQuery = document.getElementById('searchInput').value;
            this.currentPage = 1;
            this.loadBooks();
        });

        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.sortOrder = e.target.value;
            this.currentPage = 1;
            this.loadBooks();
        });
    }
}

// 전역 객체로 생성 (페이지네이션 버튼에서 접근하기 위함)
window.bookBoard = new BookBoard();