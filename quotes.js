/* ============================================================
   BLISSORA — POSITIVE QUOTES & AFFIRMATIONS JAVASCRIPT ENGINE
   Controls Quote Generation, Category Filtering, Favorites, Text-to-Speech
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // ============================================================
    // 1. QUOTE DATABASE
    // ============================================================
    const QUOTES_DATA = [
        // Peace & Calm
        {
            text: "Peace begins when expectation ends and gratitude begins.",
            author: "Buddha",
            category: "peace"
        },
        {
            text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.",
            author: "Hermann Hesse",
            category: "peace"
        },
        {
            text: "Nothing can bring you peace but yourself.",
            author: "Ralph Waldo Emerson",
            category: "peace"
        },
        {
            text: "Calmness is the cradle of power.",
            author: "Josiah Gilbert Holland",
            category: "peace"
        },
        {
            text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
            author: "Thich Nhat Hanh",
            category: "peace"
        },

        // Strength & Resilience
        {
            text: "You are stronger than you know, braver than you believe, and loved more than you imagine.",
            author: "A.A. Milne",
            category: "strength"
        },
        {
            text: "Small daily improvements over time lead to stunning results.",
            author: "Robin Sharma",
            category: "strength"
        },
        {
            text: "Hard times arouse an instinctive desire for authenticity.",
            author: "Coco Chanel",
            category: "strength"
        },
        {
            text: "Out of difficulties grow miracles.",
            author: "Jean de La Bruyère",
            category: "strength"
        },
        {
            text: "You do not have to see the whole staircase, just take the first step.",
            author: "Martin Luther King Jr.",
            category: "strength"
        },

        // Self-Love & Compassion
        {
            text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.",
            author: "Sharon Salzberg",
            category: "selflove"
        },
        {
            text: "Talk to yourself like you would to someone you love.",
            author: "Brené Brown",
            category: "selflove"
        },
        {
            text: "To love oneself is the beginning of a lifelong romance.",
            author: "Oscar Wilde",
            category: "selflove"
        },
        {
            text: "Be gentle with yourself. You are doing the best you can.",
            author: "Anonymous",
            category: "selflove"
        },
        {
            text: "Owning our story and loving ourselves through that process is the bravest thing we will ever do.",
            author: "Brené Brown",
            category: "selflove"
        },

        // Gratitude & Joy
        {
            text: "Gratitude turns what we have into enough, and more.",
            author: "Melody Beattie",
            category: "gratitude"
        },
        {
            text: "When you arise in the morning think of what a privilege it is to be alive, to think, to enjoy, to love.",
            author: "Marcus Aurelius",
            category: "gratitude"
        },
        {
            text: "Joy does not simply happen to us. We have to choose joy and keep choosing it every day.",
            author: "Henri Nouwen",
            category: "gratitude"
        },
        {
            text: "Enjoy the little things, for one day you may look back and realize they were the big things.",
            author: "Robert Brault",
            category: "gratitude"
        },

        // Mindfulness & Healing
        {
            text: "Every day is a new beginning. Take a deep breath, smile, and start again.",
            author: "Zen Proverb",
            category: "mindfulness"
        },
        {
            text: "In today's rush, we all think too much, seek too much, want too much and forget about the joy of just Being.",
            author: "Eckhart Tolle",
            category: "mindfulness"
        },
        {
            text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
            author: "Thich Nhat Hanh",
            category: "mindfulness"
        },
        {
            text: "Life is a balance of holding on and letting go.",
            author: "Rumi",
            category: "mindfulness"
        }
    ];

    // Affirmations Database
    const AFFIRMATIONS_DATA = [
        "I am grounded, peaceful, and fully capable of handling whatever today brings.",
        "I release what I cannot control and choose to focus on my inner tranquility.",
        "I am worthy of respect, happiness, self-compassion, and deep rest.",
        "My mind is clear, my heart is open, and my energy is revitalized.",
        "I choose to inhale confidence and exhale doubt and anxiety.",
        "Every breath I take fills my body with peace and healing light.",
        "I allow myself to pause, reset, and celebrate how far I have come.",
        "I am in charge of how I feel today, and I choose serenity and peace.",
        "I am gentle with myself as I learn, grow, and heal every day.",
        "My potential to live a meaningful, joyous life is limitless."
    ];

    // Default seed favorites if user has none
    const DEFAULT_FAVORITES = [
        { text: "Peace begins when expectation ends and gratitude begins.", author: "Buddha", category: "peace" },
        { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma", category: "strength" },
        { text: "Talk to yourself like you would to someone you love.", author: "Brené Brown", category: "selflove" }
    ];

    // State
    let currentCategory = "all";
    let currentQuote = QUOTES_DATA[0];
    let currentAffirmationIndex = 0;

    // DOM References
    const quoteTextEl = document.getElementById("quote");
    const quoteAuthorEl = document.getElementById("quoteAuthor");
    const quoteCategoryBadge = document.getElementById("quoteCategoryBadge");
    const newQuoteBtn = document.getElementById("newQuote");
    const favoriteBtn = document.getElementById("favoriteBtn");
    const copyQuoteBtn = document.getElementById("copyQuoteBtn");
    const speakQuoteBtn = document.getElementById("speakQuoteBtn");
    const categoryTabs = document.querySelectorAll(".category-tab-btn");

    const affirmationEl = document.getElementById("affirmation");
    const newAffirmationBtn = document.getElementById("newAffirmationBtn");
    const breatheAffirmationBtn = document.getElementById("breatheAffirmationBtn");

    const favoritesGrid = document.getElementById("favoritesGrid");
    const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");
    const customQuoteForm = document.getElementById("customQuoteForm");

    // ============================================================
    // 2. DISPLAY QUOTE FUNCTION
    // ============================================================
    function displayQuote(quoteObj) {
        currentQuote = quoteObj;

        if (quoteTextEl) {
            quoteTextEl.style.opacity = "0";
            quoteTextEl.style.transform = "translateY(8px)";
        }
        if (quoteAuthorEl) quoteAuthorEl.style.opacity = "0";

        setTimeout(() => {
            if (quoteTextEl) {
                quoteTextEl.textContent = `“${quoteObj.text}”`;
                quoteTextEl.style.opacity = "1";
                quoteTextEl.style.transform = "translateY(0)";
            }
            if (quoteAuthorEl) {
                quoteAuthorEl.textContent = `— ${quoteObj.author || "Unknown"}`;
                quoteAuthorEl.style.opacity = "1";
            }
            if (quoteCategoryBadge) {
                const catName = formatCategoryName(quoteObj.category);
                quoteCategoryBadge.textContent = catName;
            }
            updateFavoriteButtonState();
        }, 200);
    }

    function formatCategoryName(cat) {
        switch (cat) {
            case "peace": return "🌿 Peace & Calm";
            case "strength": return "💪 Strength";
            case "selflove": return "💖 Self-Love";
            case "gratitude": return "✨ Gratitude";
            case "mindfulness": return "🧘 Mindfulness";
            case "personal": return "✍️ Personal Mantra";
            default: return "🌟 Inspiration";
        }
    }

    function getFilteredQuotes() {
        if (currentCategory === "all") return QUOTES_DATA;
        return QUOTES_DATA.filter(q => q.category === currentCategory);
    }

    function getRandomQuote() {
        const pool = getFilteredQuotes();
        if (pool.length === 0) return QUOTES_DATA[0];

        // Pick a quote different from the current one if pool > 1
        let candidate = pool[Math.floor(Math.random() * pool.length)];
        if (pool.length > 1 && candidate.text === currentQuote.text) {
            candidate = pool[Math.floor(Math.random() * pool.length)];
        }
        return candidate;
    }

    // ============================================================
    // 3. CATEGORY TABS
    // ============================================================
    categoryTabs.forEach(tab => {
        tab.addEventListener("click", function () {
            categoryTabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            currentCategory = this.dataset.category || "all";
            displayQuote(getRandomQuote());
        });
    });

    if (newQuoteBtn) {
        newQuoteBtn.addEventListener("click", function () {
            displayQuote(getRandomQuote());
        });
    }

    // ============================================================
    // 4. FAVORITES MANAGEMENT
    // ============================================================
    function getFavorites() {
        try {
            const saved = localStorage.getItem("blissora_favorite_quotes");
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return DEFAULT_FAVORITES;
    }

    function saveFavorites(favs) {
        localStorage.setItem("blissora_favorite_quotes", JSON.stringify(favs));
    }

    function isCurrentQuoteFavorited() {
        const favs = getFavorites();
        return favs.some(f => f.text === currentQuote.text);
    }

    function updateFavoriteButtonState() {
        if (!favoriteBtn) return;
        if (isCurrentQuoteFavorited()) {
            favoriteBtn.innerHTML = "❤️ Favorited";
            favoriteBtn.classList.add("favorited");
        } else {
            favoriteBtn.innerHTML = "🤍 Add to Favorites";
            favoriteBtn.classList.remove("favorited");
        }
    }

    if (favoriteBtn) {
        favoriteBtn.addEventListener("click", function () {
            let favs = getFavorites();
            const index = favs.findIndex(f => f.text === currentQuote.text);

            if (index >= 0) {
                // Remove from favorites
                favs.splice(index, 1);
                saveFavorites(favs);
                updateFavoriteButtonState();
                renderFavorites();
            } else {
                // Add to favorites
                favs.unshift({
                    text: currentQuote.text,
                    author: currentQuote.author,
                    category: currentQuote.category || "inspiration"
                });
                saveFavorites(favs);
                updateFavoriteButtonState();
                renderFavorites();

                // Small heart pulse feedback
                favoriteBtn.style.transform = "scale(1.15)";
                setTimeout(() => favoriteBtn.style.transform = "scale(1)", 200);
            }
        });
    }

    function renderFavorites() {
        if (!favoritesGrid) return;
        const favs = getFavorites();

        favoritesGrid.innerHTML = "";

        if (favs.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="empty-favorites-box" style="grid-column: 1 / -1;">
                    <p>No favorite quotes saved yet. Click "🤍 Add to Favorites" on any quote to keep it here!</p>
                </div>
            `;
            return;
        }

        favs.forEach((fav, i) => {
            const card = document.createElement("div");
            card.className = "favorite-card";
            card.innerHTML = `
                <div>
                    <div style="font-size: 11px; font-weight: bold; color: #2E8B57; text-transform: uppercase; margin-bottom: 6px;">
                        ${formatCategoryName(fav.category)}
                    </div>
                    <div class="favorite-card-text">“${escapeHtml(fav.text)}”</div>
                </div>
                <div class="favorite-card-footer">
                    <span class="favorite-author">— ${escapeHtml(fav.author || "Unknown")}</span>
                    <div class="favorite-actions">
                        <button class="fav-action-btn fav-action-copy" data-text="“${escapeHtml(fav.text)}” — ${escapeHtml(fav.author)}" title="Copy Quote">📋</button>
                        <button class="fav-action-btn fav-action-delete" data-index="${i}" title="Remove from favorites">🗑️</button>
                    </div>
                </div>
            `;
            favoritesGrid.appendChild(card);
        });

        // Bind delete buttons
        document.querySelectorAll(".fav-action-delete").forEach(btn => {
            btn.addEventListener("click", function () {
                const idx = parseInt(this.dataset.index, 10);
                let currentFavs = getFavorites();
                currentFavs.splice(idx, 1);
                saveFavorites(currentFavs);
                updateFavoriteButtonState();
                renderFavorites();
            });
        });

        // Bind copy buttons
        document.querySelectorAll(".fav-action-copy").forEach(btn => {
            btn.addEventListener("click", function () {
                const text = this.getAttribute("data-text");
                copyToClipboard(text, this);
            });
        });
    }

    if (clearFavoritesBtn) {
        clearFavoritesBtn.addEventListener("click", function () {
            if (confirm("Are you sure you want to clear your saved favorite quotes?")) {
                saveFavorites([]);
                updateFavoriteButtonState();
                renderFavorites();
            }
        });
    }

    // ============================================================
    // 5. COPY & TEXT-TO-SPEECH
    // ============================================================
    function copyToClipboard(text, buttonEl) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                const orig = buttonEl.innerHTML;
                buttonEl.innerHTML = "✅ Copied!";
                setTimeout(() => buttonEl.innerHTML = orig, 1800);
            });
        } else {
            alert("Quote copied to clipboard!");
        }
    }

    if (copyQuoteBtn) {
        copyQuoteBtn.addEventListener("click", function () {
            const formatted = `“${currentQuote.text}” — ${currentQuote.author}`;
            copyToClipboard(formatted, this);
        });
    }

    if (speakQuoteBtn) {
        speakQuoteBtn.addEventListener("click", function () {
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel(); // Stop any previous speech
                const utterance = new SpeechSynthesisUtterance(`${currentQuote.text}. By ${currentQuote.author}`);
                utterance.rate = 0.9; // Calm, meditative tempo
                utterance.pitch = 1.0;
                window.speechSynthesis.speak(utterance);

                speakQuoteBtn.innerHTML = "🔊 Speaking...";
                utterance.onend = () => speakQuoteBtn.innerHTML = "🔊 Listen";
                utterance.onerror = () => speakQuoteBtn.innerHTML = "🔊 Listen";
            } else {
                alert("Text-to-speech is not supported by your browser.");
            }
        });
    }

    // ============================================================
    // 6. POSITIVE AFFIRMATION GENERATOR
    // ============================================================
    function displayAffirmation(text) {
        if (affirmationEl) {
            affirmationEl.style.opacity = "0";
            setTimeout(() => {
                affirmationEl.textContent = `“${text}”`;
                affirmationEl.style.opacity = "1";
            }, 200);
        }
    }

    if (newAffirmationBtn) {
        newAffirmationBtn.addEventListener("click", function () {
            currentAffirmationIndex = (currentAffirmationIndex + 1) % AFFIRMATIONS_DATA.length;
            displayAffirmation(AFFIRMATIONS_DATA[currentAffirmationIndex]);
        });
    }

    if (breatheAffirmationBtn) {
        breatheAffirmationBtn.addEventListener("click", function () {
            breatheAffirmationBtn.disabled = true;
            breatheAffirmationBtn.textContent = "🌬️ Inhale peace (4s)...";

            setTimeout(() => {
                breatheAffirmationBtn.textContent = "⏸️ Hold & feel the affirmation (4s)...";
            }, 4000);

            setTimeout(() => {
                breatheAffirmationBtn.textContent = "🌫️ Exhale tension (4s)...";
            }, 8000);

            setTimeout(() => {
                breatheAffirmationBtn.textContent = "✨ Centered & Peaceful";
                setTimeout(() => {
                    breatheAffirmationBtn.disabled = false;
                    breatheAffirmationBtn.textContent = "🌬️ Breathe & Absorb";
                }, 2000);
            }, 12000);
        });
    }

    // ============================================================
    // 7. USER CUSTOM QUOTE SUBMISSION
    // ============================================================
    if (customQuoteForm) {
        customQuoteForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const textInput = document.getElementById("customQuoteText");
            const authorInput = document.getElementById("customQuoteAuthor");

            const text = textInput ? textInput.value.trim() : "";
            const author = authorInput && authorInput.value.trim() ? authorInput.value.trim() : "Me";

            if (!text) {
                alert("Please write your quote or affirmation first!");
                return;
            }

            let favs = getFavorites();
            favs.unshift({
                text: text,
                author: author,
                category: "personal"
            });
            saveFavorites(favs);

            textInput.value = "";
            if (authorInput) authorInput.value = "";

            renderFavorites();
            alert("✨ Your personal quote has been added to your Favorites collection!");
        });
    }

    // Helper to escape HTML
    function escapeHtml(str) {
        if (!str) return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initial Setup
    displayQuote(QUOTES_DATA[0]);
    displayAffirmation(AFFIRMATIONS_DATA[0]);
    renderFavorites();
});

