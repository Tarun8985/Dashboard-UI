document.addEventListener('DOMContentLoaded', function () {
// Sidebar toggle buttons and sidebar element
const sidebar = document.querySelector('.sidebar');
const toggleSidebarBtn = document.querySelector('.toggle-sidebar');

// Optional: mobile hamburger toggle button inside header for mobile slide toggle
let mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
if (!mobileMenuToggle) {
mobileMenuToggle = document.createElement('button');
mobileMenuToggle.className = 'mobile-menu-toggle btn btn-link p-0 d-lg-none';
mobileMenuToggle.setAttribute('aria-label', 'Toggle sidebar');
mobileMenuToggle.innerHTML = '<i class="bi bi-list fs-3"></i>';
document.querySelector('.header-right').prepend(mobileMenuToggle);
}

// Toggle sidebar collapse on all sizes by toggling 'collapsed'
toggleSidebarBtn.addEventListener('click', () => {
sidebar.classList.toggle('collapsed');
});

// Mobile hamburger toggles sidebar slide in/out with 'expanded' class
mobileMenuToggle.addEventListener('click', () => {
sidebar.classList.toggle('expanded');
});

// Close mobile sidebar when clicking outside
document.addEventListener('click', (event) => {
const clickInsideSidebar = sidebar.contains(event.target);
const clickOnToggle = toggleSidebarBtn.contains(event.target);
const clickOnMobileToggle = mobileMenuToggle.contains(event.target);

if (!clickInsideSidebar && !clickOnToggle && !clickOnMobileToggle && window.innerWidth < 992) {
sidebar.classList.remove('expanded');
}
});

// Sidebar nav links highlight active and close mobile sidebar after click
const sidebarNavLinks = document.querySelectorAll('.sidebar-nav li a');
sidebarNavLinks.forEach((link) => {
link.addEventListener('click', (e) => {
sidebarNavLinks.forEach((l) => l.parentElement.classList.remove('active'));
e.currentTarget.parentElement.classList.add('active');
if (window.innerWidth < 992) {
sidebar.classList.remove('expanded');
}
});
});

// Theme toggle button and logic
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

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

// Apply saved or system preferred theme on load
const savedTheme = localStorage.getItem('theme') ||
(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
const currentTheme = body.getAttribute('data-theme');
setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// Sticky header shadow on scroll
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

// Back to Top button logic
const backToTopBtn = document.querySelector('.back-to-top');
function toggleBackToTop() {
if (window.scrollY > 300) {
backToTopBtn.classList.add('visible');
} else {
backToTopBtn.classList.remove('visible');
}
}
toggleBackToTop();
window.addEventListener('scroll', toggleBackToTop);

backToTopBtn.addEventListener('click', () => {
window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- Calendar feature ---

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
// Remove all day cells, keeping weekday headers (first 7 children)
while (calendarGrid.children.length > 7) {
calendarGrid.removeChild(calendarGrid.lastChild);
}

const year = date.getFullYear();
const month = date.getMonth();

calendarMonthYear.textContent = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

const firstDay = new Date(year, month, 1);
const lastDay = new Date(year, month + 1, 0);
const startDay = firstDay.getDay();

// Blank cells before first day
for (let i = 0; i < startDay; i++) {
const emptyDiv = document.createElement('div');
emptyDiv.classList.add('calendar-day', 'empty');
calendarGrid.appendChild(emptyDiv);
}

// Create days
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

// Add event dots if events exist
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

eventForm.addEventListener('submit', (e) => {
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

// Sidebar menu item clicks
calendarNavLink.addEventListener('click', (e) => {
e.preventDefault();
sidebarNavLinks.forEach(link => link.parentElement.classList.remove('active'));
calendarNavLink.parentElement.classList.add('active');

calendarSection.classList.remove('d-none');
if (cardsSection) cardsSection.classList.add('d-none');

if (window.innerWidth < 992) {
sidebar.classList.remove('expanded');
}
});

// Dashboard menu item click
const dashboardNav = document.querySelector('.sidebar-nav li:first-child a');
dashboardNav.addEventListener('click', (e) => {
e.preventDefault();
sidebarNavLinks.forEach(link => link.parentElement.classList.remove('active'));
dashboardNav.parentElement.classList.add('active');

calendarSection.classList.add('d-none');
if (cardsSection) cardsSection.classList.remove('d-none');

if (window.innerWidth < 992) {
sidebar.classList.remove('expanded');
}
});

// Initial render
renderCalendar(currentDate);
});

(() => {
  'use strict';

  // Mock notifications data (≥10 as per requirement)
  const notifications = [
    { id: 1, type: "task",    title: "Task moved to Review", desc: "API spec by Alice", time: "10:12", read: false },
    { id: 2, type: "event",   title: "Meeting added",       desc: "Design sync at 4 PM", time: "09:40", read: false },
    { id: 3, type: "comment", title: "New comment",         desc: "Sprint plan thread", time: "08:15", read: true  },
    { id: 4, type: "alert",   title: "Overdue task",         desc: "Auth UI blocked",    time: "Yesterday", read: true },
    { id: 5, type: "task",    title: "Code review assigned", desc: "Review PR #456",      time: "Yesterday", read: false },
    { id: 6, type: "event",   title: "Client call",          desc: "Discuss specs",       time: "2 days ago", read: true },
    { id: 7, type: "comment", title: "Feedback updated",     desc: "UI changes feedback", time: "2 days ago", read: false },
    { id: 8, type: "alert",   title: "Server downtime",      desc: "Database maintenance",time: "3 days ago", read: true },
    { id: 9, type: "task",    title: "New task assigned",    desc: "Update docs",          time: "3 days ago", read: false },
    { id: 10,type: "event",   title: "Team outing",          desc: "Friday evening fun",   time: "Next week", read: false },
  ];

  // Elements
  const notifBtn = document.getElementById('notifBtn');
  const notifDrawer = document.getElementById('notifDrawer');
  const notifOverlay = notifDrawer.querySelector('.notif-overlay');
  const notifList = document.getElementById('notifList');
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  const closeNotifBtn = document.getElementById('closeNotifBtn');
  const notifBadge = document.getElementById('notifBadge');

  // Drawer open state and focused notification index for keyboard nav
  let isOpen = false;
  let focusedIndex = -1;

  // Utility to lock/unlock body scrolling
  function lockBodyScroll(lock) {
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  // Render notifications list
  function renderNotifications() {
    notifList.innerHTML = '';  // clear previous list

    notifications.forEach((notif, index) => {
      const li = document.createElement('li');
      // Add 'unread' class if notification is unread (for distinct styling)
      li.className = 'notif-item' + (notif.read ? '' : ' unread');
      li.tabIndex = 0;
      li.setAttribute('role', 'listitem');
      li.setAttribute('data-index', index);
      li.setAttribute('aria-label', `${notif.title}. ${notif.desc}. ${notif.time}. ${notif.read ? 'Read.' : 'Unread.'}`);

      // Icon representing type
      const icon = document.createElement('span');
      icon.className = `notif-icon ${notif.type}`;
      li.appendChild(icon);

      // Text container (title, description, timestamp)
      const textContainer = document.createElement('div');
      textContainer.className = 'notif-content-text';

      const titleEl = document.createElement('div');
      titleEl.className = 'notif-title-text';
      titleEl.textContent = notif.title;
      textContainer.appendChild(titleEl);

      const descEl = document.createElement('div');
      descEl.className = 'notif-desc-text';
      descEl.textContent = notif.desc;
      textContainer.appendChild(descEl);

      const timeEl = document.createElement('div');
      timeEl.className = 'notif-time-text';
      timeEl.textContent = notif.time;
      textContainer.appendChild(timeEl);

      li.appendChild(textContainer);

      notifList.appendChild(li);
    });

    updateUnreadBadge();
  }

  // Update unread notification count badge on the bell icon (UI only)
  function updateUnreadBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
      notifBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      notifBadge.classList.remove('visually-hidden');
      notifBtn.setAttribute('aria-label', `You have ${unreadCount} unread notifications`);
      notifBtn.setAttribute('aria-expanded', 'false');
    } else {
      notifBadge.textContent = '';
      notifBadge.classList.add('visually-hidden');
      notifBtn.setAttribute('aria-label', "No unread notifications");
      notifBtn.setAttribute('aria-expanded', 'false');
    }
  }

  // Open drawer logic
  function openDrawer() {
    if (isOpen) return;
    isOpen = true;
    notifDrawer.hidden = false;
    notifDrawer.classList.add('open');
    notifBtn.setAttribute('aria-expanded', 'true');
    lockBodyScroll(true);
    notifList.focus();
    focusedIndex = -1;
    trapFocus(notifDrawer);
  }

  // Close drawer logic
  function closeDrawer() {
    if (!isOpen) return;
    isOpen = false;
    notifDrawer.classList.remove('open');
    notifDrawer.hidden = true;
    notifBtn.setAttribute('aria-expanded', 'false');
    lockBodyScroll(false);
    notifBtn.focus();
    releaseFocusTrap();
  }

  // Toggle drawer open/close
  function toggleDrawer() {
    if (isOpen) closeDrawer();
    else openDrawer();
  }

  // Mark all notifications as read (UI only)
  function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    renderNotifications();
  }

  // Focus trap variables
  let focusableElements = [];
  let firstFocusable, lastFocusable;
  let focusTrapHandler = null;

  // Setup focus trap inside the drawer
  function trapFocus(element) {
    focusableElements = Array.from(element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
    if (focusableElements.length === 0) return;
    firstFocusable = focusableElements[0];
    lastFocusable = focusableElements[focusableElements.length - 1];
    focusTrapHandler = function (e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else { // Tab
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeDrawer();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusPrevious();
      }
    };
    document.addEventListener('keydown', focusTrapHandler);
  }

  // Release focus trap when drawer closes
  function releaseFocusTrap() {
    if(focusTrapHandler) {
      document.removeEventListener('keydown', focusTrapHandler);
      focusTrapHandler = null;
    }
  }

  // Keyboard navigation: focus next notification
  function focusNext() {
    if (focusedIndex === -1 || focusedIndex + 1 >= notifList.children.length) {
      focusedIndex = 0;
    } else {
      focusedIndex++;
    }
    notifList.children[focusedIndex].focus();
  }

  // Keyboard navigation: focus previous notification
  function focusPrevious() {
    if (focusedIndex <= 0) {
      focusedIndex = notifList.children.length - 1;
    } else {
      focusedIndex--;
    }
    notifList.children[focusedIndex].focus();
  }

  
  notifBtn.addEventListener('click', toggleDrawer);
  notifOverlay.addEventListener('click', closeDrawer);
  closeNotifBtn.addEventListener('click', closeDrawer);
  markAllReadBtn.addEventListener('click', () => {
    markAllAsRead();
  });


  notifList.addEventListener('click', (e) => {
    const item = e.target.closest('.notif-item');
    if (!item) return;
    const index = parseInt(item.getAttribute('data-index'), 10);
    if (index >= 0 && !notifications[index].read) {
      notifications[index].read = true;
      renderNotifications();
      item.focus();
    }
  });

  renderNotifications();
})();
