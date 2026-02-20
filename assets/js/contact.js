document.addEventListener("DOMContentLoaded", function () {

    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyxUDqyPdT0PQ6NZyamFqIlEolaSqNRAtYFb-RkcGXfc3gKBrqOGCOvdnSKbFNxcAFq/exec";

    // Poll until components are loaded into the DOM
    const interval = setInterval(() => {

        const form = document.getElementById("contactForm");
        const modal = document.getElementById("successModal");
        if (!form || !modal) return;

        clearInterval(interval);
        console.log("Contact form initialized");

        // --- Close Modal Logic ---
        function closeModal() {
            modal.classList.remove("active");
        }

        const closeBtn = document.getElementById("closeModal");
        if (closeBtn) {
            closeBtn.addEventListener("click", closeModal);
        }

        modal.addEventListener("click", function (e) {
            if (e.target === modal) closeModal();
        });

        // Auto-close after 5 seconds when shown
        function showModal() {
            modal.classList.add("active");
            setTimeout(closeModal, 5000);
        }

        // --- Form Submit Handler ---
        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            console.log("FORM SUBMITTED");

            const btn = form.querySelector("button[type='submit']");
            const originalText = btn.innerHTML;

            btn.innerHTML = "Sending...";
            btn.disabled = true;

            try {
                const formData = new FormData(form);

                const response = await fetch(WEB_APP_URL, {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();
                console.log("Server Response:", result);

                if (result.status === "success") {
                    showModal();
                    form.reset();
                } else {
                    throw new Error("Submission failed");
                }

            } catch (error) {
                console.error("Error:", error);
                alert("Submission failed. Please try again.");
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });

    }, 300);

});