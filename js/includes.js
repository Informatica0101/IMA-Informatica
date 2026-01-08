document.addEventListener("DOMContentLoaded", function() {
    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');

    const fetchHeader = fetch('_header.html').then(response => response.text());
    const fetchFooter = fetch('_footer.html').then(response => response.text());

    Promise.all([fetchHeader, fetchFooter])
        .then(([headerHtml, footerHtml]) => {
            if (headerContainer) {
                headerContainer.innerHTML = headerHtml;
            }
            if (footerContainer) {
                footerContainer.innerHTML = footerHtml;
            }

            // Now that the header and footer are loaded, we can safely load the main script
            // that depends on the elements within them.
            const mainScript = document.createElement('script');
            mainScript.src = 'js/main.js';
            document.body.appendChild(mainScript);
        })
        .catch(error => {
            console.error("Error loading components:", error);
        });
});
