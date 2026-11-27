/* ============================================================
   BLISSORA — NATURE GALLERY JAVASCRIPT ENGINE
   Controls Filtering, Lightbox Modal, Slideshow, Soundscapes, and Favorites
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // ============================================================
    // 1. GALLERY DATA
    // ============================================================
    const GALLERY_ITEMS = [
        {
            id: 1,
            src: "gallery1.jpg",
            title: "Peaceful Forest",
            desc: "Take a deep breath and immerse yourself in the lush green canopy and quiet forest stillness.",
            category: "forest",
            tag: "🌲 Forest"
        },
        {
            id: 2,
            src: "gallery2.jpg",
            title: "Cascading Waterfall",
            desc: "The soothing rush of pure cascading water washes away mental fatigue and restores clarity.",
            category: "water",
            tag: "🌊 Waterfall"
        },
        {
            id: 3,
            src: "gallery3.jpg",
            title: "Majestic Mountain View",
            desc: "Breathe in the crisp alpine air and feel the enduring strength of ancient mountain peaks.",
            category: "mountain",
            tag: "🏔️ Mountain"
        },
        {
            id: 4,
            src: "galler4.jpg",
            title: "Serene Beach & Surf",
            desc: "Listen to the rhythmic cadence of gentle ocean waves washing onto warm, sun-kissed sands.",
            category: "water",
            tag: "🏖️ Beach"
        },
        {
            id: 5,
            src: "gallery5.jpg",
            title: "Vibrant Flower Garden",
            desc: "A tapestry of blossoming colors and gentle petals reminding us of life's continuous renewal.",
            category: "flowers",
            tag: "🌸 Floral"
        },
        {
            id: 6,
            src: "gallery6.jpg",
            title: "Golden Morning Sunrise",
            desc: "Soft morning rays break through the horizon, offering a warm promise of a brand new day.",
            category: "sunrise",
            tag: "🌅 Sunrise"
        }
    ];

    // State
    let currentCategory = "all";
    let activeIndex = 0;
    let isSlideshowRunning = false;
    let slideshowTimer = null;

    // DOM Elements
    const galleryContainer = document.getElementById("galleryGrid");
    const categoryTabs = document.querySelectorAll(".gallery-tab-btn");
    const slideshowBtn = document.getElementById("slideshowBtn");
    const galleryCountEl = document.getElementById("galleryItemCount");

    // Modal Elements
    const modal = document.getElementById("galleryModal");
    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const modalCounter = document.getElementById("modalCounter");
    const modalClose = document.getElementById("modalClose");
    const modalPrev = document.getElementById("modalPrev");
    const modalNext = document.getElementById("modalNext");
    const modalDownload = document.getElementById("modalDownload");
    const modalFavBtn = document.getElementById("modalFavBtn");

    // Ambient Sound Elements
    const audioPlayer = document.getElementById("galleryAudioPlayer");
    const audioPlayBtn = document.getElementById("galleryAudioPlayBtn");
    const soundSelect = document.getElementById("gallerySoundSelect");
    const audioVolSlider = document.getElementById("galleryAudioVol");

    // ============================================================
    // 2. FAVORITES MANAGEMENT
    // ============================================================
    function getFavorites() {
        try {
            const saved = localStorage.getItem("blissora_gallery_favs");
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return [];
    }

    function toggleFavorite(id, e) {
        if (e) e.stopPropagation();
        let favs = getFavorites();
        const idx = favs.indexOf(id);

        if (idx >= 0) {
            favs.splice(idx, 1);
        } else {
            favs.push(id);
        }

        localStorage.setItem("blissora_gallery_favs", JSON.stringify(favs));
        renderGallery();
        updateModalFavState();
    }

    function isFavorited(id) {
        return getFavorites().includes(id);
    }

    // ============================================================
    // 3. RENDER GALLERY CARDS
    // ============================================================
    function getFilteredItems() {
        if (currentCategory === "all") return GALLERY_ITEMS;
        if (currentCategory === "favorites") {
            const favs = getFavorites();
            return GALLERY_ITEMS.filter(item => favs.includes(item.id));
        }
        return GALLERY_ITEMS.filter(item => item.category === currentCategory);
    }

    function renderGallery() {
        if (!galleryContainer) return;
        const items = getFilteredItems();

        if (galleryCountEl) {
            galleryCountEl.textContent = `Showing ${items.length} of ${GALLERY_ITEMS.length} views`;
        }

        galleryContainer.innerHTML = "";

        if (items.length === 0) {
            galleryContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #777; font-style: italic; background: white; border-radius: 18px;">
                    <h3>No favorited sceneries yet!</h3>
                    <p>Click the ❤️ heart icon on any image to save your favorite peaceful views here.</p>
                </div>
            `;
            return;
        }

        items.forEach((item, index) => {
            const card = document.createElement("div");
            card.className = "gallery-card";
            card.innerHTML = `
                <div class="gallery-img-wrapper">
                    <img src="${item.src}" alt="${item.title}" loading="lazy">
                    <button class="gallery-fav-btn" title="${isFavorited(item.id) ? 'Remove Favorite' : 'Add to Favorites'}">
                        ${isFavorited(item.id) ? '❤️' : '🤍'}
                    </button>
                </div>
                <div class="gallery-card-content">
                    <div>
                        <span class="gallery-tag">${item.tag}</span>
                        <h3 style="margin-top: 8px;">${item.title}</h3>
                        <p>${item.desc}</p>
                    </div>
                    <div style="font-size: 13px; color: #2E8B57; font-weight: bold; margin-top: 10px;">
                        🔍 Click to Enlarge
                    </div>
                </div>
            `;

            // Favorite button click
            const favBtn = card.querySelector(".gallery-fav-btn");
            favBtn.addEventListener("click", (e) => toggleFavorite(item.id, e));

            // Card click -> open modal
            card.addEventListener("click", () => {
                openModal(index);
            });

            galleryContainer.appendChild(card);
        });
    }

    // ============================================================
    // 4. CATEGORY FILTER TABS
    // ============================================================
    categoryTabs.forEach(tab => {
        tab.addEventListener("click", function () {
            categoryTabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            currentCategory = this.dataset.category || "all";
            renderGallery();
        });
    });

    // ============================================================
    // 5. LIGHTBOX MODAL CONTROLLER
    // ============================================================
    function openModal(index) {
        const items = getFilteredItems();
        if (items.length === 0) return;
        activeIndex = (index + items.length) % items.length;
        const item = items[activeIndex];

        modalImg.src = item.src;
        modalTitle.textContent = item.title;
        modalDesc.textContent = item.desc;
        modalCounter.textContent = `${activeIndex + 1} / ${items.length}`;

        updateModalFavState();

        modal.style.display = "flex";
        document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
    }

    function closeModal() {
        modal.style.display = "none";
        document.body.style.overflow = "";
        stopSlideshow();
    }

    function nextImage() {
        const items = getFilteredItems();
        if (items.length === 0) return;
        openModal(activeIndex + 1);
    }

    function prevImage() {
        const items = getFilteredItems();
        if (items.length === 0) return;
        openModal(activeIndex - 1);
    }

    function updateModalFavState() {
        const items = getFilteredItems();
        if (items.length === 0 || !items[activeIndex]) return;
        const currentItem = items[activeIndex];

        if (modalFavBtn) {
            if (isFavorited(currentItem.id)) {
                modalFavBtn.innerHTML = "❤️ Favorited";
            } else {
                modalFavBtn.innerHTML = "🤍 Favorite";
            }
        }
    }

    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modalNext) modalNext.addEventListener("click", nextImage);
    if (modalPrev) modalPrev.addEventListener("click", prevImage);

    // Click outside modal content to close
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (modal.style.display === "flex") {
            if (e.key === "Escape") closeModal();
            if (e.key === "ArrowRight") nextImage();
            if (e.key === "ArrowLeft") prevImage();
        }
    });

    // Modal Favorite Button
    if (modalFavBtn) {
        modalFavBtn.addEventListener("click", () => {
            const items = getFilteredItems();
            if (items[activeIndex]) {
                toggleFavorite(items[activeIndex].id);
            }
        });
    }

    // Download Wallpaper Button
    if (modalDownload) {
        modalDownload.addEventListener("click", () => {
            const items = getFilteredItems();
            if (items[activeIndex]) {
                const item = items[activeIndex];
                const a = document.createElement("a");
                a.href = item.src;
                a.download = `Blissora_${item.title.replace(/\s+/g, "_")}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
    }

    // ============================================================
    // 6. ZEN SLIDESHOW PRESENTATION
    // ============================================================
    function startSlideshow() {
        isSlideshowRunning = true;
        if (slideshowBtn) {
            slideshowBtn.innerHTML = "⏸ Pause Slideshow";
            slideshowBtn.classList.add("active-tool");
        }
        openModal(0);

        clearInterval(slideshowTimer);
        slideshowTimer = setInterval(() => {
            nextImage();
        }, 4000); // 4 seconds per slide
    }

    function stopSlideshow() {
        isSlideshowRunning = false;
        clearInterval(slideshowTimer);
        if (slideshowBtn) {
            slideshowBtn.innerHTML = "▶ Zen Slideshow";
            slideshowBtn.classList.remove("active-tool");
        }
    }

    if (slideshowBtn) {
        slideshowBtn.addEventListener("click", () => {
            if (isSlideshowRunning) {
                stopSlideshow();
            } else {
                startSlideshow();
            }
        });
    }

    // ============================================================
    // 7. AMBIENT SOUNDSCAPE BAR
    // ============================================================
    if (audioPlayer && audioPlayBtn) {
        audioPlayBtn.addEventListener("click", () => {
            if (audioPlayer.paused) {
                audioPlayer.play().then(() => {
                    audioPlayBtn.innerHTML = "⏸";
                }).catch(e => console.log("Audio play error:", e));
            } else {
                audioPlayer.pause();
                audioPlayBtn.innerHTML = "▶";
            }
        });

        if (soundSelect) {
            soundSelect.addEventListener("change", function () {
                const wasPlaying = !audioPlayer.paused;
                audioPlayer.src = this.value;
                audioPlayer.load();
                if (wasPlaying) {
                    audioPlayer.play().catch(() => {});
                }
            });
        }

        if (audioVolSlider) {
            audioVolSlider.addEventListener("input", function () {
                audioPlayer.volume = this.value / 100;
            });
        }
    }

    // Initial render
    renderGallery();
});

