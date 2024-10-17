// This script fixes an issue with htmx boosting and the search field.
// In some conditions when you get back to the index page the searches value is
// not in the input field anymore.
document.addEventListener('htmx:historyRestore', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const paramValue = urlParams.get('search');

    if (paramValue) {
        const inputField = document.querySelector('input[name="search"]');
        if (inputField) {
            inputField.value = paramValue;
        }
    }
});
