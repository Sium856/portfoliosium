/**
 * ==========================================================================
 * PORTFOLIO CLIENT SCRIPT — Jahidul Islam Sium
 * Plain Vanilla JavaScript — Zero Frameworks / Zero Dependencies
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNav();
  initActiveNavHighlight();
  initCopyEmail();
  initProfileFallback();
  initPhotoUploader();
  initCertificateSlots();
  initTypedText();
});

/**
 * 1. Mobile Navigation Toggle
 */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu when a nav link is clicked
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * 2. Active Navigation Link on Scroll
 */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

/**
 * 3. Copy Email to Clipboard with Visual Toast Feedback
 */
function initCopyEmail() {
  const copyBtns = document.querySelectorAll('[data-copy-email]');
  const toast = document.getElementById('copy-toast');

  if (!copyBtns.length) return;

  copyBtns.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = btn.getAttribute('data-copy-email') || 'jahidulislamsium02@gmail.com';

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
          showToast(`Email copied: ${email}`);
        } else {
          // Fallback for older browsers / iframe restrictions
          const textarea = document.createElement('textarea');
          textarea.value = email;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          showToast(`Email copied: ${email}`);
        }
      } catch (err) {
        // If clipboard fails, open the default mailto client
        window.location.href = `mailto:${email}`;
      }
    });
  });

  function showToast(message) {
    if (!toast) return;
    const textEl = toast.querySelector('.copy-toast-text');
    if (textEl) textEl.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
}

/**
 * 4. Graceful Profile Image Fallback & Local Storage Cache
 * If the user has uploaded their real photo, it immediately restores it.
 * If 'profile.jpg' does not exist in root, it gracefully falls back to 'profile-placeholder.svg'.
 */
function initProfileFallback() {
  const profileImg = document.getElementById('profile-img');
  if (!profileImg) return;

  // 1. Check if user already loaded their photo into localStorage
  try {
    const savedPhoto = localStorage.getItem('jis_custom_photo');
    if (savedPhoto) {
      profileImg.src = savedPhoto;
    }
  } catch (err) {
    console.warn('LocalStorage unavailable for profile photo:', err);
  }

  // 2. Fallback on image load error
  profileImg.addEventListener('error', () => {
    if (!profileImg.src.includes('profile-placeholder.svg')) {
      profileImg.src = './profile-placeholder.svg';
    }
  });
}

/**
 * 4.5. Instant Photo Uploader & Drag-and-Drop
 * Allows the user to click "Upload Photo" or drag-and-drop their real picture
 * directly onto the profile ring. Updates instantly with zero reload!
 */
function initPhotoUploader() {
  const fileInput = document.getElementById('avatarFileInput');
  const profileImg = document.getElementById('profile-img');
  const dropZone = document.getElementById('profileDropZone');
  const toast = document.getElementById('copy-toast');

  if (!fileInput || !profileImg) return;

  function showToast(msg) {
    if (!toast) return;
    const textEl = toast.querySelector('.copy-toast-text');
    if (textEl) textEl.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3800);
  }

  function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      profileImg.style.opacity = '0.3';
      profileImg.src = dataUrl;
      profileImg.onload = () => {
        profileImg.style.opacity = '1';
      };

      try {
        localStorage.setItem('jis_custom_photo', dataUrl);
      } catch (err) {
        console.warn('Could not cache large image to localStorage:', err);
      }

      showToast('Photo updated! Your real photo is now active.');
    };
    reader.readAsDataURL(file);
  }

  // Handle file input selection
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      handleImageFile(file);
    }
  });

  // Handle drag and drop on profile photo container
  if (dropZone) {
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'dragend'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    });
  }
}

/**
 * 5. Certificate Slots Click Feedback
 */
function initCertificateSlots() {
  const certSlots = document.querySelectorAll('.certificate-slot');
  const toast = document.getElementById('copy-toast');

  certSlots.forEach((slot) => {
    slot.addEventListener('click', (e) => {
      const href = slot.getAttribute('href');
      if (!href || href === '#' || href === '') {
        e.preventDefault();
        if (toast) {
          const textEl = toast.querySelector('.copy-toast-text');
          if (textEl) textEl.textContent = 'Certificate slot ready: paste your certificate link in index.html';
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 3500);
        }
      }
    });
  });
}

/**
 * 6. Typed Text Effect in Hero Section (Matching Reference Portfolio)
 */
function initTypedText() {
  const typedEl = document.getElementById('typedText');
  if (!typedEl) return;

  const phrases = [
    'Competitive Programmer',
    'AI Research Aspirant',
    'Problem Solver'
  ];

  let phraseIndex = 0;
  let charIndex = phrases[0].length;
  let isDeleting = true;
  let delay = 2200;

  function typeTick() {
    const current = phrases[phraseIndex];
    if (isDeleting) {
      charIndex--;
      typedEl.textContent = current.substring(0, charIndex);
    } else {
      charIndex++;
      typedEl.textContent = current.substring(0, charIndex);
    }

    if (!isDeleting && charIndex === current.length) {
      delay = 2400; // Hold word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 350; // Pause before typing next word
    } else {
      delay = isDeleting ? 40 : 85;
    }

    setTimeout(typeTick, delay);
  }

  setTimeout(typeTick, delay);
}

function switchSkillBox(sectionId, boxId, element) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  // Hide all cards within this section's box
  const cards = section.querySelectorAll('.preview-card-box');
  cards.forEach(card => card.classList.remove('active'));

  // Remove active from sibling rows in this section block
  const parentBlock = element.closest('.skills-master-section');
  const rows = parentBlock.querySelectorAll('.skill-row-item');
  rows.forEach(row => row.classList.remove('active'));

  // Show target card and highlight active row
  const targetCard = section.querySelector('#' + boxId);
  if (targetCard) {
    targetCard.classList.add('active');
  }
  element.classList.add('active');
}
/**
 * Theme Toggle Functionality
 */
function initThemeToggle() {
  const themeToggleBtn = document.querySelector('.theme-toggle'); // ba apnar button-er selector
  if (!themeToggleBtn) return;

  // Local storage theke ager theme load kora
  const savedTheme = localStorage.getItem('jis_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }

  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    // Theme save kora
    if (document.body.classList.contains('light-mode')) {
      localStorage.setItem('jis_theme', 'light');
    } else {
      localStorage.setItem('jis_theme', 'dark');
    }
  });
}
