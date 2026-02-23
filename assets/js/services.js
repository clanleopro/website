/**
 * services.js — 3D Tilt effect for service cards
 * GPU-accelerated, pointer-tracked, mobile-disabled
 */
(function () {

    const MAX_TILT = 12;       // max degrees of tilt
    const LIFT_PX = 14;        // translateY lift on hover
    const TWEEN = 0.12;        // lerp factor (lower = smoother)

    // Detect touch/mobile — disable tilt for performance
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const isTouch = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;

    function initCards() {
        const cards = document.querySelectorAll(".service-card");
        if (!cards.length) return;

        cards.forEach(card => {
            if (isMobile || isTouch) {
                // Mobile: just a clean lift, no tilt
                card.addEventListener("mouseenter", () => {
                    card.style.transform = `translateY(-${LIFT_PX}px)`;
                    card.style.transition = "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
                });
                card.addEventListener("mouseleave", () => {
                    card.style.transform = "";
                    card.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
                });
                return;
            }

            let rafId = null;
            let targetX = 0, targetY = 0;
            let currentX = 0, currentY = 0;
            let isHovered = false;

            function lerp(a, b, n) { return a + (b - a) * n; }

            function animate() {
                currentX = lerp(currentX, targetX, TWEEN);
                currentY = lerp(currentY, targetY, TWEEN);

                const rotX = currentY.toFixed(3);
                const rotY = currentX.toFixed(3);
                const lift = isHovered ? -LIFT_PX : 0;

                card.style.transform =
                    `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(${lift}px)`;

                // Keep animating while hovering or settling back to 0
                if (isHovered || Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01) {
                    rafId = requestAnimationFrame(animate);
                } else {
                    card.style.transform = "";
                    rafId = null;
                }
            }

            card.addEventListener("mouseenter", () => {
                isHovered = true;
                card.style.transition = "none"; // let rAF handle it smoothly
                if (!rafId) rafId = requestAnimationFrame(animate);
            });

            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                // Normalize cursor to -1…1 within card
                const nx = (e.clientX - rect.left) / rect.width * 2 - 1;
                const ny = (e.clientY - rect.top) / rect.height * 2 - 1;

                targetY = -ny * MAX_TILT;   // rotateX (flip sign so top tilts back)
                targetX = nx * MAX_TILT;    // rotateY
            });

            card.addEventListener("mouseleave", () => {
                isHovered = false;
                targetX = 0;
                targetY = 0;
                card.style.transition = "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)";
                if (!rafId) rafId = requestAnimationFrame(animate);
            });
        });
    }

    // Wait for the component loader to inject the cards
    const interval = setInterval(() => {
        const grid = document.querySelector(".services-grid");
        if (!grid) return;
        clearInterval(interval);
        initCards();
    }, 200);

})();
