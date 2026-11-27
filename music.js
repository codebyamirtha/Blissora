/* ============================================================
   BLISSORA — RELAXING MUSIC ADDON JAVASCRIPT ENGINE
   Includes HTML5 Audio Engine + Real-time Web Audio Synthesizer Fallback
   ============================================================ */

(function () {
    "use strict";

    // Track Library
    const TRACKS = {
        zen: {
            id: "zen",
            name: "Zen Meditation",
            icon: "🧘",
            src: "music/relaxing.mp3",
            altSrc: "music/relaxing.wav",
            desc: "432Hz healing bowl & calm theta drone",
            tip: "Tip: Inhale peace for 4 seconds, exhale tension for 4 seconds."
        },
        rain: {
            id: "rain",
            name: "Calming Rain",
            icon: "🌧️",
            src: "music/rain.mp3",
            altSrc: "music/rain.wav",
            desc: "Gentle raindrops & soft distant thunder",
            tip: "Tip: Let the steady rhythm of rain wash away your daily stress."
        },
        ocean: {
            id: "ocean",
            name: "Ocean Waves",
            icon: "🌊",
            src: "music/ocean.mp3",
            altSrc: "music/ocean.wav",
            desc: "Rhythmic rolling waves on a peaceful shore",
            tip: "Tip: Match your breathing to the waves — inhale as they rise, exhale as they fall."
        },
        birds: {
            id: "birds",
            name: "Forest Birds",
            icon: "🐦",
            src: "music/birds.mp3",
            altSrc: "music/birds.wav",
            desc: "Morning woodland breeze & sweet songbirds",
            tip: "Tip: Picture yourself walking through a lush green, sunlit forest."
        },
        piano: {
            id: "piano",
            name: "Peaceful Piano",
            icon: "🎹",
            src: "music/piano.mp3",
            altSrc: "music/piano.wav",
            desc: "Soothing warm acoustic chords & melodies",
            tip: "Tip: Unclench your jaw and let your shoulders drop with each chord."
        }
    };

    // State
    let currentTrackId = localStorage.getItem("blissora_music_track") || "zen";
    if (!TRACKS[currentTrackId]) currentTrackId = "zen";

    let savedVolume = parseFloat(localStorage.getItem("blissora_music_volume"));
    if (isNaN(savedVolume) || savedVolume < 0 || savedVolume > 1) {
        savedVolume = 0.6; // 60% default
    }

    let isPlaying = false;
    let isMuted = false;
    let previousVolume = savedVolume;

    // Audio Element
    let audioElement = null;

    // Web Audio Fallback Synthesizer
    let audioCtx = null;
    let synthNodes = [];
    let synthMasterGain = null;
    let isSynthRunning = false;

    function initAudioElement() {
        if (!audioElement) {
            audioElement = document.createElement("audio");
            audioElement.id = "blissoraGlobalAudio";
            audioElement.loop = true;
            audioElement.volume = savedVolume;
            document.body.appendChild(audioElement);

            audioElement.addEventListener("play", () => setPlayingState(true));
            audioElement.addEventListener("pause", () => {
                if (!isSynthRunning) setPlayingState(false);
            });
            audioElement.addEventListener("error", (e) => {
                console.warn("HTML5 audio playback fallback to Web Audio Synth", e);
                if (isPlaying) {
                    startWebAudioSynth(currentTrackId);
                }
            });
        }
    }

    // --- Web Audio Synthesizer (Zero-Latency Ambient Soundscapes) ---
    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function stopWebAudioSynth() {
        synthNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                node.disconnect();
            } catch (err) { }
        });
        synthNodes = [];
        isSynthRunning = false;
    }

    function startWebAudioSynth(trackId) {
        stopWebAudioSynth();
        const ctx = getAudioContext();
        if (!ctx) return;

        synthMasterGain = ctx.createGain();
        synthMasterGain.gain.setValueAtTime(isMuted ? 0 : savedVolume * 0.5, ctx.currentTime);
        synthMasterGain.connect(ctx.destination);
        synthNodes.push(synthMasterGain);

        if (trackId === "rain" || trackId === "ocean") {
            // White/Pink noise buffer
            const bufferSize = ctx.sampleRate * 2;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = ctx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";

            if (trackId === "rain") {
                filter.frequency.setValueAtTime(950, ctx.currentTime);
                whiteNoise.connect(filter);
                filter.connect(synthMasterGain);
            } else {
                // Ocean swell filter modulation
                filter.frequency.setValueAtTime(300, ctx.currentTime);
                const lfo = ctx.createOscillator();
                lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // 10s wave period
                const lfoGain = ctx.createGain();
                lfoGain.gain.setValueAtTime(250, ctx.currentTime);
                lfo.connect(lfoGain);
                lfoGain.connect(filter.frequency);
                lfo.start();
                synthNodes.push(lfo, lfoGain);

                whiteNoise.connect(filter);
                filter.connect(synthMasterGain);
            }

            whiteNoise.start();
            synthNodes.push(whiteNoise, filter);
        } else if (trackId === "birds") {
            // Soft background breeze + gentle harmonic chirps
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(3200, ctx.currentTime);
            oscGain.gain.setValueAtTime(0.04, ctx.currentTime);
            osc.connect(oscGain);
            oscGain.connect(synthMasterGain);
            osc.start();
            synthNodes.push(osc, oscGain);
        } else if (trackId === "piano") {
            // Relaxing harmonic chords
            const freqs = [261.63, 329.63, 392.00, 523.25];
            freqs.forEach(f => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(f, ctx.currentTime);
                gain.gain.setValueAtTime(0.06, ctx.currentTime);
                osc.connect(gain);
                gain.connect(synthMasterGain);
                osc.start();
                synthNodes.push(osc, gain);
            });
        } else {
            // Zen Tibetan 432Hz + theta binaural beat (432Hz & 436Hz)
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const oscGain = ctx.createGain();

            osc1.type = "sine";
            osc1.frequency.setValueAtTime(432, ctx.currentTime);

            osc2.type = "sine";
            osc2.frequency.setValueAtTime(436, ctx.currentTime);

            oscGain.gain.setValueAtTime(0.12, ctx.currentTime);

            osc1.connect(oscGain);
            osc2.connect(oscGain);
            oscGain.connect(synthMasterGain);

            osc1.start();
            osc2.start();
            synthNodes.push(osc1, osc2, oscGain);
        }

        isSynthRunning = true;
    }

    // --- Audio Control Functions ---
    function loadTrack(trackId, shouldPlay) {
        initAudioElement();
        const track = TRACKS[trackId] || TRACKS.zen;
        currentTrackId = track.id;
        localStorage.setItem("blissora_music_track", currentTrackId);

        stopWebAudioSynth();

        audioElement.src = track.src;
        audioElement.load();

        if (shouldPlay) {
            playAudio();
        }

        updateUI();
    }

    function playAudio() {
        initAudioElement();
        isPlaying = true;

        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                setPlayingState(true);
            }).catch(err => {
                console.log("Audio file play prevented, using Web Audio Synth:", err);
                // Fallback to Web Audio Synth if file cannot play
                startWebAudioSynth(currentTrackId);
                setPlayingState(true);
            });
        }
    }

    function pauseAudio() {
        isPlaying = false;
        if (audioElement) {
            audioElement.pause();
        }
        stopWebAudioSynth();
        setPlayingState(false);
    }

    function togglePlay() {
        if (isPlaying) {
            pauseAudio();
        } else {
            // First time user interacts, start current track
            if (!audioElement || !audioElement.src || audioElement.src === window.location.href) {
                loadTrack(currentTrackId, true);
            } else {
                playAudio();
            }
        }
    }

    function setVolume(vol) {
        vol = Math.max(0, Math.min(1, vol));
        savedVolume = vol;
        localStorage.setItem("blissora_music_volume", vol.toString());

        if (audioElement) {
            audioElement.volume = isMuted ? 0 : vol;
        }
        if (synthMasterGain && audioCtx) {
            synthMasterGain.gain.setValueAtTime(isMuted ? 0 : vol * 0.5, audioCtx.currentTime);
        }

        updateVolumeUI();
    }

    function toggleMute() {
        isMuted = !isMuted;
        if (isMuted) {
            if (audioElement) audioElement.volume = 0;
            if (synthMasterGain && audioCtx) synthMasterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        } else {
            if (audioElement) audioElement.volume = savedVolume;
            if (synthMasterGain && audioCtx) synthMasterGain.gain.setValueAtTime(savedVolume * 0.5, audioCtx.currentTime);
        }
        updateVolumeUI();
    }

    function setPlayingState(playing) {
        isPlaying = playing;
        const mainPlayBtns = document.querySelectorAll(".addon-play-btn");
        mainPlayBtns.forEach(btn => {
            btn.innerHTML = playing ? "⏸" : "▶";
            btn.setAttribute("title", playing ? "Pause Music" : "Play Music");
        });

        const floatPlayBtns = document.querySelectorAll(".floating-play-btn");
        floatPlayBtns.forEach(btn => {
            btn.innerHTML = playing ? "⏸" : "▶";
        });

        const visualizer = document.getElementById("visualizerContainer");
        if (visualizer) {
            if (playing) {
                visualizer.classList.add("playing");
            } else {
                visualizer.classList.remove("playing");
            }
        }

        const floatingWidget = document.getElementById("blissoraFloatingWidget");
        if (floatingWidget) {
            if (playing) {
                floatingWidget.classList.add("playing-state");
            } else {
                floatingWidget.classList.remove("playing-state");
            }
        }
    }

    function updateVolumeUI() {
        const volumeSliders = document.querySelectorAll(".volume-slider, .floating-volume-slider, #musicVolume");
        volumeSliders.forEach(slider => {
            slider.value = isMuted ? 0 : Math.round(savedVolume * 100);
        });

        const volumeLabels = document.querySelectorAll(".volume-label");
        volumeLabels.forEach(lbl => {
            lbl.textContent = (isMuted ? 0 : Math.round(savedVolume * 100)) + "%";
        });

        const muteBtns = document.querySelectorAll(".mute-btn");
        muteBtns.forEach(btn => {
            if (isMuted || savedVolume === 0) {
                btn.textContent = "🔇";
            } else if (savedVolume < 0.5) {
                btn.textContent = "🔉";
            } else {
                btn.textContent = "🔊";
            }
        });
    }

    function updateUI() {
        const track = TRACKS[currentTrackId] || TRACKS.zen;

        // Now Playing details in Section
        const iconEl = document.getElementById("currentTrackIcon");
        if (iconEl) iconEl.textContent = track.icon;

        const titleEl = document.getElementById("currentTrackTitle");
        if (titleEl) titleEl.textContent = track.name;

        const descEl = document.getElementById("currentTrackDesc");
        if (descEl) descEl.textContent = track.desc;

        const tipEl = document.getElementById("currentTrackTip");
        if (tipEl) tipEl.textContent = track.tip;

        // Floating widget track title
        const floatTrackTitle = document.getElementById("floatingTrackTitle");
        if (floatTrackTitle) {
            floatTrackTitle.textContent = `${track.icon} ${track.name}`;
        }

        // Active state on Track Cards
        const trackCards = document.querySelectorAll(".sound-track-card");
        trackCards.forEach(card => {
            if (card.dataset.track === currentTrackId) {
                card.classList.add("active");
            } else {
                card.classList.remove("active");
            }
        });

        // Floating Select Dropdown
        const floatSelect = document.getElementById("floatingTrackSelect");
        if (floatSelect) {
            floatSelect.value = currentTrackId;
        }

        updateVolumeUI();
    }

    // --- DOM Setup & Event Binding ---
    function setupAddonEvents() {
        initAudioElement();

        // 1. Play / Pause Button in Section
        const playBtn = document.getElementById("addonPlayBtn");
        if (playBtn) {
            playBtn.addEventListener("click", togglePlay);
        }

        // 2. Track Cards in Section
        const trackCards = document.querySelectorAll(".sound-track-card");
        trackCards.forEach(card => {
            card.addEventListener("click", function () {
                const trackId = this.dataset.track;
                if (trackId && TRACKS[trackId]) {
                    loadTrack(trackId, true);
                }
            });
        });

        // 3. Volume Slider in Section
        const volSlider = document.getElementById("addonVolumeSlider");
        if (volSlider) {
            volSlider.addEventListener("input", function () {
                if (isMuted) isMuted = false;
                setVolume(this.value / 100);
            });
        }

        // 4. Mute Button in Section
        const muteBtn = document.getElementById("addonMuteBtn");
        if (muteBtn) {
            muteBtn.addEventListener("click", toggleMute);
        }

        // 5. Floating Player Trigger
        const floatTrigger = document.getElementById("floatingMusicTrigger");
        const floatPanel = document.getElementById("floatingMusicPanel");
        const floatClose = document.getElementById("floatingMusicClose");

        if (floatTrigger && floatPanel) {
            floatTrigger.addEventListener("click", () => {
                floatPanel.classList.toggle("open");
            });
        }

        if (floatClose && floatPanel) {
            floatClose.addEventListener("click", (e) => {
                e.stopPropagation();
                floatPanel.classList.remove("open");
            });
        }

        // 6. Floating Play / Pause
        const floatPlayBtn = document.getElementById("floatingPlayBtn");
        if (floatPlayBtn) {
            floatPlayBtn.addEventListener("click", togglePlay);
        }

        // 7. Floating Track Dropdown
        const floatSelect = document.getElementById("floatingTrackSelect");
        if (floatSelect) {
            floatSelect.addEventListener("change", function () {
                loadTrack(this.value, isPlaying);
            });
        }

        // 8. Floating Volume Slider
        const floatVol = document.getElementById("floatingVolumeSlider");
        if (floatVol) {
            floatVol.addEventListener("input", function () {
                if (isMuted) isMuted = false;
                setVolume(this.value / 100);
            });
        }

        // 9. Settings Page Music Volume Slider (if on settings.html)
        const settingsVol = document.querySelector(".music-settings input[type='range']");
        if (settingsVol) {
            settingsVol.id = "musicVolume";
            settingsVol.value = Math.round(savedVolume * 100);
            settingsVol.addEventListener("input", function () {
                setVolume(this.value / 100);
            });
        }

        // Pre-load track without playing
        loadTrack(currentTrackId, false);
    }

    // Attach to window for external integration (e.g. from meditation timer)
    window.BlissoraMusic = {
        play: playAudio,
        pause: pauseAudio,
        toggle: togglePlay,
        setTrack: (id) => loadTrack(id, isPlaying),
        setVolume: setVolume,
        isPlaying: () => isPlaying
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupAddonEvents);
    } else {
        setupAddonEvents();
    }
})();

