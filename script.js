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

  // Typing Effect for Hero Section
  const typingTextElement = document.querySelector('.typing-text');
  if (typingTextElement) {
    const words = ["Researcher", "Tester", "Analyst"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 150;

    function typeEffect() {
      const currentWord = words[wordIndex];
      
      if (isDeleting) {
        typingTextElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50; // Faster deleting speed
      } else {
        typingTextElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 150; // Normal typing speed
      }

      if (!isDeleting && charIndex === currentWord.length) {
        // Pause at the end of the word before deleting
        isDeleting = true;
        typingSpeed = 1500;
      } else if (isDeleting && charIndex === 0) {
        // Move to the next word after deleting is complete
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typingSpeed = 500; // Pause before typing the next word
      }

      setTimeout(typeEffect, typingSpeed);
    }

    // Start the typing effect
    setTimeout(typeEffect, 1000);
  }

  // Theme Toggle Logic
  const themeToggleBtn = document.getElementById('theme-toggle');
  const icon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

  if (themeToggleBtn && icon) {
    // Check local storage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    }

    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      
      if (document.body.classList.contains('light-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('theme', 'light');
      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  // ===== Visitor Views Counter =====
  const viewsCountEl = document.getElementById('views-count');
  if (viewsCountEl) {
    // Get current count from localStorage
    let totalViews = parseInt(localStorage.getItem('site_views') || '0', 10);

    // Check if this is a new session (hasn't been counted today)
    const lastVisitDate = localStorage.getItem('last_visit_date');
    const today = new Date().toDateString();

    if (lastVisitDate !== today) {
      // New day = new visit counted
      totalViews++;
      localStorage.setItem('site_views', totalViews.toString());
      localStorage.setItem('last_visit_date', today);
    }

    // Animated count-up effect
    function animateCounter(target, duration) {
      const start = 0;
      const startTime = performance.now();

      function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * eased);

        viewsCountEl.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          viewsCountEl.textContent = target.toLocaleString();
          viewsCountEl.classList.add('counting');
          setTimeout(() => viewsCountEl.classList.remove('counting'), 300);
        }
      }

      requestAnimationFrame(updateCount);
    }

    // Start counting animation after a short delay
    setTimeout(() => {
      animateCounter(totalViews, 1200);
    }, 500);
  }
  // ===== Floating Scroll Buttons =====
  const scrollToTopBtn = document.getElementById('scroll-to-top');
  const scrollToBottomBtn = document.getElementById('scroll-to-bottom');

  if (scrollToTopBtn && scrollToBottomBtn) {
    function updateScrollButtons() {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const scrollPercent = scrollY / (docHeight - windowHeight);

      // Show "scroll to top" after scrolling down 300px
      if (scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }

      // Show "scroll to bottom" when user is NOT near the bottom (top 85%)
      if (scrollPercent < 0.85) {
        scrollToBottomBtn.classList.add('visible');
      } else {
        scrollToBottomBtn.classList.remove('visible');
      }
    }

    // Scroll to top
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Scroll to bottom
    scrollToBottomBtn.addEventListener('click', () => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    });

    // Listen for scroll events (throttled with requestAnimationFrame)
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          updateScrollButtons();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    });

    // Initial check
    updateScrollButtons();
  }
}); 