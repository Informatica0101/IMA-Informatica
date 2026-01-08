document.addEventListener("DOMContentLoaded", function() {
    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');

    // Function to load a script dynamically
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            if (callback) callback();
        };
        script.onerror = () => console.error(`Failed to load script: ${src}`);
        document.body.appendChild(script);
    }

    if (headerContainer) {
        fetch('_header.html')
            .then(response => {
                if (!response.ok) throw new Error(`Failed to fetch _header.html: ${response.statusText}`);
                return response.text();
            })
            .then(data => {
                headerContainer.innerHTML = data;
                // Now that the header is loaded, load the UI script that controls it
                loadScript('js/main-ui.js');
            })
            .catch(error => console.error(error));
    }

    if (footerContainer) {
        fetch('_footer.html')
            .then(response => {
                if (!response.ok) throw new Error(`Failed to fetch _footer.html: ${response.statusText}`);
                return response.text();
            })
            .then(data => {
                footerContainer.innerHTML = data;
                // The year is set by main-ui.js, so no need to do it here anymore.
            })
            .catch(error => console.error(error));
    }
});
