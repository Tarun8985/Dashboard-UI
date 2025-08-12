document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle functionality
    const sidebar = document.querySelector('.sidebar');
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    
    toggleSidebar.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        sidebar.classList.toggle('expanded');
    });

    // Theme switcher
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', function() {
        if (body.getAttribute('data-theme') === 'dark') {
            body.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        }
    });

    // Sticky header on scroll
    const header = document.querySelector('.header');
    const content = document.querySelector('.content');
    
    function updateHeader() {
        if (window.innerWidth > 768) {
            // Desktop behavior
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        } else {
            // Mobile behavior - always sticky
            header.classList.add('scrolled');
        }
    }

    // Initial call
    updateHeader();

    // Update on scroll and resize
    window.addEventListener('scroll', updateHeader);
    window.addEventListener('resize', updateHeader);

    // Mobile menu toggle - CORRECTED VERSION
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.querySelector('.header-right').prepend(mobileMenuToggle);
    
    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('expanded');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnMobileToggle = mobileMenuToggle.contains(event.target);
        
        if (!isClickInsideSidebar && !isClickOnMobileToggle && window.innerWidth < 992) {
            sidebar.classList.remove('expanded');
        }
    });

    // Active menu item
    const menuItems = document.querySelectorAll('.sidebar-nav li');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Close sidebar on mobile after selection
            if (window.innerWidth < 992) {
                sidebar.classList.remove('expanded');
            }
        });
    });
});
const backToTopButton = document.querySelector('.back-to-top');

function toggleBackToTop() {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
}

// Initial check
toggleBackToTop();

// Update on scroll
window.addEventListener('scroll', toggleBackToTop);

// Smooth scroll to top
backToTopButton.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});