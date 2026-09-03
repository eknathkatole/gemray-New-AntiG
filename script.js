/* =========================================================
   01. HERO VIDEO & SOUND
   ========================================================= */

const bgVideo = document.getElementById("bgVideo");
const soundBtn = document.getElementById("soundBtn");
const iconMuted = document.getElementById("iconMuted");
const iconUnmuted = document.getElementById("iconUnmuted");

let hasUserInteractedForSound = false;

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

// Safely play video, with fallback to muted play if unmuted playback is restricted by mobile browser
function safePlayVideo(video) {
    if (!video) return;
    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Revert to muted playback so video NEVER stops playing on mobile
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

    // Auto-resume if video gets paused unexpectedly (e.g. browser policy or low-power mode)
    bgVideo.addEventListener("pause", () => {
        if (!document.hidden && bgVideo) {
            safePlayVideo(bgVideo);
        }
    });
}

// Resume playback when returning to the tab/app
document.addEventListener("visibilitychange", () => {
    if (!document.hidden && bgVideo) {
        safePlayVideo(bgVideo);
    }
});

// Try unmuting hero video safely on user tap
function tryUnmuteHero() {
    if (!bgVideo) return;
    bgVideo.muted = false;
    bgVideo.volume = 1;

    const playPromise = bgVideo.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            updateHeroSoundIcon();
        }).catch(() => {
            // If mobile browser blocks unmuted playback, immediately revert to muted so video continues uninterrupted
            bgVideo.muted = true;
            bgVideo.play().catch(() => {});
            updateHeroSoundIcon();
        });
    } else {
        updateHeroSoundIcon();
    }
}

// Track touch gestures so scrolling NEVER triggers unmute or pauses the video
let touchStartX = 0;
let touchStartY = 0;
let touchMoved = false;

window.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchMoved = false;
    }
}, { passive: true });

window.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches.length > 0) {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        // If finger moved more than 10px, it is a scroll gesture - NOT a tap!
        if (dx > 10 || dy > 10) {
            touchMoved = true;
        }
    }
}, { passive: true });

window.addEventListener("touchend", (e) => {
    // Only unmute on a clean TAP (not a scroll/swipe) and only on first interaction
    if (!touchMoved && !hasUserInteractedForSound) {
        const target = e.target;
        if (target && target.closest("button, a, input, select, textarea, form, .lightbox")) return;

        hasUserInteractedForSound = true;
        tryUnmuteHero();
    }
}, { passive: true });

// Desktop click anywhere to unmute (clean tap)
window.addEventListener("click", (e) => {
    if (!hasUserInteractedForSound) {
        const target = e.target;
        if (target && target.closest("button, a, input, select, textarea, form, .lightbox")) return;

        hasUserInteractedForSound = true;
        tryUnmuteHero();
    }
}, { passive: true });

// Sound button toggle functionality
if (soundBtn && bgVideo) {
    soundBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        event.preventDefault();
        hasUserInteractedForSound = true; // Mark as interacted so general tap won't override

        if (bgVideo.muted) {
            // User wants to UNMUTE
            tryUnmuteHero();
        } else {
            // User wants to MUTE
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
    safePlayVideo(photographerDesktopVideo);

    photographerDesktopVideo.addEventListener("pause", () => {
        if (!document.hidden && photographerDesktopVideo) {
            safePlayVideo(photographerDesktopVideo);
        }
    });

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
    safePlayVideo(photographerMobileVideo);

    photographerMobileVideo.addEventListener("pause", () => {
        if (!document.hidden && photographerMobileVideo) {
            safePlayVideo(photographerMobileVideo);
        }
    });

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
   13. GALLERY FILTER & COUNT UPDATER
   ========================================================= */

const galleryTabs = document.querySelectorAll(".gallery-tabs .tab");
const galleryItems = document.querySelectorAll(".g-item");
const galleryCountNumber = document.getElementById("galleryCountNumber");

function updateGalleryCount() {
    if (galleryCountNumber) {
        const visibleCount = document.querySelectorAll(".g-item:not(.hidden)").length;
        galleryCountNumber.textContent = visibleCount;
    }
}

galleryTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
        // Remove active state from all tabs
        galleryTabs.forEach(function (item) {
            item.classList.remove("active");
            item.setAttribute("aria-selected", "false");
        });

        // Activate clicked tab
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        const filter = tab.dataset.filter;

        // Filter gallery items
        galleryItems.forEach(function (item) {
            const category = item.dataset.cat;

            if (filter === "all" || category === filter) {
                item.classList.remove("hidden");
            } else {
                item.classList.add("hidden");
            }
        });

        updateGalleryCount();
    });
});

// Initial gallery count setup
updateGalleryCount();


/* =========================================================
   14. LIGHTBOX WITH MOBILE SWIPE & COUNTER
   ========================================================= */

const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");
const lbCounter = document.getElementById("lbCounter");

let visibleImages = [];
let lbIndex = 0;


/* =========================================================
   15. GET CURRENT VISIBLE IMAGES
   ========================================================= */

function getVisibleImages() {
    return [...document.querySelectorAll(".g-item:not(.hidden) img")];
}

function updateLightboxCounter() {
    if (lbCounter && visibleImages.length > 0) {
        lbCounter.textContent = `${lbIndex + 1} / ${visibleImages.length}`;
    }
}


/* =========================================================
   16. OPEN LIGHTBOX
   ========================================================= */

function openLightbox(image) {
    if (!lightbox || !lbImg) return;

    visibleImages = getVisibleImages();
    lbIndex = visibleImages.indexOf(image);

    if (lbIndex === -1) return;

    lbImg.src = image.currentSrc || image.src;
    lbImg.alt = image.alt || "Wedding photograph full view";

    updateLightboxCounter();

    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");

    // Prevent page scrolling while lightbox is open
    document.body.style.overflow = "hidden";
}


/* =========================================================
   17. CLOSE LIGHTBOX
   ========================================================= */

function closeLightbox() {
    if (!lightbox) return;

    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}


/* =========================================================
   18. LIGHTBOX SLIDE
   ========================================================= */

function showSlide(direction) {
    if (!lbImg || visibleImages.length === 0) return;

    lbIndex = (lbIndex + direction + visibleImages.length) % visibleImages.length;
    const image = visibleImages[lbIndex];

    lbImg.src = image.currentSrc || image.src;
    lbImg.alt = image.alt || "Wedding photograph full view";

    updateLightboxCounter();
}


/* =========================================================
   19. GALLERY IMAGE EVENTS
   ========================================================= */

galleryItems.forEach(function (item) {
    const image = item.querySelector("img");
    if (!image) return;

    image.addEventListener("click", function () {
        openLightbox(image);
    });
});


/* =========================================================
   20. LIGHTBOX CONTROLS & TOUCH SWIPE GESTURES
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

    // Touch Swipe Navigation on Mobile
    let lbTouchStartX = 0;
    let lbTouchStartY = 0;
    let lbTouchEndX = 0;
    let lbTouchEndY = 0;

    lightbox.addEventListener("touchstart", function (e) {
        if (e.touches && e.touches.length === 1) {
            lbTouchStartX = e.touches[0].clientX;
            lbTouchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    lightbox.addEventListener("touchend", function (e) {
        if (e.changedTouches && e.changedTouches.length === 1) {
            lbTouchEndX = e.changedTouches[0].clientX;
            lbTouchEndY = e.changedTouches[0].clientY;

            const diffX = lbTouchEndX - lbTouchStartX;
            const diffY = lbTouchEndY - lbTouchStartY;
            const absDiffX = Math.abs(diffX);
            const absDiffY = Math.abs(diffY);

            // Horizontal swipe (threshold: 40px)
            if (absDiffX > 40 && absDiffX > absDiffY) {
                if (diffX < 0) {
                    // Swiped Left -> Next image
                    showSlide(1);
                } else {
                    // Swiped Right -> Previous image
                    showSlide(-1);
                }
            } else if (diffY > 75 && absDiffY > absDiffX) {
                // Swiped Downwards -> Close Lightbox
                closeLightbox();
            }
        }
    }, { passive: true });
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