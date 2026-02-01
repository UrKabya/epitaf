document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Home Page');
    
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            body.classList.toggle('light-mode');
            
            const icon = themeToggle.querySelector('i');
            if (body.classList.contains('light-mode')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
            
            // Save preference to localStorage
            localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            themeToggle.querySelector('i').className = 'fas fa-sun';
        }
    }
    
    // MOBILE MENU TOGGLE - FIXED VERSION
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container')) {
                navLinks.classList.remove('active');
            }
        });
        
        // Close menu when clicking a link - ADDED THIS PART
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
    
    // Footer info cards
    document.querySelectorAll('.footer-nav .nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.querySelector('.info-card');
            
            if (!card) return;
            
            // Close all other cards
            document.querySelectorAll('.info-card').forEach(c => {
                if (c !== card) c.classList.remove('show');
            });
            
            // Toggle current card
            card.classList.toggle('show');
        });
    });
    
    // Close cards when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.info-card').forEach(card => {
            card.classList.remove('show');
        });
    });
    
    // Only run intro animation on home page
    if (document.getElementById('introOverlay')) {
        console.log('Home page detected - starting intro');
        
        // Show the intro overlay
        const introOverlay = document.getElementById('introOverlay');
        const mainContainer = document.getElementById('mainContainer');
        
        // Ensure main container is hidden initially
        if (mainContainer) {
            mainContainer.style.opacity = '0';
        }
        
        // Load images and start animation
        preloadIntroImages().then(() => {
            animateIntro();
        }).catch(error => {
            console.error('Error loading intro images:', error);
            // If images fail to load, skip intro after 2 seconds
            setTimeout(() => {
                skipIntro();
            }, 2000);
        });
    }
    
    // Initialize book gallery if on home page
    if (document.getElementById('bookGallery')) {
        console.log('Initializing book gallery');
        startBookGallery();
        initializeSearch();
    }
});

// Skip intro function
function skipIntro() {
    console.log('Skipping intro');
    enterWebsite();
}

// Image preloading
function preloadIntroImages() {
    return new Promise((resolve) => {
        const imageUrls = [
            'https://i.ibb.co/jvLJHYKy/2384227-IMG-modified.png',
            'https://i.ibb.co/VY8zsM28/upscalemedia-transformed-2-modified.png',
            'https://i.ibb.co/d014JgHs/upscalemedia-transformed-1-modified-1.png',
            'https://i.ibb.co/GfH9xgQR/reprint-2023cover-Humayun-Shankhanil-Karagar-modified.png'
        ];
        
        let loadedCount = 0;
        
        if (imageUrls.length === 0) {
            resolve();
            return;
        }
        
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
            img.onload = img.onerror = () => {
                loadedCount++;
                console.log(`Loaded image ${loadedCount}/${imageUrls.length}`);
                if (loadedCount === imageUrls.length) resolve();
            };
        });
    });
}

// Intro Animation
function animateIntro() {
    console.log('Starting intro animation');
    const introOverlay = document.getElementById('introOverlay');
    const introTitle = document.querySelector('.intro-title');
    const enterBtn = document.getElementById('enterBtn');
    
    if (!introOverlay || !enterBtn) {
        console.error('Intro elements not found');
        skipIntro();
        return;
    }
    
    // Create particles
    createParticles();
    
    // Create intro books
    createIntroBooks();
    
    // GSAP animations
    if (typeof gsap === 'undefined') {
        console.error('GSAP not loaded');
        skipIntro();
        return;
    }
    
    // Animate books entrance
    gsap.to('.intro-book', {
        x: 0,
        y: 0,
        z: 0,
        rotationY: 0,
        rotationX: 0,
        opacity: 1,
        duration: 1.5,
        stagger: 0.2,
        ease: 'back.out(1.7)',
        delay: 0.5
    });
    
    // Position books in a circle
    setTimeout(() => {
        const introBooks = document.querySelectorAll('.intro-book');
        if (introBooks.length === 0) {
            skipIntro();
            return;
        }
        
        const radius = window.innerWidth * 0.4;
        const angleStep = (2 * Math.PI) / 4;
        
        introBooks.forEach((book, index) => {
            const angle = angleStep * index;
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius - radius;
            const rotationY = -angle * (180 / Math.PI);
            
            gsap.to(book, {
                x: x,
                z: z,
                rotationY: rotationY,
                duration: 1.5,
                ease: 'elastic.out(1, 0.5)'
            });
            
            // Add hover effects
            addBookInteractions(book, rotationY);
        });
        
        // Animate title and button
        gsap.to(introTitle, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            delay: 0.5
        });
        
        gsap.to(enterBtn, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            delay: 0.8
        });
        
        // Auto-rotate books
        window.introRotationInterval = setInterval(() => {
            const rotationAngle = performance.now() / 1000 * 15; // 15 degrees per second
            const angleStep = (2 * Math.PI) / 4;
            
            introBooks.forEach((book, index) => {
                const angle = angleStep * index + (rotationAngle * Math.PI / 180);
                const x = Math.sin(angle) * radius;
                const z = Math.cos(angle) * radius - radius;
                const rotationY = -angle * (180 / Math.PI);
                
                gsap.to(book, {
                    x: x,
                    z: z,
                    rotationY: rotationY,
                    duration: 1.5,
                    ease: 'sine.inOut'
                });
            });
        }, 50);
        
    }, 2000);
    
    // Enter button click handler
    enterBtn.addEventListener('click', function() {
        console.log('Enter button clicked');
        enterWebsite();
    });
    
    // Skip intro by clicking anywhere
    introOverlay.addEventListener('click', (e) => {
        if (e.target === introOverlay) {
            console.log('Clicked intro overlay - skipping intro');
            enterWebsite();
        }
    });
    
    // Auto-skip intro after 15 seconds (in case something goes wrong)
    setTimeout(() => {
        if (introOverlay.style.display !== 'none') {
            console.log('Auto-skipping intro after timeout');
            enterWebsite();
        }
    }, 15000);
}

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = window.innerWidth < 768 ? 30 : 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 5 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const opacity = Math.random() * 0.6 + 0.2;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.opacity = opacity;
        particle.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
        
        if (typeof gsap !== 'undefined') {
            gsap.to(particle, {
                y: `+=${Math.random() * 100 - 50}`,
                x: `+=${Math.random() * 100 - 50}`,
                duration: duration,
                delay: delay,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }
        
        particlesContainer.appendChild(particle);
    }
}

function createIntroBooks() {
    const container = document.getElementById('introBooksContainer');
    if (!container) return;
    
    const bookData = [
        {
            cover: 'https://i.ibb.co/jvLJHYKy/2384227-IMG-modified.png',
            title: "অপেক্ষা"
        },
        {
            cover: 'https://i.ibb.co/VY8zsM28/upscalemedia-transformed-2-modified.png',
            title: "বৃষ্টি বিলাস"
        },
        {
            cover: 'https://i.ibb.co/d014JgHs/upscalemedia-transformed-1-modified-1.png',
            title: "নন্দিত নরকে"
        },
        {
            cover: 'https://i.ibb.co/GfH9xgQR/reprint-2023cover-Humayun-Shankhanil-Karagar-modified.png',
            title: "শঙ্খনীল কারাগার"
        }
    ];
    
    bookData.forEach((book, index) => {
        const bookEl = document.createElement('div');
        bookEl.className = 'intro-book';
        bookEl.style.backgroundImage = `url(${book.cover})`;
        bookEl.dataset.title = book.title;
        bookEl.style.backgroundColor = '#f0f0f0';
        
        if (typeof gsap !== 'undefined') {
            gsap.set(bookEl, {
                x: index % 2 === 0 ? -100 : 100,
                y: index < 2 ? -100 : 100,
                opacity: 0,
                rotationY: index % 2 === 0 ? -30 : 30,
                rotationX: index < 2 ? -15 : 15,
                z: -500
            });
        } else {
            // If GSAP fails, at least show the books
            bookEl.style.opacity = '1';
            bookEl.style.transform = 'translate(0, 0)';
        }
        
        container.appendChild(bookEl);
        
        if (index === 0) {
            bookEl.classList.add('active');
        }
    });
}

function addBookInteractions(book, rotationY) {
    if (typeof gsap === 'undefined') return;
    
    book.addEventListener('mouseenter', () => {
        if (window.innerWidth > 768) {
            gsap.to(book, {
                y: -20,
                rotationX: 5,
                rotationY: rotationY + 5,
                duration: 0.5,
                ease: 'back.out(1.7)'
            });
            book.classList.add('active');
        }
    });
    
    book.addEventListener('mouseleave', () => {
        if (window.innerWidth > 768) {
            gsap.to(book, {
                y: 0,
                rotationX: 0,
                rotationY: rotationY,
                duration: 0.5,
                ease: 'back.out(1.7)'
            });
            book.classList.remove('active');
        }
    });
    
    // Touch events for mobile
    book.addEventListener('touchstart', () => {
        gsap.to(book, {
            y: -20,
            rotationX: 5,
            rotationY: rotationY + 5,
            duration: 0.5,
            ease: 'back.out(1.7)'
        });
        book.classList.add('active');
    });
    
    book.addEventListener('touchend', () => {
        gsap.to(book, {
            y: 0,
            rotationX: 0,
            rotationY: rotationY,
            duration: 0.5,
            ease: 'back.out(1.7)'
        });
        book.classList.remove('active');
    });
}

function enterWebsite() {
    console.log('Entering website - showing main content');
    
    if (window.introRotationInterval) {
        clearInterval(window.introRotationInterval);
    }
    
    const introOverlay = document.getElementById('introOverlay');
    const mainContainer = document.getElementById('mainContainer');
    const searchContainer = document.getElementById('searchContainer');
    const galleryContainer = document.getElementById('galleryContainer');
    
    // Show main container
    if (mainContainer) {
        mainContainer.classList.add('visible');
        console.log('Main container made visible');
    }
    
    // Hide intro overlay
    if (introOverlay) {
        introOverlay.style.display = 'none';
        console.log('Intro overlay hidden');
    }
    
    // Trigger animations for search and gallery
    if (searchContainer) {
        searchContainer.style.animation = 'fadeIn 0.5s forwards';
    }
    
    if (galleryContainer) {
        galleryContainer.style.animation = 'fadeIn 0.5s forwards 0.3s';
    }
}

// Book Gallery Functions
function startBookGallery() {
    const bookGallery = document.getElementById('bookGallery');
    const navDots = document.getElementById('navDots');
    
    if (!bookGallery || !navDots) {
        console.error('Book gallery elements not found');
        return;
    }
    
    console.log('Starting book gallery');
    
    const books = [];
    const totalBooks = 11;
    let currentIndex = 0;
    let startX, moveX;
    let isDragging = false;
    let clickStartTime = 0;
    let clickStartX = 0;
    let clickStartY = 0;
    
    const bookData = [
        {
            cover: 'https://i.ibb.co/jvLJHYKy/2384227-IMG-modified.png',
            title: "অপেক্ষা",
            pages: "148 pages",
            pdf: "https://heyzine.com/flip-book/197fe6e70b.html"
        },
        {
            cover: 'https://i.ibb.co/VY8zsM28/upscalemedia-transformed-2-modified.png',
            title: "বৃষ্টি বিলাস",
            pages: "97 pages",
            pdf: "https://heyzine.com/flip-book/1a2e8c1868.html"
        },
        {
            cover: 'https://i.ibb.co/d014JgHs/upscalemedia-transformed-1-modified-1.png',
            title: "নন্দিত নরকে",
            pages: "78 pages",
            pdf: "https://heyzine.com/flip-book/b4a3d63030.html"
        },
        {
            cover: 'https://i.ibb.co/GfH9xgQR/reprint-2023cover-Humayun-Shankhanil-Karagar-modified.png',
            title: "শঙ্খনীল কারাগার",
            pages: "67 pages",
            pdf: "https://heyzine.com/flip-book/6c60034146.html"
        },
        {
            cover: 'https://i.ibb.co/BVP2wKsW/upscalemedia-transformed-3-modified-1.png',
            title: "মিসির আলি সমগ্র",
            pages: "524 pages",
            pdf: "https://heyzine.com/flip-book/0429c98a35.html"
        },
        {
            cover: 'https://i.ibb.co/1GyyFyfg/upscalemedia-transformed-4-modified.png',
            title: "তন্দ্রাবিলাস",
            pages: "96 pages",
            pdf: "https://heyzine.com/flip-book/ebd245c88d.html"
        },
        {
            cover: 'https://i.ibb.co/5wZ0Ty4/upscalemedia-transformed-3-modified.png',
            title: "দ্বিতীয় মানব",
            pages: "53 pages",
            pdf: "https://heyzine.com/flip-book/01867b93a0.html"
        },
        {
            cover: 'https://i.ibb.co/4nfWJdLk/upscalemedia-transformed-2-modified.png',
            title: "মেঘ বলেছে যাব যাব",
            pages: "248 pages",
            pdf: "https://heyzine.com/flip-book/3804efc7e4.html"
        },
        {
            cover: 'https://i.ibb.co/S7MxWjzR/Misir-Ali-Samagra-2-Book-Cover-2-modified.png',
            title: "মিসির আলি সমগ্র - ২",
            pages: "324 pages",
            pdf: "https://heyzine.com/flip-book/36500c0f66.html"
        },
        {
            cover: 'https://i.ibb.co/vCSm3xqt/1800897-modified.png',
            title: "ওমেগা পয়েন্ট",
            pages: "106 pages",
            pdf: "https://heyzine.com/flip-book/8debbab869.html"
        },
        {
            cover: 'https://i.ibb.co/mrywkVss/upscalemedia-transformed-3-modified.png',
            title: "মিসির আলি!",
            pages: "94 pages",
            pdf: "https://heyzine.com/flip-book/5620253d1a.html"
        }
    ];
    
    // Create books and dots
    for (let i = 0; i < totalBooks; i++) {
        const data = bookData[i];
        
        const book = createBook(i, data.cover, data.title, data.pages, data.pdf);
        books.push(book);
        bookGallery.appendChild(book);
        
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.dataset.index = i;
        dot.addEventListener('click', () => {
            currentIndex = i;
            positionBooks();
            updateDots();
        });
        navDots.appendChild(dot);
    }
    
    positionBooks();
    updateDots();
    
    // Touch event handlers
    bookGallery.addEventListener('touchstart', handleTouchStart, { passive: false });
    bookGallery.addEventListener('touchmove', handleTouchMove, { passive: false });
    bookGallery.addEventListener('touchend', handleTouchEnd);
    
    function createBook(index, coverUrl, title, pages, pdfLink) {
        const book = document.createElement('div');
        book.className = 'book';
        book.dataset.index = index;
        
        book.innerHTML = `
            <div class="book-cover book-front" style="background-image: url(${coverUrl})" onerror="this.style.backgroundImage='url(https://placehold.co/180x260/cccccc/333333?text=Cover+Missing)'"></div>
            <div class="book-cover book-back">${title}</div>
            <div class="book-spine"></div>
            <div class="book-side"></div>
            <div class="book-title">${title}</div>
            <div class="book-pages">${pages}</div>
            <a href="${pdfLink}" class="book-pdf-link" target="_blank"></a>
        `;
        
        return book;
    }
    
    function positionBooks() {
        const radius = window.innerWidth * (window.innerWidth > 768 ? 0.6 : 0.8);
        const angleStep = (2 * Math.PI) / totalBooks;
        
        books.forEach((book, index) => {
            const angle = angleStep * (index - currentIndex);
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius - radius;
            
            const rotationY = -angle * (180 / Math.PI);
            const tilt = -Math.abs(angle) * 10;
            
            book.style.transform = `
                translateX(${x}px)
                translateY(-50%)
                translateZ(${z}px)
                rotateY(${rotationY}deg)
                rotateX(${tilt}deg)
            `;
            
            const distance = Math.abs(index - currentIndex);
            const opacity = 1 - (distance * 0.4);
            const scale = 1 - (distance * 0.15);
            
            book.style.opacity = opacity;
            book.style.transform += ` scale(${scale})`;
            
            book.style.zIndex = totalBooks - distance;
        });
    }
    
    function updateDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        isDragging = false;
        clickStartTime = Date.now();
        clickStartX = e.touches[0].clientX;
        clickStartY = e.touches[0].clientY;
    }
    
    function handleTouchMove(e) {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = Math.abs(currentX - startX);
        const deltaY = Math.abs(currentY - clickStartY);
    
        if (!isDragging && deltaX > 10 && deltaX > deltaY) {
            isDragging = true;
        }
    
        if (isDragging) {
            e.preventDefault();
            moveX = currentX;
        }
    }
    
    function handleTouchEnd(e) {
        if (!isDragging) {
            const touch = e.changedTouches[0];
            const deltaX = Math.abs(touch.clientX - clickStartX);
            const deltaY = Math.abs(touch.clientY - clickStartY);
            const elapsed = Date.now() - clickStartTime;
    
            if (deltaX < 20 && deltaY < 20 && elapsed < 300) {
                const centerBook = books[currentIndex];
                const link = centerBook.querySelector('.book-pdf-link');
                if (link) {
                    link.click();
                }
            }
        } else {
            const threshold = 50;
            const difference = startX - moveX;
    
            if (difference > threshold) {
                currentIndex = (currentIndex + 1) % totalBooks;
            } else if (difference < -threshold) {
                currentIndex = (currentIndex - 1 + totalBooks) % totalBooks;
            }
    
            positionBooks();
            updateDots();
        }
        isDragging = false;
    }
    
    window.addEventListener('resize', positionBooks);
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput || !searchResults) {
        console.error('Search elements not found');
        return;
    }
    
    console.log('Initializing search');
    
    const books = [
        { title: "অপেক্ষা", banglish: "Opekkha", link: "https://heyzine.com/flip-book/197fe6e70b.html" },
        { title: "মিসির আলি সমগ্র", banglish: "Misir Ali Somogro", link: "https://heyzine.com/flip-book/36500c0f66.html" },
        { title: "বৃষ্টি বিলাস", banglish: "Brishti Bilash", link: "https://heyzine.com/flip-book/1a2e8c1868.html" },
        { title: "মেঘ বলেছে যাব যাব", banglish: "Megh Boleche Jabo Jabo", link: "https://heyzine.com/flip-book/3804efc7e4.html" },
        { title: "নন্দিত নরকে", banglish: "Nondito Noroke", link: "https://heyzine.com/flip-book/b4a3d63030.html" },
        { title: "তন্দ্রাবিলাস", banglish: "Tondrabilas", link: "https://heyzine.com/flip-book/ebd245c88d.html" },
        { title: "শঙ্খনীল কারাগার", banglish: "Shankhanil Karagar", link: "https://heyzine.com/flip-book/6c60034146.html" },
        { title: "দ্বিতীয় মানব", banglish: "Ditiyo Manob", link: "https://heyzine.com/flip-book/01867b93a0.html" },
        { title: "ওমেগা পয়েন্ট", banglish: "Omega Point", link: "https://heyzine.com/flip-book/8debbab869.html" },
        { title: "মিসির আলি ! আপনি কোথায়?", banglish: "Misir Ali ! Apni Kothai?", link: "https://heyzine.com/flip-book/5620253d1a.html" }
    ];

    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        searchResults.innerHTML = '';
        
        if (query === '') return;
        
        // Find matching books
        const foundBooks = books.filter(book => 
            book.title.toLowerCase().includes(query) || 
            book.banglish.toLowerCase().includes(query)
        );
        
        if (foundBooks.length > 0) {
            // Show only one book at a time
            const book = foundBooks[0];
            const resultItem = document.createElement('a');
            resultItem.href = book.link;
            resultItem.target = '_blank';
            resultItem.textContent = `${book.title} (${book.banglish})`;
            resultItem.style.animationDelay = `0.1s`;
            resultItem.style.display = 'block';
            resultItem.style.padding = '15px';
            resultItem.style.margin = '10px 0';
            resultItem.style.background = 'rgba(255, 255, 255, 0.1)';
            resultItem.style.borderRadius = '10px';
            resultItem.style.border = '2px solid var(--primary-color)';
            searchResults.appendChild(resultItem);
        } else {
            const noResult = document.createElement('p');
            noResult.textContent = 'কোনো বই পাওয়া যায়নি !';
            noResult.className = 'no-result';
            searchResults.appendChild(noResult);
        }
    });
}
