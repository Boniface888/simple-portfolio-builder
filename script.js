// ===================
// DOMContentLoaded
// ===================
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const portfolioForm = document.getElementById("portfolioForm");
  const logoutBtn = document.getElementById("logoutBtn");

  // -------------------
  // SIGNUP FUNCTIONALITY
  // -------------------
  if (signupForm) {
    const signupPasswordInput = document.getElementById("signupPassword");
    const toggleSignupPassword = document.getElementById("toggleSignupPassword");

    if (toggleSignupPassword && signupPasswordInput) {
      toggleSignupPassword.addEventListener("click", () => {
        signupPasswordInput.type =
          signupPasswordInput.type === "password" ? "text" : "password";
        toggleSignupPassword.textContent =
          signupPasswordInput.type === "password" ? "👁️" : "🙈";
      });
    }

    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = signupPasswordInput.value.trim();

      if (name && email && password) {
        const user = { name, email, password };
        localStorage.setItem("portfolioUser", JSON.stringify(user));
        alert("Account created successfully! Please log in.");
        window.location.href = "login.html";
      } else {
        alert("Please fill in all fields.");
      }
    });
  }

  // -------------------
  // LOGIN FUNCTIONALITY
  // -------------------
  if (loginForm) {
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");

    if (togglePassword && passwordInput) {
      togglePassword.addEventListener("click", () => {
        passwordInput.type =
          passwordInput.type === "password" ? "text" : "password";
        togglePassword.textContent =
          passwordInput.type === "password" ? "👁️" : "🙈";
      });
    }

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = passwordInput.value.trim();
      const storedUser = JSON.parse(localStorage.getItem("portfolioUser"));

      if (storedUser) {
        if (
          (username === storedUser.email || username === storedUser.name) &&
          password === storedUser.password
        ) {
          alert(`Welcome back, ${storedUser.name}!`);
          window.location.href = "dashboard.html";
        } else {
          alert("Invalid username or password.");
        }
      } else {
        alert("No account found. Please sign up first.");
        window.location.href = "signup.html";
      }
    });
  }

  // -------------------
  // DASHBOARD FUNCTIONALITY
  // -------------------
  if (portfolioForm) {
    const saveBtn = document.getElementById("savePortfolio");
    const previewBtn = document.getElementById("previewPortfolio");

    // Save Portfolio
    saveBtn.addEventListener("click", async () => {
      const project = await collectPortfolioData();
      if (project) {
        saveProject(project);
      }
    });

    // Preview Portfolio
    previewBtn.addEventListener("click", async () => {
      const project = await collectPortfolioData();
      if (project) {
        localStorage.setItem("previewProject", JSON.stringify(project));
        window.location.href = "preview.html";
      }
    });
  }

  // -------------------
  // LOGOUT FUNCTIONALITY
  // -------------------
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      alert("You have been logged out.");
      window.location.href = "login.html";
    });
  }

  // -------------------
  // HELPER: Collect Form Data
  // -------------------
  async function collectPortfolioData() {
    const profileImage = document.getElementById("profileImage")?.files[0];
    const fullName = document.getElementById("fullName")?.value.trim();
    const jobTitle = document.getElementById("jobTitle")?.value.trim();
    const about = document.getElementById("about")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const location = document.getElementById("location")?.value.trim();
    const website = document.getElementById("website")?.value.trim();
    const linkedin = document.getElementById("linkedin")?.value.trim();
    const github = document.getElementById("github")?.value.trim();
    const skills = document.getElementById("skills")?.value.trim();
    const education = document.getElementById("education")?.value.trim();
    const experience = document.getElementById("experience")?.value.trim();
    const projects = document.getElementById("projects")?.value.trim();

    if (!fullName || !jobTitle) {
      alert("Please fill in at least your name and job title.");
      return null;
    }

    let imageBase64 = localStorage.getItem("lastUploadedImage") || "";

    if (profileImage) {
      imageBase64 = await toBase64(profileImage);
      localStorage.setItem("lastUploadedImage", imageBase64);
    }

    return {
      fullName,
      jobTitle,
      about,
      email,
      phone,
      location,
      website,
      linkedin,
      github,
      skills,
      education,
      experience,
      projects,
      image: imageBase64,
      createdAt: new Date().toISOString(),
    };
  }

  // Convert file to Base64
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
});

// ===================
// SAVE PROJECT FUNCTION (CLEAN VERSION)
// ===================
function saveProject(data) {
  let myProjects = JSON.parse(localStorage.getItem("myProjects")) || [];

  const editIndex = localStorage.getItem("editProjectIndex");
  if (editIndex !== null) {
    myProjects[editIndex] = {
      ...data,
      createdAt: myProjects[editIndex].createdAt || new Date().toISOString()
    };
    localStorage.removeItem("editProjectIndex");
  } else {
    myProjects.push({
      ...data,
      createdAt: new Date().toISOString()
    });
  }

  localStorage.setItem("myProjects", JSON.stringify(myProjects));
  alert("Project saved successfully!");
  // 🚫 No redirect — stays on dashboard
}
document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("downloadZip");

  downloadBtn.addEventListener("click", async () => {
    const zip = new JSZip();

    // Add index.html
    const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Portfolio</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <img src="images/profile.jpg" alt="Profile Picture" class="profile-img">
    <h1>My Portfolio</h1>
  </header>
  <section>
    <h2>About Me</h2>
    <p>This is your portfolio website!</p>
  </section>
  <script src="script.js"></script>
</body>
</html>`;
    zip.file("index.html", indexHTML);

    // Add style.css
    const styleCSS = `
body { font-family: Arial, sans-serif; margin:0; padding:0; background:#f5f5f5; color:#222; }
header { text-align:center; margin:2rem; }
.profile-img { width:140px; height:140px; border-radius:50%; object-fit:cover; border:4px solid #3498db; }
section { margin:2rem; }
h2 { color:#3498db; border-bottom:2px solid #ccc; padding-bottom:0.5rem; }
`;
    zip.file("style.css", styleCSS);

    // Add script.js
    const portfolioJS = `console.log("Portfolio loaded successfully!");`;
    zip.file("script.js", portfolioJS);

    // Add images folder
    const folder = zip.folder("images");
    // Placeholder profile image (blank)
    folder.file("profile.jpg", "", { base64: true });

    // Generate ZIP
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "portfolio.zip";
    link.click();
  });
});
