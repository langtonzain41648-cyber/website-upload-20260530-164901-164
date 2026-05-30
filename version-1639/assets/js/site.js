(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const menuPanel = document.querySelector("[data-menu-panel]");

    if (menuButton && menuPanel) {
        menuButton.addEventListener("click", function () {
            menuPanel.classList.toggle("is-open");
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            const index = Number(dot.getAttribute("data-hero-dot") || 0);
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 6200);
    }

    const homeSearch = document.querySelector("[data-home-search]");
    if (homeSearch) {
        homeSearch.addEventListener("submit", function (event) {
            const input = homeSearch.querySelector("input[name='q']");
            if (input && input.value.trim()) {
                event.preventDefault();
                window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
            }
        });
    }

    const searchInput = document.querySelector("[data-search-input]");
    const filterCards = Array.from(document.querySelectorAll("[data-filter-card]"));
    const filterForm = document.querySelector("[data-search-form]");
    const quickFilters = Array.from(document.querySelectorAll("[data-filter-value]"));

    function applyFilter(value) {
        const query = (value || "").trim().toLowerCase();
        filterCards.forEach(function (card) {
            const haystack = (card.getAttribute("data-search") || "").toLowerCase();
            card.classList.toggle("is-filter-hidden", query && !haystack.includes(query));
        });
    }

    if (searchInput && filterCards.length) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";
        if (initialQuery) {
            searchInput.value = initialQuery;
            applyFilter(initialQuery);
        }
        searchInput.addEventListener("input", function () {
            applyFilter(searchInput.value);
        });
    }

    if (filterForm && searchInput) {
        filterForm.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilter(searchInput.value);
        });
    }

    quickFilters.forEach(function (button) {
        button.addEventListener("click", function () {
            const value = button.getAttribute("data-filter-value") || "";
            if (searchInput) {
                searchInput.value = value;
            }
            applyFilter(value);
        });
    });
})();
