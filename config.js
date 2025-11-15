// --- JAVASCRIPT: CONFIGURATION & STATE MANAGEMENT ---

// =========================================================================
// !!! ⚠️ CONFIGURATION - YOU MUST EDIT THIS SECTION ⚠️ !!!
// =========================================================================
const CONFIG = {
    // 1. TIMING CONTROL
    TIMER_DURATION_MS: 60 * 1000, // 1 Minute (60 seconds)
    // Must be the EXACT date/time of her birthday midnight. (Replace 2025 date!)
    // TARGET_MIDNIGHT: new Date('November 16, 2025 11::00').getTime(), 
    // TARGET_MIDNIGHT: new Date().getTime() + (5 * 60 * 1000),
        TARGET_MIDNIGHT: new Date().getTime(),

    
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
    SONG_EMBED: 'song.mp3', 
    FINAL_IMAGE_URL: 'bdaypic.jpg', 
    CRUSH_NAME: 'Her Name', 
    CLOSING_MESSAGE: 'I hope you enjoyed the journey . \n  wish u a happiest \n Happy Birthday, priya . I\'m so glad you\'re in my life .'
};
// =========================================================================

// Centralized State Management (RETAINED)
let cardState = {
    currentPage: 1, 
    unlockTimes: { 2: 0, 3: 0, 4: 0 },
    timerInterval: null
};

// Tracks whether the user has interacted with the page (click/keyboard).
let userInteracted = false;
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
        <h1 id="final-title" style="display:none;">🎉 HAPPY BDAY! 🎉</h1>
        <div id="gift-container" style="position: relative; display:flex; justify-content:center; align-items:center; width:100%; min-height:40vh;">
            <img id="final-image" src="${CONFIG.FINAL_IMAGE_URL}" alt="A personalized birthday image" style="max-width:60%; border-radius:8px; display:none; opacity:0;">
            <!-- Gift wrapper overlay (covers the image) -->
            <div id="gift-wrap" style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:60%; max-width:420px; height: auto; display:flex; align-items:center; justify-content:center;">
                <div class="gift-box" style="position:relative; width:100%; padding-top:66%; background: #fffaf0; border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,0.12); display:flex; align-items:center; justify-content:center;">
                    <div class="ribbon" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
                        <div style="width:100%; height:18%; background: linear-gradient(90deg,#d4af37,#c68b1f); transform:skewY(-3deg);"></div>
                        <div style="position:absolute; width:18%; height:100%; left:41%; background: linear-gradient(180deg,#d4af37,#c68b1f);"></div>
                    </div>
                    <button id="gift-play-button" aria-label="Open gift" style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); z-index:4; background:transparent; border:none; font-size:18px; color:#5b4636; cursor:pointer; padding:8px 14px;">Open Gift</button>
                </div>
            </div>
        </div>

        <!-- Hidden audio element; playback is triggered when gift is opened -->
        <audio id="birthday-audio" style="display: none;" preload="auto">
            <source src="${CONFIG.SONG_EMBED}" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>

        <p id="final-closing" style="display:none; margin-top: 20px; font-weight: bold;">${CONFIG.CLOSING_MESSAGE.replace('[Crush\'s Name]', CONFIG.CRUSH_NAME)}</p>
    `;

    // Inject classic styling for the final page (only once)
    if (!document.getElementById('classic-style')) {
        const style = document.createElement('style');
        style.id = 'classic-style';
        style.innerHTML = `
            .final-classic { font-family: Georgia, 'Times New Roman', serif; color: #2b2b2b; background: transparent; padding: 40px; text-align: center; min-height: 60vh; box-shadow: 0 6px 30px rgba(0,0,0,0.12); border-radius: 12px; }
            .final-classic h1 { font-size: 36px; margin-bottom: 8px; }
            .final-classic p { font-size: 16px; color: #3b3b3b; }
            .final-classic img { max-width: 60%; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.12); margin: 18px 0; }
            .butterfly { position: absolute; pointer-events: none; font-size: 28px; will-change: transform, opacity; transform-origin: center; }
        `;
        document.head.appendChild(style);
    }

    // Apply final-classic to container
    finalPage.classList.add('final-classic');

    // Try to play immediately. If blocked, show a clear play button so the user can start playback.
    const tryPlay = () => {
        const audio = document.getElementById('birthday-audio');
        if (!audio) return;

        // If the user has interacted previously, browsers are more likely to allow autoplay.
        audio.play().then(() => {
            // played successfully (but still present gift overlay until opened)
        }).catch(err => {
            console.log('Autoplay blocked or failed:', err);
        });
        // Always present the gift wrapper so user can open it intentionally
        showGiftWrapper(audio);
    };

    // If we are currently handling a user gesture, try playing right away.
    tryPlay();
}

// Show a gift wrapper overlay over the image; clicking unwraps and starts audio
function showGiftWrapper(audioEl) {
    const giftWrap = document.getElementById('gift-wrap');
    const playBtn = document.getElementById('gift-play-button');
    const finalPage = document.getElementById('final-page');
    if (!giftWrap || !playBtn || !finalPage) return;

    // Ensure single attachment
    if (document.getElementById('gift-opened')) return;

    // Click handler to unwrap
    const openGift = () => {
        // animate the gift wrap scaling and fading
        giftWrap.animate([
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(1.04) rotate(-3deg)', opacity: 1, offset: 0.4 },
            { transform: 'scale(0.2) rotate(25deg)', opacity: 0 }
        ], { duration: 700, easing: 'ease-out', fill: 'forwards' });

        // Slight delay to let unwrap animation show
        setTimeout(() => {
            // remove the gift wrap from DOM
            if (giftWrap && giftWrap.parentNode) giftWrap.parentNode.removeChild(giftWrap);

            // reveal the hidden image with a subtle fade/scale animation
            const finalImg = document.getElementById('final-image');
            if (finalImg) {
                finalImg.style.display = 'block';
                try {
                    finalImg.animate([
                        { opacity: 0, transform: 'scale(0.98)' },
                        { opacity: 1, transform: 'scale(1)' }
                    ], { duration: 420, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });
                } catch (e) {
                    finalImg.style.opacity = '1';
                }
            }

            // reveal title, subtitle and closing message
            const titleEl = document.getElementById('final-title');
            const subEl = document.getElementById('final-sub');
            const closingEl = document.getElementById('final-closing');
            [titleEl, subEl, closingEl].forEach((el, idx) => {
                if (!el) return;
                el.style.display = 'block';
                try {
                    el.animate([
                        { opacity: 0, transform: 'translateY(6px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ], { duration: 480, delay: 120 * idx, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });
                } catch (e) {
                    el.style.opacity = '1';
                }
            });

            // mark opened
            const marker = document.createElement('div'); marker.id = 'gift-opened'; marker.style.display='none'; finalPage.appendChild(marker);
            // play audio
            if (audioEl) {
                audioEl.play().catch(err => console.log('Play failed after gift open:', err));
            }
            // spawn butterflies
            createButterflies(12);
        }, 420);
    };

    // Allow clicking either the overlay or the image to open the gift
    playBtn.addEventListener('click', openGift, { once: true });
    const img = document.getElementById('final-image');
    if (img) img.addEventListener('click', openGift, { once: true });
}

// Create animated butterflies that fly across the final page
function createButterflies(count) {
    const container = document.getElementById('final-page');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
        const b = document.createElement('div');
        b.className = 'butterfly';
        b.textContent = '🦋';

        // start near the center with small random offset
        const startX = rect.width * 0.5 + (Math.random() - 0.5) * 80;
        const startY = rect.height * 0.6 + (Math.random() - 0.5) * 40;

        // end somewhere above and to the sides
        const endX = Math.random() * rect.width;
        const endY = Math.random() * rect.height * 0.25;

        b.style.left = `${startX}px`;
        b.style.top = `${startY}px`;
        b.style.opacity = '0';
        container.appendChild(b);

        // randomize animation params
        const duration = 2500 + Math.random() * 2200;
        const delay = Math.random() * 300;

        const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 120;
        const midY = (startY + endY) / 2 - (50 + Math.random() * 120);

        // Use Web Animations API for a smooth path
        const keyframes = [
            { transform: `translate(0px, 0px) rotate(${Math.random()*30-15}deg)`, opacity: 0 },
            { transform: `translate(${midX - startX}px, ${midY - startY}px) rotate(${Math.random()*60-30}deg)`, opacity: 1 },
            { transform: `translate(${endX - startX}px, ${endY - startY}px) rotate(${Math.random()*60-30}deg)`, opacity: 0 }
        ];

        const anim = b.animate(keyframes, {
            duration: duration,
            easing: 'cubic-bezier(.32,.7,.15,1)',
            delay: delay,
            iterations: 1,
            fill: 'forwards'
        });

        anim.onfinish = () => b.remove();
    }
}

// Initialize the card on load (RETAINED)
function initializeCard() {
    loadPageContent(); 
    // Track any user interaction so browsers may allow autoplay later
    document.addEventListener('click', () => userInteracted = true, { once: false });
    document.addEventListener('keydown', () => userInteracted = true, { once: false });
    if (Date.now() >= CONFIG.TARGET_MIDNIGHT) {
        showFinalPage();
    } else {
        updatePageDisplay();
    }
}

document.addEventListener('DOMContentLoaded', initializeCard);