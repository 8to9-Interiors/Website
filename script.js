/**
 * MOBILE NAVIGATION TOGGLE
 *
 * How it works:
 * 1. We select the hamburger button and the nav menu list.
 * 2. Clicking the button toggles the CSS class "is-open" on both elements.
 * 3. CSS handles the visual change (menu slides in, bars become an X).
 * 4. aria-expanded keeps the button accessible for screen readers.
 */

const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");

/**
 * Opens or closes the mobile menu.
 * Toggles "is-open" on the button and menu so CSS can show/hide them.
 */
function toggleMobileMenu() {
  const isOpen = navMenu.classList.toggle("is-open");
  navToggle.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
}

navToggle.addEventListener("click", toggleMobileMenu);

/**
 * Close the menu when a nav link is clicked (better mobile UX).
 * Also enables smooth in-page scrolling without leaving menu open.
 */
navLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    if (navMenu.classList.contains("is-open")) {
      navMenu.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation menu");
    }
  });
});

/**
 * Close menu if user resizes window to desktop width.
 * Prevents the mobile panel from staying open on larger screens.
 */
window.addEventListener("resize", function () {
  if (window.innerWidth > 768 && navMenu.classList.contains("is-open")) {
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
  }
});

/**
 * CONTACT FORM — client-side validation demo
 *
 * Prevents default submit (no backend yet) and shows a simple alert.
 * Replace this with a real form handler (e.g. Formspree, Netlify Forms) later.
 */
const contactForm = document.querySelector(".contact-form");

contactForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email || !message) {
    alert("Please fill in all fields before submitting.");
    return;
  }

  alert("Thank you, " + name + "! Your message has been received. We will contact you soon.");
  contactForm.reset();
});
