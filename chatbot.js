/* ============================================================
   BLISSORA — AI WELLNESS CHATBOT ENGINE
   Interactive, empathetic, and comprehensive wellness assistant
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // DOM Elements
    const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendBtn");
    const clearChatBtn = document.getElementById("clearChatBtn");
    const quickQuestionButtons = document.querySelectorAll(".quick-question-btn");

    // Welcome Message Constant
    const INITIAL_BOT_MESSAGE = {
        sender: "bot",
        text: "👋 Hello! I am your Blissora Wellness Companion. How are you feeling right now? Feel free to ask me about stress relief, meditation, sleep tips, or daily wellness habits.",
        time: getCurrentTime()
    };

    // ============================================================
    // 1. CHAT HISTORY (LOCALSTORAGE)
    // ============================================================
    function getStoredChat() {
        try {
            const saved = localStorage.getItem("blissora_chat_history");
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return [INITIAL_BOT_MESSAGE];
    }

    function saveChat(history) {
        // Keep last 40 messages
        if (history.length > 40) history = history.slice(history.length - 40);
        localStorage.setItem("blissora_chat_history", JSON.stringify(history));
    }

    function getCurrentTime() {
        return new Date().toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    // ============================================================
    // 2. RENDER MESSAGES
    // ============================================================
    function renderMessages() {
        if (!chatBox) return;
        chatBox.innerHTML = "";
        const history = getStoredChat();

        history.forEach(msg => {
            appendMessageToDOM(msg.text, msg.sender, msg.time);
        });

        scrollChatToBottom();
    }

    function appendMessageToDOM(text, sender, time) {
        const row = document.createElement("div");
        row.className = `message-row ${sender}`;

        const bubble = document.createElement("div");
        bubble.className = sender === "user" ? "user-message" : "bot-message";
        bubble.innerHTML = formatMessageText(text);

        const timeSpan = document.createElement("span");
        timeSpan.className = "message-time";
        timeSpan.textContent = time || getCurrentTime();

        row.appendChild(bubble);
        row.appendChild(timeSpan);
        chatBox.appendChild(row);

        scrollChatToBottom();
    }

    function formatMessageText(text) {
        // Convert simple line breaks and links
        return text
            .replace(/\n/g, "<br>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    }

    function scrollChatToBottom() {
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    // ============================================================
    // 3. TYPING INDICATOR
    // ============================================================
    function showTypingIndicator() {
        const row = document.createElement("div");
        row.className = "message-row bot typing-row";
        row.id = "typingIndicatorRow";

        const indicator = document.createElement("div");
        indicator.className = "typing-indicator";
        indicator.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;

        row.appendChild(indicator);
        chatBox.appendChild(row);
        scrollChatToBottom();
    }

    function hideTypingIndicator() {
        const row = document.getElementById("typingIndicatorRow");
        if (row) row.remove();
    }

    // ============================================================
    // 4. SEND MESSAGE LOGIC
    // ============================================================
    function sendMessage(customText) {
        const text = (customText || userInput.value).trim();
        if (!text) return;

        const time = getCurrentTime();

        // 1. Append User Message
        const history = getStoredChat();
        history.push({ sender: "user", text: text, time: time });
        saveChat(history);
        appendMessageToDOM(text, "user", time);

        if (!customText && userInput) {
            userInput.value = "";
        }

        // 2. Show Typing Indicator
        showTypingIndicator();

        // 3. Generate Bot Response after 500ms
        setTimeout(() => {
            hideTypingIndicator();
            const reply = generateBotReply(text);
            const botTime = getCurrentTime();

            const updatedHistory = getStoredChat();
            updatedHistory.push({ sender: "bot", text: reply, time: botTime });
            saveChat(updatedHistory);
            appendMessageToDOM(reply, "bot", botTime);
        }, 550);
    }

    if (sendButton) {
        sendButton.addEventListener("click", () => sendMessage());
    }

    if (userInput) {
        userInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                sendMessage();
            }
        });
    }

    // ============================================================
    // 5. QUICK QUESTIONS CHIPS
    // ============================================================
    quickQuestionButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            const query = this.dataset.query || this.textContent.replace(/^[^\w\s]+/, "").trim();
            sendMessage(query);
        });
    });

    // ============================================================
    // 6. CLEAR CHAT
    // ============================================================
    if (clearChatBtn) {
        clearChatBtn.addEventListener("click", function () {
            if (confirm("Clear your chat conversation?")) {
                localStorage.removeItem("blissora_chat_history");
                renderMessages();
            }
        });
    }

    // ============================================================
    // 7. COMPREHENSIVE WELLNESS NLP RESPONSE ENGINE
    // ============================================================
    function generateBotReply(raw) {
        const q = raw.toLowerCase();

        // Greetings
        if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q === "morning" || q.includes("good morning")) {
            return "Good day! 🌿 I am happy you're here. Taking a few moments for self-care is powerful. How can I support your peace of mind right now?";
        }

        if (q.includes("good night") || q.includes("bye") || q.includes("goodnight")) {
            return "Sweet dreams and restful sleep! 🌙 Put your phone aside, let your shoulders melt into the bed, and breathe in peace.";
        }

        if (q.includes("how are you")) {
            return "I am feeling peaceful and ready to help you relax! 😊 How is your heart and mind feeling today?";
        }

        if (q.includes("who are you") || q.includes("what are you") || q.includes("what can you do")) {
            return "I am **Blissora AI**, your personal wellness and mindfulness assistant! 🌿 I can guide you through:\n• **Stress Relief & Anxiety reduction**\n• **Breathing exercises (Box, 4-7-8)**\n• **Sleep & Insomnia remedies**\n• **Meditation guidance**\n• **Daily positive quotes & affirmations**\n• **Navigating Blissora's features**";
        }

        if (q.includes("thank")) {
            return "You are so very welcome! 💚 Remember to be as patient and kind with yourself as you are with others.";
        }

        // Stress & Anxiety & Panic
        if (q.includes("stress") || q.includes("anxious") || q.includes("anxiety") || q.includes("panic") || q.includes("overwhelm") || q.includes("nervous")) {
            return "I hear you, and it is completely understandable to feel overwhelmed. 💚 Let's take a pause together right now:\n\n1. **Unclench your jaw** and drop your shoulders down away from your ears.\n2. **Try the 5-4-3-2-1 Grounding Technique**: Look around and name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 positive thing you appreciate.\n3. **Box Breathing**: Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds.\n\n✨ *Tip:* Head to our **Meditation** tab for an interactive animated breathing circle!";
        }

        // Breathing
        if (q.includes("breath") || q.includes("breathing") || q.includes("inhale")) {
            return "Deep breathing is your body's built-in remote control to slow your heart rate! 🌬️\n\n• **Box Breathing (4-4-4-4)**: Great for focus and composure.\n• **4-7-8 Breathing**: Natural tranquilizer for the nervous system — inhale 4s, hold 7s, exhale 8s.\n• **Calm (4-6)**: Inhale 4s, exhale 6s to immediately trigger parasympathetic calm.\n\nVisit our **Meditation Page** to practice with the visual breathing guide!";
        }

        // Sadness / Down / Depression
        if (q.includes("sad") || q.includes("crying") || q.includes("unhappy") || q.includes("depressed") || q.includes("hopeless") || q.includes("hurt")) {
            return "I am sending you a warm virtual embrace. 💚 It takes bravery to acknowledge when things feel heavy. Please remember:\n\n• You do not have to carry everything all at once.\n• Treat yourself with supreme gentleness today — make a warm cup of tea, wrap yourself in a blanket, and rest.\n• Writing your thoughts in our **Journal** can help release mental clutter without judgment.\n\nYou are deeply valuable, and this difficult chapter will pass.";
        }

        // Sleep / Insomnia
        if (q.includes("sleep") || q.includes("insomnia") || q.includes("tired") || q.includes("can't sleep") || q.includes("bedtime")) {
            return "A peaceful night's rest is essential for healing. 😴 Here are proven tips for deeper sleep:\n\n1. **Digital Sunset**: Turn off mobile screens 30-45 minutes before sleep.\n2. **4-7-8 Breathwork**: Do 4 cycles right in bed to slow your pulse.\n3. **Sound Therapy**: Listen to gentle rainfall or 432Hz Zen bowls in our **Relaxing Music** player.\n4. **Brain Dump**: Write tomorrow's to-do list in your Journal so your mind stops looping on it.";
        }

        // Meditation
        if (q.includes("meditat") || q.includes("mindful") || q.includes("zen")) {
            return "Meditation isn't about stopping your thoughts — it's about noticing them without judgment and gently returning to your breath. 🧘\n\n• Start small with just **3 to 5 minutes**.\n• Check out our **Meditation Page** for customizable session timers, guided techniques (Body Scan, Loving-Kindness), and ambient soundscapes!";
        }

        // Anger / Frustrated
        if (q.includes("angry") || q.includes("mad") || q.includes("frustrated") || q.includes("irritat")) {
            return "Anger is an indicator of boundary crossing or frustration. 🌬️\n\n1. **Take 3 long, cooling exhales** through your mouth.\n2. **Physical Release**: Do a brisk 5-minute walk, shake your hands, or stretch your chest.\n3. Give yourself permission to pause before speaking or sending that message.";
        }

        // Happy / Good Mood
        if (q.includes("happy") || q.includes("great") || q.includes("good") || q.includes("excited") || q.includes("awesome") || q.includes("wonderful")) {
            return "That warms my heart! 🌟 Savor this positive feeling. Notice where you feel joy in your body — a light chest, a smile, or relaxed shoulders. Why not log this moment in your **Mood Tracker** or write what made you smile in your **Journal**?";
        }

        // Quote / Motivation / Inspiration
        if (q.includes("quote") || q.includes("motivation") || q.includes("inspire") || q.includes("affirmation")) {
            const quoteOptions = [
                "✨ *'Peace begins when expectation ends and gratitude begins.'* — Buddha",
                "✨ *'You are stronger than you know, braver than you believe, and loved more than you imagine.'* — A.A. Milne",
                "✨ *'Small daily improvements over time lead to stunning results.'* — Robin Sharma",
                "✨ *'Talk to yourself like you would to someone you love.'* — Brené Brown"
            ];
            const randomQuote = quoteOptions[Math.floor(Math.random() * quoteOptions.length)];
            return `${randomQuote}\n\n👉 Visit our **Quotes & Affirmations** page to generate more or save favorites!`;
        }

        // Music / Audio / Soundscapes
        if (q.includes("music") || q.includes("sound") || q.includes("rain") || q.includes("ocean") || q.includes("song") || q.includes("listen")) {
            return "Blissora features **5 relaxing ambient soundscapes**! 🎵\n\n• 🧘 **Zen Tibetan Bowls (432Hz)**\n• 🌧️ **Calming Rain & Thunder**\n• 🌊 **Rhythmic Ocean Waves**\n• 🐦 **Forest Birds & Breeze**\n• 🎹 **Peaceful Piano Chords**\n\nYou can play them directly on our **Home Page**, **Meditation Page**, or using the **Floating Music Player** in the bottom-left corner!";
        }

        // Weather
        if (q.includes("weather") || q.includes("temperature") || q.includes("rainy") || q.includes("sunny")) {
            return "Weather profoundly affects our emotional state! 🌤️ Check our **Weather Suggestions** page to get live weather for your city along with custom wellness routines (hydration for sunny days, cozy mindfulness for rainy days)!";
        }

        // Journal / Diary
        if (q.includes("journal") || q.includes("write") || q.includes("diary")) {
            return "Expressive writing is clinically proven to reduce stress and anxiety. 📝 In our **Journal** page, you can:\n• Tag your entries with mood badges\n• Click any of our **6 Writing Prompts** for inspiration\n• Save daily gratitude notes to your Gratitude Wall\n• Export your reflections as a backup file!";
        }

        // Challenge / Habits
        if (q.includes("challenge") || q.includes("habit") || q.includes("routine") || q.includes("goal")) {
            return "Micro-habits change lives! 🎯 Visit our **Daily Challenge** page to:\n• Complete today's wellness micro-task\n• Check items off your Weekly Checklist\n• Build your daily mindfulness streak\n• Unlock badges in your **Achievement Hall**!";
        }

        // Loneliness / Relationships
        if (q.includes("lonely") || q.includes("alone") || q.includes("friend")) {
            return "Feeling lonely is a deeply human experience, but please remember you are not alone in having these feelings. 💖\n\n• Reach out to a loved one with a simple text: *'Thinking of you, hope you're having a good day.'*\n• Spend a few minutes outside observing birds and trees — nature reminds us of connection.\n• Practice Metta (Loving-Kindness) in our Meditation section.";
        }

        // Default friendly fallback
        return "Thank you for sharing that with me. 😊 I am here to help you cultivate peace, clarity, and daily balance.\n\nCould you tell me a little more, or try one of the **Quick Questions** below for instant guidance on stress, sleep, or breathing?";
    }

    // Initial render
    renderMessages();
});
