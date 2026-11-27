/* ============================================================
   BLISSORA — MEDITATION JAVASCRIPT ENGINE
   Controls Breathing Exercises, Timer, Music, and Stats
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // ============================================================
    // 1. BREATHING GUIDE CONTROLLER
    // ============================================================
    const breathingCircle = document.getElementById("breathingCircle");
    const breathingText = document.getElementById("breathingText");
    const breathingInstruction = document.getElementById("breathingInstruction");
    const startBreathingBtn = document.getElementById("startBreathingBtn");
    const stopBreathingBtn = document.getElementById("stopBreathingBtn");
    const breathingModeButtons = document.querySelectorAll(".breathing-mode-btn");

    let isBreathingActive = false;
    let breathingTimeout = null;
    let breathingCountdownInterval = null;
    let currentBreathingMode = "box"; // "box", "relax", "calm"

    // Breathing phase definitions in seconds
    const BREATHING_MODES = {
        box: [
            { phase: "inhale", text: "Inhale...", instruction: "Breathe in deeply through your nose", duration: 4 },
            { phase: "hold", text: "Hold...", instruction: "Gently hold your breath with calm lungs", duration: 4 },
            { phase: "exhale", text: "Exhale...", instruction: "Release your breath slowly through your mouth", duration: 4 },
            { phase: "hold", text: "Hold...", instruction: "Rest at the bottom of the breath", duration: 4 }
        ],
        relax: [
            { phase: "inhale", text: "Inhale...", instruction: "Inhale quietly through your nose (4s)", duration: 4 },
            { phase: "hold", text: "Hold...", instruction: "Hold your breath calmly (7s)", duration: 7 },
            { phase: "exhale", text: "Exhale...", instruction: "Exhale completely with a gentle whoosh (8s)", duration: 8 }
        ],
        calm: [
            { phase: "inhale", text: "Inhale...", instruction: "Breathe in peace and energy (4s)", duration: 4 },
            { phase: "exhale", text: "Exhale...", instruction: "Breathe out all worry and fatigue (6s)", duration: 6 }
        ]
    };

    let currentStepIndex = 0;

    function runBreathingStep() {
        if (!isBreathingActive) return;

        const steps = BREATHING_MODES[currentBreathingMode] || BREATHING_MODES.box;
        const step = steps[currentStepIndex];

        // Apply visual circle class
        breathingCircle.className = "breathing-circle " + step.phase;
        breathingCircle.style.transitionDuration = step.duration + "s";

        let remainingSec = step.duration;
        breathingText.textContent = `${step.text} (${remainingSec})`;
        breathingInstruction.textContent = step.instruction;

        clearInterval(breathingCountdownInterval);
        breathingCountdownInterval = setInterval(() => {
            remainingSec--;
            if (remainingSec > 0 && isBreathingActive) {
                breathingText.textContent = `${step.text} (${remainingSec})`;
            } else {
                clearInterval(breathingCountdownInterval);
            }
        }, 1000);

        breathingTimeout = setTimeout(() => {
            if (isBreathingActive) {
                currentStepIndex = (currentStepIndex + 1) % steps.length;
                runBreathingStep();
            }
        }, step.duration * 1000);
    }

    function startBreathing() {
        isBreathingActive = true;
        currentStepIndex = 0;
        startBreathingBtn.style.display = "none";
        stopBreathingBtn.style.display = "inline-block";
        runBreathingStep();
    }

    function stopBreathing() {
        isBreathingActive = false;
        clearTimeout(breathingTimeout);
        clearInterval(breathingCountdownInterval);
        startBreathingBtn.style.display = "inline-block";
        stopBreathingBtn.style.display = "none";

        breathingCircle.className = "breathing-circle";
        breathingCircle.style.transitionDuration = "0.5s";
        breathingText.textContent = "Ready";
        breathingInstruction.textContent = 'Press "Start Breathing" to begin your cycle.';
    }

    if (startBreathingBtn) startBreathingBtn.addEventListener("click", startBreathing);
    if (stopBreathingBtn) stopBreathingBtn.addEventListener("click", stopBreathing);

    breathingModeButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            breathingModeButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            currentBreathingMode = this.dataset.mode;
            if (isBreathingActive) {
                clearTimeout(breathingTimeout);
                clearInterval(breathingCountdownInterval);
                currentStepIndex = 0;
                runBreathingStep();
            }
        });
    });

    // ============================================================
    // 2. MEDITATION TIMER CONTROLLER
    // ============================================================
    let selectedMinutes = 5;
    let totalSeconds = selectedMinutes * 60;
    let remainingSeconds = totalSeconds;
    let timerInterval = null;

    const timerDisplay = document.getElementById("timer");
    const progressBar = document.getElementById("timerProgressBar");
    const startBtn = document.getElementById("startBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const resetBtn = document.getElementById("resetBtn");
    const presetButtons = document.querySelectorAll(".preset-btn");
    const autoPlayMusicCheckbox = document.getElementById("autoPlayMusicCheckbox");
    const completionCard = document.getElementById("completionCard");
    const completionMessage = document.getElementById("completionMessage");
    const closeCompletionBtn = document.getElementById("closeCompletionBtn");

    const music = document.getElementById("relaxMusic");
    const trackButtons = document.querySelectorAll(".track-select-btn");

    function updateTimerDisplay() {
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        if (timerDisplay) {
            timerDisplay.textContent = display;
        }

        if (progressBar && totalSeconds > 0) {
            const elapsed = totalSeconds - remainingSeconds;
            const percent = (elapsed / totalSeconds) * 100;
            progressBar.style.width = `${percent}%`;
        }
    }

    function setDuration(minutes) {
        pauseMeditation();
        selectedMinutes = minutes;
        totalSeconds = minutes * 60;
        remainingSeconds = totalSeconds;
        updateTimerDisplay();

        presetButtons.forEach(btn => {
            if (parseInt(btn.dataset.minutes, 10) === minutes) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        if (completionCard) completionCard.style.display = "none";
    }

    presetButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            const mins = parseInt(this.dataset.minutes, 10);
            if (!isNaN(mins)) {
                setDuration(mins);
            }
        });
    });

    function startMeditation() {
        if (timerInterval !== null) return;

        if (completionCard) completionCard.style.display = "none";

        // Auto-play music if requested
        if (autoPlayMusicCheckbox && autoPlayMusicCheckbox.checked && music && music.paused) {
            music.play().catch(e => console.log("Music play prevented by browser policy:", e));
        }

        timerInterval = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                updateTimerDisplay();
            } else {
                finishMeditation();
            }
        }, 1000);

        startBtn.style.opacity = "0.7";
        startBtn.textContent = "Running...";
    }

    function pauseMeditation() {
        if (timerInterval !== null) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        if (music && !music.paused) {
            music.pause();
        }
        if (startBtn) {
            startBtn.style.opacity = "1";
            startBtn.textContent = "▶ Resume";
        }
    }

    function resetMeditation() {
        pauseMeditation();
        remainingSeconds = totalSeconds;
        updateTimerDisplay();
        if (startBtn) {
            startBtn.textContent = "▶ Start";
        }
        if (completionCard) completionCard.style.display = "none";
    }

    function finishMeditation() {
        pauseMeditation();
        if (music) {
            music.pause();
        }

        // Play gentle completion sound
        try {
            const bell = new Audio("music/relaxing.mp3");
            bell.volume = 0.7;
            bell.play().catch(() => {});
        } catch (e) {}

        // Record stats
        recordMeditationSession(selectedMinutes);

        // Display completion card
        if (completionCard && completionMessage) {
            completionMessage.textContent = `You dedicated ${selectedMinutes} mindful minute${selectedMinutes === 1 ? "" : "s"} to your inner peace. Notice how calm and centered you feel right now.`;
            completionCard.style.display = "block";
            completionCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }

    if (startBtn) startBtn.addEventListener("click", startMeditation);
    if (pauseBtn) pauseBtn.addEventListener("click", pauseMeditation);
    if (resetBtn) resetBtn.addEventListener("click", resetMeditation);

    if (closeCompletionBtn && completionCard) {
        closeCompletionBtn.addEventListener("click", () => {
            completionCard.style.display = "none";
            resetMeditation();
        });
    }

    // ============================================================
    // 3. SOUNDTRACK CHOOSER
    // ============================================================
    if (trackButtons.length > 0 && music) {
        trackButtons.forEach(btn => {
            btn.addEventListener("click", function () {
                trackButtons.forEach(b => b.classList.remove("active"));
                this.classList.add("active");

                const wasPlaying = !music.paused;
                music.src = this.dataset.src;
                music.load();

                if (wasPlaying || timerInterval !== null) {
                    music.play().catch(e => console.log("Audio play error:", e));
                }
            });
        });
    }

    // ============================================================
    // 4. GUIDED TECHNIQUE CARDS
    // ============================================================
    const techniqueCards = document.querySelectorAll(".technique-card");

    techniqueCards.forEach(card => {
        const btn = card.querySelector(".practice-btn");
        if (btn) {
            btn.addEventListener("click", function () {
                const mins = parseInt(card.dataset.minutes, 10);
                const name = card.dataset.name;

                if (!isNaN(mins)) {
                    setDuration(mins);
                }

                // Scroll up to timer
                const timerSec = document.querySelector(".timer-section");
                if (timerSec) {
                    timerSec.scrollIntoView({ behavior: "smooth" });
                }

                // Show quick guidance hint
                if (timerDisplay) {
                    timerDisplay.setAttribute("title", `Practicing: ${name}`);
                }
            });
        }
    });

    // ============================================================
    // 5. MEDITATION STATS TRACKER
    // ============================================================
    const statSessionsEl = document.getElementById("statSessions");
    const statMinutesEl = document.getElementById("statMinutes");
    const statStreakEl = document.getElementById("statStreak");

    function loadMeditationStats() {
        let stats = {
            totalSessions: 0,
            totalMinutes: 0,
            lastDate: null,
            streakDays: 1
        };

        try {
            const saved = localStorage.getItem("blissora_meditation_stats");
            if (saved) stats = JSON.parse(saved);
        } catch (e) {}

        if (statSessionsEl) statSessionsEl.textContent = stats.totalSessions || 0;
        if (statMinutesEl) statMinutesEl.textContent = (stats.totalMinutes || 0) + "m";
        if (statStreakEl) statStreakEl.textContent = (stats.streakDays || 1) + " Day" + ((stats.streakDays || 1) === 1 ? "" : "s");

        return stats;
    }

    function recordMeditationSession(minutes) {
        let stats = loadMeditationStats();
        stats.totalSessions = (stats.totalSessions || 0) + 1;
        stats.totalMinutes = (stats.totalMinutes || 0) + minutes;

        const todayStr = new Date().toDateString();
        if (stats.lastDate) {
            const last = new Date(stats.lastDate);
            const today = new Date(todayStr);
            const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                stats.streakDays = (stats.streakDays || 1) + 1;
            } else if (diffDays > 1) {
                stats.streakDays = 1;
            }
        } else {
            stats.streakDays = 1;
        }
        stats.lastDate = todayStr;

        localStorage.setItem("blissora_meditation_stats", JSON.stringify(stats));
        loadMeditationStats();
    }

    // Initial setup
    updateTimerDisplay();
    loadMeditationStats();
});
