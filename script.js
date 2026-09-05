/* =========================================================
   01. HERO VIDEO & UNIVERSAL BROWSER AUDIO ENGINE
   ========================================================= */

const bgVideo = document.getElementById("bgVideo");
const soundBtn = document.getElementById("soundBtn");
const iconMuted = document.getElementById("iconMuted");
const iconUnmuted = document.getElementById("iconUnmuted");

let hasUserInteractedForSound = false;
let globalAudioCtx = null;
let currentActiveSectionId = "hero";

function updateHeroSoundIcon() {
    if (!bgVideo || !soundBtn) return;

    if (bgVideo.muted) {
        if (iconMuted) iconMuted.style.display = "inline-flex";
        if (iconUnmuted) iconUnmuted.style.display = "none";
        soundBtn.setAttribute("aria-label", "Unmute video");
    } else {
        if (iconMuted) iconMuted.style.display = "none";
        if (iconUnmuted) iconUnmuted.style.display = "inline-flex";
        soundBtn.setAttribute("aria-label", "Mute video");
    }
}

// Safely play video, with fallback to muted play if unmuted playback is restricted by browser policy
function safePlayVideo(video) {
    if (!video) return;
    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            video.muted = true;
            video.play().catch(() => {});
            if (video === bgVideo) updateHeroSoundIcon();
        });
    }
}

// Initial video setup
if (bgVideo) {
    bgVideo.muted = true;
    bgVideo.volume = 1;
    safePlayVideo(bgVideo);
    updateHeroSoundIcon();

    bgVideo.addEventListener("pause", () => {
        if (!document.hidden && bgVideo && currentActiveSectionId === "hero") {
            safePlayVideo(bgVideo);
        }
    });
}

// Resume playback when returning to the tab/app
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        if (typeof window.syncActiveSectionSound === "function") {
            window.syncActiveSectionSound();
        }
    }
});

// Try unmuting hero video safely
function tryUnmuteHero() {
    if (!bgVideo) return;
    bgVideo.muted = false;
    bgVideo.volume = 1;

    const playPromise = bgVideo.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            updateHeroSoundIcon();
        }).catch(() => {
            bgVideo.muted = true;
            bgVideo.play().catch(() => {});
            updateHeroSoundIcon();
        });
    } else {
        updateHeroSoundIcon();
    }
}

// Global helper to prime all videos and Web Audio across Safari iOS / Android / Chrome
function primeAllMediaElements() {
    // 1. Resume Web Audio Context
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            if (!globalAudioCtx) {
                globalAudioCtx = new AudioCtx();
            }
            if (globalAudioCtx.state === "suspended") {
                globalAudioCtx.resume();
            }
        }
    } catch (e) {}

    // 2. Prime media volumes
    const allVideos = document.querySelectorAll("video");
    allVideos.forEach(v => {
        v.volume = 1;
    });
}

// Universal interaction listener: un-mutes active section on ANY tap, scroll, swipe, touch
function onAnyUserInteraction() {
    hasUserInteractedForSound = true;
    primeAllMediaElements();

    if (typeof window.syncActiveSectionSound === "function") {
        window.syncActiveSectionSound();
    } else {
        tryUnmuteHero();
    }
}

// Attach to all user gesture and navigation events for instant sound activation
["touchstart", "touchend", "pointerdown", "mousedown", "click", "keydown", "wheel"].forEach(evt => {
    window.addEventListener(evt, onAnyUserInteraction, { passive: true });
    document.addEventListener(evt, onAnyUserInteraction, { passive: true });
});

// Sound button toggle functionality
if (soundBtn && bgVideo) {
    soundBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        event.preventDefault();
        hasUserInteractedForSound = true;

        if (bgVideo.muted) {
            tryUnmuteHero();
        } else {
            bgVideo.muted = true;
            safePlayVideo(bgVideo);
            updateHeroSoundIcon();
        }
    });

    soundBtn.addEventListener("touchstart", function (e) {
        e.stopPropagation();
    }, { passive: true });
}


/* =========================================================
   02. CINEMATIC METALLIC GLINT & SPARK CONTROLLER
   ========================================================= */

const heroBrand = document.getElementById("heroBrand");
const brandNameWrapper = document.querySelector(".brand-name-wrapper");

let goldAnimationRunning = false;
let goldTimer = null;
let sparkTimeout = null;
let cleanupTimeout = null;

function startGoldReflection() {
    if (!heroBrand || goldAnimationRunning) return;

    goldAnimationRunning = true;

    // Reset previous states cleanly
    heroBrand.classList.remove("gold-sweep", "spark-active");
    void heroBrand.offsetWidth;

    // Start glint sweep Left -> Right across GEMRAY (3.2s)
    heroBrand.classList.add("gold-sweep");

    // Spark triggers at the exact moment the glint reaches the final 'Y' of GEMRAY (2550ms)
    if (sparkTimeout) clearTimeout(sparkTimeout);
    sparkTimeout = setTimeout(function () {
        if (heroBrand) {
            heroBrand.classList.add("spark-active");
        }
    }, 2550);

    // Clean up animation classes as soon as glint and spark complete together (3500ms)
    if (cleanupTimeout) clearTimeout(cleanupTimeout);
    cleanupTimeout = setTimeout(function () {
        if (heroBrand) {
            heroBrand.classList.remove("gold-sweep", "spark-active");
        }
        goldAnimationRunning = false;

        // Seamlessly repeat the glow and spark cycle continuously
        scheduleNextReflection();
    }, 3500);
}

function scheduleNextReflection() {
    if (goldTimer) clearTimeout(goldTimer);
    // Smooth pause of 1.5s - 2.5s before the next sweep repeats
    const pauseDelay = Math.floor(Math.random() * 1000) + 1500;
    goldTimer = setTimeout(function () {
        startGoldReflection();
    }, pauseDelay);
}

// Initial cycle starts gently after page load (1.5s)
setTimeout(function () {
    startGoldReflection();
}, 1500);

// Interactive Glint on Hover or Tap
if (brandNameWrapper) {
    brandNameWrapper.addEventListener("mouseenter", function () {
        if (!goldAnimationRunning) {
            if (goldTimer) clearTimeout(goldTimer);
            startGoldReflection();
        }
    });

    brandNameWrapper.addEventListener("click", function () {
        if (!goldAnimationRunning) {
            if (goldTimer) clearTimeout(goldTimer);
            startGoldReflection();
        }
    });
}


/* =========================================================
   03. AMBIENT GOLD DUST / STARDUST PARTICLE CANVAS
   ========================================================= */

function initHeroParticles() {
    const canvas = document.getElementById("heroParticles");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles = [];
    let animationFrameId = null;
    let width = 0;
    let height = 0;
    let isVisible = true;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        createParticles();
    }

    function createParticles() {
        particles = [];
        // Dense enough to be magical, light enough to be 60/120fps smooth
        const count = Math.min(Math.floor(width * 0.035), 45);

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.6 + 0.5,
                alpha: Math.random() * 0.6 + 0.2,
                speedY: -(Math.random() * 0.35 + 0.15),
                speedX: (Math.random() - 0.5) * 0.25,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.025 + 0.01,
                color: Math.random() > 0.3 ? "212, 175, 90" : "255, 235, 175" // Warm gold / Pale starlight
            });
        }
    }

    function draw() {
        if (!isVisible) return;

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            p.pulse += p.pulseSpeed;
            const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.pulse) * 0.25);

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${currentAlpha})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = `rgba(${p.color}, 0.8)`;
            ctx.fill();

            // Movement
            p.y += p.speedY;
            p.x += p.speedX;

            // Wrap around edges seamlessly
            if (p.y < -10) {
                p.y = height + 10;
                p.x = Math.random() * width;
            }
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;
        }

        animationFrameId = requestAnimationFrame(draw);
    }

    // Window resize observer
    window.addEventListener("resize", resize, { passive: true });
    resize();
    draw();

    // Pause animation when hero is off-screen to preserve battery
    if ("IntersectionObserver" in window) {
        const heroSection = document.getElementById("hero");
        if (heroSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    isVisible = entry.isIntersecting;
                    if (isVisible && !animationFrameId) {
                        draw();
                    }
                });
            }, { threshold: 0.05 });
            observer.observe(heroSection);
        }
    }
}

// Initialize particles after DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroParticles);
} else {
    initHeroParticles();
}


/* =========================================================
   07. PHOTOGRAPHER VIDEOS
   ========================================================= */

const photographerDesktopVideo =
    document.getElementById(
        "photographerVideoDesktop"
    );


const photographerMobileVideo =
    document.getElementById(
        "photographerVideoMobile"
    );


const photographerSoundBtn =
    document.getElementById(
        "photographerSoundBtn"
    );


const photographerMobileSoundBtn =
    document.getElementById(
        "photographerMobileSoundBtn"
    );


/* =========================================================
   08. PHOTOGRAPHER SOUND ICON UPDATE
   ========================================================= */

function updatePhotographerSoundIcon(
    video,
    button
) {

    if (!video || !button) return;


    const mutedIcon =
        button.querySelector(
            ".photographer-muted-icon"
        );


    const unmutedIcon =
        button.querySelector(
            ".photographer-unmuted-icon"
        );


    if (video.muted) {

        if (mutedIcon) {

            mutedIcon.style.display =
                "block";

        }

        if (unmutedIcon) {

            unmutedIcon.style.display =
                "none";

        }

        button.setAttribute(
            "aria-label",
            "Unmute photographer video"
        );

    } else {

        if (mutedIcon) {

            mutedIcon.style.display =
                "none";

        }

        if (unmutedIcon) {

            unmutedIcon.style.display =
                "block";

        }

        button.setAttribute(
            "aria-label",
            "Mute photographer video"
        );

    }

}


/* =========================================================
   09. DESKTOP PHOTOGRAPHER VIDEO
   ========================================================= */

if (photographerDesktopVideo) {
    photographerDesktopVideo.muted = true;
    photographerDesktopVideo.volume = 1;

    updatePhotographerSoundIcon(
        photographerDesktopVideo,
        photographerSoundBtn
    );
}


/* =========================================================
   10. DESKTOP PHOTOGRAPHER SOUND
   ========================================================= */

if (photographerDesktopVideo && photographerSoundBtn) {
    photographerSoundBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        event.preventDefault();

        if (photographerDesktopVideo.muted) {
            photographerDesktopVideo.muted = false;
            photographerDesktopVideo.volume = 1;
            const p = photographerDesktopVideo.play();
            if (p !== undefined) {
                p.then(() => {
                    updatePhotographerSoundIcon(photographerDesktopVideo, photographerSoundBtn);
                }).catch(() => {
                    photographerDesktopVideo.muted = true;
                    photographerDesktopVideo.play().catch(() => {});
                    updatePhotographerSoundIcon(photographerDesktopVideo, photographerSoundBtn);
                });
            }
        } else {
            photographerDesktopVideo.muted = true;
            safePlayVideo(photographerDesktopVideo);
            updatePhotographerSoundIcon(photographerDesktopVideo, photographerSoundBtn);
        }
    });
}


/* =========================================================
   11. MOBILE PHOTOGRAPHER VIDEO
   ========================================================= */

if (photographerMobileVideo) {
    photographerMobileVideo.muted = true;
    photographerMobileVideo.volume = 1;

    updatePhotographerSoundIcon(
        photographerMobileVideo,
        photographerMobileSoundBtn
    );
}


/* =========================================================
   12. MOBILE PHOTOGRAPHER SOUND
   ========================================================= */

if (photographerMobileVideo && photographerMobileSoundBtn) {
    photographerMobileSoundBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        event.preventDefault();

        if (photographerMobileVideo.muted) {
            photographerMobileVideo.muted = false;
            photographerMobileVideo.volume = 1;
            const p = photographerMobileVideo.play();
            if (p !== undefined) {
                p.then(() => {
                    updatePhotographerSoundIcon(photographerMobileVideo, photographerMobileSoundBtn);
                }).catch(() => {
                    photographerMobileVideo.muted = true;
                    photographerMobileVideo.play().catch(() => {});
                    updatePhotographerSoundIcon(photographerMobileVideo, photographerMobileSoundBtn);
                });
            }
        } else {
            photographerMobileVideo.muted = true;
            safePlayVideo(photographerMobileVideo);
            updatePhotographerSoundIcon(photographerMobileVideo, photographerMobileSoundBtn);
        }
    });

    photographerMobileSoundBtn.addEventListener("touchstart", function (e) {
        e.stopPropagation();
    }, { passive: true });
}


/* =========================================================
   12A. 3D LAYERED REAL STORIES CAROUSEL & SWIPER
   ========================================================= */

(function initStories3DCarousel() {
    const container = document.getElementById("storiesStackContainer");
    const deck = document.getElementById("storiesDeck");
    const prevBtn = document.getElementById("storiesPrevBtn");
    const nextBtn = document.getElementById("storiesNextBtn");
    const soundBtn = document.getElementById("storySoundBtn");
    const dots = document.querySelectorAll(".story-dot");

    if (!deck) return;

    const cards = Array.from(deck.querySelectorAll(".story-deck-card"));
    if (cards.length === 0) return;

    let currentIndex = 0;
    let isStorySoundMuted = true;
    let isTransitioning = false;

    // Synchronize card classes (is-active, is-next, is-prev, is-hidden) and audio/video states
    function updateStoryDeck() {
        const total = cards.length;

        cards.forEach((card, i) => {
            const video = card.querySelector(".story-video");
            card.classList.remove("is-active", "is-next", "is-prev", "is-hidden");

            // Calculate relative offset from currentIndex in cyclic buffer
            let offset = (i - currentIndex) % total;
            if (offset < 0) offset += total;

            if (offset === 0) {
                // Front active card
                card.classList.add("is-active");
                if (video) {
                    try { video.currentTime = 0; } catch (e) {}
                    video.muted = isStorySoundMuted;
                    video.volume = 1;
                    safePlayVideo(video);
                }
            } else if (offset === 1) {
                // Next card (middle layer stacked right behind)
                card.classList.add("is-next");
                if (video) {
                    video.muted = true;
                    safePlayVideo(video);
                }
            } else if (offset === total - 1) {
                // Prev card (back layer stacked left behind)
                card.classList.add("is-prev");
                if (video) {
                    video.muted = true;
                    safePlayVideo(video);
                }
            } else {
                // Additional cards hidden
                card.classList.add("is-hidden");
                if (video) {
                    video.pause();
                }
            }
        });

        // Update dot pagination
        dots.forEach((dot, idx) => {
            if (idx === currentIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });

        updateStorySoundIcon();
    }

    function goToStory(index, direction = "next") {
        if (isTransitioning) return;
        isTransitioning = true;

        const total = cards.length;
        currentIndex = (index + total) % total;
        updateStoryDeck();

        setTimeout(() => {
            isTransitioning = false;
        }, 550);
    }

    function nextStory() {
        goToStory(currentIndex + 1, "next");
    }

    function prevStory() {
        goToStory(currentIndex - 1, "prev");
    }

    // Button event listeners
    if (nextBtn) {
        nextBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            nextStory();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            prevStory();
        });
    }

    // Direct card click interaction (clicking on next/prev card brings it to front)
    cards.forEach((card, idx) => {
        card.addEventListener("click", function (e) {
            // Don't trigger if clicked on video controls or sound button
            if (e.target.closest(".story-sound-btn") || e.target.closest(".stories-nav-btn")) return;

            if (idx !== currentIndex) {
                goToStory(idx);
            }
        });
    });

    // Pagination dots click
    dots.forEach((dot) => {
        dot.addEventListener("click", function () {
            const targetIdx = parseInt(this.getAttribute("data-index"), 10);
            if (!isNaN(targetIdx) && targetIdx !== currentIndex) {
                goToStory(targetIdx);
            }
        });
    });

    // Touch swipe support (Up/Down for mobile, Left/Right for desktop/tablets)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;

    deck.addEventListener("touchstart", function (e) {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isSwiping = true;
        }
    }, { passive: true });

    deck.addEventListener("touchmove", function (e) {
        if (!isSwiping || e.touches.length !== 1) return;
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
    }, { passive: true });

    deck.addEventListener("touchend", function () {
        if (!isSwiping) return;
        isSwiping = false;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const isMobileScreen = window.innerWidth <= 1000;

        if (isMobileScreen) {
            // Mobile: Vertical swipe gesture (Up / Down)
            if (Math.abs(deltaY) > 35) {
                if (deltaY < 0) {
                    // Swiped Up -> Next video
                    nextStory();
                } else {
                    // Swiped Down -> Previous video
                    prevStory();
                }
            } else if (Math.abs(deltaX) > 40) {
                // Also support horizontal swipe fallback
                if (deltaX < 0) {
                    nextStory();
                } else {
                    prevStory();
                }
            }
        } else {
            // Desktop: Horizontal swipe / drag gesture
            if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX < 0) {
                    nextStory();
                } else {
                    prevStory();
                }
            }
        }
        touchStartX = 0;
        touchEndX = 0;
        touchStartY = 0;
        touchEndY = 0;
    }, { passive: true });

    // Desktop Mouse Drag / Swipe
    let mouseStartX = 0;
    let isMouseDown = false;

    deck.addEventListener("mousedown", function (e) {
        if (e.target.closest(".stories-nav-btn") || e.target.closest(".story-sound-btn")) return;
        isMouseDown = true;
        mouseStartX = e.clientX;
        deck.classList.add("is-dragging");
    });

    window.addEventListener("mouseup", function (e) {
        if (!isMouseDown) return;
        isMouseDown = false;
        deck.classList.remove("is-dragging");

        const deltaX = e.clientX - mouseStartX;
        if (Math.abs(deltaX) > 50) {
            if (deltaX < 0) {
                nextStory();
            } else {
                prevStory();
            }
        }
    });

    // Horizontal Trackpad / Wheel scroll support over the deck
    let wheelTimeout = null;
    deck.addEventListener("wheel", function (e) {
        if (Math.abs(e.deltaX) > 30) {
            e.preventDefault();
            if (!wheelTimeout) {
                if (e.deltaX > 0) {
                    nextStory();
                } else {
                    prevStory();
                }
                wheelTimeout = setTimeout(() => {
                    wheelTimeout = null;
                }, 600);
            }
        }
    }, { passive: false });

    // Sound toggle function
    function updateStorySoundIcon() {
        if (!soundBtn) return;
        const mutedIcon = soundBtn.querySelector(".sound-icon-muted");
        const unmutedIcon = soundBtn.querySelector(".sound-icon-unmuted");

        if (isStorySoundMuted) {
            if (mutedIcon) mutedIcon.style.display = "block";
            if (unmutedIcon) unmutedIcon.style.display = "none";
            soundBtn.setAttribute("aria-label", "Unmute stories audio");
        } else {
            if (mutedIcon) mutedIcon.style.display = "none";
            if (unmutedIcon) unmutedIcon.style.display = "block";
            soundBtn.setAttribute("aria-label", "Mute stories audio");
        }
    }

    if (soundBtn) {
        soundBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            e.preventDefault();

            isStorySoundMuted = !isStorySoundMuted;
            const activeCard = cards[currentIndex];
            if (activeCard) {
                const activeVideo = activeCard.querySelector(".story-video");
                if (activeVideo) {
                    activeVideo.muted = isStorySoundMuted;
                    activeVideo.volume = 1;
                    if (!isStorySoundMuted) {
                        const p = activeVideo.play();
                        if (p !== undefined) {
                            p.catch(() => {
                                activeVideo.muted = true;
                                isStorySoundMuted = true;
                                updateStorySoundIcon();
                            });
                        }
                    }
                }
            }
            updateStorySoundIcon();
        });
    }

    // Expose story audio helpers to global audio orchestrator
    window.setStorySoundState = function(unmute) {
        isStorySoundMuted = !unmute;
        updateStorySoundIcon();
        const activeCard = cards[currentIndex];
        if (activeCard) {
            const activeVideo = activeCard.querySelector(".story-video");
            if (activeVideo) {
                activeVideo.muted = isStorySoundMuted;
                activeVideo.volume = 1;
                if (!isStorySoundMuted) {
                    safePlayVideo(activeVideo);
                }
            }
        }
    };

    window.getActiveStoryVideo = function() {
        const activeCard = cards[currentIndex];
        return activeCard ? activeCard.querySelector(".story-video") : null;
    };

    // Initialize initial state
    updateStoryDeck();
})();


/* =========================================================
   12B. PORTFOLIO PREVIEW GLASS COLLAGE ROTATOR & REDIRECT
   ========================================================= */

(function initPortfolioPreviewCollage() {
    const collage = document.getElementById("portfolioGlassCollage");
    const exploreBtn = document.getElementById("portfolioExploreBtn");
    if (!collage) return;

    // Full pool of new verified engagement & prewedding photos
    const photoPool = [
        "photos/pre wedding/prewedding1/Bhushan Pre-wedding photo-050.jpg",
        "photos/pre wedding/prewedding1/Bhushan Pre-wedding photo-09.jpg",
        "photos/pre wedding/prewedding1/Bhushan Pre-wedding photo-10.jpg",
        "photos/pre wedding/prewedding1/Bhushan Pre-wedding photo-13.jpg",
        "photos/pre wedding/prewedding1/Bhushan Pre-wedding photo-15.jpg",
        "photos/pre wedding/prewedding1/Bhushan Pre-wedding photo-29.jpg",
        "photos/pre wedding/prewedding1/Bhushan Pre-wedding photo-31.jpg",
        "photos/pre wedding/prewedding1/Bhushan Pre-wedding photo-38.jpg",
        "photos/pre wedding/prewedding1/Bhushan Pre-wedding photo-39.jpg",
        "photos/pre wedding/prewedding1/Bhushan Pre-wedding photo-42.jpg",
        "photos/pre wedding/prewedding1/Bhushan Pre-wedding photo-51.jpg",
        "photos/pre wedding/prewedding1/Bhushan Pre-wedding photo-54.jpg",
        "photos/pre wedding/prewedding2/Bhushan Pre-wedding photo-006.jpg",
        "photos/pre wedding/prewedding2/Bhushan Pre-wedding photo-016.jpg",
        "photos/pre wedding/prewedding2/Bhushan Pre-wedding photo-019.jpg",
        "photos/pre wedding/prewedding2/Bhushan Pre-wedding photo-024.jpg",
        "photos/pre wedding/prewedding2/Bhushan Pre-wedding photo-035.jpg",
        "photos/pre wedding/prewedding2/Bhushan Pre-wedding photo-036.jpg",
        "photos/pre wedding/prewedding2/Bhushan Pre-wedding photo-054.jpg",
        "photos/pre wedding/prewedding2/Bhushan Pre-wedding photo-055.jpg",
        "photos/pre wedding/prewedding2/Bhushan Pre-wedding photo-076.jpg",
        "photos/pre wedding/prewedding2/Bhushan Pre-wedding photo-078.jpg",
        "photos/pre wedding/prewedding2/Bhushan Pre-wedding photo-085.jpg",
        "photos/pre wedding/prewedding2/Bhushan Pre-wedding photo-100.jpg",
        "photos/pre wedding/prewedding2/Bhushan Pre-wedding photo-107.jpg",
        "photos/engagement/Bhushan Pre-wedding photo-09.jpg.jpeg",
        "photos/engagement/Bhushan Pre-wedding photo-11.jpg.jpeg",
        "photos/engagement/Bhushan Pre-wedding photo-12.jpg.jpeg",
        "photos/engagement/Bhushan Pre-wedding photo-19.jpg.jpeg",
        "photos/engagement/Bhushan Pre-wedding photo-20.jpg.jpeg",
        "photos/engagement/Bhushan Pre-wedding photo-23.jpg.jpeg",
        "photos/engagement/Bhushan Pre-wedding photo-26.jpg.jpeg",
        "photos/engagement/Bhushan Pre-wedding photo-27.jpg.jpeg"
    ];

    const cards = Array.from(collage.querySelectorAll(".portfolio-glass-card"));
    if (cards.length === 0) return;

    let poolIndex = cards.length;

    // Periodically pick one random glass card and cross-fade its image with a new photo from the pool
    function swapCollagePhoto() {
        if (document.hidden) return;

        const randomCardIdx = Math.floor(Math.random() * cards.length);
        const targetCard = cards[randomCardIdx];
        if (!targetCard) return;

        const img = targetCard.querySelector(".glass-photo");
        if (!img) return;

        const nextSrc = photoPool[poolIndex % photoPool.length];
        poolIndex++;

        // Preload next image before swapping to prevent empty placeholder flashes
        const preloader = new Image();
        preloader.src = nextSrc;
        preloader.onload = () => {
            img.style.opacity = "0.3";
            img.style.transform = "scale(0.94)";

            setTimeout(() => {
                img.src = nextSrc;
                img.style.opacity = "1";
                img.style.transform = "scale(1)";
            }, 300);
        };
        preloader.onerror = () => {
            img.style.opacity = "1";
            img.style.transform = "scale(1)";
        };
    }

    // Interval swapping every 3.5 seconds
    const swapTimer = setInterval(swapCollagePhoto, 3500);

    // Smooth page exit transition when clicking "Explore More"
    if (exploreBtn) {
        exploreBtn.addEventListener("click", function (e) {
            e.preventDefault();
            const targetHref = this.getAttribute("href") || "portfolio.html";

            // Visual feedback
            exploreBtn.style.transform = "scale(0.95)";
            document.body.style.transition = "opacity 0.45s ease, filter 0.45s ease";
            document.body.style.opacity = "0";
            document.body.style.filter = "blur(8px)";

            setTimeout(() => {
                window.location.href = targetHref;
            }, 450);
        });
    }
})();


/* =========================================================
   12C. SEAMLESS SCROLL SECTION AUDIO & NAV HIGHLIGHT ORCHESTRATOR
   - Automatically switches & un-mutes video audio for active section
   - Pauses all off-screen videos to ensure 60fps/120fps butter-smooth scrolling
   - Updates active nav link pill and auto-scrolls mobile navbar container
   ========================================================= */

(function initSeamlessSectionAudioAndNav() {
    const heroElem = document.getElementById("hero");
    const storiesElem = document.getElementById("stories");
    const portfolioElem = document.getElementById("portfolio-preview");
    const photographerElem = document.getElementById("photographer");
    const contactElem = document.getElementById("contact");

    const portfolioShowcaseVideo = document.getElementById("portfolioShowcaseVideo");
    const portfolioSoundBtn = document.getElementById("portfolioSoundBtn");
    const navLinksContainer = document.getElementById("portfolioNavLinks");

    function updatePortfolioSoundIcon() {
        if (!portfolioSoundBtn || !portfolioShowcaseVideo) return;
        const mutedIcon = portfolioSoundBtn.querySelector(".portfolio-muted-icon");
        const unmutedIcon = portfolioSoundBtn.querySelector(".portfolio-unmuted-icon");
        if (portfolioShowcaseVideo.muted) {
            if (mutedIcon) mutedIcon.style.display = "inline-flex";
            if (unmutedIcon) unmutedIcon.style.display = "none";
            portfolioSoundBtn.setAttribute("aria-label", "Unmute portfolio video");
        } else {
            if (mutedIcon) mutedIcon.style.display = "none";
            if (unmutedIcon) unmutedIcon.style.display = "inline-flex";
            portfolioSoundBtn.setAttribute("aria-label", "Mute portfolio video");
        }
    }

    if (portfolioSoundBtn && portfolioShowcaseVideo) {
        portfolioSoundBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            e.preventDefault();
            hasUserInteractedForSound = true;
            if (portfolioShowcaseVideo.muted) {
                portfolioShowcaseVideo.muted = false;
                portfolioShowcaseVideo.volume = 1;
                const p = portfolioShowcaseVideo.play();
                if (p !== undefined) {
                    p.then(() => updatePortfolioSoundIcon()).catch(() => {
                        portfolioShowcaseVideo.muted = true;
                        safePlayVideo(portfolioShowcaseVideo);
                        updatePortfolioSoundIcon();
                    });
                }
            } else {
                portfolioShowcaseVideo.muted = true;
                safePlayVideo(portfolioShowcaseVideo);
                updatePortfolioSoundIcon();
            }
        });
    }

    const firstVisitSections = new Set();
    let currentActiveId = "hero";

    // Map section IDs to corresponding navbar selector
    const navLinkSelectors = {
        "hero": 'a[href="index.html"], a[href="#hero"]',
        "stories": 'a[href="#stories"]',
        "portfolio-preview": 'a[href="portfolio.html"], a[href="#portfolio-preview"]',
        "photographer": 'a[href="#photographer"]',
        "contact": 'a[href="#contact"]'
    };

    function updateActiveNavLink(activeSectionId) {
        if (!navLinksContainer) return;
        const allLinks = navLinksContainer.querySelectorAll("a:not(.portfolio-nav-wa-pill)");
        allLinks.forEach(link => link.classList.remove("active"));

        const selector = navLinkSelectors[activeSectionId];
        if (selector) {
            const targetLink = navLinksContainer.querySelector(selector);
            if (targetLink) {
                targetLink.classList.add("active");
                // Auto-scroll the mobile horizontally scrollable nav container to keep active link centered
                if (window.innerWidth <= 768) {
                    try {
                        const containerWidth = navLinksContainer.offsetWidth;
                        const linkLeft = targetLink.offsetLeft;
                        const linkWidth = targetLink.offsetWidth;
                        const scrollTo = linkLeft - (containerWidth / 2) + (linkWidth / 2);
                        navLinksContainer.scrollTo({
                            left: Math.max(0, scrollTo),
                            behavior: "smooth"
                        });
                    } catch (e) {}
                }
            }
        }
    }

    function orchestrateSectionAudioAndMedia(activeSectionId) {
        currentActiveId = activeSectionId;
        currentActiveSectionId = activeSectionId;

        const isFirstVisit = !firstVisitSections.has(activeSectionId);
        if (isFirstVisit) {
            firstVisitSections.add(activeSectionId);
        }

        // Update active navigation item
        updateActiveNavLink(activeSectionId);

        const isMobile = window.innerWidth <= 768;

        // 1. Hero Audio & Playback
        if (bgVideo) {
            if (activeSectionId === "hero") {
                if (isFirstVisit) {
                    try { bgVideo.currentTime = 0; } catch (e) {}
                }
                bgVideo.muted = !hasUserInteractedForSound;
                bgVideo.volume = 1;
                const p = bgVideo.play();
                if (p !== undefined) {
                    p.then(() => updateHeroSoundIcon()).catch(() => {
                        bgVideo.muted = true;
                        safePlayVideo(bgVideo);
                        updateHeroSoundIcon();
                    });
                }
            } else {
                bgVideo.muted = true;
                bgVideo.pause();
                updateHeroSoundIcon();
            }
        }

        // 2. Stories / Review Audio & Playback
        const storiesDeck = document.getElementById("storiesDeck");
        if (storiesDeck) {
            const storyCards = Array.from(storiesDeck.querySelectorAll(".story-deck-card"));
            if (activeSectionId === "stories") {
                if (typeof window.setStorySoundState === "function") {
                    window.setStorySoundState(hasUserInteractedForSound);
                }
                storyCards.forEach((card) => {
                    const vid = card.querySelector(".story-video");
                    if (vid) {
                        const isActive = card.classList.contains("is-active");
                        if (isActive) {
                            if (isFirstVisit) {
                                try { vid.currentTime = 0; } catch (e) {}
                            }
                            vid.muted = !hasUserInteractedForSound;
                            vid.volume = 1;
                            const p = vid.play();
                            if (p !== undefined) {
                                p.then(() => {
                                    const storySoundBtn = document.getElementById("storySoundBtn");
                                    if (storySoundBtn) {
                                        const m = storySoundBtn.querySelector(".sound-icon-muted");
                                        const u = storySoundBtn.querySelector(".sound-icon-unmuted");
                                        if (hasUserInteractedForSound) {
                                            if (m) m.style.display = "none";
                                            if (u) u.style.display = "block";
                                        }
                                    }
                                }).catch(() => {
                                    vid.muted = true;
                                    safePlayVideo(vid);
                                });
                            }
                        } else {
                            vid.muted = true;
                            vid.pause();
                        }
                    }
                });
            } else {
                if (typeof window.setStorySoundState === "function") {
                    window.setStorySoundState(false);
                }
                storyCards.forEach((card) => {
                    const vid = card.querySelector(".story-video");
                    if (vid) {
                        vid.muted = true;
                        vid.pause();
                    }
                });
                const storySoundBtn = document.getElementById("storySoundBtn");
                if (storySoundBtn) {
                    const m = storySoundBtn.querySelector(".sound-icon-muted");
                    const u = storySoundBtn.querySelector(".sound-icon-unmuted");
                    if (m) m.style.display = "block";
                    if (u) u.style.display = "none";
                }
            }
        }

        // 3. Portfolio Showcase Video Audio & Playback
        if (portfolioShowcaseVideo) {
            if (activeSectionId === "portfolio-preview") {
                if (isFirstVisit) {
                    try { portfolioShowcaseVideo.currentTime = 0; } catch (e) {}
                }
                portfolioShowcaseVideo.muted = !hasUserInteractedForSound;
                portfolioShowcaseVideo.volume = 1;
                const p = portfolioShowcaseVideo.play();
                if (p !== undefined) {
                    p.then(() => updatePortfolioSoundIcon()).catch(() => {
                        portfolioShowcaseVideo.muted = true;
                        safePlayVideo(portfolioShowcaseVideo);
                        updatePortfolioSoundIcon();
                    });
                }
            } else {
                portfolioShowcaseVideo.muted = true;
                portfolioShowcaseVideo.pause();
                updatePortfolioSoundIcon();
            }
        }

        // 4. Meet Photographer Video Audio & Playback
        if (photographerDesktopVideo) {
            if (activeSectionId === "photographer" && !isMobile) {
                if (isFirstVisit) {
                    try { photographerDesktopVideo.currentTime = 0; } catch (e) {}
                }
                photographerDesktopVideo.muted = !hasUserInteractedForSound;
                photographerDesktopVideo.volume = 1;
                const p = photographerDesktopVideo.play();
                if (p !== undefined) {
                    p.then(() => updatePhotographerSoundIcon(photographerDesktopVideo, photographerSoundBtn)).catch(() => {
                        photographerDesktopVideo.muted = true;
                        safePlayVideo(photographerDesktopVideo);
                        updatePhotographerSoundIcon(photographerDesktopVideo, photographerSoundBtn);
                    });
                }
            } else {
                photographerDesktopVideo.muted = true;
                photographerDesktopVideo.pause();
                updatePhotographerSoundIcon(photographerDesktopVideo, photographerSoundBtn);
            }
        }

        if (photographerMobileVideo) {
            if (activeSectionId === "photographer" && isMobile) {
                if (isFirstVisit) {
                    try { photographerMobileVideo.currentTime = 0; } catch (e) {}
                }
                photographerMobileVideo.muted = !hasUserInteractedForSound;
                photographerMobileVideo.volume = 1;
                const p = photographerMobileVideo.play();
                if (p !== undefined) {
                    p.then(() => updatePhotographerSoundIcon(photographerMobileVideo, photographerMobileSoundBtn)).catch(() => {
                        photographerMobileVideo.muted = true;
                        safePlayVideo(photographerMobileVideo);
                        updatePhotographerSoundIcon(photographerMobileVideo, photographerMobileSoundBtn);
                    });
                }
            } else {
                photographerMobileVideo.muted = true;
                photographerMobileVideo.pause();
                updatePhotographerSoundIcon(photographerMobileVideo, photographerMobileSoundBtn);
            }
        }
    }

    // Expose sync helper for instant sound activation on user interaction
    window.syncActiveSectionSound = function () {
        if (!currentActiveId) currentActiveId = "hero";
        orchestrateSectionAudioAndMedia(currentActiveId);
    };

    if ("IntersectionObserver" in window) {
        const sections = [
            { id: "hero", el: heroElem },
            { id: "stories", el: storiesElem },
            { id: "portfolio-preview", el: portfolioElem },
            { id: "photographer", el: photographerElem },
            { id: "contact", el: contactElem }
        ].filter(item => item.el !== null);

        const observer = new IntersectionObserver((entries) => {
            let topCandidate = null;
            let highestRatio = 0;

            sections.forEach(s => {
                const rect = s.el.getBoundingClientRect();
                const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
                const ratio = visibleHeight / window.innerHeight;
                if (ratio > highestRatio) {
                    highestRatio = ratio;
                    topCandidate = s.id;
                }
            });

            if (topCandidate && highestRatio >= 0.2 && topCandidate !== currentActiveId) {
                orchestrateSectionAudioAndMedia(topCandidate);
            }
        }, {
            threshold: [0.1, 0.2, 0.4, 0.6, 0.8]
        });

        // Expose global trigger for instantaneous scroll audio unlocking
        window.triggerActiveSectionAudio = function () {
            let topCandidate = "hero";
            let highestRatio = 0;

            sections.forEach(s => {
                const rect = s.el.getBoundingClientRect();
                const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
                const ratio = visibleHeight / window.innerHeight;
                if (ratio > highestRatio) {
                    highestRatio = ratio;
                    topCandidate = s.id;
                }
            });

            orchestrateSectionAudioAndMedia(topCandidate);
        };

        sections.forEach(s => observer.observe(s.el));
    }
})();


/* =========================================================
   12B. PORTFOLIO MOBILE MENU TOGGLE
   ========================================================= */

const portfolioNavToggle = document.getElementById("portfolioNavToggle");
const portfolioNavLinks = document.getElementById("portfolioNavLinks");

if (portfolioNavToggle && portfolioNavLinks) {
    portfolioNavToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        const isOpen = portfolioNavLinks.classList.toggle("open");
        portfolioNavToggle.classList.toggle("open");
        portfolioNavToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close menu when clicking any nav link
    portfolioNavLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            portfolioNavLinks.classList.remove("open");
            portfolioNavToggle.classList.remove("open");
            portfolioNavToggle.setAttribute("aria-expanded", "false");
        });
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
        if (!portfolioNavLinks.contains(e.target) && !portfolioNavToggle.contains(e.target)) {
            portfolioNavLinks.classList.remove("open");
            portfolioNavToggle.classList.remove("open");
            portfolioNavToggle.setAttribute("aria-expanded", "false");
        }
    });

    // Close on escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && portfolioNavLinks.classList.contains("open")) {
            portfolioNavLinks.classList.remove("open");
            portfolioNavToggle.classList.remove("open");
            portfolioNavToggle.setAttribute("aria-expanded", "false");
        }
    });
}


/* =========================================================
   13. GALLERY FILTER, 20-ITEM LIMIT & EXPLORE MORE
   ========================================================= */

const galleryTabs = document.querySelectorAll(".gallery-tabs .tab");
const galleryItems = document.querySelectorAll(".g-item");
const galleryCountNumber = document.getElementById("galleryCountNumber");
const galleryExploreContainer = document.getElementById("galleryExploreContainer");
const galleryExploreBtn = document.getElementById("galleryExploreBtn");
const exploreRemainingCount = document.getElementById("exploreRemainingCount");

const GALLERY_LIMIT = 20;
let currentGalleryFilter = "all";
let isGalleryExpanded = false;

function applyGalleryFilterAndLimit() {
    let matchingIndex = 0;
    let totalMatching = 0;

    galleryItems.forEach(function (item) {
        const category = item.dataset.cat;
        const matchesFilter = (currentGalleryFilter === "all" || category === currentGalleryFilter);

        if (matchesFilter) {
            item.classList.remove("hidden");
            totalMatching++;

            if (!isGalleryExpanded && matchingIndex >= GALLERY_LIMIT) {
                item.classList.add("g-item-hidden-limit");
                item.classList.remove("g-item-reveal");
            } else {
                item.classList.remove("g-item-hidden-limit");
            }
            matchingIndex++;
        } else {
            item.classList.add("hidden");
            item.classList.remove("g-item-hidden-limit");
            item.classList.remove("g-item-reveal");
        }
    });

    // Update Explore More button visibility and remaining count
    if (galleryExploreContainer) {
        if (!isGalleryExpanded && totalMatching > GALLERY_LIMIT) {
            galleryExploreContainer.classList.remove("hidden");
            if (exploreRemainingCount) {
                exploreRemainingCount.textContent = `+${totalMatching - GALLERY_LIMIT}`;
            }
        } else {
            galleryExploreContainer.classList.add("hidden");
        }
    }

    if (galleryCountNumber) {
        const visibleCount = document.querySelectorAll(".g-item:not(.hidden):not(.g-item-hidden-limit)").length;
        galleryCountNumber.textContent = visibleCount;
    }
}

// Tab Click Events
galleryTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
        galleryTabs.forEach(function (item) {
            item.classList.remove("active");
            item.setAttribute("aria-selected", "false");
        });

        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        currentGalleryFilter = tab.dataset.filter || "all";
        isGalleryExpanded = false; // Reset pagination upon tab change

        applyGalleryFilterAndLimit();
    });
});

// Explore More Click Event
if (galleryExploreBtn) {
    galleryExploreBtn.addEventListener("click", function () {
        isGalleryExpanded = true;
        let revealedIndex = 0;

        galleryItems.forEach(function (item) {
            const category = item.dataset.cat;
            const matchesFilter = (currentGalleryFilter === "all" || category === currentGalleryFilter);

            if (matchesFilter && item.classList.contains("g-item-hidden-limit")) {
                item.classList.remove("g-item-hidden-limit");
                item.classList.add("g-item-reveal");
                item.style.animationDelay = `${revealedIndex * 40}ms`;
                revealedIndex++;
            }
        });

        if (galleryExploreContainer) {
            galleryExploreContainer.classList.add("hidden");
        }

        if (galleryCountNumber) {
            const visibleCount = document.querySelectorAll(".g-item:not(.hidden):not(.g-item-hidden-limit)").length;
            galleryCountNumber.textContent = visibleCount;
        }
    });
}

// Initial gallery filter and limit setup
applyGalleryFilterAndLimit();


/* =========================================================
   14. LIGHTBOX & FULLSCREEN MOBILE REELS VIEWER
   ========================================================= */

const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbVideo = document.getElementById("lbVideo");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");
const lbCounter = document.getElementById("lbCounter");

const mobileReelsModal = document.getElementById("mobileReelsModal");
const mobileReelsContainer = document.getElementById("mobileReelsContainer");
const reelsCounter = document.getElementById("reelsCounter");
const reelsCloseBtn = document.getElementById("reelsCloseBtn");

let visibleGalleryItems = [];
let currentMediaIndex = 0;
let reelsObserver = null;

function getVisibleGalleryItems() {
    return [...document.querySelectorAll(".g-item:not(.hidden):not(.g-item-hidden-limit)")];
}

function updateLightboxCounter() {
    if (lbCounter && visibleGalleryItems.length > 0) {
        lbCounter.textContent = `${currentMediaIndex + 1} / ${visibleGalleryItems.length}`;
    }
}


/* =========================================================
   15. DESKTOP LIGHTBOX
   ========================================================= */

function openLightbox(item) {
    if (!lightbox) return;

    visibleGalleryItems = getVisibleGalleryItems();
    currentMediaIndex = visibleGalleryItems.indexOf(item);
    if (currentMediaIndex === -1) return;

    const img = item.querySelector("img");
    const video = item.querySelector("video");

    if (video) {
        if (lbImg) lbImg.style.display = "none";
        if (lbVideo) {
            lbVideo.style.display = "block";
            lbVideo.src = video.currentSrc || video.src;
            lbVideo.play().catch(() => {});
        }
    } else if (img) {
        if (lbVideo) {
            lbVideo.pause();
            lbVideo.style.display = "none";
        }
        if (lbImg) {
            lbImg.style.display = "block";
            lbImg.src = img.currentSrc || img.src;
            lbImg.alt = img.alt || "Wedding photograph full view";
        }
    }

    updateLightboxCounter();
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    if (!lightbox) return;
    if (lbVideo) {
        lbVideo.pause();
        lbVideo.src = "";
    }
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function showSlide(direction) {
    if (visibleGalleryItems.length === 0) return;
    currentMediaIndex = (currentMediaIndex + direction + visibleGalleryItems.length) % visibleGalleryItems.length;
    const item = visibleGalleryItems[currentMediaIndex];
    const img = item.querySelector("img");
    const video = item.querySelector("video");

    if (video) {
        if (lbImg) lbImg.style.display = "none";
        if (lbVideo) {
            lbVideo.style.display = "block";
            lbVideo.src = video.currentSrc || video.src;
            lbVideo.play().catch(() => {});
        }
    } else if (img) {
        if (lbVideo) {
            lbVideo.pause();
            lbVideo.style.display = "none";
        }
        if (lbImg) {
            lbImg.style.display = "block";
            lbImg.src = img.currentSrc || img.src;
            lbImg.alt = img.alt || "Wedding photograph full view";
        }
    }

    updateLightboxCounter();
}


/* =========================================================
   16. MOBILE FULLSCREEN REELS VIEWER (REELS LIKE SCROLLING)
   ========================================================= */

function openMobileReels(clickedItem) {
    if (!mobileReelsModal || !mobileReelsContainer) return;

    visibleGalleryItems = getVisibleGalleryItems();
    const startIndex = visibleGalleryItems.indexOf(clickedItem);
    if (startIndex === -1) return;

    // Build reels slides dynamically from currently visible filtered items
    mobileReelsContainer.innerHTML = "";

    visibleGalleryItems.forEach((item, idx) => {
        const slide = document.createElement("div");
        slide.className = "mobile-reel-slide";
        slide.dataset.index = idx;

        const img = item.querySelector("img");
        const video = item.querySelector("video");

        if (video) {
            slide.classList.add("reel-video-slide");
            const src = video.currentSrc || video.src;
            slide.innerHTML = `
                <div class="reel-ambient-bg-wrap">
                    <video src="${src}" muted loop playsinline class="reel-ambient-video"></video>
                </div>
                <div class="reel-media-wrapper">
                    <video src="${src}" loop playsinline webkit-playsinline class="reel-main-video" preload="metadata"></video>
                    <button class="reel-sound-toggle-btn" type="button" aria-label="Toggle Sound">
                        <svg class="reel-icon-muted" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <line x1="23" y1="9" x2="17" y2="15"></line>
                            <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                        <svg class="reel-icon-unmuted" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                        </svg>
                    </button>
                    <div class="reel-video-play-indicator">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="rgba(255,255,255,0.9)"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                </div>
            `;
        } else if (img) {
            const src = img.currentSrc || img.src;
            const alt = img.alt || "Wedding moment";
            slide.innerHTML = `
                <div class="reel-ambient-bg-wrap">
                    <img src="${src}" alt="" class="reel-ambient-photo" aria-hidden="true">
                </div>
                <div class="reel-media-wrapper">
                    <img src="${src}" alt="${alt}" class="reel-main-photo">
                </div>
            `;
        }

        mobileReelsContainer.appendChild(slide);
    });

    // Update counter
    if (reelsCounter) {
        reelsCounter.textContent = `${startIndex + 1} / ${visibleGalleryItems.length}`;
    }

    mobileReelsModal.classList.add("active");
    mobileReelsModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Instant scroll to selected slide
    const targetSlide = mobileReelsContainer.children[startIndex];
    if (targetSlide) {
        mobileReelsContainer.scrollTop = targetSlide.offsetTop;
    }

    // Initialize IntersectionObserver to handle active slide, counter, video autoplay
    if (reelsObserver) {
        reelsObserver.disconnect();
    }

    reelsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const slide = entry.target;
            const mainVideo = slide.querySelector(".reel-main-video");
            const ambientVideo = slide.querySelector(".reel-ambient-video");

            if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
                const idx = parseInt(slide.dataset.index, 10);
                if (reelsCounter && !isNaN(idx)) {
                    reelsCounter.textContent = `${idx + 1} / ${visibleGalleryItems.length}`;
                }

                if (mainVideo) {
                    mainVideo.play().catch(() => {});
                    if (ambientVideo) ambientVideo.play().catch(() => {});
                }
            } else {
                if (mainVideo) {
                    mainVideo.pause();
                }
                if (ambientVideo) {
                    ambientVideo.pause();
                }
            }
        });
    }, {
        root: mobileReelsContainer,
        threshold: 0.55
    });

    Array.from(mobileReelsContainer.children).forEach((slide) => {
        reelsObserver.observe(slide);
    });

    // Video sound and play/pause tap handlers in reels
    mobileReelsContainer.querySelectorAll(".reel-video-slide").forEach((videoSlide) => {
        const v = videoSlide.querySelector(".reel-main-video");
        const soundBtn = videoSlide.querySelector(".reel-sound-toggle-btn");
        const mutedIcon = videoSlide.querySelector(".reel-icon-muted");
        const unmutedIcon = videoSlide.querySelector(".reel-icon-unmuted");
        const playIndicator = videoSlide.querySelector(".reel-video-play-indicator");

        if (soundBtn && v) {
            soundBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                v.muted = !v.muted;
                if (v.muted) {
                    mutedIcon.style.display = "block";
                    unmutedIcon.style.display = "none";
                } else {
                    mutedIcon.style.display = "none";
                    unmutedIcon.style.display = "block";
                }
            });
        }

        if (v) {
            v.addEventListener("click", () => {
                if (v.paused) {
                    v.play().catch(() => {});
                    if (playIndicator) {
                        playIndicator.classList.remove("show");
                    }
                } else {
                    v.pause();
                    if (playIndicator) {
                        playIndicator.classList.add("show");
                    }
                }
            });
        }
    });
}

function closeMobileReels() {
    if (!mobileReelsModal) return;

    if (reelsObserver) {
        reelsObserver.disconnect();
    }

    if (mobileReelsContainer) {
        mobileReelsContainer.querySelectorAll("video").forEach((v) => {
            v.pause();
            v.src = "";
        });
        mobileReelsContainer.innerHTML = "";
    }

    mobileReelsModal.classList.remove("active");
    mobileReelsModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

if (reelsCloseBtn) {
    reelsCloseBtn.addEventListener("click", closeMobileReels);
}


/* =========================================================
   17. GALLERY ITEM CLICK EVENTS (MOBILE REELS VS DESKTOP LIGHTBOX)
   ========================================================= */

galleryItems.forEach(function (item) {
    item.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;

        const isMobile = window.innerWidth <= 768 || window.matchMedia("(max-width: 768px)").matches;
        if (isMobile) {
            openMobileReels(item);
        } else {
            openLightbox(item);
        }
    });
});


/* =========================================================
   18. LIGHTBOX CONTROLS & TOUCH SWIPE GESTURES
   ========================================================= */

if (lbClose) {
    lbClose.addEventListener("click", closeLightbox);
}

if (lbPrev) {
    lbPrev.addEventListener("click", function (e) {
        e.stopPropagation();
        showSlide(-1);
    });
}

if (lbNext) {
    lbNext.addEventListener("click", function (e) {
        e.stopPropagation();
        showSlide(1);
    });
}

// Close lightbox on backdrop click
if (lightbox) {
    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox || event.target.classList.contains("lightbox-image-wrapper")) {
            closeLightbox();
        }
    });
}


/* =========================================================
   21. KEYBOARD CONTROLS
   ========================================================= */

document.addEventListener("keydown", function (event) {
    if (!lightbox || !lightbox.classList.contains("active")) {
        return;
    }

    if (event.key === "ArrowLeft") {
        showSlide(-1);
    } else if (event.key === "ArrowRight") {
        showSlide(1);
    } else if (event.key === "Escape") {
        closeLightbox();
    }
});


/* =========================================================
   22B. CUSTOM GLASSMORPHIC SELECT (ANDROID CHROME & ALL BROWSERS)
   ========================================================= */

const customServiceSelect = document.getElementById("customServiceSelect");
const serviceSelectTrigger = document.getElementById("serviceSelectTrigger");
const serviceDropdown = document.getElementById("serviceDropdown");
const nativeServiceSelect = document.getElementById("service");

if (customServiceSelect && serviceSelectTrigger && serviceDropdown && nativeServiceSelect) {
    const triggerValue = serviceSelectTrigger.querySelector(".custom-select-value");
    const options = serviceDropdown.querySelectorAll(".custom-select-option");

    // Toggle dropdown open/close on trigger tap/click
    serviceSelectTrigger.addEventListener("click", function (e) {
        e.stopPropagation();
        const isOpen = customServiceSelect.classList.toggle("open");
        serviceSelectTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Select an option
    options.forEach(function (option) {
        option.addEventListener("click", function (e) {
            e.stopPropagation();
            const value = option.dataset.value;
            const text = option.querySelector(".opt-text").textContent;

            // Sync native select value
            nativeServiceSelect.value = value;
            nativeServiceSelect.dispatchEvent(new Event("change", { bubbles: true }));

            // Update visible trigger text
            if (triggerValue) {
                triggerValue.textContent = text;
            }

            // Update option selected styles & checkmark
            options.forEach(function (opt) {
                opt.classList.remove("selected");
                opt.setAttribute("aria-selected", "false");
            });
            option.classList.add("selected");
            option.setAttribute("aria-selected", "true");

            // Close dropdown
            customServiceSelect.classList.remove("open");
            serviceSelectTrigger.setAttribute("aria-expanded", "false");
        });
    });

    // Close on click outside
    document.addEventListener("click", function (e) {
        if (!customServiceSelect.contains(e.target)) {
            customServiceSelect.classList.remove("open");
            serviceSelectTrigger.setAttribute("aria-expanded", "false");
        }
    });

    // Reset custom select when parent form resets
    const parentForm = customServiceSelect.closest("form");
    if (parentForm) {
        parentForm.addEventListener("reset", function () {
            if (triggerValue) {
                triggerValue.textContent = "Select a service";
            }
            options.forEach(function (opt, idx) {
                if (idx === 0) {
                    opt.classList.add("selected");
                    opt.setAttribute("aria-selected", "true");
                } else {
                    opt.classList.remove("selected");
                    opt.setAttribute("aria-selected", "false");
                }
            });
        });
    }
}


/* =========================================================
   22C. CUSTOM LUXURY GLASSMORPHIC CALENDAR DATE PICKER
   ========================================================= */

const customDateWrapper = document.getElementById("customDateWrapper");
const datePickerTrigger = document.getElementById("datePickerTrigger");
const customCalendarPopup = document.getElementById("customCalendarPopup");
const dateDisplayValue = document.getElementById("dateDisplayValue");
const nativeDateInput = document.getElementById("date");
const calPrevMonth = document.getElementById("calPrevMonth");
const calNextMonth = document.getElementById("calNextMonth");
const calMonthYear = document.getElementById("calMonthYear");
const calDaysGrid = document.getElementById("calDaysGrid");
const calClearBtn = document.getElementById("calClearBtn");
const calTodayBtn = document.getElementById("calTodayBtn");

if (customDateWrapper && datePickerTrigger && customCalendarPopup && calDaysGrid) {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentCalDate = new Date();
    let selectedDate = null;

    function renderCalendar() {
        const year = currentCalDate.getFullYear();
        const month = currentCalDate.getMonth();

        // Header month and year
        if (calMonthYear) {
            calMonthYear.textContent = `${monthNames[month]} ${year}`;
        }

        calDaysGrid.innerHTML = "";

        // First day of month (0 = Sun, 1 = Mon, etc.)
        const firstDay = new Date(year, month, 1).getDay();
        // Number of days in current month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        // Number of days in previous month
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Prev month placeholder days
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayCell = document.createElement("button");
            dayCell.type = "button";
            dayCell.className = "cal-day cal-day-other-month";
            dayCell.textContent = daysInPrevMonth - i;
            dayCell.disabled = true;
            calDaysGrid.appendChild(dayCell);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement("button");
            dayCell.type = "button";
            dayCell.className = "cal-day";
            dayCell.textContent = day;

            const thisDate = new Date(year, month, day);
            thisDate.setHours(0, 0, 0, 0);

            // Is today?
            if (thisDate.getTime() === today.getTime()) {
                dayCell.classList.add("cal-day-today");
            }

            // Is past date? (Disable past dates for wedding bookings)
            if (thisDate < today) {
                dayCell.classList.add("cal-day-disabled");
                dayCell.disabled = true;
            } else {
                // Is selected?
                if (selectedDate && thisDate.getTime() === selectedDate.getTime()) {
                    dayCell.classList.add("cal-day-selected");
                    dayCell.setAttribute("aria-selected", "true");
                }

                dayCell.addEventListener("click", function (e) {
                    e.stopPropagation();
                    selectDate(new Date(year, month, day));
                });
            }

            calDaysGrid.appendChild(dayCell);
        }

        // Fill remaining slots in week grid
        const totalCells = firstDay + daysInMonth;
        const remainingCells = (7 - (totalCells % 7)) % 7;
        for (let i = 1; i <= remainingCells; i++) {
            const dayCell = document.createElement("button");
            dayCell.type = "button";
            dayCell.className = "cal-day cal-day-other-month";
            dayCell.textContent = i;
            dayCell.disabled = true;
            calDaysGrid.appendChild(dayCell);
        }
    }

    function selectDate(date) {
        selectedDate = date;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const isoString = `${year}-${month}-${day}`;

        // Update hidden input value for form submission
        if (nativeDateInput) {
            nativeDateInput.value = isoString;
            nativeDateInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // Format display text (e.g. "24 November 2026")
        if (dateDisplayValue) {
            dateDisplayValue.textContent = `${date.getDate()} ${monthNames[date.getMonth()]} ${year}`;
            dateDisplayValue.classList.add("has-value");
        }

        renderCalendar();

        // Close popup
        customDateWrapper.classList.remove("open");
        datePickerTrigger.setAttribute("aria-expanded", "false");
    }

    function clearDate() {
        selectedDate = null;
        if (nativeDateInput) {
            nativeDateInput.value = "";
            nativeDateInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
        if (dateDisplayValue) {
            dateDisplayValue.textContent = "Select Wedding Date";
            dateDisplayValue.classList.remove("has-value");
        }
        renderCalendar();
        customDateWrapper.classList.remove("open");
        datePickerTrigger.setAttribute("aria-expanded", "false");
    }

    // Trigger toggle
    datePickerTrigger.addEventListener("click", function (e) {
        e.stopPropagation();
        // Close service dropdown if open
        if (typeof customServiceSelect !== "undefined" && customServiceSelect) {
            customServiceSelect.classList.remove("open");
            const st = document.getElementById("serviceSelectTrigger");
            if (st) st.setAttribute("aria-expanded", "false");
        }

        const isOpen = customDateWrapper.classList.toggle("open");
        datePickerTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
        if (isOpen) {
            renderCalendar();
        }
    });

    // Month Navigation
    if (calPrevMonth) {
        calPrevMonth.addEventListener("click", function (e) {
            e.stopPropagation();
            currentCalDate.setMonth(currentCalDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (calNextMonth) {
        calNextMonth.addEventListener("click", function (e) {
            e.stopPropagation();
            currentCalDate.setMonth(currentCalDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // Action buttons
    if (calClearBtn) {
        calClearBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            clearDate();
        });
    }

    if (calTodayBtn) {
        calTodayBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            currentCalDate = new Date();
            selectDate(new Date());
        });
    }

    // Close on click outside
    document.addEventListener("click", function (e) {
        if (!customDateWrapper.contains(e.target)) {
            customDateWrapper.classList.remove("open");
            datePickerTrigger.setAttribute("aria-expanded", "false");
        }
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && customDateWrapper.classList.contains("open")) {
            customDateWrapper.classList.remove("open");
            datePickerTrigger.setAttribute("aria-expanded", "false");
            datePickerTrigger.focus();
        }
    });

    // Reset when form resets
    const parentForm = customDateWrapper.closest("form");
    if (parentForm) {
        parentForm.addEventListener("reset", function () {
            clearDate();
        });
    }

    // Initial render
    renderCalendar();
}


/* =========================================================
   23. CONTACT FORM
   ========================================================= */

const contactForm =
    document.getElementById(
        "contactForm"
    );


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const nameInput = document.getElementById("name");
            const phoneInput = document.getElementById("phone");
            const emailInput = document.getElementById("email");
            const serviceInput = document.getElementById("service");
            const dateInput = document.getElementById("date");
            const messageInput = document.getElementById("message");

            const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Not provided";
            const phone = phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : "Not provided";
            const email = emailInput && emailInput.value.trim() ? emailInput.value.trim() : "Not provided";
            const service = serviceInput && serviceInput.value ? serviceInput.value : "General Enquiry";

            // Format date to DD-MM-YYYY
            let weddingDate = "Not specified";
            if (dateInput && dateInput.value) {
                const parts = dateInput.value.split("-");
                if (parts.length === 3) {
                    weddingDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                } else {
                    weddingDate = dateInput.value;
                }
            }

            const storyMessage = messageInput && messageInput.value.trim() ? messageInput.value.trim() : "No additional notes provided";

            // Compose message requesting a callback
            const text =
                `*New Enquiry for Gemray Studio* 💍📸\n\n` +
                `Hello Bhushan, I would like to request a callback regarding our wedding enquiry.\n\n` +
                `👤 *Name:* ${name}\n` +
                `📞 *Phone:* ${phone}\n` +
                `✉️ *Email:* ${email}\n` +
                `✨ *Service:* ${service}\n` +
                `📅 *Wedding Date:* ${weddingDate}\n\n` +
                `💬 *Our Story & Details:*\n${storyMessage}\n\n` +
                `Looking forward to connecting with you!`;

            const whatsappNumber = "918956010406";
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(text)}`;

            // Directly navigate user to WhatsApp
            window.location.href = whatsappUrl;

            contactForm.reset();

        }
    );

}


/* =========================================================
   24. CLEANUP
   ========================================================= */

window.addEventListener(
    "beforeunload",
    function () {

        if (goldTimer) {

            clearTimeout(
                goldTimer
            );

        }

    }
);