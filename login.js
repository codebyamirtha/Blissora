/* ============================================================
   BLISSORA — AUTHENTICATION (LOGIN & SIGNUP) JAVASCRIPT
   Handles login validation, account creation, demo sign-in,
   remember-me persistence, password visibility toggles,
   password strength evaluation, and password reset modal.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    // ============================================================
    // 0. THEME SYNC
    // ============================================================
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    // ============================================================
    // 1. LOCAL STORAGE USER REPOSITORY
    // ============================================================
    const DEFAULT_DEMO_USER = {
        name: "Demo User",
        email: "demo@blissora.com",
        password: "password123",
        joinedDate: "November 2026"
    };

    function getUsers() {
        let users = [];
        try {
            const stored = localStorage.getItem("blissora_users");
            if (stored) {
                users = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Error reading users:", e);
        }

        // Ensure default demo user exists
        if (!users.some(u => u.email.toLowerCase() === DEFAULT_DEMO_USER.email.toLowerCase())) {
            users.push(DEFAULT_DEMO_USER);
            localStorage.setItem("blissora_users", JSON.stringify(users));
        }

        return users;
    }

    function findUserByEmail(email) {
        if (!email) return null;
        const users = getUsers();
        return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
    }

    function saveNewUser(user) {
        const users = getUsers();
        users.push(user);
        localStorage.setItem("blissora_users", JSON.stringify(users));
    }

    function updateUserPassword(email, newPassword) {
        const users = getUsers();
        let updated = false;
        const normalized = email.trim().toLowerCase();
        for (let i = 0; i < users.length; i++) {
            if (users[i].email.toLowerCase() === normalized) {
                users[i].password = newPassword;
                updated = true;
                break;
            }
        }
        if (updated) {
            localStorage.setItem("blissora_users", JSON.stringify(users));
        }
        return updated;
    }

    // ============================================================
    // 2. IN-PAGE NOTIFICATION HELPER
    // ============================================================
    function showAlert(alertEl, message, type = "error") {
        if (!alertEl) return;
        alertEl.textContent = message;
        alertEl.className = `auth-alert show ${type}`;

        if (type === "error") {
            alertEl.classList.remove("shake");
            void alertEl.offsetWidth; // Force reflow
            alertEl.classList.add("shake");
        }
    }

    function clearAlert(alertEl) {
        if (!alertEl) return;
        alertEl.className = "auth-alert";
        alertEl.textContent = "";
    }

    // ============================================================
    // 3. PASSWORD VISIBILITY TOGGLE HELPER
    // ============================================================
    function setupPasswordToggle(toggleBtnId, inputId) {
        const btn = document.getElementById(toggleBtnId);
        const input = document.getElementById(inputId);
        if (btn && input) {
            btn.addEventListener("click", function () {
                const isPassword = input.type === "password";
                input.type = isPassword ? "text" : "password";
                btn.textContent = isPassword ? "🙈" : "👁️";
                btn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
            });
        }
    }

    setupPasswordToggle("togglePasswordBtn", "password");
    setupPasswordToggle("toggleConfirmPasswordBtn", "confirmPassword");
    setupPasswordToggle("toggleResetPasswordBtn", "resetNewPassword");

    // ============================================================
    // 4. LOGIN PAGE LOGIC
    // ============================================================
    const loginForm = document.getElementById("loginForm");
    const authAlert = document.getElementById("authAlert");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberMeCheckbox = document.getElementById("rememberMe");
    const demoLoginBtn = document.getElementById("demoLoginBtn");

    if (loginForm) {
        // Pre-fill Remembered Email
        const rememberedEmail = localStorage.getItem("blissora_remembered_email");
        if (rememberedEmail && emailInput && rememberMeCheckbox) {
            emailInput.value = rememberedEmail;
            rememberMeCheckbox.checked = true;
        }

        // Check URL query parameters (e.g., from signup redirect)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("registered") === "true") {
            const regEmail = urlParams.get("email");
            if (regEmail && emailInput) {
                emailInput.value = regEmail;
            }
            showAlert(authAlert, "🎉 Account created successfully! Please sign in with your password.", "success");
        }

        // Handle Login Submission
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            clearAlert(authAlert);

            const email = emailInput ? emailInput.value.trim() : "";
            const password = passwordInput ? passwordInput.value : "";

            // 1. Validate Empty Fields
            if (!email || !password) {
                showAlert(authAlert, "Please enter both your email address and password.", "error");
                return;
            }

            // 2. Validate Email Format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showAlert(authAlert, "Please enter a valid email address.", "error");
                return;
            }

            // 3. Authenticate User
            const user = findUserByEmail(email);
            if (!user || user.password !== password) {
                showAlert(authAlert, "Incorrect email or password. Please try again or use the demo login.", "error");
                return;
            }

            // 4. Handle Remember Me
            if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                localStorage.setItem("blissora_remembered_email", email);
            } else {
                localStorage.removeItem("blissora_remembered_email");
            }

            // 5. Store Session & Sync Profile
            const sessionUser = {
                name: user.name,
                email: user.email,
                joinedDate: user.joinedDate || "November 2026"
            };
            localStorage.setItem("blissora_current_user", JSON.stringify(sessionUser));

            // Sync with profile in Settings
            try {
                let profile = JSON.parse(localStorage.getItem("blissora_user_profile") || "{}");
                profile.name = user.name;
                profile.email = user.email;
                if (!profile.joinedDate) profile.joinedDate = user.joinedDate || "November 2026";
                if (!profile.avatar) profile.avatar = "profile.jpg";
                if (!profile.mantra) profile.mantra = "Inhale peace, exhale tension.";
                localStorage.setItem("blissora_user_profile", JSON.stringify(profile));
            } catch (err) {
                console.error("Profile sync error:", err);
            }

            // 6. Success Feedback & Redirect
            showAlert(authAlert, `🌿 Welcome back, ${user.name}! Redirecting to Blissora...`, "success");

            const submitBtn = document.getElementById("loginSubmitBtn");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = "✨ Logging in...";
            }

            setTimeout(function () {
                window.location.href = "index.html";
            }, 750);
        });

        // One-Click Demo Login
        if (demoLoginBtn) {
            demoLoginBtn.addEventListener("click", function () {
                if (emailInput) emailInput.value = DEFAULT_DEMO_USER.email;
                if (passwordInput) passwordInput.value = DEFAULT_DEMO_USER.password;
                if (loginForm) {
                    loginForm.dispatchEvent(new Event("submit", { cancelable: true }));
                }
            });
        }
    }

    // ============================================================
    // 5. FORGOT PASSWORD MODAL LOGIC
    // ============================================================
    const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
    const forgotModal = document.getElementById("forgotPasswordModal");
    const closeForgotModalBtn = document.getElementById("closeForgotModalBtn");
    const cancelResetBtn = document.getElementById("cancelResetBtn");
    const submitResetBtn = document.getElementById("submitResetBtn");
    const resetEmailInput = document.getElementById("resetEmail");
    const resetNewPasswordInput = document.getElementById("resetNewPassword");
    const modalAlert = document.getElementById("modalAlert");

    function openForgotModal() {
        if (!forgotModal) return;
        forgotModal.classList.add("active");
        clearAlert(modalAlert);
        if (emailInput && emailInput.value && resetEmailInput) {
            resetEmailInput.value = emailInput.value;
        }
        if (resetNewPasswordInput) resetNewPasswordInput.value = "";
    }

    function closeForgotModal() {
        if (!forgotModal) return;
        forgotModal.classList.remove("active");
        clearAlert(modalAlert);
    }

    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener("click", function (e) {
            e.preventDefault();
            openForgotModal();
        });
    }

    if (closeForgotModalBtn) closeForgotModalBtn.addEventListener("click", closeForgotModal);
    if (cancelResetBtn) cancelResetBtn.addEventListener("click", closeForgotModal);

    if (forgotModal) {
        forgotModal.addEventListener("click", function (e) {
            if (e.target === forgotModal) closeForgotModal();
        });
    }

    if (submitResetBtn) {
        submitResetBtn.addEventListener("click", function () {
            clearAlert(modalAlert);
            const email = resetEmailInput ? resetEmailInput.value.trim() : "";
            const newPass = resetNewPasswordInput ? resetNewPasswordInput.value : "";

            if (!email) {
                showAlert(modalAlert, "Please enter your registered email address.", "error");
                return;
            }

            if (!newPass || newPass.length < 6) {
                showAlert(modalAlert, "New password must be at least 6 characters long.", "error");
                return;
            }

            const existingUser = findUserByEmail(email);
            if (!existingUser) {
                showAlert(modalAlert, "No Blissora account found with that email address.", "error");
                return;
            }

            const success = updateUserPassword(email, newPass);
            if (success) {
                showAlert(modalAlert, "✅ Password updated successfully! Closing...", "success");
                setTimeout(function () {
                    closeForgotModal();
                    if (emailInput) emailInput.value = email;
                    if (passwordInput) passwordInput.value = newPass;
                    showAlert(authAlert, "Password updated. You can now log in!", "success");
                }, 1200);
            } else {
                showAlert(modalAlert, "Failed to update password. Please try again.", "error");
            }
        });
    }

    // ============================================================
    // 6. SIGNUP PAGE LOGIC
    // ============================================================
    const signupForm = document.getElementById("signupForm");
    const nameInput = document.getElementById("name");
    const signupPasswordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const strengthBar = document.getElementById("strengthBar");
    const strengthFill = document.getElementById("strengthFill");
    const strengthText = document.getElementById("strengthText");

    if (signupForm) {
        // Password Strength Meter
        if (signupPasswordInput && strengthBar && strengthFill && strengthText) {
            signupPasswordInput.addEventListener("input", function () {
                const val = this.value;
                if (!val) {
                    strengthBar.style.display = "none";
                    strengthText.style.display = "none";
                    return;
                }

                strengthBar.style.display = "block";
                strengthText.style.display = "block";

                let score = 0;
                if (val.length >= 6) score += 1;
                if (val.length >= 9) score += 1;
                if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 1;
                if (/[0-9]/.test(val)) score += 1;
                if (/[^A-Za-z0-9]/.test(val)) score += 1;

                if (score <= 2) {
                    strengthFill.style.width = "33%";
                    strengthFill.style.backgroundColor = "#e53935";
                    strengthText.textContent = "Weak password";
                    strengthText.style.color = "#e53935";
                } else if (score <= 4) {
                    strengthFill.style.width = "66%";
                    strengthFill.style.backgroundColor = "#fb8c00";
                    strengthText.textContent = "Good password";
                    strengthText.style.color = "#fb8c00";
                } else {
                    strengthFill.style.width = "100%";
                    strengthFill.style.backgroundColor = "#2E8B57";
                    strengthText.textContent = "Strong password";
                    strengthText.style.color = "#2E8B57";
                }
            });
        }

        // Handle Signup Submission
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault();
            clearAlert(authAlert);

            const name = nameInput ? nameInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim() : "";
            const password = signupPasswordInput ? signupPasswordInput.value : "";
            const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";

            // Validate Fields
            if (!name || !email || !password || !confirmPassword) {
                showAlert(authAlert, "Please fill in all required fields.", "error");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showAlert(authAlert, "Please enter a valid email address.", "error");
                return;
            }

            if (password.length < 6) {
                showAlert(authAlert, "Password must be at least 6 characters.", "error");
                return;
            }

            if (password !== confirmPassword) {
                showAlert(authAlert, "Passwords do not match. Please re-enter.", "error");
                return;
            }

            // Check duplicate email
            const existing = findUserByEmail(email);
            if (existing) {
                showAlert(authAlert, "An account with this email already exists. Please log in.", "error");
                return;
            }

            // Format Joined Date
            const now = new Date();
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const joinedDate = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

            // Save User
            const newUser = {
                name: name,
                email: email,
                password: password,
                joinedDate: joinedDate
            };
            saveNewUser(newUser);

            showAlert(authAlert, "🌿 Account created! Redirecting to login...", "success");

            const signupSubmitBtn = document.getElementById("signupSubmitBtn");
            if (signupSubmitBtn) {
                signupSubmitBtn.disabled = true;
                signupSubmitBtn.innerHTML = "✨ Creating Account...";
            }

            setTimeout(function () {
                window.location.href = `login.html?registered=true&email=${encodeURIComponent(email)}`;
            }, 800);
        });
    }

});
