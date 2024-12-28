document.addEventListener('DOMContentLoaded', function() {
    const { DateTime } = luxon;

    const created_at_element = document.getElementById('taken-at');
    const dateText = created_at_element.textContent.trim();

    console.log("Date Text:", dateText);  // Check the date format

    // Attempt to parse the date (ISO format)
    const date = DateTime.fromISO(dateText, { zone: 'utc' });

    if (date.isValid) {
        console.log("Parsed Date:", date);

        // Convert to local time zone
        const localDate = date.setZone('local');
        console.log("Local Date:", localDate);

        // Check if the local date looks correct
        console.log("Formatted Local Date:", localDate.toLocaleString(DateTime.DATETIME_MED));

        // Display the formatted date in the local time zone
        created_at_element.textContent = localDate.toLocaleString(DateTime.DATETIME_MED);
    } else {
        console.log("Invalid Date");
        created_at_element.textContent = 'Invalid date';  // Fallback message
    }
});
