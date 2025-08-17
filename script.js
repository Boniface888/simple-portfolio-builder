// ===== Toggle Password Visibility =====
function togglePassword() {
    const passwordField = document.getElementById("password");
    if (passwordField.type === "password") {
      passwordField.type = "text";
    } else {
      passwordField.type = "password";
    }
  }
  
  // ===== Handle Sign Up =====
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const email = document.getElementById("signupEmail").value;
      const password = document.getElementById("signupPassword").value;
  
      if (email && password) {
        // Save credentials in localStorage
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userPassword", password);
  
        alert("Sign Up successful! You can now login.");
        window.location.href = "login.html"; // redirect to login
      } else {
        alert("Please fill in all fields.");
      }
    });
  }
  
  // ===== Handle Login =====
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
  
      const savedEmail = localStorage.getItem("userEmail");
      const savedPassword = localStorage.getItem("userPassword");
  
      if (!savedEmail || !savedPassword) {
        alert("You need to sign up first before logging in.");
        window.location.href = "signup.html";
        return;
      }
  
      if (email === savedEmail && password === savedPassword) {
        alert("Login successful! 🎉");
        window.location.href = "home.html"; // redirect to homepage after login
      } else {
        alert("Wrong credentials. Please try again.");
      }
    });
  }
  