// =======================
// Page Navigation Logic
// =======================
const pages = document.querySelectorAll(".page");

function showPage(selector) {
    pages.forEach(p => p.classList.add("hidden"));
    document.querySelector(selector).classList.remove("hidden");
}

// Navigation buttons
document.getElementById("nav-home").addEventListener("click", () => showPage(".home-container"));
document.getElementById("nav-read").addEventListener("click", () => showPage(".learn-container"));
document.getElementById("nav-speak").addEventListener("click", () => showPage(".speak-container"));
document.getElementById("nav-write").addEventListener("click", () => showPage(".write-container"));
document.getElementById("nav-about").addEventListener("click", () => showPage(".about-container"));
document.getElementById("start-btn").addEventListener("click", () => showPage(".learn-container"));

// =======================
// Learn to Read Logic
// =======================
const getWordBtn = document.getElementById("get-word-btn");
const wordDisplay = document.getElementById("word-display");
const phonemesContainer = document.getElementById("phonemes-container");
const listenBtn = document.getElementById("listen-btn");
const showSoundsBtn = document.getElementById("show-sounds-btn");
const showMeaningBtn = document.getElementById("show-meaning-btn");
const meaningDisplay = document.getElementById("meaning-display");

let currentWord = "";
let currentPhonemes = [];

getWordBtn.addEventListener("click", async () => {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/word");
        const data = await response.json();
        currentWord = data.word;
        currentPhonemes = data.phonemes.split(" ");
        wordDisplay.textContent = currentWord;
        phonemesContainer.innerHTML = "";
        meaningDisplay.innerHTML = "";
    } catch (err) {
        console.error(err);
        wordDisplay.textContent = "Error loading word!";
    }
});

listenBtn.addEventListener("click", () => {
    if (currentWord) {
        const utter = new SpeechSynthesisUtterance(currentWord);
        utter.rate = 0.8;
        utter.pitch = 1.2;
        window.speechSynthesis.speak(utter);
    }
});

showSoundsBtn.addEventListener("click", () => {
    phonemesContainer.innerHTML = "";
    currentPhonemes.forEach(ph => {
        const btn = document.createElement("button");
        btn.textContent = ph;
        btn.classList.add("btn-secondary");
        btn.addEventListener("click", () => {
            const utter = new SpeechSynthesisUtterance(ph);
            utter.rate = 0.5;
            utter.pitch = 1.5;
            window.speechSynthesis.speak(utter);
        });
        phonemesContainer.appendChild(btn);
    });
});

showMeaningBtn.addEventListener("click", async () => {
    if (!currentWord) return;
    meaningDisplay.innerHTML = "🔄 Loading meaning...";

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentWord}`);
        if (!response.ok) throw new Error("Meaning not found");
        const data = await response.json();
        const definition = data[0].meanings[0].definitions[0].definition;
        meaningDisplay.innerHTML = `📖 Meaning of "${currentWord}":<br>${definition}`;
    } catch (err) {
        console.warn(err);
        meaningDisplay.innerHTML = `ℹ️ "${currentWord}" is for practice purposes!`;
    }
});

// =======================
// Speak & Repeat Logic
// =======================
const getSpeakWordBtn = document.getElementById("get-speak-word-btn");
const speakWordDisplay = document.getElementById("speak-word-display");
const startSpeakBtn = document.getElementById("start-speak-btn");
const speakResult = document.getElementById("speak-result");

let currentSpeakWord = "";

getSpeakWordBtn.addEventListener("click", async () => {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/word");
        const data = await response.json();
        currentSpeakWord = data.word;
        speakWordDisplay.textContent = currentSpeakWord;
        speakResult.textContent = "";
    } catch (err) {
        console.error(err);
        speakWordDisplay.textContent = "⚠️ Error loading word!";
    }
});

startSpeakBtn.addEventListener("click", () => {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Your browser doesn’t support speech recognition 😢");
        return;
    }

    if (!currentSpeakWord) {
        speakResult.textContent = "🎯 Please click 'Get Word' first!";
        speakResult.style.color = "orange";
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    speakResult.textContent = "🎙️ Listening...";
    speakResult.style.color = "blue";
    recognition.start();

    recognition.onresult = (event) => {
        let spoken = event.results[0][0].transcript.toLowerCase().trim();
        let target = currentSpeakWord.toLowerCase().trim();

        spoken = spoken.replace(/[^a-z]/g, "");
        target = target.replace(/[^a-z]/g, "");

        if (spoken === target) {
            speakResult.textContent = "✅ Correct! You said it perfectly!";
            speakResult.style.color = "green";
        } else {
            speakResult.textContent = `❌ You said: "${event.results[0][0].transcript}" — try again!`;
            speakResult.style.color = "red";
        }
    };

    recognition.onerror = (event) => {
        speakResult.textContent = `⚠️ Error: ${event.error}`;
        speakResult.style.color = "red";
    };
});

// =======================
// Writing Canvas
// =======================
const canvas = document.getElementById("write-canvas");
const clearBtn = document.getElementById("clear-canvas");
const ctx = canvas.getContext("2d");

let drawing = false;
canvas.addEventListener("mousedown", () => (drawing = true));
canvas.addEventListener("mouseup", () => (drawing = false));
canvas.addEventListener("mouseleave", () => (drawing = false));
canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0072ff";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
