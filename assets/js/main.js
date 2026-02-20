document.addEventListener("DOMContentLoaded", function () {
    const components = [
        { id: "navbar", file: "components/navbar.html", callback: initNavbar },
        { id: "hero", file: "components/hero.html" },
        { id: "services", file: "components/services.html" },
        { id: "products", file: "components/products.html" },
        { id: "about", file: "components/about.html" },
        { id: "contact", file: "components/contact.html" },
        { id: "footer", file: "components/footer.html" }
    ];

    const loadPromises = components.map(component =>
        loadComponent(component.id, component.file, component.callback)
    );

    Promise.all(loadPromises).then(() => {
        // Initialize animations after all content is loaded
        if (window.initAnimations) {
            window.initAnimations();
        }
        // Re-check hash navigation since content might have shifted
        if (window.location.hash) {
            const hash = window.location.hash;
            const el = document.querySelector(hash);
            if (el) el.scrollIntoView();
        }
    });
});

function loadComponent(id, file, callback) {
    const element = document.getElementById(id);
    if (!element) return Promise.resolve(); // Return resolved promise if element missing

    return fetch(file)
        .then(response => {
            if (!response.ok) throw new Error(`Could not load ${file}`);
            return response.text();
        })
        .then(html => {
            element.innerHTML = html;
            // Execute scripts inside the loaded HTML if any (simple innerHTML doesn't execute scripts)
            // But here we rely on callback for logic
            if (callback) callback();
        })
        .catch(error => console.error(error));
}
