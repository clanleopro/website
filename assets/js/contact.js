document.addEventListener("DOMContentLoaded", function () {

    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyxUDqyPdT0PQ6NZyamFqIlEolaSqNRAtYFb-RkcGXfc3gKBrqOGCOvdnSKbFNxcAFq/exec";

    // Poll until the contact form is loaded into the DOM
    const interval = setInterval(() => {

        const form = document.getElementById("contactForm");
        if (!form) return;

        clearInterval(interval);
        console.log("Contact form initialized");

        // --- Create Success Modal and append directly to <body> ---
        // (Avoids any overflow/stacking-context clipping from parent containers)
        const modal = document.createElement("div");
        modal.id = "successModal";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <h3>Thank You!</h3>
                <p>Thank you for contacting us. We have received your message and will get back to you shortly.</p>
                <button class="btn-red btn-sm" id="closeModal">Close</button>
            </div>
        `;
        document.body.appendChild(modal);

        // --- Close Modal Logic ---
        function closeModal() {
            modal.classList.remove("active");
        }

        const closeBtn = modal.querySelector("#closeModal");
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
            const originalHTML = btn.innerHTML;

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
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }
        });

    }, 300);

});