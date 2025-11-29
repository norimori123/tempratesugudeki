document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
            if (nav.style.display === 'block') {
                nav.style.position = 'absolute';
                nav.style.top = '100%';
                nav.style.left = '0';
                nav.style.width = '100%';
                nav.style.background = '#fff';
                nav.style.padding = '20px';
                nav.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
            }
        });
    }

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (window.innerWidth <= 768 && nav.style.display === 'block') {
                    nav.style.display = 'none';
                }

                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply animations to sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });

    // PDF Rendering Logic
    const pdfUrl = 'assets/template.pdf';
    const galleryContainer = document.getElementById('pdf-gallery');

    if (galleryContainer) {
        initPdfGallery(pdfUrl, galleryContainer);
    }

});

async function initPdfGallery(url, container) {
    try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        // Clear loading spinner
        container.innerHTML = '';

        const totalPages = pdf.numPages;

        // Generate random page order
        // Always keep page 1 first
        const otherPages = [];
        for (let i = 2; i <= totalPages; i++) {
            otherPages.push(i);
        }

        // Shuffle other pages
        for (let i = otherPages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [otherPages[i], otherPages[j]] = [otherPages[j], otherPages[i]];
        }

        const allPages = [1, ...otherPages];

        // Pagination state
        let currentPageIndex = 0;
        const itemsPerPage = 9; // Show 9 items initially

        // Create a wrapper for the grid to keep it separate from the button
        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'gallery-grid-wrapper';
        // Move the grid class to this wrapper or keep it on container?
        // The container currently has 'gallery-grid' class in HTML. 
        // Let's remove it from container and add it to a new inner div if needed, 
        // OR just append items to container and put button after container?
        // The HTML structure is: <div id="pdf-gallery" class="gallery-grid"></div>
        // We should probably remove 'gallery-grid' from the ID element and put it on a child, 
        // OR just append the button after the grid.

        // Let's change the strategy: 
        // 1. The container (pdf-gallery) will hold the grid items directly (it is a grid).
        // 2. The button will be inserted AFTER the container.

        const renderNextBatch = async () => {
            const end = Math.min(currentPageIndex + itemsPerPage, allPages.length);
            const batch = allPages.slice(currentPageIndex, end);

            for (const pageNum of batch) {
                await renderPage(pdf, pageNum, container);
            }

            currentPageIndex = end;

            // Update button visibility
            if (currentPageIndex >= allPages.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-flex';
                loadMoreBtn.textContent = `もっと見る (${allPages.length - currentPageIndex})`;
            }
        };

        // Create Load More Button
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'btn btn-outline load-more-btn';
        loadMoreBtn.textContent = 'もっと見る';
        loadMoreBtn.style.marginTop = '40px';
        loadMoreBtn.style.cursor = 'pointer';

        // Insert button after the gallery container
        container.parentNode.insertBefore(loadMoreBtn, container.nextSibling);

        // Wrap button in a center div
        const btnWrapper = document.createElement('div');
        btnWrapper.className = 'text-center';
        container.parentNode.insertBefore(btnWrapper, container.nextSibling);
        btnWrapper.appendChild(loadMoreBtn);

        loadMoreBtn.addEventListener('click', renderNextBatch);

        // Initial render
        await renderNextBatch();

    } catch (error) {
        console.error('Error rendering PDF:', error);
        container.innerHTML = '<div class="error-message">スライドの読み込みに失敗しました。<br>PDFファイルが存在するか確認してください。</div>';
    }
}

async function renderPage(pdf, pageNum, container) {
    try {
        const page = await pdf.getPage(pageNum);
        const scale = 0.5; // Thumbnail scale
        const viewport = page.getViewport({ scale: scale });

        const div = document.createElement('div');
        div.className = 'gallery-item';

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        div.appendChild(canvas);
        container.appendChild(div);

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        await page.render(renderContext).promise;
    } catch (err) {
        console.error(`Error rendering page ${pageNum}:`, err);
    }
}
