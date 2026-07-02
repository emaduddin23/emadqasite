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

  // ===== Visitor Views Counter (Server-Side via Netlify Function) =====
  const viewsCountEl = document.getElementById('views-count');
  if (viewsCountEl) {
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

    // Check if this session already counted the view
    const alreadyCounted = sessionStorage.getItem('view_counted');

    // POST = increment + return count (new session)
    // GET  = just return count (already counted this session)
    const method = alreadyCounted ? 'GET' : 'POST';

    fetch('/api/views', { method })
      .then(res => res.json())
      .then(data => {
        if (!alreadyCounted) {
          sessionStorage.setItem('view_counted', 'true');
        }
        setTimeout(() => {
          animateCounter(data.views || 0, 1200);
        }, 500);
      })
      .catch(() => {
        viewsCountEl.textContent = '—';
      });
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

  // ===== Contact Form Handler =====
  const contactForm = document.getElementById('contact-form');
  const contactSubmitBtn = document.getElementById('contact-submit');
  const contactToast = document.getElementById('contact-toast');

  if (contactForm && contactSubmitBtn && contactToast) {
    function showToast(type, message) {
      const toastIcon = contactToast.querySelector('.toast-icon i');
      const toastMsg = contactToast.querySelector('.toast-message');

      // Reset classes
      contactToast.classList.remove('show', 'success', 'error');

      // Set type
      contactToast.classList.add(type);
      toastMsg.textContent = message;

      if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
      } else {
        toastIcon.className = 'fas fa-exclamation-circle';
      }

      // Trigger show with slight delay for animation
      requestAnimationFrame(() => {
        contactToast.classList.add('show');
      });

      // Auto-hide after 6 seconds
      setTimeout(() => {
        contactToast.classList.remove('show');
      }, 6000);
    }

    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      // Client-side validation
      if (!name || !email || !message) {
        showToast('error', 'Please fill in all fields.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('error', 'Please enter a valid email address.');
        return;
      }

      // Show loading state
      contactSubmitBtn.classList.add('loading');

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          showToast('success', data.message || 'Message sent successfully!');
          contactForm.reset();
        } else {
          showToast('error', data.error || 'Something went wrong. Please try again.');
        }
      } catch (err) {
        showToast('error', 'Network error. Please check your connection and try again.');
      } finally {
        contactSubmitBtn.classList.remove('loading');
      }
    });
  }
});