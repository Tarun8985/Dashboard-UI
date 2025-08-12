document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");
  const navLinks = sidebar.querySelectorAll(".nav-link");
  const themeToggle = document.getElementById("themeToggle");
  const backToTopBtn = document.getElementById("backToTop");
  const header = document.querySelector("header.navbar");

  // Initialize theme from saved preference or default to light or system preference
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme(prefersDark ? "dark" : "light");
  }

  // Sync toggle UI state with current theme
  function updateToggleState(theme) {
    themeToggle.checked = (theme === "dark");
  }

  // Sidebar toggle handler (collapse on desktop, slide on mobile)
  toggleBtn.addEventListener("click", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.toggle("collapsed");
    } else {
      sidebar.classList.toggle("show");
    }
  });

  // Close mobile sidebar if clicking outside
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && e.target !== toggleBtn) {
        sidebar.classList.remove("show");
      }
    }
  });

  // Highlight active menu item on click
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("show");
      }
    });
  });

  // Theme toggle switch handler
  themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  });

  // Set theme, update toggle and save preference
  function setTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
    localStorage.setItem("theme", theme);
    updateToggleState(theme);
  }

  // Sticky header style and back-to-top button visibility on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    if (window.scrollY > 300) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  });

  // Back to top smooth scroll on click
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Accessibility: toggle sidebar with keyboard (Enter/Space)
  toggleBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleBtn.click();
    }
  });

  // Accessibility: allow backToTop button keyboard activation
  backToTopBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      backToTopBtn.click();
    }
  });
});
