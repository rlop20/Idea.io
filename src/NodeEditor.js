import * as d3 from 'd3';

/**
 * editNodeText - Allows users to edit the text content of a node by overlaying an HTML input element.
 * @param {Object} d - Data bound to the node that was clicked.
 * @param {HTMLElement} textElement - The HTML element representing the text of the node.
 */
export function editNodeText(d, textElement) {
  const parent = d3.select(textElement.parentNode);
  const currentValue = d.data.name;

  // Get the position and size of the text element
  const bbox = textElement.getBoundingClientRect();
  const container = document.body;

  // Create an input element and position it over the text element
  const input = document.createElement('textarea');
  input.value = currentValue;
  input.style.position = 'absolute';
  input.style.left = `${bbox.left + window.scrollX}px`;
  input.style.top = `${bbox.top + window.scrollY}px`;
  input.style.width = `${bbox.width + 20}px`; // Ensure the width is slightly larger than the text box
  input.style.fontSize = '12px';
  input.style.padding = '4px';
  input.style.zIndex = 1000;
  input.style.border = '1px solid #ccc';
  input.style.boxSizing = 'border-box';
  input.style.resize = 'none'; // Disable manual resizing by the user
  input.style.overflow = 'hidden'; // Hide overflow initially
  
  // Ensure the text wraps inside the textarea
  input.style.whiteSpace = 'pre-wrap'; // Make sure text wraps
  input.style.wordWrap = 'break-word'; // Break long words if necessary
  
  container.appendChild(input);

  // Auto-resize the textarea based on the text content
  const resizeTextArea = () => {
    input.style.height = 'auto'; // Reset the height so it can shrink on content removal
    input.style.height = `${input.scrollHeight}px`; // Set height to match content
  };

  // Call resize function immediately to set the initial size
  resizeTextArea();

  // Add event listener to resize the textarea when the user types or modifies content
  input.addEventListener('input', resizeTextArea);

  // Focus the input for editing
  input.focus();

  // Handle blur event to save the updated text
  input.addEventListener('blur', () => {
    const newValue = input.value.trim();
    if (newValue) {
      d.data.name = newValue;
    }
    // Remove the input field
    container.removeChild(input);

    // Update the original D3 text element with the new value
    d3.select(textElement).text(newValue);
  });

  // Handle the Enter key event to finish editing
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      input.blur(); // Trigger blur to save changes
    }
  });
}
