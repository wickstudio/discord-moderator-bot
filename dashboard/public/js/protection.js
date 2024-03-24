document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("config.protection-form");
  
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(e.target);
  
      // Process checkboxes: set their values in formData based on their checked state
      const checkboxes = form.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        formData.set(checkbox.name, checkbox.checked);
      });
  
      // Remove radio group entry from formData
      formData.delete('radio-group');
  
      // Process radio inputs: set true or false in formData based on their checked state
      const radioInputs = form.querySelectorAll('input[type="radio"]');
      radioInputs.forEach(radio => {
        formData.set(radio.value, form.querySelector(`input[value="${radio.value}"]:checked`) ? true : false);
      });
  
      // Construct an object from formData entries, supporting array keys
      let object = {};
      formData.forEach((value, key) => {
        const arrayKeyMatch = key.match(/^(.+)\[(\d+)\]$/);
        if (arrayKeyMatch) {
          const [, arrayKey, arrayIndex] = arrayKeyMatch;
          if (!Reflect.has(object, arrayKey)) {
            object[arrayKey] = [];
          }
          if (!Array.isArray(object[arrayKey])) {
            object[arrayKey] = [object[arrayKey]];
          }
          object[arrayKey][parseInt(arrayIndex, 10)] = value;
        } else {
          if (!Reflect.has(object, key)) {
            object[key] = value;
          } else {
            if (!Array.isArray(object[key])) {
              object[key] = [object[key]];
            }
            object[key].push(value);
          }
        }
      });
  
      // Send the constructed object to the server
      fetch("/protection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(object),
      })
      .then((data) => {
        console.log("Success:", data);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while updating the configuration.");
      });
    });
  });
  