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

function markVideoReady(video) {
    if (!video) return;
    video.classList.add("video-ready");
}

function watchVideoFrames(video) {
    if (!video) return;
    const dismissPoster = () => {
        video.classList.add("video-ready");
        if (video.currentTime > 0.05 || !video.paused) {
            video.removeAttribute("poster");
        }
    };
    ["playing", "timeupdate", "loadeddata", "canplay"].forEach((eventName) => {
        video.addEventListener(eventName, dismissPoster);
    });
}

// Auto-bind to all video elements across the entire page
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("video").forEach(watchVideoFrames);
});
if (document.readyState !== "loading") {
    document.querySelectorAll("video").forEach(watchVideoFrames);
}

let currentIsMobile = null;

function updateHeroVideoSource() {
    if (!bgVideo) return;
    const isMobile = window.innerWidth <= 768;
    const targetSrc = isMobile
        ? "media/New Website Content/Hero videos/Virtical Hero video 02.mp4"
        : "media/New Website Content/Hero videos/Horizontal Hero video 02.mp4";
    const targetPoster = isMobile
        ? "photos/hero-mobile-thumb.jpg"
        : "photos/hero-desktop-thumb.jpg";

    // Always set on first call (currentIsMobile is null) or when device type changes
    if (isMobile === currentIsMobile) return;
    currentIsMobile = isMobile;

    const wasMuted = bgVideo.muted;
    bgVideo.src = targetSrc;
    bgVideo.poster = targetPoster;
    bgVideo.muted = wasMuted;
    bgVideo.load();

    // Play after data is available so the video frame is actually visible
    bgVideo.addEventListener("loadeddata", function onLoaded() {
        bgVideo.removeEventListener("loadeddata", onLoaded);
        if (currentActiveSectionId === "hero") {
            safePlayVideo(bgVideo);
        }
    }, { once: true });
}

/// Initial hero video resolution setup
if (bgVideo) {
    watchVideoFrames(bgVideo);
    updateHeroVideoSource();
    bgVideo.muted = true;
    bgVideo.volume = 1;

    let resizeTimer = null;
    window.addEventListener("resize", () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateHeroVideoSource, 200);
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
    }, { passive: true });

    brandNameWrapper.addEventListener("click", function () {
        if (!goldAnimationRunning) {
            if (goldTimer) clearTimeout(goldTimer);
            startGoldReflection();
        }
    });
}


/* =========================================================
   03. AMBIENT GOLD DUST / STARDUST PARTICLE CANVAS (60/120FPS JITTER-FREE)
   ========================================================= */

function initHeroParticles() {
    const canvas = document.getElementById("heroParticles");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
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
        // Optimized count for silky 60/120fps performance
        const count = Math.min(Math.floor(width * 0.028), 35);

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5 + 0.6,
                alpha: Math.random() * 0.6 + 0.25,
                speedY: -(Math.random() * 0.35 + 0.15),
                speedX: (Math.random() - 0.5) * 0.2,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                color: Math.random() > 0.3 ? "212, 175, 90" : "255, 235, 175"
            });
        }
    }

    function draw() {
        if (!isVisible) {
            animationFrameId = null;
            return;
        }

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            p.pulse += p.pulseSpeed;
            const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.pulse) * 0.25);

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${currentAlpha})`;
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

    // Pause animation when hero is off-screen to preserve battery & CPU
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
            }, { threshold: 0.02 });
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


const testimonialBgVideo = document.getElementById("testimonialBgVideo");
const storySoundBtn = document.getElementById("storySoundBtn");

if (photographerDesktopVideo) watchVideoFrames(photographerDesktopVideo);
if (photographerMobileVideo) watchVideoFrames(photographerMobileVideo);
if (testimonialBgVideo) watchVideoFrames(testimonialBgVideo);




/* =========================================================
   12B. PORTFOLIO PREVIEW GLASS COLLAGE ROTATOR & REDIRECT
   ========================================================= */

(function initPortfolioPreviewCollage() {
    const collage = document.getElementById("portfolioGlassCollage");
    const exploreBtn = document.getElementById("portfolioExploreBtn");
    const previewSection = document.getElementById("portfolio-preview");
    if (!collage) return;

    let isSectionVisible = false;

    if ("IntersectionObserver" in window && previewSection) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                isSectionVisible = entry.isIntersecting;
            });
        }, { threshold: 0.05 });
        obs.observe(previewSection);
    } else {
        isSectionVisible = true;
    }

    // Full pool of active verified gallery photos
    const photoPool = [
        "media/New Website Content/Photo gallary/07SL0260.jpg",
        "media/New Website Content/Photo gallary/07SL0363.jpg",
        "media/New Website Content/Photo gallary/07SL0433.jpg",
        "media/New Website Content/Photo gallary/07SL0451.jpg",
        "media/New Website Content/Photo gallary/07SL0960.jpg",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-006.JPG",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-016.JPG",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-019.JPG",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-024.JPG",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-055.JPG",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-078.JPG",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-09.JPG",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-10.JPG",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-107.JPG",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-12.jpg.jpeg",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-15.JPG",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-23.jpg.jpeg",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-27.jpg.jpeg",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-38.JPG",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-39.JPG",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-42.JPG",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-51.JPG",
        "media/New Website Content/Photo gallary/Bhushan Pre-wedding photo-54.JPG",
        "media/New Website Content/Photo gallary/RK102880.JPG",
        "media/New Website Content/Photo gallary/RK102893.JPG",
        "media/New Website Content/Photo gallary/RK102914.JPG",
        "media/New Website Content/Photo gallary/RK102917.JPG",
        "media/New Website Content/Photo gallary/RK102925.JPG",
        "media/New Website Content/Photo gallary/RK102927.JPG",
        "media/New Website Content/Photo gallary/RK102935.JPG",
        "media/New Website Content/Photo gallary/RK102956.JPG",
        "media/New Website Content/Photo gallary/RK102962.JPG",
        "media/New Website Content/Photo gallary/RK102969.JPG",
        "media/New Website Content/Photo gallary/RK103106.JPG",
        "media/New Website Content/Photo gallary/RK103116.JPG",
        "media/New Website Content/Photo gallary/RK103121.JPG",
        "media/New Website Content/Photo gallary/RK103147.JPG",
        "media/New Website Content/Photo gallary/RK103185.JPG",
        "media/New Website Content/Photo gallary/RK103187.JPG",
        "media/New Website Content/Photo gallary/RK103220.JPG",
        "media/New Website Content/Photo gallary/RK103226.JPG",
        "media/New Website Content/Photo gallary/_EM_8329.JPG",
        "media/New Website Content/Photo gallary/_EM_8341.JPG",
        "media/New Website Content/Photo gallary/_EM_8356.JPG",
        "media/New Website Content/Photo gallary/_EM_8429.JPG",
        "media/New Website Content/Photo gallary/_EM_8488.JPG",
        "media/New Website Content/Photo gallary/_EM_8508.JPG",
        "media/New Website Content/Photo gallary/_EM_8569.JPG",
        "media/New Website Content/Photo gallary/_EM_8577.JPG",
        "media/New Website Content/Photo gallary/_EM_8592.JPG",
        "media/New Website Content/Photo gallary/_EM_8692.JPG"
    ];

    const cards = Array.from(collage.querySelectorAll(".portfolio-glass-card"));
    if (cards.length === 0) return;

    let poolIndex = cards.length;

    // Only swap when section is on-screen
    function swapCollagePhoto() {
        if (document.hidden || !isSectionVisible) return;

        const randomCardIdx = Math.floor(Math.random() * cards.length);
        const targetCard = cards[randomCardIdx];
        if (!targetCard) return;

        const img = targetCard.querySelector(".glass-photo");
        if (!img) return;

        const nextSrc = photoPool[poolIndex % photoPool.length];
        poolIndex++;

        const preloader = new Image();
        preloader.decoding = "async";
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
   12C. CINEMATIC SMART AUDIO & VIDEO PLAYBACK ENGINE
   - ONLY ONE VIDEO ACTIVELY PLAYS AT ANY TIME (Zero lag / jitter / sound conflict)
   - Initial instant hero entry (<500ms target); off-screen videos preload="none"
   - First user gesture (tap, click, scroll, wheel, touch, keydown) starts audio cleanly
   - Strict replay rule: entering/re-entering any video section restarts it from 00:00
   - Multi-threshold IntersectionObserver with hysteresis prevents micro-scroll jitter
   - Sequence token cancellation aborts stale playback on rapid scrolling
   - Unified sound icon synchronization across all sound buttons
   - Tab visibility (document.hidden) and pagehide/unload safe pause
   ========================================================= */

(function initCinematicSmartPlaybackEngine() {
    // 1. Define all managed sections and their respective video/sound controls
    const sectionConfigs = [
        {
            id: "hero",
            el: document.getElementById("hero"),
            getVideo: () => document.getElementById("bgVideo"),
            getSoundBtn: () => document.getElementById("soundBtn")
        },
        {
            id: "photographer",
            el: document.getElementById("photographer"),
            getVideo: () => {
                const isMobile = window.innerWidth <= 768;
                return isMobile 
                    ? document.getElementById("photographerVideoMobile") 
                    : document.getElementById("photographerVideoDesktop");
            },
            getSoundBtn: () => {
                const isMobile = window.innerWidth <= 768;
                return isMobile 
                    ? document.getElementById("photographerMobileSoundBtn") 
                    : document.getElementById("photographerSoundBtn");
            }
        },
        {
            id: "portfolio-preview",
            el: document.getElementById("portfolio-preview"),
            getVideo: () => document.getElementById("portfolioShowcaseVideo"),
            getSoundBtn: () => document.getElementById("portfolioSoundBtn")
        },
        {
            id: "stories",
            el: document.getElementById("stories"),
            getVideo: () => document.getElementById("testimonialBgVideo"),
            getSoundBtn: () => document.getElementById("storySoundBtn")
        },
        {
            id: "collection",
            el: document.getElementById("collection"),
            getVideo: () => null,
            getSoundBtn: () => null
        },
        {
            id: "contact",
            el: document.getElementById("contact"),
            getVideo: () => null,
            getSoundBtn: () => null
        }
    ].filter(item => item.el !== null);

    // All unique managed video elements across the page
    function getAllVideos() {
        const list = [
            document.getElementById("bgVideo"),
            document.getElementById("photographerVideoDesktop"),
            document.getElementById("photographerVideoMobile"),
            document.getElementById("portfolioShowcaseVideo"),
            document.getElementById("testimonialBgVideo")
        ];
        return list.filter(Boolean);
    }

    // If on a page with no managed videos (e.g. product.html, portfolio.html), exit gracefully
    if (sectionConfigs.length === 0 || getAllVideos().length === 0) return;

    const navLinksContainer = document.getElementById("portfolioNavLinks");

    // 2. Engine State
    let currentActiveId = "hero";
    let hasUserInteracted = false;
    let isGlobalMuted = true;             // Starts muted per browser autoplay policy
    let isUserManuallyMuted = false;      // True if user explicitly tapped mute
    let activationSequence = 0;           // Cancels outdated playback requests during fast scrolls
    let globalAudioCtx = null;

    // 3. Web Audio unlock helper
    function primeWebAudio() {
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

        getAllVideos().forEach(v => {
            try { v.volume = 1; } catch (e) {}
        });
    }

    // 4. Safe video control primitives
    function safePause(video) {
        if (!video) return;
        try {
            video.muted = true;
            video.pause();
        } catch (e) {}
    }

    function safePlay(video) {
        if (!video) return Promise.resolve();
        const promise = video.play();
        if (promise !== undefined) {
            return promise.catch((err) => {
                if (err && err.name === "NotAllowedError") {
                    video.muted = true;
                    return video.play().catch(() => {});
                }
                return Promise.resolve();
            });
        }
        return Promise.resolve();
    }

    // 5. Synchronize all sound buttons across the website
    function updateAllSoundButtonsUI(mutedState) {
        // Hero button
        const heroBtn = document.getElementById("soundBtn");
        if (heroBtn) {
            const m = document.getElementById("iconMuted");
            const u = document.getElementById("iconUnmuted");
            if (m) m.style.display = mutedState ? "inline-flex" : "none";
            if (u) u.style.display = mutedState ? "none" : "inline-flex";
            heroBtn.setAttribute("aria-label", mutedState ? "Unmute video" : "Mute video");
        }

        // Photographer Desktop button
        const pDeskBtn = document.getElementById("photographerSoundBtn");
        if (pDeskBtn) {
            const m = pDeskBtn.querySelector(".photographer-muted-icon");
            const u = pDeskBtn.querySelector(".photographer-unmuted-icon");
            if (m) m.style.display = mutedState ? "block" : "none";
            if (u) u.style.display = mutedState ? "none" : "block";
            pDeskBtn.setAttribute("aria-label", mutedState ? "Unmute photographer video" : "Mute photographer video");
        }

        // Photographer Mobile button
        const pMobBtn = document.getElementById("photographerMobileSoundBtn");
        if (pMobBtn) {
            const m = pMobBtn.querySelector(".photographer-muted-icon");
            const u = pMobBtn.querySelector(".photographer-unmuted-icon");
            if (m) m.style.display = mutedState ? "block" : "none";
            if (u) u.style.display = mutedState ? "none" : "block";
            pMobBtn.setAttribute("aria-label", mutedState ? "Unmute photographer video" : "Mute photographer video");
        }

        // Portfolio Preview button
        const portBtn = document.getElementById("portfolioSoundBtn");
        if (portBtn) {
            const m = portBtn.querySelector(".portfolio-muted-icon");
            const u = portBtn.querySelector(".portfolio-unmuted-icon");
            if (m) m.style.display = mutedState ? "inline-flex" : "none";
            if (u) u.style.display = mutedState ? "none" : "inline-flex";
            portBtn.setAttribute("aria-label", mutedState ? "Unmute portfolio video" : "Mute portfolio video");
        }

        // Testimonial button
        const storyBtn = document.getElementById("storySoundBtn");
        if (storyBtn) {
            const m = storyBtn.querySelector(".sound-icon-muted");
            const u = storyBtn.querySelector(".sound-icon-unmuted");
            if (m) m.style.display = mutedState ? "block" : "none";
            if (u) u.style.display = mutedState ? "none" : "block";
            storyBtn.setAttribute("aria-label", mutedState ? "Unmute testimonial audio" : "Mute testimonial audio");
        }
    }

    // 6. Navigation Link Highlighting
    const navLinkSelectors = {
        "hero": 'a[href="index.html"], a[href="#hero"]',
        "photographer": 'a[href="#photographer"]',
        "portfolio-preview": 'a[href="portfolio.html"], a[href="#portfolio-preview"]',
        "stories": 'a[href="#stories"], a[href="#testimonial"]',
        "collection": 'a[href="product.html"], a[href="#collection"]',
        "contact": 'a[href="#contact"]'
    };

    let navRafId = null;
    function updateActiveNavLink(sectionId) {
        if (!navLinksContainer) return;
        const allLinks = navLinksContainer.querySelectorAll("a:not(.portfolio-nav-wa-pill)");
        allLinks.forEach(link => link.classList.remove("active"));

        const selector = navLinkSelectors[sectionId];
        if (selector) {
            const targetLink = navLinksContainer.querySelector(selector);
            if (targetLink) {
                targetLink.classList.add("active");
                if (window.innerWidth <= 768) {
                    if (navRafId) cancelAnimationFrame(navRafId);
                    navRafId = requestAnimationFrame(() => {
                        try {
                            const containerWidth = navLinksContainer.clientWidth;
                            const linkLeft = targetLink.offsetLeft;
                            const linkWidth = targetLink.clientWidth;
                            const scrollTo = linkLeft - (containerWidth / 2) + (linkWidth / 2);
                            navLinksContainer.scrollTo({
                                left: Math.max(0, scrollTo),
                                behavior: "auto"
                            });
                        } catch (e) {}
                    });
                }
            }
        }
    }

    // 7. Find active video for given section ID
    function getActiveVideoForSection(sectionId) {
        const cfg = sectionConfigs.find(c => c.id === sectionId);
        return cfg ? cfg.getVideo() : null;
    }

    // 8. Core Section Activation Engine
    function activateSection(targetSectionId, forceReplay = false) {
        if (!targetSectionId) return;

        const isSame = (targetSectionId === currentActiveId);
        if (isSame && !forceReplay) {
            return; // Prevent restarting video on slight scrolling within same section
        }

        currentActiveId = targetSectionId;
        currentActiveSectionId = targetSectionId;
        updateActiveNavLink(targetSectionId);

        const currentSeq = ++activationSequence;
        const targetVideo = getActiveVideoForSection(targetSectionId);

        // A. Immediately pause & mute ALL other videos (strict rule: zero background play)
        getAllVideos().forEach(v => {
            if (v !== targetVideo) {
                safePause(v);
            }
        });

        if (!targetVideo) {
            // Section has no video (e.g. collection, contact)
            updateAllSoundButtonsUI(true);
            return;
        }

        // B. Replay Rule: Reset to 00:00 when entering/returning to this section
        try {
            targetVideo.currentTime = 0;
        } catch (e) {}

        // C. Audio determination:
        // Audible ONLY if user has interacted, hasn't explicitly muted, and global mute is off
        const shouldBeUnmuted = hasUserInteracted && !isUserManuallyMuted && !isGlobalMuted;
        targetVideo.muted = !shouldBeUnmuted;
        targetVideo.volume = 1;

        // D. Start playback safely with sequence cancellation check
        const playPromise = targetVideo.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // If a rapid scroll moved past this section before play resolved, stop it immediately!
                if (currentSeq !== activationSequence) {
                    safePause(targetVideo);
                    return;
                }
                updateAllSoundButtonsUI(targetVideo.muted);
            }).catch(() => {
                if (currentSeq !== activationSequence) return;
                // Autoplay with sound denied -> fallback to muted
                targetVideo.muted = true;
                targetVideo.play().catch(() => {});
                updateAllSoundButtonsUI(true);
            });
        } else {
            updateAllSoundButtonsUI(targetVideo.muted);
        }
    }

    // 9. Centralized Sound Toggle (attached to ALL sound buttons)
    function onSoundButtonClick(e) {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        hasUserInteracted = true;
        primeWebAudio();

        const activeVideo = getActiveVideoForSection(currentActiveId);

        if (isGlobalMuted) {
            // Visitor wants UNMUTE
            isUserManuallyMuted = false;
            isGlobalMuted = false;

            if (activeVideo) {
                activeVideo.muted = false;
                activeVideo.volume = 1;
                const p = activeVideo.play();
                if (p !== undefined) {
                    p.then(() => {
                        updateAllSoundButtonsUI(false);
                    }).catch(() => {
                        activeVideo.muted = true;
                        isGlobalMuted = true;
                        updateAllSoundButtonsUI(true);
                    });
                } else {
                    updateAllSoundButtonsUI(false);
                }
            } else {
                updateAllSoundButtonsUI(false);
            }
        } else {
            // Visitor wants MUTE
            isUserManuallyMuted = true;
            isGlobalMuted = true;

            if (activeVideo) {
                activeVideo.muted = true;
            }
            updateAllSoundButtonsUI(true);
        }
    }

    // Wire up all sound buttons across the entire website
    [
        document.getElementById("soundBtn"),
        document.getElementById("photographerSoundBtn"),
        document.getElementById("photographerMobileSoundBtn"),
        document.getElementById("portfolioSoundBtn"),
        document.getElementById("storySoundBtn")
    ].forEach(btn => {
        if (btn) {
            btn.addEventListener("click", onSoundButtonClick);
            btn.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
        }
    });

    // 10. First User Gesture Audio Activation
    function onFirstUserInteraction() {
        if (hasUserInteracted) return;
        hasUserInteracted = true;
        hasUserInteractedForSound = true;
        primeWebAudio();

        // If user hasn't manually chosen to mute, unmute the currently visible section!
        if (!isUserManuallyMuted) {
            isGlobalMuted = false;
            const activeVideo = getActiveVideoForSection(currentActiveId);
            if (activeVideo) {
                activeVideo.muted = false;
                activeVideo.volume = 1;
                const p = activeVideo.play();
                if (p !== undefined) {
                    p.then(() => {
                        updateAllSoundButtonsUI(false);
                    }).catch(() => {
                        activeVideo.muted = true;
                        isGlobalMuted = true;
                        updateAllSoundButtonsUI(true);
                    });
                } else {
                    updateAllSoundButtonsUI(false);
                }
            } else {
                updateAllSoundButtonsUI(false);
            }
        }

        // Clean up one-time interaction listeners
        ["touchstart", "pointerdown", "mousedown", "click", "keydown", "wheel", "scroll"].forEach(evt => {
            window.removeEventListener(evt, onFirstUserInteraction, { capture: true, passive: true });
        });
    }

    ["touchstart", "pointerdown", "mousedown", "click", "keydown", "wheel", "scroll"].forEach(evt => {
        window.addEventListener(evt, onFirstUserInteraction, { capture: true, passive: true });
    });

    // 11. Viewport-Based Section Intersection Observer
    if ("IntersectionObserver" in window) {
        const visibilityMap = new Map();

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                visibilityMap.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
            });

            // Find section occupying largest portion of viewport
            let topCandidateId = currentActiveId;
            let maxRatio = 0;

            visibilityMap.forEach((ratio, id) => {
                if (ratio > maxRatio) {
                    maxRatio = ratio;
                    topCandidateId = id;
                }
            });

            const currentRatio = visibilityMap.get(currentActiveId) || 0;

            // Hysteresis activation rule:
            // Only switch if:
            // 1) Current active section has largely left view (< 0.25) AND top candidate has >= 0.20
            // 2) OR top candidate has dominant presence (>= 0.45) and meaningfully exceeds current (diff >= 0.12)
            if (topCandidateId !== currentActiveId) {
                const shouldSwitch = (currentRatio < 0.25 && maxRatio >= 0.20) ||
                                     (maxRatio >= 0.45 && maxRatio > currentRatio + 0.12);
                if (shouldSwitch) {
                    activateSection(topCandidateId);
                }
            }
        }, {
            threshold: [0, 0.15, 0.30, 0.45, 0.60, 0.75, 0.90]
        });

        sectionConfigs.forEach(item => sectionObserver.observe(item.el));

        // Predictive Preloader: buffers metadata for off-screen videos 500px before arrival
        const predictivePreloader = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const vid = entry.target;
                    if (vid && vid.dataset.buffered !== "true") {
                        vid.dataset.buffered = "true";
                        vid.preload = "metadata";
                        if (vid.networkState === HTMLMediaElement.NETWORK_EMPTY) {
                            try { vid.load(); } catch (e) {}
                        }
                    }
                    obs.unobserve(vid);
                }
            });
        }, {
            rootMargin: "500px 0px 500px 0px",
            threshold: 0.01
        });

        getAllVideos().forEach(v => {
            if (v !== document.getElementById("bgVideo")) {
                predictivePreloader.observe(v);
            }
        });
    }

    // 12. Viewport Resize & Breakpoint Switching (photographer desktop <-> mobile)
    let lastIsMobile = (window.innerWidth <= 768);
    window.addEventListener("resize", () => {
        const isMobileNow = (window.innerWidth <= 768);
        if (isMobileNow !== lastIsMobile) {
            lastIsMobile = isMobileNow;
            if (currentActiveId === "photographer") {
                activateSection("photographer", true);
            }
        }
    }, { passive: true });

    // 13. Tab Visibility & App Lifecycle
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            getAllVideos().forEach(safePause);
        } else {
            // Restore playback of active section only
            const activeVideo = getActiveVideoForSection(currentActiveId);
            if (activeVideo) {
                activeVideo.muted = isGlobalMuted;
                activeVideo.volume = 1;
                safePlay(activeVideo);
                updateAllSoundButtonsUI(activeVideo.muted);
            }
        }
    });

    window.addEventListener("pagehide", () => {
        getAllVideos().forEach(safePause);
    });
    window.addEventListener("beforeunload", () => {
        getAllVideos().forEach(safePause);
    });

    // 14. Initial Section Determination (check URL hash on entry)
    let initialSectionId = "hero";
    if (window.location.hash) {
        const hashId = window.location.hash.replace("#", "");
        if (sectionConfigs.some(c => c.id === hashId)) {
            initialSectionId = hashId;
        } else if (hashId === "testimonial") {
            initialSectionId = "stories";
        }
    }
    activateSection(initialSectionId, true);

    // 15. Global Backward-Compatibility Bridges
    window.syncActiveSectionSound = function () {
        activateSection(currentActiveId, false);
    };
    window.triggerActiveSectionAudio = function () {
        onFirstUserInteraction();
    };
    window.setStorySoundState = function (unmute) {
        if (unmute) {
            isUserManuallyMuted = false;
            isGlobalMuted = false;
        } else {
            isGlobalMuted = true;
        }
        updateAllSoundButtonsUI(!unmute);
        const storyVid = document.getElementById("testimonialBgVideo");
        if (storyVid) {
            storyVid.muted = !unmute;
            if (unmute) safePlay(storyVid);
        }
    };
    window.getActiveStoryVideo = function () {
        return document.getElementById("testimonialBgVideo");
    };
    window.smartPlaybackEngine = {
        activateSection,
        toggleSound: onSoundButtonClick,
        getActiveSection: () => currentActiveId,
        isMuted: () => isGlobalMuted
    };
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
   13. PORTFOLIO REDESIGN: FILMS & FRAMES INTERACTIVE CONTROLLER
   ========================================================= */

// YouTube Films Configuration list (easily add new YouTube films here)
const YOUTUBE_FILMS = [
    {
        id: "27GvMIU-ggw",
        title: "Pooja & Vivek",
        tag: "Wedding Cinema",
        url: "https://youtu.be/27GvMIU-ggw?si=ThxrqpHOfekSzUr6"
    },
    {
        id: "tW82JeeTcbQ",
        title: "Sidhhi & Bhushan",
        tag: "Wedding Story",
        url: "https://youtu.be/tW82JeeTcbQ?si=Zv1U0zRvf38EK5Mc"
    },
    {
        id: "YMGI_TckZRE",
        title: "Pallavi & Sagar",
        tag: "Cinematic Film",
        url: "https://youtu.be/YMGI_TckZRE?si=reKSyJ-kFNU01GhD"
    },
    {
        id: "itVlkgsShzA",
        title: "Pallavi & Sagar",
        tag: "Pre-Wedding Film",
        url: "https://youtu.be/itVlkgsShzA?si=C3ac54GEghyEXsXt"
    }
];

// Helper to extract clean 11-char YouTube ID from any URL or ID
function extractYouTubeId(urlOrId) {
    if (!urlOrId) return "";
    const trimmed = String(urlOrId).trim();
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : (trimmed.length === 11 ? trimmed : "");
}

(function initPortfolioFilmsAndFrames() {
    const tabFilmsBtn = document.getElementById("tabFilmsBtn");
    const tabFramesBtn = document.getElementById("tabFramesBtn");
    const filmsSection = document.getElementById("filmsSection");
    const framesSection = document.getElementById("framesSection");
    const subtitleText = document.getElementById("portfolioSubtitleText");

    if (!tabFilmsBtn || !tabFramesBtn || !filmsSection || !framesSection) return;

    let currentlyPlayingCard = null;

    function stopAllFilms() {
        document.querySelectorAll(".film-card.is-playing").forEach(card => {
            card.classList.remove("is-playing");
            const slot = card.querySelector(".film-iframe-slot");
            if (slot) slot.innerHTML = "";
            const controls = card.querySelector(".film-custom-controls");
            if (controls) controls.style.display = "none";
        });
        currentlyPlayingCard = null;
    }

    function stopFilmCard(card) {
        if (!card) return;
        card.classList.remove("is-playing");
        const slot = card.querySelector(".film-iframe-slot");
        if (slot) slot.innerHTML = "";
        const controls = card.querySelector(".film-custom-controls");
        if (controls) controls.style.display = "none";
        if (currentlyPlayingCard === card) {
            currentlyPlayingCard = null;
        }
    }

    function playFilmCard(card) {
        const videoId = card.dataset.videoId;
        if (!videoId) return;

        if (card.classList.contains("is-playing") && currentlyPlayingCard === card) return;

        stopAllFilms();

        card.classList.add("is-playing");
        currentlyPlayingCard = card;

        const slot = card.querySelector(".film-iframe-slot");
        if (slot) {
            const videoTitle = card.dataset.title || "Wedding Film";
            slot.innerHTML = `<iframe 
                src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1" 
                title="${videoTitle}" 
                loading="eager"
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerpolicy="strict-origin-when-cross-origin" 
                allowfullscreen>
            </iframe>`;
        }

        const controlsBar = card.querySelector(".film-custom-controls");
        if (controlsBar) {
            controlsBar.style.display = "flex";
        }
    }

    // Switch between Films and Frames tabs
    function switchPortfolioMode(mode) {
        if (mode === "frames") {
            tabFilmsBtn.classList.remove("active");
            tabFilmsBtn.setAttribute("aria-selected", "false");
            tabFramesBtn.classList.add("active");
            tabFramesBtn.setAttribute("aria-selected", "true");

            filmsSection.style.display = "none";
            framesSection.style.display = "block";

            if (subtitleText) {
                subtitleText.textContent = "Timeless Moments & Fine-Art Wedding Photography";
            }

            stopAllFilms();

            if (history.replaceState) {
                history.replaceState(null, "", "#frames");
            }
        } else {
            tabFramesBtn.classList.remove("active");
            tabFramesBtn.setAttribute("aria-selected", "false");
            tabFilmsBtn.classList.add("active");
            tabFilmsBtn.setAttribute("aria-selected", "true");

            framesSection.style.display = "none";
            filmsSection.style.display = "block";

            if (subtitleText) {
                subtitleText.textContent = "Cinematic Wedding & Pre-Wedding Films";
            }

            if (history.replaceState) {
                history.replaceState(null, "", "#films");
            }
        }
    }

    tabFilmsBtn.addEventListener("click", () => switchPortfolioMode("films"));
    tabFramesBtn.addEventListener("click", () => switchPortfolioMode("frames"));

    // Hash navigation support on initial load
    if (window.location.hash === "#frames") {
        switchPortfolioMode("frames");
    }

    // Bind click events on film cards
    document.querySelectorAll(".film-card").forEach(card => {
        const trigger = card.querySelector(".film-play-trigger");
        const posterWrap = card.querySelector(".film-poster-wrapper");
        const closeBtn = card.querySelector(".film-close-btn");
        const fullscreenBtn = card.querySelector(".film-fullscreen-btn");

        if (trigger) {
            trigger.addEventListener("click", (e) => {
                e.stopPropagation();
                playFilmCard(card);
            });
        }

        if (posterWrap) {
            posterWrap.addEventListener("click", () => {
                playFilmCard(card);
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                stopFilmCard(card);
            });
        }

        if (fullscreenBtn) {
            fullscreenBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const container = card.querySelector(".film-player-container");
                if (container) {
                    if (document.fullscreenElement) {
                        document.exitFullscreen().catch(() => {});
                    } else if (container.requestFullscreen) {
                        container.requestFullscreen().catch(() => {});
                    } else if (container.webkitRequestFullscreen) {
                        container.webkitRequestFullscreen();
                    }
                }
            });
        }
    });

    // FRAMES MASONRY LIGHTBOX CLICK
    document.querySelectorAll(".frame-card").forEach(card => {
        card.addEventListener("click", () => {
            if (typeof openLightbox === "function") {
                openLightbox(card);
            }
        });
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (typeof openLightbox === "function") {
                    openLightbox(card);
                }
            }
        });
    });
})();

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
    const frameCards = [...document.querySelectorAll(".frame-card")];
    if (frameCards.length > 0) return frameCards;
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

document.querySelectorAll(".frame-card, .g-item").forEach(function (item) {
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

    // Mobile touch swipe gestures for lightbox
    let lbTouchStartX = 0;
    let lbTouchStartY = 0;
    lightbox.addEventListener("touchstart", function (e) {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        lbTouchStartX = e.changedTouches[0].clientX;
        lbTouchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    lightbox.addEventListener("touchend", function (e) {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const diffX = e.changedTouches[0].clientX - lbTouchStartX;
        const diffY = e.changedTouches[0].clientY - lbTouchStartY;

        // Ensure horizontal swipe is dominant and exceeds 40px
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            if (diffX < 0) {
                showSlide(1);
            } else {
                showSlide(-1);
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
                triggerValue.textContent = "Select Service";
            }
            options.forEach(function (opt) {
                opt.classList.remove("selected");
                opt.setAttribute("aria-selected", "false");
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
            dateDisplayValue.textContent = "Select your date";
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


/* =========================================================
   25. PRODUCT / COLLECTION CATEGORY TABS
   ========================================================= */

(function initProductCategoryTabs() {
    const tabs = document.querySelectorAll(".product-category-tab");
    const panes = document.querySelectorAll(".product-category-pane");
    const gridContainer = document.querySelector(".product-grid-container");
    if (!tabs || tabs.length === 0) return;

    function activateCategory(targetFilter, shouldScroll = false) {
        // Normalize filter name
        const cleanFilter = targetFilter.replace("#", "").trim();

        // 1. Update Tab styling
        tabs.forEach(t => {
            const filterAttr = t.getAttribute("data-filter") || t.getAttribute("href")?.replace("#", "");
            if (filterAttr === cleanFilter) {
                t.classList.add("active");
            } else {
                t.classList.remove("active");
            }
        });

        // 2. Switch Pane Visibility
        let foundPane = false;
        panes.forEach(pane => {
            const paneCat = pane.getAttribute("data-category") || pane.id;
            if (paneCat === cleanFilter) {
                pane.classList.add("active");
                pane.style.display = "block";
                foundPane = true;
            } else {
                pane.classList.remove("active");
                pane.style.display = "none";
            }
        });

        // 3. Smooth scroll to grid container if user clicked
        if (shouldScroll && gridContainer) {
            const headerOffset = 90;
            const gridPos = gridContainer.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: Math.max(0, gridPos),
                behavior: "smooth"
            });
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            const filterType = this.getAttribute("data-filter") || (href ? href.replace("#", "") : "");
            
            if (filterType) {
                e.preventDefault();
                activateCategory(filterType, true);
                if (window.history && window.history.replaceState) {
                    window.history.replaceState(null, null, "#" + filterType);
                }
            }
        });
    });

    // Check URL hash on initial page load
    const initialHash = window.location.hash ? window.location.hash.replace("#", "") : "";
    if (initialHash) {
        const matchingTab = Array.from(tabs).find(t => {
            const f = t.getAttribute("data-filter") || t.getAttribute("href")?.replace("#", "");
            return f === initialHash;
        });
        if (matchingTab) {
            activateCategory(initialHash, false);
        }
    }
})();