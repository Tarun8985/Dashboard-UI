document.addEventListener('DOMContentLoaded', function () {
  // Sidebar toggle functionality
  const sidebar = document.querySelector('.sidebar');
  const toggleSidebarBtn = document.querySelector('.toggle-sidebar');

  toggleSidebarBtn.addEventListener('click', function () {
    if (window.innerWidth < 992) {
      // Mobile: toggle 'expanded' class (slide in/out)
      sidebar.classList.toggle('expanded');
    } else {
      // Desktop: toggle 'collapsed' class (shrink/expand width)
      sidebar.classList.toggle('collapsed');
    }
  });

  // Theme switcher
  const themeToggle = document.querySelector('.theme-toggle');
  const body = document.body;

  // Initialize theme from localStorage or system preference
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(savedTheme);

  function setTheme(theme) {
    if (theme === 'dark') {
      body.setAttribute('data-theme', 'dark');
      themeToggle.innerHTML = '<i class="bi bi-sun-fill fs-4"></i>';
    } else {
      body.setAttribute('data-theme', 'light');
      themeToggle.innerHTML = '<i class="bi bi-moon-fill fs-4"></i>';
    }
    localStorage.setItem('theme', theme);
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  // Sticky header on scroll
  const header = document.querySelector('.header');
  function updateHeader() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader);

  // Mobile menu toggle button (optional)
  const mobileMenuToggle = document.createElement('button');
  mobileMenuToggle.className = 'mobile-menu-toggle btn btn-link p-0 d-lg-none';
  mobileMenuToggle.innerHTML = '<i class="bi bi-list fs-3"></i>';
  header.querySelector('.header-right').prepend(mobileMenuToggle);

  mobileMenuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('expanded');
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', function (event) {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnMobileToggle = mobileMenuToggle.contains(event.target);
    if (!isClickInsideSidebar && !isClickOnMobileToggle && window.innerWidth < 992) {
      sidebar.classList.remove('expanded');
    }
  });

  // Highlight active sidebar nav item on click
  const sidebarNavLinks = document.querySelectorAll('.sidebar-nav li a');
  sidebarNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      sidebarNavLinks.forEach(l => l.parentElement.classList.remove('active'));
      e.currentTarget.parentElement.classList.add('active');

      // Close sidebar on mobile after selection
      if (window.innerWidth < 992) {
        sidebar.classList.remove('expanded');
      }
    });
  });

  // Back to Top button functionality
  const backToTopButton = document.querySelector('.back-to-top');

  function toggleBackToTop() {
    if (window.scrollY > 300) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  }
  toggleBackToTop();
  window.addEventListener('scroll', toggleBackToTop);

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- Calendar Functionality ---
  const calendarNavLink = document.getElementById('calendarNav');
  const calendarSection = document.getElementById('calendarSection');
  const cardsSection = document.querySelector('.cards-section');
  const calendarMonthYear = document.getElementById('calendarMonthYear');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const todayBtn = document.getElementById('todayBtn');
  const calendarGrid = calendarSection.querySelector('.calendar-grid');
  const eventModalEl = document.getElementById('eventModal');
  const eventModal = new bootstrap.Modal(eventModalEl);
  const eventForm = document.getElementById('eventForm');
  const eventDateInput = document.getElementById('eventDate');
  const eventTitleInput = document.getElementById('eventTitle');
  const eventColorInput = document.getElementById('eventColor');
  const deleteEventBtn = document.getElementById('deleteEventBtn');

  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  let selectedDate = null;
  let events = JSON.parse(localStorage.getItem('calendarEvents') || '{}');

  function formatDateKey(date) {
    return date.toISOString().split('T')[0];
  }

  function renderCalendar(date) {
    // Clear previous day cells (keep 7 weekday headers)
    while (calendarGrid.children.length > 7) {
      calendarGrid.removeChild(calendarGrid.lastChild);
    }

    const year = date.getFullYear();
    const month = date.getMonth();

    calendarMonthYear.textContent = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    // Empty slots before first day
    for (let i = 0; i < startDay; i++) {
      const emptySlot = document.createElement('div');
      emptySlot.classList.add('calendar-day', 'empty');
      calendarGrid.appendChild(emptySlot);
    }

    // Create day cells
    for (let dayNum = 1; dayNum <= lastDay.getDate(); dayNum++) {
      const dayDate = new Date(year, month, dayNum);
      const dayKey = formatDateKey(dayDate);
      const dayDiv = document.createElement('div');
      dayDiv.classList.add('calendar-day');
      dayDiv.setAttribute('tabindex', '0');
      dayDiv.setAttribute('role', 'button');
      dayDiv.setAttribute('aria-label', `Day ${dayNum}, ${date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`);
      dayDiv.textContent = dayNum;

      // Highlight today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dayDate.getTime() === today.getTime()) {
        dayDiv.classList.add('today');
      }

      // Event dots
      if (events[dayKey]) {
        const uniqueColors = [...new Set(events[dayKey].map(ev => ev.color))].slice(0, 3);
        uniqueColors.forEach(color => {
          const dot = document.createElement('span');
          dot.className = `event-dot ${color}`;
          dayDiv.appendChild(dot);
        });
      }

      dayDiv.addEventListener('click', () => openEventModal(dayDate));
      dayDiv.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openEventModal(dayDate);
        }
      });

      calendarGrid.appendChild(dayDiv);
    }
  }

  function openEventModal(date) {
    selectedDate = date;
    const dayKey = formatDateKey(date);

    eventDateInput.value = date.toDateString();

    const dayEvents = events[dayKey] || [];

    if (dayEvents.length > 0) {
      // Load last event for editing
      const ev = dayEvents[dayEvents.length - 1];
      eventTitleInput.value = ev.title;
      eventColorInput.value = ev.color || 'primary';
      deleteEventBtn.classList.remove('d-none');
    } else {
      eventTitleInput.value = '';
      eventColorInput.value = 'primary';
      deleteEventBtn.classList.add('d-none');
    }

    eventModal.show();
  }

  eventForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!selectedDate) return;

    const dayKey = formatDateKey(selectedDate);
    const title = eventTitleInput.value.trim();
    const color = eventColorInput.value || 'primary';

    if (!title) {
      alert('Please enter an event title.');
      eventTitleInput.focus();
      return;
    }

    // Save one event per day (can be extended)
    events[dayKey] = [{ title, color }];
    localStorage.setItem('calendarEvents', JSON.stringify(events));
    eventModal.hide();
    renderCalendar(currentDate);
  });

  deleteEventBtn.addEventListener('click', () => {
    if (!selectedDate) return;
    const dayKey = formatDateKey(selectedDate);
    if (confirm('Delete all events for this day?')) {
      delete events[dayKey];
      localStorage.setItem('calendarEvents', JSON.stringify(events));
      eventModal.hide();
      renderCalendar(currentDate);
    }
  });

  prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

  todayBtn.addEventListener('click', () => {
    currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    renderCalendar(currentDate);
  });

  // Sidebar calendar menu click handler
  calendarNavLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Set active class on sidebar links
    sidebarNavLinks.forEach(link => link.parentElement.classList.remove('active'));
    calendarNavLink.parentElement.classList.add('active');

    // Show calendar, hide cards
    calendarSection.classList.remove('d-none');
    if (cardsSection) cardsSection.classList.add('d-none');
  });

  // Dashboard link goes back to cards view
  const dashboardNav = document.querySelector('.sidebar-nav li:first-child a');
  dashboardNav.addEventListener('click', (e) => {
    e.preventDefault();
    sidebarNavLinks.forEach(link => link.parentElement.classList.remove('active'));
    dashboardNav.parentElement.classList.add('active');

    calendarSection.classList.add('d-none');
    if (cardsSection) cardsSection.classList.remove('d-none');
  });

  // Initialize calendar view (hidden by default)
  renderCalendar(currentDate);
});
