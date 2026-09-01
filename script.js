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

// Initial video setup
if (bgVideo) {
    bgVideo.muted = true;
    bgVideo.volume = 1;

    const playPromise = bgVideo.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Autoplay with audio was restricted initially; will start on interaction
        });
    }

    updateHeroSoundIcon();
}

// Automatically unmute and play sound on FIRST touch/click anywhere on the screen (Mobile + Laptop)
function unmuteOnFirstInteraction() {
    if (hasUserInteractedForSound || !bgVideo) return;
    hasUserInteractedForSound = true;

    bgVideo.muted = false;
    bgVideo.volume = 1;

    if (bgVideo.paused) {
        bgVideo.play().catch(() => {});
    }

    updateHeroSoundIcon();

    // Clean up one-time listeners
    const events = ["click", "touchstart", "touchend", "pointerdown", "keydown"];
    events.forEach((evt) => {
        window.removeEventListener(evt, unmuteOnFirstInteraction, { capture: true });
    });
}

// Register one-time interaction listeners across mobile and desktop
const interactionEvents = ["click", "touchstart", "touchend", "pointerdown", "keydown"];
interactionEvents.forEach((evt) => {
    window.addEventListener(evt, unmuteOnFirstInteraction, { capture: true, once: true, passive: true });
});

// Sound button toggle functionality
if (soundBtn && bgVideo) {
    soundBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        hasUserInteractedForSound = true; // Mark as interacted so global listener won't override manual mute

        bgVideo.muted = !bgVideo.muted;
        bgVideo.volume = 1;

        if (bgVideo.paused) {
            bgVideo.play().catch(() => {});
        }

        updateHeroSoundIcon();
    });
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

    /*
        Start muted so autoplay is allowed.
    */

    photographerDesktopVideo.muted =
        true;

    photographerDesktopVideo.volume =
        1;


    photographerDesktopVideo.play()
        .catch(() => {});


    updatePhotographerSoundIcon(
        photographerDesktopVideo,
        photographerSoundBtn
    );

}


/* =========================================================
   10. DESKTOP PHOTOGRAPHER SOUND
   ========================================================= */

if (
    photographerDesktopVideo &&
    photographerSoundBtn
) {

    photographerSoundBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            photographerDesktopVideo.muted =
                !photographerDesktopVideo.muted;


            photographerDesktopVideo.volume =
                1;


            if (
                photographerDesktopVideo.paused
            ) {

                photographerDesktopVideo
                    .play()
                    .catch(() => {});

            }


            updatePhotographerSoundIcon(
                photographerDesktopVideo,
                photographerSoundBtn
            );

        }
    );


    /*
        Tapping the photographer video
        intentionally enables sound.
    */

    photographerDesktopVideo.addEventListener(
        "click",
        function () {

            if (
                photographerDesktopVideo.muted
            ) {

                photographerDesktopVideo.muted =
                    false;

                photographerDesktopVideo.volume =
                    1;


                updatePhotographerSoundIcon(
                    photographerDesktopVideo,
                    photographerSoundBtn
                );

            }

        }
    );

}


/* =========================================================
   11. MOBILE PHOTOGRAPHER VIDEO
   ========================================================= */

if (photographerMobileVideo) {

    /*
        Mobile reel:

        9:16
        muted initially
        autoplay
        playsinline
    */

    photographerMobileVideo.muted =
        true;

    photographerMobileVideo.volume =
        1;


    photographerMobileVideo.play()
        .catch(() => {});


    updatePhotographerSoundIcon(
        photographerMobileVideo,
        photographerMobileSoundBtn
    );

}


/* =========================================================
   12. MOBILE PHOTOGRAPHER SOUND
   ========================================================= */

if (
    photographerMobileVideo &&
    photographerMobileSoundBtn
) {

    photographerMobileSoundBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            photographerMobileVideo.muted =
                !photographerMobileVideo.muted;


            photographerMobileVideo.volume =
                1;


            if (
                photographerMobileVideo.paused
            ) {

                photographerMobileVideo
                    .play()
                    .catch(() => {});

            }


            updatePhotographerSoundIcon(
                photographerMobileVideo,
                photographerMobileSoundBtn
            );

        }
    );


    /*
        Direct touch/click on mobile reel
        can enable sound.
    */

    photographerMobileVideo.addEventListener(
        "click",
        function () {

            if (
                photographerMobileVideo.muted
            ) {

                photographerMobileVideo.muted =
                    false;

                photographerMobileVideo.volume =
                    1;


                updatePhotographerSoundIcon(
                    photographerMobileVideo,
                    photographerMobileSoundBtn
                );

            }

        }
    );

}


/* =========================================================
   13. GALLERY FILTER
   ========================================================= */

const galleryTabs =
    document.querySelectorAll(
        ".gallery-tabs .tab"
    );


const galleryItems =
    document.querySelectorAll(
        ".g-item"
    );


galleryTabs.forEach(
    function (tab) {

        tab.addEventListener(
            "click",
            function () {


                /*
                    Remove active state
                    from all tabs.
                */

                galleryTabs.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                /*
                    Activate clicked tab.
                */

                tab.classList.add(
                    "active"
                );


                const filter =
                    tab.dataset.filter;


                /*
                    Filter gallery items.
                */

                galleryItems.forEach(
                    function (item) {

                        const category =
                            item.dataset.cat;


                        if (
                            filter === "all" ||
                            category === filter
                        ) {

                            item.classList.remove(
                                "hidden"
                            );

                        } else {

                            item.classList.add(
                                "hidden"
                            );

                        }

                    }
                );

            }
        );

    }
);


/* =========================================================
   14. LIGHTBOX
   ========================================================= */

const lightbox =
    document.getElementById(
        "lightbox"
    );


const lbImg =
    document.getElementById(
        "lbImg"
    );


const lbClose =
    document.getElementById(
        "lbClose"
    );


const lbPrev =
    document.getElementById(
        "lbPrev"
    );


const lbNext =
    document.getElementById(
        "lbNext"
    );


let visibleImages = [];

let lbIndex = 0;


/* =========================================================
   15. GET CURRENT VISIBLE IMAGES
   ========================================================= */

function getVisibleImages() {

    return [
        ...document.querySelectorAll(
            ".g-item:not(.hidden) img"
        )
    ];

}


/* =========================================================
   16. OPEN LIGHTBOX
   ========================================================= */

function openLightbox(image) {

    if (!lightbox || !lbImg)
        return;


    visibleImages =
        getVisibleImages();


    lbIndex =
        visibleImages.indexOf(
            image
        );


    if (lbIndex === -1)
        return;


    lbImg.src =
        image.currentSrc ||
        image.src;


    lbImg.alt =
        image.alt || "";


    lightbox.classList.add(
        "active"
    );


    lightbox.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
        Prevent page scrolling
        while lightbox is open.
    */

    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   17. CLOSE LIGHTBOX
   ========================================================= */

function closeLightbox() {

    if (!lightbox)
        return;


    lightbox.classList.remove(
        "active"
    );


    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   18. LIGHTBOX SLIDE
   ========================================================= */

function showSlide(direction) {

    if (
        !lbImg ||
        visibleImages.length === 0
    ) {

        return;

    }


    lbIndex =
        (
            lbIndex +
            direction +
            visibleImages.length
        ) %
        visibleImages.length;


    const image =
        visibleImages[
            lbIndex
        ];


    lbImg.src =
        image.currentSrc ||
        image.src;


    lbImg.alt =
        image.alt || "";

}


/* =========================================================
   19. GALLERY IMAGE EVENTS
   ========================================================= */

galleryItems.forEach(
    function (item) {

        const image =
            item.querySelector(
                "img"
            );


        if (!image)
            return;


        image.addEventListener(
            "click",
            function () {

                openLightbox(
                    image
                );

            }
        );

    }
);


/* =========================================================
   20. LIGHTBOX CONTROLS
   ========================================================= */

if (lbClose) {

    lbClose.addEventListener(
        "click",
        closeLightbox
    );

}


if (lbPrev) {

    lbPrev.addEventListener(
        "click",
        function () {

            showSlide(-1);

        }
    );

}


if (lbNext) {

    lbNext.addEventListener(
        "click",
        function () {

            showSlide(1);

        }
    );

}


/* =========================================================
   21. CLOSE LIGHTBOX BY BACKGROUND CLICK
   ========================================================= */

if (lightbox) {

    lightbox.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                lightbox
            ) {

                closeLightbox();

            }

        }
    );

}


/* =========================================================
   22. KEYBOARD CONTROLS
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            !lightbox ||
            !lightbox.classList.contains(
                "active"
            )
        ) {

            return;

        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            showSlide(-1);

        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            showSlide(1);

        }


        if (
            event.key ===
            "Escape"
        ) {

            closeLightbox();

        }

    }
);


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