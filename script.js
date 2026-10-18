
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  // ==========================================
  // 1. FOOTER YEAR
  // ==========================================

  const year = $("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // ==========================================
  // 2. MOBILE NAVIGATION
  // ==========================================

  const menuToggle = $(".menu-toggle");
  const navLinks = $(".nav-links");

  function closeMenu() {
    if (!menuToggle || !navLinks) return;

    menuToggle.classList.remove("active");
    navLinks.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  if (menuToggle && navLinks) {
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", (event) => {
      event.stopPropagation();

      const isOpen = !navLinks.classList.contains("active");

      navLinks.classList.toggle("active", isOpen);
      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    $$("a", navLinks).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  // ==========================================
  // 3. SMOOTH ANCHOR NAVIGATION
  // ==========================================

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      let target;

      try {
        target = $(href);
      } catch {
        return;
      }

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "start",
      });

      closeMenu();
    });
  });

  // ==========================================
  // 4. SCROLL REVEAL
  // ==========================================

  const revealSelectors = [
    ".section-heading",
    ".about-content",
    ".about-visual",
    ".expertise-card",
    ".project-card",
    ".contact-content",
    ".contact-card",
    ".stats",
  ];

  const revealElements = [
    ...new Set(
      revealSelectors.flatMap((selector) => $$(selector))
    ),
  ];

  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    revealElements.forEach((element, index) => {
      element.classList.add("reveal");

      if (
        element.matches(".expertise-card, .project-card")
      ) {
        element.style.transitionDelay =
          `${(index % 3) * 80}ms`;
      }

      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  // ==========================================
  // 5. ACTIVE NAVIGATION SECTION
  // ==========================================

  const sections = $$("main section[id]");
  const navItems = $$('.nav-links a[href^="#"]');

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navItems.forEach((link) => {
            const active =
              link.getAttribute("href") ===
              `#${entry.target.id}`;

            link.classList.toggle("active", active);

            if (active) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-30% 0px -55% 0px",
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  // ==========================================
  // 6. HERO PARALLAX
  // ==========================================

  const heroVisual = $(".hero-visual");
  const visualGlow = $(".visual-glow");
  const coreScene = $(".core-scene");

  if (
    finePointer.matches &&
    !reduceMotion.matches &&
    heroVisual
  ) {
    heroVisual.addEventListener("pointermove", (event) => {
      const bounds = heroVisual.getBoundingClientRect();

      const x =
        (event.clientX - bounds.left) / bounds.width - 0.5;

      const y =
        (event.clientY - bounds.top) / bounds.height - 0.5;

      if (visualGlow) {
        visualGlow.style.translate =
          `${x * 15}px ${y * 15}px`;
      }

      if (coreScene) {
        coreScene.style.setProperty(
          "--pointer-x",
          `${x * 8}deg`
        );

        coreScene.style.setProperty(
          "--pointer-y",
          `${y * -8}deg`
        );
      }
    });

    heroVisual.addEventListener("pointerleave", () => {
      if (visualGlow) {
        visualGlow.style.translate = "0px 0px";
      }

      if (coreScene) {
        coreScene.style.removeProperty("--pointer-x");
        coreScene.style.removeProperty("--pointer-y");
      }
    });
  }

  // ==========================================
  // 7. 3D PROJECT CARD TILT
  // ==========================================

  if (finePointer.matches && !reduceMotion.matches) {
    $$(".project-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();

        const x =
          (event.clientX - bounds.left) / bounds.width;

        const y =
          (event.clientY - bounds.top) / bounds.height;

        const rotateY = (x - 0.5) * 7;
        const rotateX = (0.5 - y) * 7;

        card.style.setProperty("--pointer-x", `${x * 100}%`);
        card.style.setProperty("--pointer-y", `${y * 100}%`);

        card.style.transform =
          `perspective(1000px) ` +
          `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ` +
          "translateY(-5px)";
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
        card.style.removeProperty("--pointer-x");
        card.style.removeProperty("--pointer-y");
      });
    });
  }

  // ==========================================
  // 8. EXPERTISE CARD LIGHTING
  // ==========================================

  if (finePointer.matches && !reduceMotion.matches) {
    $$(".expertise-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();

        const x =
          ((event.clientX - bounds.left) / bounds.width) * 100;

        const y =
          ((event.clientY - bounds.top) / bounds.height) * 100;

        card.style.setProperty("--pointer-x", `${x}%`);
        card.style.setProperty("--pointer-y", `${y}%`);
      });

      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--pointer-x");
        card.style.removeProperty("--pointer-y");
      });
    });
  }

  // ==========================================
  // 9. CONTACT FEEDBACK
  // ==========================================

  $$('a[href^="mailto:"]').forEach((link) => {
    link.addEventListener("click", () => {
      link.classList.add("contact-clicked");

      window.setTimeout(() => {
        link.classList.remove("contact-clicked");
      }, 450);
    });
  });

  // ==========================================
  // 10. OPTIONAL SCROLL PROGRESS
  // ==========================================

  let scrollTicking = false;

  function updateScrollProgress() {
    const scrollableHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const progress =
      scrollableHeight > 0
        ? window.scrollY / scrollableHeight
        : 0;

    document.documentElement.style.setProperty(
      "--scroll-progress",
      `${Math.min(1, Math.max(0, progress)) * 100}%`
    );

    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;

      scrollTicking = true;
      window.requestAnimationFrame(updateScrollProgress);
    },
    { passive: true }
  );

  updateScrollProgress();

  // ==========================================
  // 11. INITIALIZE
  // ==========================================

  console.log(
    "%c JAY PRIME TECHNOLOGIES ",
    "background:#071326;color:#66bdff;" +
      "font-size:16px;font-weight:bold;padding:8px;"
  );

  console.log("Interactive portfolio initialized.");
});

/* =========================================
   ENHANCED 3D MOUSE INTERACTION
   Adds subtle cursor-responsive depth
   ========================================= */

(() => {
    const hero = document.querySelector(".hero");
    const visual = document.querySelector(".hero-visual");
    const scene = document.querySelector(".core-scene");
    const cube = document.querySelector(".core-cube");

    if (!hero || !visual || !scene || !cube) return;

    // Avoid duplicate animation loops if this code is initialized again.
    if (visual.dataset.mouse3dReady === "true") return;
    visual.dataset.mouse3dReady = "true";

    // Disable pointer-driven movement when reduced motion is preferred.
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    // Touchscreens don't have a conventional mouse cursor.
    const finePointer = window.matchMedia("(pointer: fine)");

    if (reducedMotion.matches || !finePointer.matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrame = null;

    const maxTilt = 5;

    function handlePointerMove(event) {
        const bounds = visual.getBoundingClientRect();

        if (!bounds.width || !bounds.height) return;

        // Normalize cursor position around the center of the scene.
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;

        targetX = (x - 0.5) * 2;
        targetY = (y - 0.5) * 2;
    }

    function resetPointer() {
        targetX = 0;
        targetY = 0;
    }

    function animateScene() {
        // Ease toward the cursor rather than snapping instantly.
        currentX += (targetX - currentX) * 0.055;
        currentY += (targetY - currentY) * 0.055;

        const rotateY = currentX * maxTilt;
        const rotateX = currentY * -maxTilt;

        // Use a separate CSS variable so existing transforms survive.
        scene.style.setProperty("--mouse-rotate-x", `${rotateX}deg`);
        scene.style.setProperty("--mouse-rotate-y", `${rotateY}deg`);

        // Gentle depth movement on the visual container.
        visual.style.setProperty("--mouse-depth-x", `${currentX * 5}px`);
        visual.style.setProperty("--mouse-depth-y", `${currentY * 5}px`);

        const stillMoving =
            Math.abs(targetX - currentX) > 0.001 ||
            Math.abs(targetY - currentY) > 0.001;

        if (stillMoving) {
            animationFrame = requestAnimationFrame(animateScene);
        } else {
            animationFrame = null;
        }
    }

    function startAnimation() {
        if (animationFrame === null) {
            animationFrame = requestAnimationFrame(animateScene);
        }
    }

    visual.addEventListener("pointermove", (event) => {
        handlePointerMove(event);
        startAnimation();
    });

    visual.addEventListener("pointerleave", () => {
        resetPointer();
        startAnimation();
    });

    // Clean up if the browser tab is hidden.
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        } else if (!document.hidden) {
            startAnimation();
        }
    });
})();

/* =========================================
   VONNIX-STYLE HERO PARTICLE FIELD
   Lightweight canvas animation
   ========================================= */

(() => {
    const hero = document.querySelector(".hero-visual");

    if (!hero || hero.querySelector(".hero-particle-canvas")) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    if (reducedMotion.matches) return;

    const canvas = document.createElement("canvas");
    canvas.className = "hero-particle-canvas";
    canvas.setAttribute("aria-hidden", "true");

    const context = canvas.getContext("2d");
    if (!context) return;

    hero.prepend(canvas);

    let width = 0;
    let height = 0;
    let particles = [];
    let animationId = null;
    let pointerX = -1000;
    let pointerY = -1000;

    const particleCount = Math.min(
        65,
        Math.max(28, Math.floor(window.innerWidth / 22))
    );

    function resizeCanvas() {
        const bounds = hero.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        width = bounds.width;
        height = bounds.height;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.8 + 0.5,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.45 + 0.15
        }));
    }

    function drawParticles() {
        context.clearRect(0, 0, width, height);

        for (const particle of particles) {
            // Gentle movement away from the cursor.
            const dx = particle.x - pointerX;
            const dy = particle.y - pointerY;
            const distance = Math.hypot(dx, dy);

            if (distance < 90 && distance > 0) {
                particle.x += (dx / distance) * 0.35;
                particle.y += (dy / distance) * 0.35;
            }

            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0) particle.x = width;
            if (particle.x > width) particle.x = 0;
            if (particle.y < 0) particle.y = height;
            if (particle.y > height) particle.y = 0;

            context.beginPath();
            context.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI * 2
            );

            context.fillStyle =
                `rgba(102, 189, 255, ${particle.alpha})`;
            context.fill();
        }

        // Draw subtle connecting lines between nearby particles.
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i];
                const b = particles[j];
                const distance = Math.hypot(a.x - b.x, a.y - b.y);

                if (distance < 100) {
                    context.beginPath();
                    context.moveTo(a.x, a.y);
                    context.lineTo(b.x, b.y);

                    context.strokeStyle =
                        `rgba(57, 157, 255, ${(1 - distance / 100) * 0.16})`;
                    context.lineWidth = 0.7;
                    context.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(drawParticles);
    }

    hero.addEventListener("pointermove", (event) => {
        const bounds = canvas.getBoundingClientRect();
        pointerX = event.clientX - bounds.left;
        pointerY = event.clientY - bounds.top;
    });

    hero.addEventListener("pointerleave", () => {
        pointerX = -1000;
        pointerY = -1000;
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden && animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        } else if (!document.hidden && animationId === null) {
            animationId = requestAnimationFrame(drawParticles);
        }
    });

    resizeCanvas();
    drawParticles();

    if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(resizeCanvas);
        observer.observe(hero);
    } else {
        window.addEventListener("resize", resizeCanvas);
    }
})();

document.addEventListener("DOMContentLoaded", () => {
  // Update the copyright year automatically.
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Mobile navigation menu.
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.getElementById("main-navigation");

  if (menuToggle && navigation) {
    const closeMenu = () => {
      navigation.classList.remove("nav-open");
      menuToggle.setAttribute("aria-expanded", "false");
    };

    menuToggle.addEventListener("click", () => {
      const isExpanded =
        menuToggle.getAttribute("aria-expanded") === "true";

      navigation.classList.toggle("nav-open", !isExpanded);
      menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }

  // Highlight the navigation link for the current section.
  const sections = document.querySelectorAll(
    "main section[id]"
  );

  const navLinks = document.querySelectorAll(
    ".nav-links a[href^='#']"
  );

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              const isActive =
                link.getAttribute("href") === `#${entry.target.id}`;

              link.classList.toggle("active", isActive);
            });
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }
});
