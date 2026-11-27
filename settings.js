/* ============================================================
   BLISSORA — SETTINGS JAVASCRIPT
   Handles all settings options: Profile, Theme, Audio,
   Notifications, Accessibility, Data Export/Import/Reset,
   and System Status.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    // ============================================================
    // 0. TOAST NOTIFICATION UTILITY
    // ============================================================
    let toastTimeout = null;
    function showToast(message, type = "success", duration = 3000) {
        let toast = document.getElementById("settingsToast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "settingsToast";
            toast.className = "settings-toast";
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.className = `settings-toast show ${type}`;

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, duration);
    }

    // ============================================================
    // 1. USER PROFILE MANAGEMENT
    // ============================================================
    const DEFAULT_PROFILE = {
        name: "Mindful Explorer",
        email: "blissora.user@example.com",
        mantra: "Inhale peace, exhale tension.",
        avatar: "profile.jpg",
        joinedDate: "November 2026"
    };

    function loadProfile() {
        let profile = DEFAULT_PROFILE;
        try {
            const saved = localStorage.getItem("blissora_user_profile");
            if (saved) {
                profile = Object.assign({}, DEFAULT_PROFILE, JSON.parse(saved));
            }
        } catch (e) {
            console.error("Error loading profile:", e);
        }

        // Update View elements
        const nameEl = document.getElementById("displayProfileName");
        const emailEl = document.getElementById("displayProfileEmail");
        const mantraEl = document.getElementById("displayProfileMantra");
        const avatarEl = document.getElementById("profileAvatar");
        const memberSinceEl = document.getElementById("memberSinceBadge");

        if (nameEl) nameEl.textContent = profile.name;
        if (emailEl) emailEl.textContent = profile.email;
        if (mantraEl) mantraEl.textContent = `"${profile.mantra}"`;
        if (avatarEl) avatarEl.src = profile.avatar || "profile.jpg";
        if (memberSinceEl) memberSinceEl.textContent = `📅 Member since ${profile.joinedDate}`;

        // Populate Edit Inputs
        const nameInput = document.getElementById("profileNameInput");
        const emailInput = document.getElementById("profileEmailInput");
        const mantraInput = document.getElementById("profileMantraInput");

        if (nameInput) nameInput.value = profile.name;
        if (emailInput) emailInput.value = profile.email;
        if (mantraInput) mantraInput.value = profile.mantra;

        return profile;
    }

    function saveProfile(e) {
        if (e) e.preventDefault();

        const nameInput = document.getElementById("profileNameInput");
        const emailInput = document.getElementById("profileEmailInput");
        const mantraInput = document.getElementById("profileMantraInput");

        const newName = nameInput ? nameInput.value.trim() : "";
        const newEmail = emailInput ? emailInput.value.trim() : "";
        const newMantra = mantraInput ? mantraInput.value.trim() : "";

        if (!newName) {
            showToast("Please enter a valid display name.", "warning");
            return;
        }

        const currentProfile = loadProfile();
        currentProfile.name = newName;
        if (newEmail) currentProfile.email = newEmail;
        if (newMantra) currentProfile.mantra = newMantra;

        localStorage.setItem("blissora_user_profile", JSON.stringify(currentProfile));
        loadProfile();

        // Hide edit box
        const editBox = document.getElementById("profileEditBox");
        if (editBox) editBox.classList.remove("active");

        showToast("Profile updated successfully!");
    }

    const editProfileBtn = document.getElementById("editProfileBtn");
    const cancelProfileBtn = document.getElementById("cancelProfileBtn");
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const profileEditBox = document.getElementById("profileEditBox");

    if (editProfileBtn && profileEditBox) {
        editProfileBtn.addEventListener("click", function () {
            profileEditBox.classList.toggle("active");
            if (profileEditBox.classList.contains("active")) {
                const nameInput = document.getElementById("profileNameInput");
                if (nameInput) nameInput.focus();
            }
        });
    }

    if (cancelProfileBtn && profileEditBox) {
        cancelProfileBtn.addEventListener("click", function () {
            profileEditBox.classList.remove("active");
            loadProfile(); // Reset inputs
        });
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener("click", saveProfile);
    }

    // ============================================================
    // 2. THEME SETTINGS (LIGHT / DARK MODE)
    // ============================================================
    const lightBtn = document.getElementById("lightMode");
    const darkBtn = document.getElementById("darkMode");
    const themeStatus = document.getElementById("themeStatus");

    function applyTheme(theme, save = true) {
        const isDark = theme === "dark";
        document.body.classList.toggle("dark-mode", isDark);

        if (lightBtn) lightBtn.classList.toggle("active", !isDark);
        if (darkBtn) darkBtn.classList.toggle("active", isDark);

        if (themeStatus) {
            themeStatus.textContent = isDark ? "🌙 Dark theme is active" : "☀️ Light theme is active";
        }

        if (save) {
            localStorage.setItem("theme", theme);
            showToast(isDark ? "Switched to Dark Mode" : "Switched to Light Mode");
        }
    }

    if (lightBtn) {
        lightBtn.addEventListener("click", () => applyTheme("light"));
    }

    if (darkBtn) {
        darkBtn.addEventListener("click", () => applyTheme("dark"));
    }

    // Load initial theme
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme, false);

    // ============================================================
    // 3. MUSIC & AUDIO SETTINGS
    // ============================================================
    const musicVolumeSlider = document.getElementById("musicVolume");
    const volumePercent = document.getElementById("volumePercent");
    const testAudioBtn = document.getElementById("testAudioBtn");
    const muteAudioBtn = document.getElementById("muteAudioBtn");
    const defaultTrackSelect = document.getElementById("defaultTrackSelect");

    let previewAudio = null;

    function initAudioSettings() {
        const savedVol = localStorage.getItem("blissora_music_volume");
        const volVal = (savedVol !== null) ? Math.round(parseFloat(savedVol) * 100) : 60;

        if (musicVolumeSlider) musicVolumeSlider.value = volVal;
        if (volumePercent) volumePercent.textContent = volVal + "%";

        const savedTrack = localStorage.getItem("blissora_default_track") || "music/relaxing.mp3";
        if (defaultTrackSelect) defaultTrackSelect.value = savedTrack;

        const isMuted = localStorage.getItem("blissora_music_muted") === "true";
        if (muteAudioBtn) {
            muteAudioBtn.innerHTML = isMuted ? "🔈 Unmute Audio" : "🔇 Mute Audio";
        }
    }

    if (musicVolumeSlider) {
        musicVolumeSlider.addEventListener("input", function () {
            const val = parseInt(this.value, 10);
            if (volumePercent) volumePercent.textContent = val + "%";
            const floatVol = (val / 100);
            localStorage.setItem("blissora_music_volume", floatVol.toString());

            if (previewAudio) {
                previewAudio.volume = floatVol;
            }
        });
    }

    if (defaultTrackSelect) {
        defaultTrackSelect.addEventListener("change", function () {
            localStorage.setItem("blissora_default_track", this.value);
            showToast(`Default track set to: ${this.options[this.selectedIndex].text}`);
        });
    }

    if (muteAudioBtn) {
        muteAudioBtn.addEventListener("click", function () {
            const currentlyMuted = localStorage.getItem("blissora_music_muted") === "true";
            const nextMuted = !currentlyMuted;
            localStorage.setItem("blissora_music_muted", nextMuted.toString());

            this.innerHTML = nextMuted ? "🔈 Unmute Audio" : "🔇 Mute Audio";
            showToast(nextMuted ? "Audio muted" : "Audio unmuted");
        });
    }

    if (testAudioBtn) {
        testAudioBtn.addEventListener("click", function () {
            if (previewAudio && !previewAudio.paused) {
                previewAudio.pause();
                previewAudio.currentTime = 0;
                testAudioBtn.innerHTML = "🔊 Test Sound";
                return;
            }

            const trackSrc = (defaultTrackSelect ? defaultTrackSelect.value : "music/relaxing.mp3") || "music/relaxing.mp3";
            const vol = musicVolumeSlider ? (parseInt(musicVolumeSlider.value, 10) / 100) : 0.6;

            try {
                if (!previewAudio) {
                    previewAudio = new Audio();
                }
                previewAudio.src = trackSrc;
                previewAudio.volume = vol;

                testAudioBtn.innerHTML = "⏹️ Stop Preview";
                const playPromise = previewAudio.play();

                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        showToast("Playing 3-second relaxing preview...");
                        setTimeout(() => {
                            if (previewAudio && !previewAudio.paused) {
                                previewAudio.pause();
                                previewAudio.currentTime = 0;
                                testAudioBtn.innerHTML = "🔊 Test Sound";
                            }
                        }, 3500);
                    }).catch(err => {
                        console.warn("Audio playback note:", err);
                        testAudioBtn.innerHTML = "🔊 Test Sound";
                        showToast("Preview chime triggered (Volume: " + Math.round(vol * 100) + "%)");
                    });
                }
            } catch (err) {
                console.error("Audio error:", err);
                testAudioBtn.innerHTML = "🔊 Test Sound";
            }
        });
    }

    // ============================================================
    // 4. DAILY REMINDER & NOTIFICATION SETTINGS
    // ============================================================
    const dailyReminderToggle = document.getElementById("dailyReminderToggle");
    const reminderTimeInput = document.getElementById("reminderTime");
    const reminderCategorySelect = document.getElementById("reminderCategory");
    const reminderSubcontrols = document.getElementById("reminderSubcontrols");
    const reminderStatusText = document.getElementById("reminderStatusText");
    const testNotificationBtn = document.getElementById("testNotificationBtn");

    function loadReminderSettings() {
        let settings = {
            enabled: false,
            time: "09:00",
            category: "mindful_breathing"
        };
        try {
            const saved = localStorage.getItem("blissora_reminder_settings");
            if (saved) settings = Object.assign({}, settings, JSON.parse(saved));
        } catch (e) {
            console.error("Reminder settings load error:", e);
        }

        if (dailyReminderToggle) dailyReminderToggle.checked = settings.enabled;
        if (reminderTimeInput) reminderTimeInput.value = settings.time || "09:00";
        if (reminderCategorySelect) reminderCategorySelect.value = settings.category || "mindful_breathing";

        updateReminderUI(settings.enabled, settings.time);
    }

    function updateReminderUI(enabled, time) {
        if (reminderSubcontrols) {
            reminderSubcontrols.style.display = enabled ? "flex" : "none";
        }
        if (reminderStatusText) {
            if (enabled) {
                reminderStatusText.textContent = `Active: Daily mindfulness reminder set for ${formatTime(time || "09:00")}`;
                reminderStatusText.style.color = "#2E8B57";
            } else {
                reminderStatusText.textContent = "Reminders are currently turned off.";
                reminderStatusText.style.color = "#888";
            }
        }
    }

    function formatTime(timeStr) {
        if (!timeStr) return "9:00 AM";
        const parts = timeStr.split(":");
        let hour = parseInt(parts[0], 10);
        const min = parts[1] || "00";
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12;
        hour = hour ? hour : 12;
        return `${hour}:${min} ${ampm}`;
    }

    function saveReminderSettings() {
        const enabled = dailyReminderToggle ? dailyReminderToggle.checked : false;
        const time = reminderTimeInput ? reminderTimeInput.value : "09:00";
        const category = reminderCategorySelect ? reminderCategorySelect.value : "mindful_breathing";

        const settings = { enabled, time, category };
        localStorage.setItem("blissora_reminder_settings", JSON.stringify(settings));
        updateReminderUI(enabled, time);
    }

    if (dailyReminderToggle) {
        dailyReminderToggle.addEventListener("change", function () {
            saveReminderSettings();
            showToast(this.checked ? "Daily reminder enabled!" : "Daily reminder disabled.");
        });
    }

    if (reminderTimeInput) {
        reminderTimeInput.addEventListener("change", function () {
            saveReminderSettings();
            showToast(`Reminder time set to ${formatTime(this.value)}`);
        });
    }

    if (reminderCategorySelect) {
        reminderCategorySelect.addEventListener("change", function () {
            saveReminderSettings();
            showToast("Reminder topic updated!");
        });
    }

    if (testNotificationBtn) {
        testNotificationBtn.addEventListener("click", function () {
            const timeStr = reminderTimeInput ? formatTime(reminderTimeInput.value) : "9:00 AM";
            const topicText = reminderCategorySelect ? reminderCategorySelect.options[reminderCategorySelect.selectedIndex].text : "Mindfulness";

            // Visual in-app notification banner
            showToast(`🔔 Daily Reminder (${timeStr}): Time for your ${topicText}! Take a deep breath 🌿`, "info", 4500);

            // Native Browser Notification (if supported & allowed)
            if ("Notification" in window) {
                if (Notification.permission === "granted") {
                    new Notification("Blissora Reminder 🌿", {
                        body: `Take a pause! It's time for your ${topicText}. Breathe in... and let go.`,
                        icon: "logo.png"
                    });
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            new Notification("Blissora Reminder 🌿", {
                                body: `Take a pause! It's time for your ${topicText}. Breathe in... and let go.`,
                                icon: "logo.png"
                            });
                        }
                    });
                }
            }
        });
    }

    // ============================================================
    // 5. ACCESSIBILITY SETTINGS (FONT SIZE, CONTRAST, MOTION)
    // ============================================================
    const increaseFontBtn = document.getElementById("increaseFontBtn");
    const decreaseFontBtn = document.getElementById("decreaseFontBtn");
    const resetFontBtn = document.getElementById("resetFontBtn");
    const fontScaleDisplay = document.getElementById("fontScaleDisplay");
    const fontPreviewBox = document.getElementById("fontPreviewBox");
    const highContrastToggle = document.getElementById("highContrastToggle");
    const reducedMotionToggle = document.getElementById("reducedMotionToggle");

    let currentFontScale = 100; // percent

    function applyFontScale(scale, save = true) {
        currentFontScale = Math.max(80, Math.min(140, scale));
        document.documentElement.style.fontSize = `${currentFontScale}%`;

        if (fontScaleDisplay) fontScaleDisplay.textContent = `${currentFontScale}%`;
        if (fontPreviewBox) {
            fontPreviewBox.style.fontSize = `${1 + (currentFontScale - 100) / 100 * 0.4}rem`;
        }

        if (save) {
            localStorage.setItem("blissora_font_scale", currentFontScale.toString());
        }
    }

    if (increaseFontBtn) {
        increaseFontBtn.addEventListener("click", function () {
            applyFontScale(currentFontScale + 10);
            showToast(`Font size scaled to ${currentFontScale}%`);
        });
    }

    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener("click", function () {
            applyFontScale(currentFontScale - 10);
            showToast(`Font size scaled to ${currentFontScale}%`);
        });
    }

    if (resetFontBtn) {
        resetFontBtn.addEventListener("click", function () {
            applyFontScale(100);
            showToast("Font size reset to 100%");
        });
    }

    if (highContrastToggle) {
        highContrastToggle.addEventListener("change", function () {
            document.body.classList.toggle("high-contrast", this.checked);
            localStorage.setItem("blissora_high_contrast", this.checked.toString());
            showToast(this.checked ? "High contrast enabled" : "High contrast disabled");
        });
    }

    if (reducedMotionToggle) {
        reducedMotionToggle.addEventListener("change", function () {
            document.body.classList.toggle("reduced-motion", this.checked);
            localStorage.setItem("blissora_reduced_motion", this.checked.toString());
            showToast(this.checked ? "Reduced animations enabled" : "Animations enabled");
        });
    }

    function loadAccessibilitySettings() {
        const savedScale = parseInt(localStorage.getItem("blissora_font_scale"), 10);
        if (!isNaN(savedScale)) {
            applyFontScale(savedScale, false);
        }

        const savedContrast = localStorage.getItem("blissora_high_contrast") === "true";
        if (highContrastToggle) {
            highContrastToggle.checked = savedContrast;
            document.body.classList.toggle("high-contrast", savedContrast);
        }

        const savedMotion = localStorage.getItem("blissora_reduced_motion") === "true";
        if (reducedMotionToggle) {
            reducedMotionToggle.checked = savedMotion;
            document.body.classList.toggle("reduced-motion", savedMotion);
        }
    }

    // ============================================================
    // 6. DATA MANAGEMENT (EXPORT, IMPORT, RESET)
    // ============================================================
    const exportDataBtn = document.getElementById("exportDataBtn");
    const importDataBtn = document.getElementById("importDataBtn");
    const importFileInput = document.getElementById("importFileInput");
    const resetDataBtn = document.getElementById("resetDataBtn");
    const resetModal = document.getElementById("resetConfirmModal");
    const confirmResetBtn = document.getElementById("confirmResetBtn");
    const cancelResetBtn = document.getElementById("cancelResetBtn");
    const storageUsageText = document.getElementById("storageUsageText");

    function calculateStorageUsage() {
        let totalBytes = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                totalBytes += key.length + (localStorage.getItem(key) || "").length;
            }
        }
        const kb = (totalBytes / 1024).toFixed(1);
        if (storageUsageText) {
            storageUsageText.textContent = `💾 Local Storage: ${kb} KB used (Privacy-friendly, 100% on device)`;
        }
    }

    function exportAllData() {
        const dataKeys = [
            "theme",
            "blissora_user_profile",
            "blissora_music_volume",
            "blissora_music_muted",
            "blissora_default_track",
            "blissora_reminder_settings",
            "blissora_font_scale",
            "blissora_high_contrast",
            "blissora_reduced_motion",
            "journalEntries",
            "blissora_gratitude_list",
            "blissora_mood_history",
            "blissora_current_mood",
            "blissora_fav_quotes",
            "blissora_custom_mantras",
            "blissora_challenge_stats",
            "blissora_weekly_checks",
            "blissora_custom_goals",
            "blissora_completed_today",
            "blissora_completed_date",
            "blissora_meditation_stats",
            "blissora_gallery_favs",
            "blissora_weather_last_city"
        ];

        const exportPayload = {
            appName: "Blissora",
            version: "2.0",
            exportedAt: new Date().toISOString(),
            data: {}
        };

        dataKeys.forEach(key => {
            const val = localStorage.getItem(key);
            if (val !== null) {
                try {
                    exportPayload.data[key] = JSON.parse(val);
                } catch (e) {
                    exportPayload.data[key] = val;
                }
            }
        });

        const jsonString = JSON.stringify(exportPayload, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const dateStr = new Date().toISOString().split("T")[0];
        link.href = url;
        link.download = `blissora-backup-${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast("📥 Blissora data exported successfully!");
    }

    if (exportDataBtn) {
        exportDataBtn.addEventListener("click", exportAllData);
    }

    if (importDataBtn && importFileInput) {
        importDataBtn.addEventListener("click", () => importFileInput.click());

        importFileInput.addEventListener("change", function (e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    const parsed = JSON.parse(event.target.result);
                    if (!parsed.data || typeof parsed.data !== "object") {
                        throw new Error("Invalid Blissora backup structure.");
                    }

                    Object.keys(parsed.data).forEach(key => {
                        const val = parsed.data[key];
                        if (typeof val === "object") {
                            localStorage.setItem(key, JSON.stringify(val));
                        } else {
                            localStorage.setItem(key, String(val));
                        }
                    });

                    // Re-init UI
                    loadProfile();
                    initAudioSettings();
                    loadReminderSettings();
                    loadAccessibilitySettings();
                    calculateStorageUsage();

                    const importedTheme = localStorage.getItem("theme") || "light";
                    applyTheme(importedTheme, false);

                    showToast("📤 Backup restored successfully!");
                } catch (err) {
                    console.error("Import error:", err);
                    showToast("Error importing file: Invalid format", "error");
                }
                importFileInput.value = "";
            };
            reader.readAsText(file);
        });
    }

    if (resetDataBtn && resetModal) {
        resetDataBtn.addEventListener("click", function () {
            resetModal.classList.add("active");
        });
    }

    if (cancelResetBtn && resetModal) {
        cancelResetBtn.addEventListener("click", function () {
            resetModal.classList.remove("active");
        });
    }

    if (confirmResetBtn && resetModal) {
        confirmResetBtn.addEventListener("click", function () {
            const keysToReset = [
                "blissora_user_profile",
                "blissora_music_volume",
                "blissora_music_muted",
                "blissora_default_track",
                "blissora_reminder_settings",
                "blissora_font_scale",
                "blissora_high_contrast",
                "blissora_reduced_motion",
                "journalEntries",
                "blissora_gratitude_list",
                "blissora_mood_history",
                "blissora_current_mood",
                "blissora_fav_quotes",
                "blissora_custom_mantras",
                "blissora_challenge_stats",
                "blissora_weekly_checks",
                "blissora_custom_goals",
                "blissora_completed_today",
                "blissora_completed_date",
                "blissora_meditation_stats",
                "blissora_gallery_favs",
                "blissora_weather_last_city"
            ];

            keysToReset.forEach(k => localStorage.removeItem(k));

            resetModal.classList.remove("active");
            applyTheme("light", true);
            applyFontScale(100, true);

            loadProfile();
            initAudioSettings();
            loadReminderSettings();
            loadAccessibilitySettings();
            calculateStorageUsage();

            showToast("🗑️ All Blissora data has been reset to defaults.", "warning");
        });
    }

    // ============================================================
    // 7. INITIALIZE ALL SECTIONS
    // ============================================================
    loadProfile();
    initAudioSettings();
    loadReminderSettings();
    loadAccessibilitySettings();
    calculateStorageUsage();

});

