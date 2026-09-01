/* =========================================================
   GEMRAY STUDIO
   MAIN JAVASCRIPT
   ========================================================= */


/* =========================================================
   01. HERO VIDEO
   ========================================================= */

const bgVideo = document.getElementById("bgVideo");

const soundBtn = document.getElementById("soundBtn");

const iconMuted = document.getElementById("iconMuted");
const iconUnmuted = document.getElementById("iconUnmuted");


/*
    Hero video:
    - autoplay
    - muted initially
    - loop
    - playsinline
*/

if (bgVideo) {

    bgVideo.muted = true;
    bgVideo.volume = 1;

    bgVideo.play().catch(() => {
        // Browser may block autoplay.
        // Video will start after user interaction.
    });

}


/* =========================================================
   02. HERO SOUND ICON
   ========================================================= */

function updateHeroSoundIcon() {

    if (!bgVideo || !soundBtn) return;


    if (bgVideo.muted) {

        if (iconMuted) {
            iconMuted.style.display = "block";
        }

        if (iconUnmuted) {
            iconUnmuted.style.display = "none";
        }

        soundBtn.setAttribute(
            "aria-label",
            "Unmute video"
        );

    } else {

        if (iconMuted) {
            iconMuted.style.display = "none";
        }

        if (iconUnmuted) {
            iconUnmuted.style.display = "block";
        }

        soundBtn.setAttribute(
            "aria-label",
            "Mute video"
        );

    }

}


updateHeroSoundIcon();


/* =========================================================
   03. HERO SOUND BUTTON
   ========================================================= */

if (soundBtn && bgVideo) {

    soundBtn.addEventListener(
        "click",
        function (event) {

            /*
                Prevent the button click from
                reaching the video.
            */

            event.stopPropagation();


            bgVideo.muted =
                !bgVideo.muted;


            bgVideo.volume = 1;


            /*
                If video somehow stopped,
                start it again.
            */

            if (bgVideo.paused) {

                bgVideo.play().catch(() => {});

            }


            updateHeroSoundIcon();

        }
    );

}


/* =========================================================
   04. HERO VIDEO TOUCH / CLICK
   ========================================================= */

/*
    Important:

    The website does NOT automatically unmute
    just because the user clicks somewhere.

    If the user intentionally taps the HERO VIDEO,
    sound can be enabled.
*/

if (bgVideo) {

    bgVideo.addEventListener(
        "click",
        function () {

            if (bgVideo.muted) {

                bgVideo.muted = false;

                bgVideo.volume = 1;

                updateHeroSoundIcon();

            }

        }
    );

}


/* =========================================================
   05. CINEMATIC GOLD REFLECTION
   ========================================================= */

/*
    Animation sequence:

    Normal gold
         ↓
    Wait 7–12 seconds
         ↓
    Gold reflection moves left → right
         ↓
    Reflection reaches Y
         ↓
    Tiny spark appears
         ↓
    Spark disappears
         ↓
    Logo returns to normal
         ↓
    Wait again
*/


const heroBrand =
    document.getElementById("heroBrand");


let goldAnimationRunning = false;

let goldTimer = null;


/* =========================================================
   START GOLD REFLECTION
   ========================================================= */

function startGoldReflection() {

    if (!heroBrand) return;

    if (goldAnimationRunning) return;


    goldAnimationRunning = true;


    /*
        Remove previous animation classes.
    */

    heroBrand.classList.remove(
        "gold-sweep"
    );

    heroBrand.classList.remove(
        "spark-active"
    );


    /*
        Force browser reflow.

        This allows the same CSS animation
        to restart every time.
    */

    void heroBrand.offsetWidth;


    /*
        Start gold reflection.
    */

    heroBrand.classList.add(
        "gold-sweep"
    );


    /*
        Spark appears when the reflection
        reaches the end of GEMRAY.
    */

    setTimeout(
        function () {

            heroBrand.classList.add(
                "spark-active"
            );

        },
        1650
    );


    /*
        Remove everything after animation.
    */

    setTimeout(
        function () {

            heroBrand.classList.remove(
                "gold-sweep"
            );

            heroBrand.classList.remove(
                "spark-active"
            );

            goldAnimationRunning = false;

        },
        3000
    );

}


/* =========================================================
   06. RANDOM REFLECTION TIMER
   ========================================================= */

function scheduleGoldReflection() {

    /*
        Random delay:

        Minimum = 7 seconds
        Maximum = 12 seconds
    */

    const minimumDelay = 7000;

    const maximumDelay = 12000;


    const randomDelay =
        Math.floor(
            Math.random() *
            (
                maximumDelay -
                minimumDelay
            )
        ) +
        minimumDelay;


    goldTimer =
        setTimeout(
            function () {

                startGoldReflection();

                scheduleGoldReflection();

            },
            randomDelay
        );

}


/*
    Give the page a few seconds before
    the first reflection.

    This keeps the initial logo calm.
*/

setTimeout(
    function () {

        startGoldReflection();

        scheduleGoldReflection();

    },
    3000
);


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


            alert(
                "Thank you! Your enquiry has been received."
            );


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