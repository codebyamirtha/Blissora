/* =====================================
        THEME JAVASCRIPT
===================================== */

// Apply Theme
function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

// Save Theme
function saveTheme(theme) {
    localStorage.setItem("theme", theme);
}

// Run after page loads
document.addEventListener("DOMContentLoaded", function () {
    const lightButton = document.getElementById("lightMode");
    const darkButton = document.getElementById("darkMode");

    if (lightButton) {
        lightButton.addEventListener("click", function () {
            applyTheme("light");
            saveTheme("light");
        });
    }

    if (darkButton) {
        darkButton.addEventListener("click", function () {
            applyTheme("dark");
            saveTheme("dark");
        });
    }

    // Load Saved Theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        applyTheme(savedTheme);
    }
});
