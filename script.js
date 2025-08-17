// ===================
// Password Eye Toggle
// ===================
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // Change icon when toggled
    togglePassword.textContent = type === "password" ? "👁️" : "🙈";
  });
}

// ===================
// Login Form Redirect
// ===================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault(); // stop form from refreshing the page

    // Get username & password (you can expand this later with real validation)
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username && password) {
      // Redirect to next page (change 'dashboard.html' if needed)
      window.location.href = "dashboard.html";
    } else {
      alert("Please enter both username and password.");
    }
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  // Toggle Password Visibility
  togglePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.textContent = "🙈"; // Change icon
    } else {
      passwordInput.type = "password";
      togglePassword.textContent = "👁️"; // Reset icon
    }
  });

  // Handle Login Form
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = passwordInput.value.trim();

    if (username && password) {
      // For now, just redirect to dashboard (no backend yet)
      window.location.href = "dashboard.html";
    } else {
      alert("Please enter both username and password.");
    }
  });
});
