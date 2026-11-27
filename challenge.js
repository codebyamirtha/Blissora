/* ============================================================
   BLISSORA — DAILY CHALLENGE & ACHIEVEMENTS JAVASCRIPT ENGINE
   Controls Daily Challenges, Checklists, Badges, and Streaks
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // ============================================================
    // 1. CHALLENGE DATABASE
    // ============================================================
    const CHALLENGES_POOL = [
        {
            id: "nature-1",
            title: "🌿 Spend 10 Minutes in Nature",
            desc: "Step outside into the fresh air, observe the trees or sky, and disconnect from indoor stress.",
            category: "nature",
            badgeKey: "nature"
        },
        {
            id: "nature-2",
            title: "🚶 Mindful 15-Minute Walk",
            desc: "Go for a brisk walk around your neighborhood or park without checking your mobile phone.",
            category: "nature",
            badgeKey: "nature"
        },
        {
            id: "mind-1",
            title: "🧘 Practice 5 Minutes of Deep Breathing",
            desc: "Sit quietly, close your eyes, and follow the 4-4-4-4 box breathing technique to calm your pulse.",
            category: "mind",
            badgeKey: "mind"
        },
        {
            id: "mind-2",
            title: "📝 Write Down 3 Things You Love About Yourself",
            desc: "Open your journal and write down three qualities, talents, or efforts you appreciate about yourself.",
            category: "mind",
            badgeKey: "mind"
        },
        {
            id: "health-1",
            title: "💧 Drink 8 Glasses of Fresh Water",
            desc: "Hydrate your body consistently throughout the day to elevate mental alertness and physical energy.",
            category: "health",
            badgeKey: "water"
        },
        {
            id: "health-2",
            title: "🥗 Enjoy a Fresh Fruit or Green Salad",
            desc: "Nourish your mind and body with a wholesome, vitamin-rich meal or refreshing healthy snack.",
            category: "health",
            badgeKey: "health"
        },
        {
            id: "detox-1",
            title: "📵 Spend 1 Hour Screen-Free",
            desc: "Put away phones, tablets, and computers for 60 consecutive minutes to restore your focus.",
            category: "detox",
            badgeKey: "detox"
        },
        {
            id: "kind-1",
            title: "😊 Send a Kind Message to a Friend or Family",
            desc: "Reach out to someone you care about and let them know you appreciate them in your life.",
            category: "kindness",
            badgeKey: "kind"
        },
        {
            id: "kind-2",
            title: "💖 Practice 5 Minutes of Loving-Kindness",
            desc: "Mentally send genuine wishes of health, safety, and happiness to everyone you interact with today.",
            category: "kindness",
            badgeKey: "kind"
        }
    ];

    // Built-in Weekly Tasks
    const DEFAULT_WEEKLY_TASKS = [
        { id: "w1", text: "💧 Drink 8 glasses of fresh water", completed: false, badgeKey: "water" },
        { id: "w2", text: "📖 Read an inspiring book for 20 minutes", completed: false },
        { id: "w3", text: "🚶 Walk 5,000 mindful steps", completed: false },
        { id: "w4", text: "🧘 Meditate for at least 10 minutes", completed: false, badgeKey: "mind" },
        { id: "w5", text: "😊 Smile or say hello to 5 people today", completed: false, badgeKey: "kind" },
        { id: "w6", text: "📵 Stay away from screens for 1 full hour", completed: false, badgeKey: "detox" },
        { id: "w7", text: "🎵 Listen to relaxing music soundscapes", completed: false }
    ];

    // State
    let currentCategory = "all";
    let currentChallengeIndex = 0;

    // DOM Elements
    const challengeTagEl = document.getElementById("challengeTagBadge");
    const challengeTitleEl = document.getElementById("challengeTitle");
    const challengeDescEl = document.getElementById("challengeDesc");
    const completeChallengeBtn = document.getElementById("completeChallenge");
    const randomChallengeBtn = document.getElementById("randomChallengeBtn");
    const celebrationBox = document.getElementById("celebrationBox");
    const categoryTabs = document.querySelectorAll(".challenge-tab-btn");

    const statStreakEl = document.getElementById("statStreak");
    const statTotalEl = document.getElementById("statTotal");
    const statBadgesEl = document.getElementById("statBadges");

    const progressFill = document.getElementById("checklistProgressFill");
    const progressText = document.getElementById("checklistProgressText");
    const checklistContainer = document.getElementById("checklistItems");
    const customGoalForm = document.getElementById("customGoalForm");
    const customGoalInput = document.getElementById("customGoalInput");
    const resetWeekBtn = document.getElementById("resetWeekBtn");

    // Badges Elements
    const badgeCards = document.querySelectorAll(".badge-card");

    // ============================================================
    // 2. DATA PERSISTENCE HELPERS
    // ============================================================
    function getTodayKey() {
        return "blissora_challenge_done_" + new Date().toISOString().slice(0, 10);
    }

    function getStats() {
        try {
            const saved = localStorage.getItem("blissora_challenge_stats");
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return { streak: 1, total: 0, lastDate: null, unlockedBadges: [] };
    }

    function saveStats(stats) {
        localStorage.setItem("blissora_challenge_stats", JSON.stringify(stats));
    }

    function getWeeklyTasks() {
        try {
            const saved = localStorage.getItem("blissora_weekly_checklist");
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return DEFAULT_WEEKLY_TASKS;
    }

    function saveWeeklyTasks(tasks) {
        localStorage.setItem("blissora_weekly_checklist", JSON.stringify(tasks));
    }

    // ============================================================
    // 3. DAILY CHALLENGE SELECTION & DISPLAY
    // ============================================================
    function getFilteredChallenges() {
        if (currentCategory === "all") return CHALLENGES_POOL;
        return CHALLENGES_POOL.filter(c => c.category === currentCategory);
    }

    function displayCurrentChallenge() {
        const pool = getFilteredChallenges();
        if (pool.length === 0) return;
        if (currentChallengeIndex >= pool.length) currentChallengeIndex = 0;

        const ch = pool[currentChallengeIndex];

        if (challengeTitleEl) challengeTitleEl.textContent = ch.title;
        if (challengeDescEl) challengeDescEl.textContent = ch.desc;
        if (challengeTagEl) {
            challengeTagEl.textContent = formatCategory(ch.category);
        }

        updateCompleteButtonState();
    }

    function formatCategory(cat) {
        switch (cat) {
            case "nature": return "🌿 Nature & Fresh Air";
            case "mind": return "🧘 Mindfulness & Focus";
            case "health": return "💧 Physical Health";
            case "detox": return "📵 Digital Detox";
            case "kindness": return "💖 Kindness & Connection";
            default: return "🎯 Daily Wellness";
        }
    }

    function updateCompleteButtonState() {
        if (!completeChallengeBtn) return;
        const pool = getFilteredChallenges();
        const ch = pool[currentChallengeIndex];
        const isDone = localStorage.getItem(getTodayKey() + "_" + ch.id) === "true";

        if (isDone) {
            completeChallengeBtn.textContent = "✅ Completed! (Click to Undo)";
            completeChallengeBtn.classList.add("completed-state");
            if (celebrationBox) celebrationBox.style.display = "block";
        } else {
            completeChallengeBtn.textContent = "✅ Mark as Completed";
            completeChallengeBtn.classList.remove("completed-state");
            if (celebrationBox) celebrationBox.style.display = "none";
        }
    }

    // ============================================================
    // 4. COMPLETE CHALLENGE EVENT
    // ============================================================
    if (completeChallengeBtn) {
        completeChallengeBtn.addEventListener("click", function () {
            const pool = getFilteredChallenges();
            const ch = pool[currentChallengeIndex];
            const key = getTodayKey() + "_" + ch.id;
            const isDone = localStorage.getItem(key) === "true";

            let stats = getStats();

            if (isDone) {
                // Undo
                localStorage.removeItem(key);
                if (stats.total > 0) stats.total--;
                saveStats(stats);
                updateCompleteButtonState();
                updateDashboardStats();
                return;
            }

            // Mark completed
            localStorage.setItem(key, "true");
            stats.total = (stats.total || 0) + 1;

            // Check daily streak
            const todayStr = new Date().toDateString();
            if (stats.lastDate) {
                const last = new Date(stats.lastDate);
                const today = new Date(todayStr);
                const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    stats.streak = (stats.streak || 1) + 1;
                } else if (diffDays > 1) {
                    stats.streak = 1;
                }
            } else {
                stats.streak = 1;
            }
            stats.lastDate = todayStr;

            // Track category badge key
            if (!stats.unlockedBadges) stats.unlockedBadges = [];
            stats.unlockedBadges.push("first");
            if (ch.badgeKey) stats.unlockedBadges.push(ch.badgeKey);
            if (stats.streak >= 3) stats.unlockedBadges.push("streak3");

            saveStats(stats);

            // Celebration sound and effect
            try {
                const audio = new Audio("music/relaxing.mp3");
                audio.volume = 0.6;
                audio.play().catch(() => {});
            } catch (e) {}

            updateCompleteButtonState();
            updateDashboardStats();
            renderBadges();

            alert(`🎉 Congratulations! You completed today's challenge: "${ch.title}"! Keep up the amazing momentum.`);
        });
    }

    if (randomChallengeBtn) {
        randomChallengeBtn.addEventListener("click", function () {
            const pool = getFilteredChallenges();
            currentChallengeIndex = (currentChallengeIndex + 1) % pool.length;
            displayCurrentChallenge();
        });
    }

    categoryTabs.forEach(tab => {
        tab.addEventListener("click", function () {
            categoryTabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            currentCategory = this.dataset.category || "all";
            currentChallengeIndex = 0;
            displayCurrentChallenge();
        });
    });

    // ============================================================
    // 5. WEEKLY INTERACTIVE CHECKLIST
    // ============================================================
    function renderWeeklyChecklist() {
        if (!checklistContainer) return;
        const tasks = getWeeklyTasks();

        checklistContainer.innerHTML = "";

        let completedCount = 0;

        tasks.forEach((task, index) => {
            if (task.completed) completedCount++;

            const div = document.createElement("div");
            div.className = "checklist-item" + (task.completed ? " checked" : "");
            div.innerHTML = `
                <div class="checklist-left">
                    <div class="checkbox-custom">${task.completed ? "✓" : ""}</div>
                    <span class="checklist-text">${escapeHtml(task.text)}</span>
                </div>
                <div style="font-size: 12px; color: #888;">${task.completed ? "Done ✅" : "Tap to complete"}</div>
            `;

            div.addEventListener("click", () => toggleTask(index));
            checklistContainer.appendChild(div);
        });

        // Update progress bar
        const total = tasks.length;
        const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        if (progressFill) progressFill.style.width = pct + "%";
        if (progressText) progressText.textContent = `${completedCount} of ${total} Completed (${pct}%)`;

        // Check champion badge
        if (completedCount === total && total >= 5) {
            let stats = getStats();
            if (!stats.unlockedBadges) stats.unlockedBadges = [];
            if (!stats.unlockedBadges.includes("champion")) {
                stats.unlockedBadges.push("champion");
                saveStats(stats);
                renderBadges();
            }
        }
    }

    function toggleTask(index) {
        const tasks = getWeeklyTasks();
        if (index < 0 || index >= tasks.length) return;

        tasks[index].completed = !tasks[index].completed;
        saveWeeklyTasks(tasks);

        // Update stats if checked
        if (tasks[index].completed) {
            let stats = getStats();
            stats.total = (stats.total || 0) + 1;
            if (!stats.unlockedBadges) stats.unlockedBadges = [];
            stats.unlockedBadges.push("first");
            if (tasks[index].badgeKey) stats.unlockedBadges.push(tasks[index].badgeKey);
            saveStats(stats);
            updateDashboardStats();
            renderBadges();
        }

        renderWeeklyChecklist();
    }

    // Add Custom Goal
    if (customGoalForm && customGoalInput) {
        customGoalForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const text = customGoalInput.value.trim();
            if (!text) return;

            const tasks = getWeeklyTasks();
            tasks.push({
                id: "c_" + Date.now(),
                text: "🎯 " + text,
                completed: false
            });
            saveWeeklyTasks(tasks);
            customGoalInput.value = "";
            renderWeeklyChecklist();
            alert("✨ Custom goal added to your checklist!");
        });
    }

    if (resetWeekBtn) {
        resetWeekBtn.addEventListener("click", function () {
            if (confirm("Reset all tasks in your checklist for a fresh start?")) {
                const tasks = DEFAULT_WEEKLY_TASKS.map(t => ({ ...t, completed: false }));
                saveWeeklyTasks(tasks);
                renderWeeklyChecklist();
            }
        });
    }

    // ============================================================
    // 6. DASHBOARD STATS & BADGES
    // ============================================================
    function updateDashboardStats() {
        const stats = getStats();
        if (statStreakEl) statStreakEl.textContent = (stats.streak || 1) + " Day" + ((stats.streak || 1) === 1 ? "" : "s");
        if (statTotalEl) statTotalEl.textContent = (stats.total || 0);

        const unlockedCount = countUnlockedBadges();
        if (statBadgesEl) statBadgesEl.textContent = `${unlockedCount} / ${badgeCards.length}`;
    }

    function countUnlockedBadges() {
        const stats = getStats();
        const unlocked = new Set(stats.unlockedBadges || []);
        let count = 0;
        badgeCards.forEach(card => {
            const badgeId = card.dataset.badge;
            if (unlocked.has(badgeId)) count++;
        });
        return count;
    }

    function renderBadges() {
        const stats = getStats();
        const unlocked = new Set(stats.unlockedBadges || []);

        badgeCards.forEach(card => {
            const badgeId = card.dataset.badge;
            const statusEl = card.querySelector(".badge-status");

            if (unlocked.has(badgeId)) {
                card.classList.remove("locked");
                card.classList.add("unlocked");
                if (statusEl) statusEl.textContent = "Unlocked 🏆";
            } else {
                card.classList.remove("unlocked");
                card.classList.add("locked");
                if (statusEl) statusEl.textContent = "Locked 🔒";
            }
        });
    }

    function escapeHtml(str) {
        if (!str) return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initial load
    displayCurrentChallenge();
    renderWeeklyChecklist();
    updateDashboardStats();
    renderBadges();
});

