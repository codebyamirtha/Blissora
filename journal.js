/* ============================================================
   BLISSORA — JOURNAL JAVASCRIPT ENGINE
   Manages all interactive options on the Journal page.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // --- DOM Elements ---
    const journalForm = document.getElementById("journalForm");
    const journalDate = document.getElementById("journalDate");
    const journalTitle = document.getElementById("journalTitle");
    const journalText = document.getElementById("journalText");
    const selectedMoodTag = document.getElementById("selectedMoodTag");
    const moodTagButtons = document.querySelectorAll(".mood-tag-btn");
    const wordCountDisplay = document.getElementById("wordCountDisplay");
    const saveJournalBtn = document.getElementById("saveJournalBtn");
    const clearFormBtn = document.getElementById("clearFormBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const editIndexInput = document.getElementById("editIndex");

    const entriesContainer = document.getElementById("entries");
    const entriesCountEl = document.getElementById("entriesCount");
    const searchInput = document.getElementById("journalSearchInput");
    const exportBtn = document.getElementById("exportJournalBtn");
    const clearAllBtn = document.getElementById("clearAllEntriesBtn");

    const promptCards = document.querySelectorAll(".prompt-card");
    const randomPromptBtn = document.getElementById("randomPromptBtn");

    const gratitudeInput = document.getElementById("gratitudeInput");
    const saveGratitudeBtn = document.getElementById("saveGratitudeBtn");
    const gratitudeList = document.getElementById("gratitudeList");

    // ============================================================
    // 1. INITIALIZE TODAY'S DATE
    // ============================================================
    function setTodayDate() {
        if (journalDate && !journalDate.value) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, "0");
            const dd = String(today.getDate()).padStart(2, "0");
            journalDate.value = `${yyyy}-${mm}-${dd}`;
        }
    }
    setTodayDate();

    // ============================================================
    // 2. MOOD TAG SELECTION
    // ============================================================
    moodTagButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            moodTagButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            if (selectedMoodTag) {
                selectedMoodTag.value = this.dataset.mood;
            }
        });
    });

    // ============================================================
    // 3. WORD & CHARACTER COUNTER
    // ============================================================
    function updateWordCount() {
        if (!journalText || !wordCountDisplay) return;
        const text = journalText.value.trim();
        const chars = journalText.value.length;
        const words = text ? text.split(/\s+/).length : 0;
        wordCountDisplay.textContent = `${words} word${words === 1 ? "" : "s"} | ${chars} character${chars === 1 ? "" : "s"}`;
    }

    if (journalText) {
        journalText.addEventListener("input", updateWordCount);
    }

    // ============================================================
    // 4. SAVE OR UPDATE JOURNAL ENTRY
    // ============================================================
    if (journalForm) {
        journalForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const date = journalDate.value;
            const title = journalTitle.value.trim();
            const text = journalText.value.trim();
            const mood = selectedMoodTag ? selectedMoodTag.value : "😌 Calm";
            const editIndex = parseInt(editIndexInput.value, 10);

            if (!date || !title || !text) {
                alert("Please fill in the date, title, and your thoughts.");
                return;
            }

            let entries = [];
            try {
                entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
            } catch (err) {
                entries = [];
            }

            const now = new Date();
            const timeStr = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

            if (editIndex >= 0 && editIndex < entries.length) {
                // Update existing entry
                entries[editIndex].date = date;
                entries[editIndex].title = title;
                entries[editIndex].text = text;
                entries[editIndex].mood = mood;
                entries[editIndex].updatedAt = timeStr;
                alert("✨ Journal entry updated successfully!");
                resetForm();
            } else {
                // Add new entry
                const newEntry = {
                    id: Date.now(),
                    date: date,
                    time: timeStr,
                    title: title,
                    text: text,
                    mood: mood
                };
                entries.unshift(newEntry);
                alert("✨ Journal entry saved to your personal journal!");
                resetForm();
            }

            localStorage.setItem("journalEntries", JSON.stringify(entries));
            loadEntries();
        });
    }

    // ============================================================
    // 5. FORM RESET & CANCEL EDIT
    // ============================================================
    function resetForm() {
        if (journalForm) journalForm.reset();
        editIndexInput.value = "-1";
        saveJournalBtn.innerHTML = "💾 Save Journal Entry";
        if (cancelEditBtn) cancelEditBtn.style.display = "none";

        // Reset mood tag to Calm
        moodTagButtons.forEach(b => {
            if (b.dataset.mood === "😌 Calm") b.classList.add("active");
            else b.classList.remove("active");
        });
        if (selectedMoodTag) selectedMoodTag.value = "😌 Calm";

        setTodayDate();
        updateWordCount();
    }

    if (clearFormBtn) {
        clearFormBtn.addEventListener("click", resetForm);
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener("click", resetForm);
    }

    // ============================================================
    // 6. LOAD & DISPLAY ENTRIES (WITH SEARCH & FILTER)
    // ============================================================
    function loadEntries() {
        if (!entriesContainer) return;

        let entries = [];
        try {
            entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
        } catch (e) {
            entries = [];
        }

        // Update count
        if (entriesCountEl) {
            entriesCountEl.textContent = entries.length;
        }

        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

        // Filter if query exists
        const filteredEntries = query
            ? entries.filter(e =>
                (e.title && e.title.toLowerCase().includes(query)) ||
                (e.text && e.text.toLowerCase().includes(query)) ||
                (e.mood && e.mood.toLowerCase().includes(query)) ||
                (e.date && e.date.includes(query))
            )
            : entries;

        entriesContainer.innerHTML = "";

        if (entries.length === 0) {
            entriesContainer.innerHTML = `
                <div class="empty-entries-box">
                    <h3>No journal entries saved yet.</h3>
                    <p>Take a deep breath and write your first reflection above!</p>
                </div>
            `;
            return;
        }

        if (filteredEntries.length === 0) {
            entriesContainer.innerHTML = `
                <div class="empty-entries-box">
                    <h3>No matching entries found for "${query}".</h3>
                    <p>Try searching for a different keyword or clear the search bar.</p>
                </div>
            `;
            return;
        }

        filteredEntries.forEach(function (entry) {
            // Find real index in original entries array for edit/delete
            const realIndex = entries.findIndex(e => e.id === entry.id || (e.title === entry.title && e.date === entry.date && e.text === entry.text));

            const card = document.createElement("div");
            card.className = "entry-card";

            card.innerHTML = `
                <div class="entry-card-header">
                    <div>
                        <h3 class="entry-title">${escapeHtml(entry.title || "Untitled Entry")}</h3>
                    </div>
                    <div class="entry-meta">
                        <span class="entry-mood-badge">${escapeHtml(entry.mood || "😌 Calm")}</span>
                        <span>📅 ${entry.date} ${entry.time ? `(${entry.time})` : ""}</span>
                    </div>
                </div>
                <div class="entry-body">${escapeHtml(entry.text)}</div>
                <div class="entry-actions">
                    <button class="entry-action-btn edit-btn" data-index="${realIndex}">✏️ Edit</button>
                    <button class="entry-action-btn copy-btn" data-text="${escapeHtml(entry.title + "\n\n" + entry.text)}">📋 Copy</button>
                    <button class="entry-action-btn delete-btn" data-index="${realIndex}">🗑️ Delete</button>
                </div>
            `;

            entriesContainer.appendChild(card);
        });

        // Bind Edit buttons
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const idx = parseInt(this.dataset.index, 10);
                editEntry(idx);
            });
        });

        // Bind Delete buttons
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const idx = parseInt(this.dataset.index, 10);
                deleteEntry(idx);
            });
        });

        // Bind Copy buttons
        document.querySelectorAll(".copy-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const text = this.getAttribute("data-text");
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(() => {
                        this.textContent = "✅ Copied!";
                        setTimeout(() => this.textContent = "📋 Copy", 2000);
                    });
                } else {
                    alert("Entry text copied!");
                }
            });
        });
    }

    // Helper to escape HTML to prevent XSS
    function escapeHtml(str) {
        if (!str) return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ============================================================
    // 7. EDIT ENTRY
    // ============================================================
    function editEntry(index) {
        let entries = [];
        try {
            entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
        } catch (e) { }

        if (index < 0 || index >= entries.length) return;

        const entry = entries[index];
        journalDate.value = entry.date;
        journalTitle.value = entry.title || "";
        journalText.value = entry.text || "";
        editIndexInput.value = index;

        // Set mood
        if (entry.mood) {
            moodTagButtons.forEach(b => {
                if (b.dataset.mood === entry.mood) b.classList.add("active");
                else b.classList.remove("active");
            });
            if (selectedMoodTag) selectedMoodTag.value = entry.mood;
        }

        saveJournalBtn.innerHTML = "💾 Update Entry";
        if (cancelEditBtn) cancelEditBtn.style.display = "inline-block";
        updateWordCount();

        // Scroll to form
        journalForm.scrollIntoView({ behavior: "smooth" });
        journalText.focus();
    }

    // ============================================================
    // 8. DELETE ENTRY
    // ============================================================
    function deleteEntry(index) {
        if (!confirm("Are you sure you want to delete this journal entry?")) return;

        let entries = [];
        try {
            entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
        } catch (e) { }

        entries.splice(index, 1);
        localStorage.setItem("journalEntries", JSON.stringify(entries));

        // If currently editing this entry, reset form
        if (parseInt(editIndexInput.value, 10) === index) {
            resetForm();
        }

        loadEntries();
    }

    // ============================================================
    // 9. SEARCH / FILTER LISTENER
    // ============================================================
    if (searchInput) {
        searchInput.addEventListener("input", loadEntries);
    }

    // ============================================================
    // 10. EXPORT JOURNAL AS TEXT FILE
    // ============================================================
    if (exportBtn) {
        exportBtn.addEventListener("click", function () {
            let entries = [];
            try {
                entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
            } catch (e) { }

            if (entries.length === 0) {
                alert("No journal entries to export yet!");
                return;
            }

            let fileContent = `=========================================\n`;
            fileContent += `       BLISSORA PERSONAL JOURNAL\n`;
            fileContent += `       Exported on: ${new Date().toLocaleString()}\n`;
            fileContent += `=========================================\n\n`;

            entries.forEach((e, i) => {
                fileContent += `-----------------------------------------\n`;
                fileContent += `ENTRY #${i + 1}: ${e.title || "Untitled"}\n`;
                fileContent += `DATE: ${e.date} ${e.time ? `(${e.time})` : ""}\n`;
                fileContent += `MOOD: ${e.mood || "Calm"}\n`;
                fileContent += `-----------------------------------------\n`;
                fileContent += `${e.text}\n\n`;
            });

            const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Blissora_Journal_Export_${new Date().toISOString().slice(0, 10)}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // ============================================================
    // 11. CLEAR ALL ENTRIES
    // ============================================================
    if (clearAllBtn) {
        clearAllBtn.addEventListener("click", function () {
            let entries = [];
            try {
                entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
            } catch (e) { }

            if (entries.length === 0) {
                alert("Your journal is already empty.");
                return;
            }

            if (confirm(`Are you sure you want to delete all ${entries.length} journal entries? This action cannot be undone.`)) {
                localStorage.removeItem("journalEntries");
                resetForm();
                loadEntries();
                alert("All journal entries have been cleared.");
            }
        });
    }

    // ============================================================
    // 12. INTERACTIVE WRITING PROMPTS
    // ============================================================
    function applyPrompt(promptText) {
        if (journalTitle) {
            journalTitle.value = promptText;
        }
        if (journalForm) {
            journalForm.scrollIntoView({ behavior: "smooth" });
        }
        if (journalText) {
            journalText.focus();
        }
    }

    promptCards.forEach(card => {
        card.addEventListener("click", function () {
            const prompt = this.dataset.prompt;
            if (prompt) applyPrompt(prompt);
        });
    });

    if (randomPromptBtn) {
        randomPromptBtn.addEventListener("click", function () {
            if (promptCards.length === 0) return;
            const randIdx = Math.floor(Math.random() * promptCards.length);
            const chosenCard = promptCards[randIdx];
            const prompt = chosenCard.dataset.prompt;
            chosenCard.style.borderColor = "#2E8B57";
            setTimeout(() => chosenCard.style.borderColor = "#e0e0e0", 1500);
            applyPrompt(prompt);
        });
    }

    // ============================================================
    // 13. TODAY'S GRATITUDE WALL
    // ============================================================
    function renderGratitudeList() {
        if (!gratitudeList) return;
        let list = [];
        try {
            list = JSON.parse(localStorage.getItem("blissora_gratitude_list")) || [];
        } catch (e) {
            list = [];
        }

        gratitudeList.innerHTML = "";

        if (list.length === 0) {
            gratitudeList.innerHTML = `<div style="text-align: center; color: #888; font-size: 13px; padding: 15px;">No gratitude notes saved yet. Write what you are thankful for above!</div>`;
            return;
        }

        list.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "gratitude-item";
            div.innerHTML = `
                <div>
                    <div class="gratitude-text">💖 ${escapeHtml(item.text)}</div>
                    <div class="gratitude-date">${item.date}</div>
                </div>
                <button class="gratitude-delete" data-index="${index}" title="Delete note">✕</button>
            `;
            gratitudeList.appendChild(div);
        });

        document.querySelectorAll(".gratitude-delete").forEach(btn => {
            btn.addEventListener("click", function () {
                const idx = parseInt(this.dataset.index, 10);
                deleteGratitude(idx);
            });
        });
    }

    function deleteGratitude(index) {
        let list = [];
        try {
            list = JSON.parse(localStorage.getItem("blissora_gratitude_list")) || [];
        } catch (e) { }

        list.splice(index, 1);
        localStorage.setItem("blissora_gratitude_list", JSON.stringify(list));
        renderGratitudeList();
    }

    if (saveGratitudeBtn && gratitudeInput) {
        saveGratitudeBtn.addEventListener("click", function () {
            const text = gratitudeInput.value.trim();
            if (!text) {
                alert("Please write something you are thankful for first!");
                return;
            }

            const now = new Date();
            const dateStr = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

            let list = [];
            try {
                list = JSON.parse(localStorage.getItem("blissora_gratitude_list")) || [];
            } catch (e) {
                list = [];
            }

            list.unshift({
                id: Date.now(),
                text: text,
                date: dateStr
            });

            localStorage.setItem("blissora_gratitude_list", JSON.stringify(list));
            gratitudeInput.value = "";
            renderGratitudeList();
            alert("🙏 Gratitude saved to your wall! Thankfulness is the key to inner peace.");
        });
    }

    // Initial load
    loadEntries();
    renderGratitudeList();
});
