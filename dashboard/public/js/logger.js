// Logger configuration form submission handling
document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("loggerForm").addEventListener("submit", async function (e) {
      e.preventDefault(); // Prevent traditional form submission
  
      const updatedLoggerConfig = { events: data.logger.events };
  
      // Process checkboxes, setting their corresponding event to true or false
      document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
        updatedLoggerConfig.events[checkbox.name] = checkbox.checked;
      });
  
      // Process text inputs, updating event log ID values
      document.querySelectorAll('input[type="text"]').forEach((input) => {
        updatedLoggerConfig.events[input.name] = input.value;
      });
  
      try {
        // Send updated logger configuration to the server
        const response = await fetch("/logger", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedLoggerConfig),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        window.location.reload(); // Reload the page or navigate user to a confirmation page
  
      } catch (error) {
        console.error("Error:", error);
        // Display error message to the user or log the error
      }
    });
  });
  