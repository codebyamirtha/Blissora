/* ============================================================
   BLISSORA — MOOD TRACKER JAVASCRIPT ENGINE
   Controls all interactive options on the Mood Tracker page.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // --- State Variables ---
    let selectedMood = null; // { name: string, emoji: string }
    let energyLevel = 50;

    // Recommendations Database
    const TIPS = [
        "🚶 Take a 10-minute walk outside and let natural sunlight gently reset your circadian rhythm.",
        "🌬️ Practice the 4-7-8 breathing technique: Inhale for 4s, hold for 7s, and exhale slowly for 8s.",
        "💧 Drink a tall glass of cool water and do 3 slow shoulder rolls backward.",
        "📝 Write down three small things you felt grateful for today in your journal.",
        "🎵 Put on relaxing rain or ocean sounds and close your eyes for 3 uninterrupted minutes.",
        "☕ Brew a warm cup of herbal chamomile or green tea and enjoy each sip mindfully.",
        "🌿 Unclench your jaw, relax your eyebrows, and let your shoulders drop.",
        "🧘 Take five slow belly breaths, placing one hand on your chest and one on your abdomen.",
        "📵 Give yourself 20 minutes of digital downtime away from all screens and notifications.",
        "💖 Speak to yourself with the same kindness and compassion you would offer a best friend."
    ];
    let currentTipIndex = 0;

    // Weather Advice Database
    const WEATHER_DATA = {
        sunny: {
            title: "☀️ Sunny Day Advice",
            text: "Go outside and soak in the natural sunlight! Sunlight naturally boosts serotonin and vitamin D, instantly brightening your outlook."
        },
        rainy: {
            title: "🌧️ Rainy Day Advice",
            text: "Embrace the soothing atmosphere. Wrap yourself in a cozy blanket, listen to the gentle patter of raindrops, and enjoy warm herbal tea."
        },
        cloudy: {
            title: "⛅ Cloudy Day Advice",
            text: "Overcast skies bring gentle, soft light — perfect for mindful journaling, stretching, or reading an inspiring chapter of a book."
        },
        cold: {
            title: "❄️ Chilly Day Advice",
            text: "Keep your body warm and grounded. Sip warm broth or tea, do light indoor yoga, and practice deep, warming belly breaths."
        },
        night: {
            title: "🌙 Peaceful Evening Advice",
            text: "Dim bright overhead lights, put phones away 30 minutes before sleep, and listen to calming Zen meditation chords for restful slumber."
        }
    };

    // ============================================================
    // 1. PRIMARY MOOD CARDS SELECTION
    // ============================================================
    const moodCards = document.querySelectorAll(".mood-card");

    moodCards.forEach(function (card) {
        card.addEventListener("click", function () {
            // Remove previous selection
            moodCards.forEach(item => item.classList.remove("selected"));

            // Mark clicked card
            this.classList.add("selected");

            const moodName = this.dataset.mood;
            const moodEmoji = this.dataset.emoji;

            selectedMood = {
                name: moodName,
                emoji: moodEmoji
            };

            // Sync with quick emoji picker if matching
            syncEmojiPicker(moodEmoji);

            // Update live helper message
            const statusMsg = document.getElementById("emojiStatusMsg");
            if (statusMsg) {
                statusMsg.textContent = `Selected: ${moodEmoji} ${moodName} — Click "Save Today's Mood" below to record it!`;
                statusMsg.style.color = "#2E8B57";
            }
        });
    });

    // ============================================================
    // 2. QUICK EMOJI PICKER
    // ============================================================
    const emojiButtons = document.querySelectorAll(".emoji-btn");

    emojiButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            emojiButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            const moodName = this.dataset.mood;
            const moodEmoji = this.dataset.emoji;

            selectedMood = {
                name: moodName,
                emoji: moodEmoji
            };

            // Highlight matching primary card if present
            moodCards.forEach(card => {
                if (card.dataset.mood && card.dataset.mood.toLowerCase() === moodName.toLowerCase()) {
                    card.classList.add("selected");
                } else {
                    card.classList.remove("selected");
                }
            });

            // Update status text
            const statusMsg = document.getElementById("emojiStatusMsg");
            if (statusMsg) {
                statusMsg.textContent = `Selected: ${moodEmoji} ${moodName} — Ready to save or analyze below!`;
                statusMsg.style.color = "#2E8B57";
            }
        });
    });

    function syncEmojiPicker(emoji) {
        emojiButtons.forEach(btn => {
            if (btn.dataset.emoji === emoji) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    }

    // ============================================================
    // 3. SAVE MOOD FUNCTIONALITY
    // ============================================================
    const saveButton = document.getElementById("saveMood");

    if (saveButton) {
        saveButton.addEventListener("click", function () {
            if (!selectedMood) {
                alert("Please click one of the mood cards or emojis above first!");
                return;
            }

            const now = new Date();
            const dateStr = now.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            const timeStr = now.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
            });
            const timestamp = `${dateStr} at ${timeStr}`;

            const moodEntry = {
                mood: selectedMood.name,
                emoji: selectedMood.emoji,
                energy: energyLevel,
                timestamp: timestamp,
                rawDate: now.toISOString()
            };

            // Save current today mood
            localStorage.setItem("todayMood", JSON.stringify(moodEntry));

            // Append to mood history
            let history = [];
            try {
                const storedHistory = localStorage.getItem("blissora_mood_history");
                if (storedHistory) {
                    history = JSON.parse(storedHistory);
                }
            } catch (e) {
                history = [];
            }
            // Add to beginning of array
            history.unshift(moodEntry);
            // Keep recent 30 entries
            if (history.length > 30) history = history.slice(0, 30);
            localStorage.setItem("blissora_mood_history", JSON.stringify(history));

            // Refresh UI
            displaySavedMood();
            renderMoodHistory();

            // Friendly alert / feedback
            alert(`✨ Mood Saved: ${selectedMood.emoji} ${selectedMood.name} with ${energyLevel}% energy on ${timestamp}. Great job checking in with yourself!`);
        });
    }

    // ============================================================
    // 4. DISPLAY SAVED MOOD
    // ============================================================
    function displaySavedMood() {
        const textEl = document.getElementById("savedMoodText");
        const timeEl = document.getElementById("savedMoodTimestamp");

        const savedData = localStorage.getItem("todayMood");
        if (savedData) {
            try {
                const entry = JSON.parse(savedData);
                if (textEl) {
                    textEl.innerHTML = `<strong>${entry.emoji} ${entry.mood}</strong> &bull; Energy Level: <strong>${entry.energy}%</strong>`;
                }
                if (timeEl) {
                    timeEl.textContent = `Recorded on ${entry.timestamp}`;
                }

                // Pre-select corresponding card
                moodCards.forEach(card => {
                    if (card.dataset.mood && card.dataset.mood.toLowerCase() === entry.mood.toLowerCase()) {
                        card.classList.add("selected");
                        selectedMood = { name: entry.mood, emoji: entry.emoji };
                    }
                });
                syncEmojiPicker(entry.emoji);
            } catch (e) {
                // If stored as legacy string
                if (textEl) textEl.textContent = `😊 Today's Mood: ${savedData}`;
            }
        }
    }

    // ============================================================
    // 5. STRESS & MOOD ENERGY SLIDER & ANALYZER
    // ============================================================
    const moodRange = document.getElementById("moodRange");
    const rangeValue = document.getElementById("rangeValue");
    const resultBox = document.getElementById("result");

    function getEnergyStatus(val) {
        if (val <= 25) {
            return {
                label: `${val}% - Low Energy / Need Rest`,
                color: "#e53e3e",
                category: "low",
                desc: "Your energy battery is running low. This is a gentle reminder from your body to slow down, rest, and recharge."
            };
        } else if (val <= 50) {
            return {
                label: `${val}% - Mild Energy / Recharging`,
                color: "#dd6b20",
                category: "mild",
                desc: "You have moderate energy. Don't push yourself too hard today — balance work with small, rejuvenating breaks."
            };
        } else if (val <= 75) {
            return {
                label: `${val}% - Balanced & Calm`,
                color: "#2E8B57",
                category: "balanced",
                desc: "You are in a peaceful, balanced state! Steady focus and a calm mindset will make today feel smooth and grounded."
            };
        } else {
            return {
                label: `${val}% - Vibrant Energy & High Motivation`,
                color: "#319795",
                category: "high",
                desc: "You are bursting with positive energy! Harness this momentum for your favorite hobbies, creative ideas, or physical activity."
            };
        }
    }

    if (moodRange && rangeValue) {
        moodRange.addEventListener("input", function () {
            energyLevel = parseInt(this.value, 10);
            const status = getEnergyStatus(energyLevel);
            rangeValue.textContent = status.label;
            rangeValue.style.color = status.color;
        });
    }

    // Make checkMood global so inline onclick="checkMood()" works seamlessly
    window.checkMood = function () {
        if (!resultBox) return;

        const val = moodRange ? parseInt(moodRange.value, 10) : 50;
        const status = getEnergyStatus(val);
        const currentMoodName = selectedMood ? selectedMood.name : "Unspecified";
        const currentMoodEmoji = selectedMood ? selectedMood.emoji : "🌈";

        let moodRecommendation = "";
        if (selectedMood) {
            const m = selectedMood.name.toLowerCase();
            if (m.includes("happy") || m.includes("excited") || m.includes("ecstatic")) {
                moodRecommendation = "Your positive mood is a wonderful gift. Take a moment to write down what brought you this joy in your journal!";
            } else if (m.includes("calm") || m.includes("peace")) {
                moodRecommendation = "Maintain this inner sanctuary of peace. A short 5-minute meditation will anchor this serenity for the rest of your day.";
            } else if (m.includes("sad") || m.includes("tearful")) {
                moodRecommendation = "It is completely okay to feel sad. Be gentle with yourself, drink a warm cup of tea, and listen to soothing rain sounds.";
            } else if (m.includes("stressed") || m.includes("frustrated") || m.includes("angry")) {
                moodRecommendation = "Release the tension stored in your body. Try 4-7-8 breathing and step outside for 5 minutes of fresh air.";
            } else if (m.includes("tired")) {
                moodRecommendation = "Your mind and muscles need gentle care. Avoid bright screens this evening and aim for an earlier bedtime.";
            } else {
                moodRecommendation = "Take deep conscious breaths and listen to what your body is asking for right now.";
            }
        } else {
            moodRecommendation = "Tip: Click a mood card above for an even more personalized emotional analysis!";
        }

        resultBox.style.display = "block";
        resultBox.innerHTML = `
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px; color: ${status.color};">
                ${currentMoodEmoji} Mood Check: ${currentMoodName} &bull; ${status.label}
            </div>
            <p style="margin: 8px 0; font-size: 15px;">${status.desc}</p>
            <p style="margin: 8px 0; font-weight: 500; color: #166534; background: #e8f5e9; padding: 10px; border-radius: 8px;">
                💡 <strong>Personalized Recommendation:</strong> ${moodRecommendation}
            </p>
        `;

        resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    // ============================================================
    // 6. RECOMMENDATIONS "NEXT TIP" BUTTON
    // ============================================================
    const nextTipBtn = document.getElementById("nextTipBtn");
    const recommendText = document.getElementById("recommendText");
    const tipCounter = document.getElementById("tipCounter");

    if (nextTipBtn && recommendText) {
        nextTipBtn.addEventListener("click", function () {
            currentTipIndex = (currentTipIndex + 1) % TIPS.length;
            recommendText.style.opacity = "0";

            setTimeout(() => {
                recommendText.textContent = TIPS[currentTipIndex];
                if (tipCounter) {
                    tipCounter.textContent = `Tip ${currentTipIndex + 1} of ${TIPS.length}`;
                }
                recommendText.style.opacity = "1";
            }, 200);
        });
    }

    // ============================================================
    // 7. WEATHER MOOD ADVICE TABS
    // ============================================================
    const weatherTabs = document.querySelectorAll(".weather-tab-btn");
    const weatherTitle = document.getElementById("weatherTitle");
    const weatherAdvice = document.getElementById("weatherAdvice");

    weatherTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            weatherTabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");

            const weatherType = this.dataset.weather;
            const data = WEATHER_DATA[weatherType];
            if (data && weatherTitle && weatherAdvice) {
                weatherTitle.textContent = data.title;
                weatherAdvice.textContent = data.text;
            }
        });
    });

    // ============================================================
    // 8. MOOD HISTORY LOG & CLEAR
    // ============================================================
    const historyList = document.getElementById("historyList");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");

    function renderMoodHistory() {
        if (!historyList) return;

        let history = [];
        try {
            const stored = localStorage.getItem("blissora_mood_history");
            if (stored) history = JSON.parse(stored);
        } catch (e) {
            history = [];
        }

        if (!Array.isArray(history) || history.length === 0) {
            historyList.innerHTML = `<div class="empty-history-text">No previous mood logs yet. Track your mood above to begin!</div>`;
            return;
        }

        let html = "";
        history.forEach(item => {
            html += `
                <div class="history-item">
                    <div class="history-item-left">
                        <span class="history-emoji">${item.emoji || "😊"}</span>
                        <div>
                            <span class="history-mood-name">${item.mood}</span>
                        </div>
                    </div>
                    <div class="history-item-right">
                        <span class="history-energy-badge">${item.energy !== undefined ? item.energy + '% Energy' : 'Logged'}</span>
                        <span>${item.timestamp}</span>
                    </div>
                </div>
            `;
        });
        historyList.innerHTML = html;
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener("click", function () {
            if (confirm("Are you sure you want to clear your mood check-in history?")) {
                localStorage.removeItem("blissora_mood_history");
                renderMoodHistory();
                alert("Mood history cleared successfully.");
            }
        });
    }

    // ============================================================
    // 9. RELAXING MUSIC PLAYBACK SYNC
    // ============================================================
    const musicAudioElements = document.querySelectorAll(".music-card audio");

    musicAudioElements.forEach(function (audio) {
        audio.addEventListener("play", function () {
            // When one track plays, pause all other cards
            musicAudioElements.forEach(function (otherAudio) {
                if (otherAudio !== audio) {
                    otherAudio.pause();
                }
            });
        });
    });

    // Initial load
    displaySavedMood();
    renderMoodHistory();
});
