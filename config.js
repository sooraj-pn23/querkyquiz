// --- JAVASCRIPT: CONFIGURATION & STATE MANAGEMENT ---

// =========================================================================
// !!! ⚠️ CONFIGURATION - YOU MUST EDIT THIS SECTION ⚠️ !!!
// =========================================================================
const CONFIG = {
    // 1. TIMING CONTROL
    TIMER_DURATION_MS: 60 * 1000, // 1 Minute (60 seconds)
    // Must be the EXACT date/time of her birthday midnight. (Replace 2025 date!)
    TARGET_MIDNIGHT: new Date('October 30, 2025 11:15:00').getTime(), 
    
    // 2. ANSWERS: Update these to your specific correct answers. They are case-insensitive.
    ANSWERS: {
        1: ['ALIEN', 'UNICORN'], // Page 1: Flirty choice (can accept both options)
        2: 'POTATO',             // Page 2: Must be your specific funny word
        3: 'YES',                // Page 3: Must be your specific flirty answer
    },
    
    // 3. PAGE CONTENT & REPLIES: Titles, Questions, and Quirky Pop-ups
    PAGES: {
        1: { 
            title: "A Sneaky Surprise is in the Air...", 
            question: "If you had to choose a mythical creature to be your personal chauffeur for the day, would you choose a slightly confused **Alien** or a sassy **Unicorn**?",
            reply: "POP! You chose wisely. Your chauffeur is currently receiving mandatory sparkle-waxing. Next challenge in T-minus one minute!"
        },
        2: { 
            title: "Tick Tock Goes the Clock! (The Silly Test)", 
            question: "What is the funniest one-word substitute for the word 'Crush' that makes you laugh every time you hear it? (Hint: The answer is something you might eat.)", 
            reply: "BAM! Perfect answer. That word is now officially banned from all serious conversations. You’ve earned a one-minute break. Don't spend it all in one place!"
        },
        3: { 
            title: "The Final Countdown Begins... Almost!", 
            question: "Hypothetically: If I showed up right now with pizza, your favorite movie, and a terrible singing voice, would you let me in? (Answer with a single, simple word.)", 
            reply: "BOOM! I knew it! Your honesty is appreciated, though my singing remains questionable. The last test of patience awaits..."
        },
        4: { 
            title: "The Final Test of Patience (Midnight Awaits)", 
            question: "Is waiting for this final reveal more painful than accidentally texting your parents a super embarrassing emoji? Ponder that... but **your answer won't open the card.**" 
        }
    },

    // 4. FINAL REVEAL CONTENT:
    SONG_EMBED: 'https://open.spotify.com/embed/track/1', 
    FINAL_IMAGE_URL: 'https://via.placeholder.com/350x200?text=Your+Personal+Photo+Here', 
    CRUSH_NAME: 'Her Name', 
    CLOSING_MESSAGE: 'I hope you enjoyed the journey. You deserve the best day. Happy Birthday, [Crush\'s Name]. I\'m so glad you\'re in my life.'
};
// =========================================================================

// Centralized State Management (RETAINED)
let cardState = {
    currentPage: 1, 
    unlockTimes: { 2: 0, 3: 0, 4: 0 },
    timerInterval: null
};

// --- CORE LOGIC FUNCTIONS ---

// Function to populate page content from CONFIG (RETAINED)
function loadPageContent() {
    for (let i = 1; i <= 4; i++) {
        const page = document.querySelector(`[data-page="${i}"]`);
        page.querySelector('h2').innerHTML = CONFIG.PAGES[i].title;
        if (i === 1) {
             page.querySelector('p').innerHTML = CONFIG.PAGES[i].question;
        } else {
             page.querySelectorAll('p')[1].innerHTML = CONFIG.PAGES[i].question;
        }
    }
}

// Function to update which page is currently visible (RETAINED)
function updatePageDisplay() {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    const currentPageElement = document.getElementById(`page-${cardState.currentPage}`);
    if (currentPageElement) {
        currentPageElement.style.display = 'block';
    }
    
    if (cardState.currentPage > 1 && cardState.currentPage < 5) {
         startPageTimer(cardState.currentPage);
    }
    
    if (cardState.currentPage === 2 || cardState.currentPage === 3) {
        const button = document.querySelector(`[data-input="${cardState.currentPage}"]`).nextElementSibling;
        button.disabled = true; // Disable until timer completes
    }
}

function showCustomModal(title, message) {
    const overlay = document.getElementById('custom-modal-overlay');
    const titleElement = document.getElementById('modal-title');
    const messageElement = document.getElementById('modal-message');
    const closeButton = document.getElementById('modal-close-button');

    // 1. Set Content
    titleElement.textContent = title;
    messageElement.textContent = message;

    // 2. Show Modal
    overlay.classList.add('visible');

    // 3. Setup Close Listener (to hide it when the button is clicked)
    // We remove any existing listener first to prevent multiple triggers
    const closeModal = () => {
        overlay.classList.remove('visible');
        closeButton.removeEventListener('click', closeModal);
        overlay.removeEventListener('click', handleOutsideClick);
    };

    const handleOutsideClick = (event) => {
        if (event.target === overlay) {
            closeModal();
        }
    };
    
    closeButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', handleOutsideClick);
}


// Function to check answers and progress the card (UPDATED for Custom Modal)
function checkAnswer(pageNumber) {
    const inputElement = document.querySelector(`[data-input="${pageNumber}"]`);
    const messageElement = document.querySelector(`[data-message="${pageNumber}"]`);
    const buttonElement = inputElement.nextElementSibling;
    const answer = inputElement.value.toUpperCase().trim();

    let isCorrect = false;

    if (pageNumber === 1) {
        isCorrect = CONFIG.ANSWERS[1].includes(answer);
    } else {
        isCorrect = answer === CONFIG.ANSWERS[pageNumber];
    }

    if (isCorrect) {
        // --- NEW: Trigger the CUSTOM POP-UP reply ---
        // We use a default title for the pop-up
        showCustomModal("Perfect Answer!", CONFIG.PAGES[pageNumber].reply);
        // -------------------------------------------

        messageElement.textContent = `Correct! Unlocking next stage...`;
        inputElement.disabled = true;
        buttonElement.disabled = true;

        const now = Date.now();
        const nextPageIndex = pageNumber + 1;

        if (nextPageIndex === 2 || nextPageIndex === 3) {
            cardState.unlockTimes[nextPageIndex] = now + CONFIG.TIMER_DURATION_MS; 
        } else if (nextPageIndex === 4) {
            const oneMinuteBefore = CONFIG.TARGET_MIDNIGHT - (60 * 1000); 
            cardState.unlockTimes[nextPageIndex] = Math.max(now + (60 * 1000), oneMinuteBefore);
        }

        // We wrap the page transition in a small timeout to let the user see the modal first
        setTimeout(() => {
            // Check if the modal is still open, and if so, wait until it closes
            const overlay = document.getElementById('custom-modal-overlay');
            if (overlay.classList.contains('visible')) {
                 // Wait for the modal to close before transitioning
                document.getElementById('modal-close-button').addEventListener('click', () => {
                    cardState.currentPage = nextPageIndex;
                    updatePageDisplay();
                }, { once: true }); // Use { once: true } to ensure it only runs once
            } else {
                 // If the modal somehow closed early, transition immediately
                cardState.currentPage = nextPageIndex;
                updatePageDisplay();
            }

        }, 50); // Small initial delay
        
    } else {
        messageElement.textContent = "Oops! That answer is incorrect. Try again.";
    }
}
// Timer function that runs every second (RETAINED)
function startPageTimer(pageNumber) {
    if (cardState.timerInterval) clearInterval(cardState.timerInterval);

    const timerElement = document.querySelector(`[data-timer="${pageNumber}"]`);
    const buttonElement = document.querySelector(`[data-input="${pageNumber}"]`).nextElementSibling;
    const unlockTimestamp = cardState.unlockTimes[pageNumber];
    
    cardState.timerInterval = setInterval(() => {
        const now = Date.now();
        
        if (now >= CONFIG.TARGET_MIDNIGHT) {
            clearInterval(cardState.timerInterval);
            showFinalPage();
            return;
        }
        
        let timeRemaining = (pageNumber === 4) 
            ? CONFIG.TARGET_MIDNIGHT - now 
            : unlockTimestamp - now;

        if (timeRemaining <= 0) {
            clearInterval(cardState.timerInterval);
            
            if (pageNumber < 4) {
                timerElement.textContent = "TIMER COMPLETE! Answer now!";
                buttonElement.disabled = false; 
            } else {
                timerElement.textContent = "ALMOST MIDNIGHT!"; 
            }
            
        } else {
            const totalSeconds = Math.floor(timeRemaining / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            
            if (pageNumber === 4) {
                const hours = Math.floor(totalSeconds / 3600);
                timerElement.textContent = `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                 timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }, 1000);
}

// Function to show the final birthday page (RETAINED)
function showFinalPage() {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    const finalPage = document.getElementById('final-page');
    finalPage.style.display = 'block';

    finalPage.innerHTML = `
        <h1>🎉 HAPPY BIRTHDAY! 🎉</h1>
        <p>All that patience finally paid off! You made it to midnight.</p>
        <img src="${CONFIG.FINAL_IMAGE_URL}" alt="A personalized birthday image">
        
        <p style="font-style: italic; margin-top: 20px;">Your Song Choice:</p>
        <iframe 
            style="border-radius:12px" 
            src="${CONFIG.SONG_EMBED}" 
            width="100%" 
            height="100" 
            frameBorder="0" 
            allowfullscreen="" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy">
        </iframe>
        
        <p style="margin-top: 20px; font-weight: bold;">${CONFIG.CLOSING_MESSAGE.replace('[Crush\'s Name]', CONFIG.CRUSH_NAME)}</p>
    `;
}

// Initialize the card on load (RETAINED)
function initializeCard() {
    loadPageContent(); 
    if (Date.now() >= CONFIG.TARGET_MIDNIGHT) {
        showFinalPage();
    } else {
        updatePageDisplay();
    }
}

document.addEventListener('DOMContentLoaded', initializeCard);