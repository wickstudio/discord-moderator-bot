document.addEventListener("DOMContentLoaded", (event) => {
    const form = document.getElementById("commandsForm");
  
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      const commands = {};
  
      // Process checkboxes, setting unchecked ones to 'false' explicitly
      const checkboxes = form.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
          formData.set(checkbox.name, 'false');
        }
      });
  
      // Convert FormData into a commands object, converting 'on' to true for checked checkboxes
      for (const [key, value] of formData) {
        commands[key] = value === "on";
      }
  
      // Send the commands object to the server
      fetch("/commands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commands }),
      })
      .then((data) => {
        window.location.reload(); // Optionally, navigate user or show success message
      })
      .catch((error) => {
        console.error("There has been a problem with your fetch operation:", error);
        // Optionally, handle or display error to the user
      });
    });
  });
  