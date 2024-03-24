// Handling auto-respond form actions
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("autoRespondersForm");
    const addAutoResponderButton = document.getElementById("addAutoResponder");
    const entryTemplate = document.getElementById("entryTemplate").content;

    // Function to add a new autoResponder entry
    function addAutoResponder(autoResponder = { trigger: "", reply: "", mentionUser: true }) {
        const clone = document.importNode(entryTemplate, true);
        const removeButton = clone.querySelector(".removeAutoResponder");

        clone.querySelector(".triggerInput").value = autoResponder.trigger;
        clone.querySelector(".replyInput").value = autoResponder.reply;
        clone.querySelector(".mentionUserSelect").value = autoResponder.mentionUser.toString();

        // Remove button event listener
        removeButton.addEventListener("click", function () {
            removeButton.closest(".autoResponderEntry").remove();
        });

        form.insertBefore(clone, document.getElementById('AutoResponderButtons'));
    }

    // Add new autoResponder entry on button click
    addAutoResponderButton.addEventListener("click", () => addAutoResponder());

    // Load initial autoResponders, for example from server or local storage
    const initialAutoResponders = data.autoResponders; // Assume 'data' is defined elsewhere
    initialAutoResponders.forEach(addAutoResponder);

    // const saveButton = document.getElementById("saveAutoResponders");

    // Save button event listener
    form.addEventListener("submit", function () {
        const autoRespondersData = [];

        // Collect data from all autoResponder entries
        document.querySelectorAll(".autoResponderEntry").forEach((entry) => {
            const trigger = entry.querySelector(".triggerInput").value;
            const reply = entry.querySelector(".replyInput").value;
            const mentionUser = entry.querySelector(".mentionUserSelect").value === "true";

            autoRespondersData.push({ trigger, reply, mentionUser });
        });

        // Submit the collected data to server
        fetch("/autoResponders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ autoResponders: autoRespondersData }),
        })
            .then((data) => {
                window.location.reload(); // Reload the page or handle success (e.g., display a success message)
                console.log("Success:", data);
            })
            .catch((error) => {
                console.error("Error:", error); // Handle error (e.g., display an error message)
            });
    });
});
