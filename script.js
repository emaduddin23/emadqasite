document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger-icon');
  const navMenu = document.querySelector('nav#main-nav ul');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
    // Optional: Close menu when a link is clicked (for better UX)
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
      });
    });
  }

  // Smooth scroll to sections and highlight active nav link
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  function highlightNavLink() {
    let scrollPosition = window.scrollY + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Highlight on scroll
  window.addEventListener('scroll', highlightNavLink);
  
  // Highlight on load
  highlightNavLink();
}); 