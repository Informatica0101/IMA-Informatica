document.addEventListener("DOMContentLoaded", function() {
    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');

    if (headerContainer) {
        fetch('_header.html')
            .then(response => response.text())
            .then(data => {
                headerContainer.innerHTML = data;
            });
    }

    if (footerContainer) {
        fetch('_footer.html')
            .then(response => response.text())
            .then(data => {
                footerContainer.innerHTML = data;
                // Set current year in footer
                const currentYearSpan = document.getElementById('current-year');
                if (currentYearSpan) {
                    currentYearSpan.textContent = new Date().getFullYear();
                }
            });
    }
});
