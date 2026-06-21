/* ==========================================================================
   PORTFOLIO SCRIPTS & INTERACTIONS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
  initScrollAnimations();
  initDragToScroll();
  initNeuralCanvas();
  initProjectsFilter();
  initProjectModals();
  initMlPredictor();
  initRagChat();
  initGuestbook();
  initJobRecommender();
});

/* ==========================================================================
   THEME TOGGLER
   ========================================================================== */
function initTheme() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  // Check saved theme or system default
  const savedTheme = localStorage.getItem("impeccable-theme");
  const systemPrefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  
  if (savedTheme === "light" || (!savedTheme && systemPrefersLight)) {
    document.documentElement.classList.add("light-theme");
    updateThemeButtonTitle("light");
  } else {
    document.documentElement.classList.remove("light-theme");
    updateThemeButtonTitle("dark");
  }

  toggleBtn.addEventListener("click", () => {
    const isLight = document.documentElement.classList.toggle("light-theme");
    const activeTheme = isLight ? "light" : "dark";
    localStorage.setItem("impeccable-theme", activeTheme);
    updateThemeButtonTitle(activeTheme);
  });
}

function updateThemeButtonTitle(theme) {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;
  if (theme === "light") {
    toggleBtn.setAttribute("title", "Switch to Dark Mode");
    toggleBtn.setAttribute("aria-label", "Switch to Dark Mode");
  } else {
    toggleBtn.setAttribute("title", "Switch to Light Mode");
    toggleBtn.setAttribute("aria-label", "Switch to Light Mode");
  }
}

/* ==========================================================================
   SMOOTH SCROLLING & ACTIVE NAVIGATION HIGH-LIGHT
   ========================================================================== */
function initNavigation() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  // Handle active highlighting on scroll
  window.addEventListener("scroll", () => {
    let currentId = "";
    const scrollPos = window.scrollY + 120; // Matches header offset threshold

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentId = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentId}`) {
        link.classList.add("active");
      }
    });
  });

  // Handle smooth scroll clicks manually to ensure perfect alignment
  const allLinks = document.querySelectorAll(".nav-link, .mobile-nav-link, .hero-actions a, .brand, .avail-btn");
  allLinks.forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const targetSection = document.querySelector(href);
        if (targetSection) {
          const headerHeight = 72; // Height of sticky header
          const targetPos = href === "#hero" ? 0 : targetSection.offsetTop - headerHeight + 10;
          
          window.scrollTo({
            top: targetPos,
            behavior: "smooth"
          });
          
          // Update URL hash
          history.pushState(null, null, href);

          // Close mobile menu if open
          const mobileNav = document.getElementById("mobile-nav");
          if (mobileNav) {
            mobileNav.classList.remove("active");
          }
        }
      }
    });
  });
}

/* ==========================================================================
   SCROLL REVEAL ANIMATIONS (IntersectionObserver)
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   DRAG TO SCROLL (Projects Horizontal Scroll)
   ========================================================================== */
function initDragToScroll() {
  const container = document.querySelector(".projects-scroll-container");
  if (!container) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  container.addEventListener("mousedown", (e) => {
    isDown = true;
    container.classList.add("active-drag");
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener("mouseleave", () => {
    isDown = false;
    container.classList.remove("active-drag");
  });

  container.addEventListener("mouseup", () => {
    isDown = false;
    container.classList.remove("active-drag");
  });

  container.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll-speed factor
    container.scrollLeft = scrollLeft - walk;
  });
}

/* ==========================================================================
   NEURAL NETWORK CANVAS ANIMATION
   ========================================================================== */
function initNeuralCanvas() {
  const canvas = document.getElementById("neural-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = (canvas.width = canvas.parentElement.clientWidth);
  let height = (canvas.height = canvas.parentElement.clientHeight);

  window.addEventListener("resize", () => {
    if (!canvas) return;
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight;
  });

  const numNodes = 48;
  const nodes = [];
  const connectionDist = 120;

  // Mouse coords
  const mouse = { x: null, y: null };
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Create nodes
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2.5 + 1.5
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Get current design colors
    const isLight = document.documentElement.classList.contains("light-theme");
    const dotColor = isLight ? "rgba(8, 145, 178, 0.45)" : "rgba(0, 240, 255, 0.45)";
    const lineColor = isLight ? "rgba(8, 145, 178, 0.12)" : "rgba(0, 240, 255, 0.12)";
    const hoverLineColor = isLight ? "rgba(79, 70, 229, 0.4)" : "rgba(0, 240, 255, 0.45)";

    // Update & draw nodes
    nodes.forEach(node => {
      // Magnetic pull to mouse
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          node.x += (dx / dist) * force * 0.5;
          node.y += (dy / dist) * force * 0.5;
        }
      }

      node.x += node.vx;
      node.y += node.vy;

      // Bounce bounds
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw lines
    for (let i = 0; i < numNodes; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < numNodes; j++) {
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);

        if (dist < connectionDist) {
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = (1 - dist / connectionDist) * 1.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Connect to mouse
      if (mouse.x !== null && mouse.y !== null) {
        const mouseDist = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (mouseDist < connectionDist + 30) {
          ctx.strokeStyle = hoverLineColor;
          ctx.lineWidth = (1.5 - mouseDist / (connectionDist + 30)) * 2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   PROJECTS FILTERING
   ========================================================================== */
function initProjectsFilter() {
  const pills = document.querySelectorAll(".filter-pill");
  const cards = document.querySelectorAll(".project-card");

  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      const filter = pill.getAttribute("data-filter");

      cards.forEach(card => {
        const category = card.getAttribute("data-category");
        if (filter === "all" || category === filter || (filter === "ai" && category === "data")) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

/* ==========================================================================
   PROJECT MODALS
   ========================================================================== */
function initProjectModals() {
  const overlay = document.getElementById("project-modal");
  const closeBtn = document.getElementById("modal-close");
  const detailTriggers = document.querySelectorAll(".project-detail-btn");
  
  if (!overlay || !closeBtn) return;

  function closeModal() {
    overlay.classList.remove("active");
    setTimeout(() => {
      overlay.style.display = "none";
    }, 300);
  }

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  // Handle keys
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      closeModal();
    }
  });

  detailTriggers.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const card = btn.closest(".project-card");
      if (!card) return;

      const name = card.querySelector(".project-name").textContent;
      const desc = card.querySelector(".project-desc").textContent;
      const longDesc = card.getAttribute("data-long-desc") || desc;
      const category = card.getAttribute("data-category");
      const techStack = JSON.parse(card.getAttribute("data-tech-stack") || "[]");
      const demoUrl = card.getAttribute("data-demo-url");
      const githubUrl = card.getAttribute("data-github-url");

      // Populate modal content
      document.getElementById("modal-project-name").textContent = name;
      document.getElementById("modal-project-category").textContent = category;
      document.getElementById("modal-project-long-desc").innerHTML = `<p>${longDesc}</p>`;
      
      const techContainer = document.getElementById("modal-project-tech");
      techContainer.innerHTML = "";
      techStack.forEach(tech => {
        const span = document.createElement("span");
        span.className = "project-tag";
        span.textContent = tech;
        techContainer.appendChild(span);
      });

      const demoLink = document.getElementById("modal-demo-link");
      const githubLink = document.getElementById("modal-github-link");

      if (demoUrl && demoUrl !== "null" && demoUrl !== "") {
        demoLink.setAttribute("href", demoUrl);
        demoLink.style.display = "inline-flex";
      } else {
        demoLink.style.display = "none";
      }

      if (githubUrl && githubUrl !== "null" && githubUrl !== "") {
        githubLink.setAttribute("href", githubUrl);
        githubLink.style.display = "inline-flex";
      } else {
        githubLink.style.display = "none";
      }

      // Show overlay
      overlay.style.display = "flex";
      // Trigger reflow
      overlay.offsetHeight;
      overlay.classList.add("active");
    });
  });
}

/* ==========================================================================
   ML PREDICTOR SIMULATOR (Pose Growth Predictor)
   ========================================================================== */
function initMlPredictor() {
  const form = document.getElementById("ml-predictor-form");
  const submitBtn = document.getElementById("ml-submit");
  const resultBox = document.getElementById("ml-result");
  const fillBar = document.getElementById("ml-fill");
  const confidenceVal = document.getElementById("ml-confidence");
  const predictionText = document.getElementById("ml-prediction-text");

  if (!form || !submitBtn || !resultBox) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("ml-input").value.trim();
    if (!input) return;

    // Loading status
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<svg class=" SunIcon animate-spin h-3.5 w-3.5 mr-2" style="width: 14px; height: 14px; display: inline; animation: spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> Computing...`;
    resultBox.style.display = "none";
    fillBar.style.width = "0";

    // Simulate inference delay
    setTimeout(() => {
      let score = 0;
      let prediction = "";
      const query = input.toLowerCase();

      if (query.includes("child") || query.includes("pose") || query.includes("stand") || query.includes("standing") || query.includes("berdiri")) {
        prediction = "Pose Estimated: Correct Standing posture for toddler screening.";
        score = 94.6;
      } else if (query.includes("face") || query.includes("eye") || query.includes("image") || query.includes("wajah") || query.includes("mata")) {
        prediction = "Model prediction: Face bounding box successfully localized.";
        score = 88.2;
      } else {
        prediction = "Classification: Toddler growth marker detected.";
        score = 75.4;
      }

      // Populate results
      predictionText.textContent = prediction;
      confidenceVal.textContent = `${score.toFixed(1)}% confidence`;
      resultBox.style.display = "block";

      // Reset loading button
      submitBtn.disabled = false;
      submitBtn.textContent = "Run Prediction Analysis";

      // Animate progress bar fill
      setTimeout(() => {
        fillBar.style.width = `${score}%`;
      }, 50);

    }, 1200);
  });
}

// Add CSS animation for spin dynamically to prevent issues
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;
document.head.appendChild(styleSheet);

/* ==========================================================================
   RAG ASSISTANT EXPERIMENTS (Exhibit 01)
   ========================================================================== */
function initRagChat() {
  const form = document.getElementById("rag-form");
  const input = document.getElementById("rag-input");
  const chatFeed = document.getElementById("rag-chat-feed");
  const submitBtn = document.getElementById("rag-submit");

  if (!form || !input || !chatFeed || !submitBtn) return;

  function appendBubble(role, content) {
    const row = document.createElement("div");
    row.className = `chat-bubble-row ${role === "user" ? "user-row" : ""}`;

    if (role === "assistant") {
      const avatar = document.createElement("div");
      avatar.className = "chat-avatar";
      avatar.textContent = "知";
      row.appendChild(avatar);
    }

    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${role === "user" ? "user-bubble" : "assistant-bubble"}`;
    bubble.innerHTML = `<p>${content}</p>`;
    row.appendChild(bubble);

    chatFeed.appendChild(row);
    chatFeed.scrollTop = chatFeed.scrollHeight;
    return bubble;
  }

  // Handle Suggested Questions
  document.querySelectorAll(".suggested-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      sendMessage(btn.textContent.trim());
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    sendMessage(message);
  });

  async function sendMessage(message) {
    input.value = "";
    appendBubble("user", message);

    // Create loader block
    const loaderRow = document.createElement("div");
    loaderRow.className = "chat-bubble-row";
    loaderRow.id = "rag-loader-bubble";

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = "知";
    loaderRow.appendChild(avatar);

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble assistant-bubble";
    bubble.innerHTML = `<p style="display:flex; align-items:center; gap:8px;"><span class="status-indicator"></span> Searching knowledge base...</p>`;
    loaderRow.appendChild(bubble);
    chatFeed.appendChild(loaderRow);
    chatFeed.scrollTop = chatFeed.scrollHeight;

    submitBtn.disabled = true;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      // Remove loader
      loaderRow.remove();

      if (!res.ok) {
        throw new Error("RAG retrieval failed");
      }

      const text = await res.text();
      
      // Stream output type writer style
      const botBubble = appendBubble("assistant", "");
      let idx = 0;
      
      const interval = setInterval(() => {
        botBubble.innerHTML = `<p>${text.substring(0, idx + 1)}<span style="color:var(--jade); animation:pulse-glow 0.8s infinite;">▊</span></p>`;
        chatFeed.scrollTop = chatFeed.scrollHeight;
        idx++;
        if (idx >= text.length) {
          clearInterval(interval);
          botBubble.innerHTML = `<p>${text}</p>`;
        }
      }, 10);

    } catch (err) {
      loaderRow.remove();
      appendBubble("assistant", "Failed to connect to the RAG pipeline. Please check if Pinecone & Gemini API keys are configured in environment variables.");
    } finally {
      submitBtn.disabled = false;
    }
  }
}

/* ==========================================================================
   GUESTBOOK / MESSAGES SYSTEM
   ========================================================================== */
function initGuestbook() {
  const form = document.getElementById("guestbook-form");
  const listContainer = document.getElementById("guestbook-list");
  const charCounter = document.getElementById("g-char-counter");
  const msgInput = document.getElementById("g-message-input");

  if (!form || !listContainer) return;

  // Character counter
  if (msgInput && charCounter) {
    msgInput.addEventListener("input", () => {
      const len = msgInput.value.length;
      charCounter.textContent = `${len}/500`;
      if (len > 450) {
        charCounter.style.color = "var(--maple)";
      } else {
        charCounter.style.color = "var(--text-muted)";
      }
    });
  }

  // Handle Form Submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("g-name-input").value.trim();
    const message = msgInput.value.trim();
    const honeypot = document.getElementById("g-hp-input").value;
    const submitBtn = form.querySelector(".g-submit");
    const errorBlock = document.getElementById("g-error-msg");

    if (errorBlock) errorBlock.textContent = "";

    // Honeypot spam check
    if (honeypot) {
      console.warn("Spam detected!");
      return;
    }

    if (name.length < 2) {
      showToast("Name must be at least 2 characters.", true);
      return;
    }
    if (message.length < 5) {
      showToast("Message must be at least 5 characters.", true);
      return;
    }

    // Submit state
    submitBtn.disabled = true;
    submitBtn.textContent = "Transmitting...";

    // Optimistic UI update: render message in memory first
    const cleanName = name;
    const cleanMsg = message;
    const optimisticId = `opt-${Date.now()}`;
    const dateStr = "Today";

    const optMsgElement = createMessageElement({
      id: optimisticId,
      sender_name: cleanName,
      message: cleanMsg,
      created_at: new Date().toISOString()
    }, true);

    // Append date divider if needed
    let todayDivider = document.getElementById("divider-today");
    if (!todayDivider) {
      todayDivider = document.createElement("div");
      todayDivider.className = "date-divider";
      todayDivider.id = "divider-today";
      todayDivider.innerHTML = `<div class="line"></div><span>Today (Sending)</span><div class="line"></div>`;
      listContainer.prepend(todayDivider);
    }
    
    // Insert optimistic message right under the divider
    todayDivider.after(optMsgElement);
    listContainer.scrollTop = 0;

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_name: cleanName, message: cleanMsg })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to transmit message");
      }

      // Success: replace optimistic message with real details
      const realMsgElement = createMessageElement({
        id: data.id,
        sender_name: cleanName,
        message: cleanMsg,
        created_at: new Date().toISOString()
      }, false);

      optMsgElement.replaceWith(realMsgElement);
      showToast("Message successfully transmitted!", false);

      // Reset form
      document.getElementById("g-name-input").value = "";
      msgInput.value = "";
      if (charCounter) charCounter.textContent = "0/500";

    } catch (err) {
      // Remove optimistic element & divider if empty
      optMsgElement.remove();
      const checkDivider = document.getElementById("divider-today");
      if (checkDivider) {
        const next = checkDivider.nextElementSibling;
        if (!next || !next.getAttribute("data-msg-id") || !next.getAttribute("data-msg-id").startsWith("opt-")) {
          checkDivider.remove();
        }
      }

      if (errorBlock) errorBlock.textContent = err.message;
      showToast(err.message, true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Transmit Message";
    }
  });
}

// Helper to create message element
function createMessageElement(msg, isOptimistic) {
  const item = document.createElement("div");
  item.className = "g-message";
  if (isOptimistic) item.style.opacity = "0.5";
  item.setAttribute("data-msg-id", msg.id);

  const colors = ["jade", "indigo", "gold"];
  let hash = 0;
  for (let i = 0; i < msg.sender_name.length; i++) {
    hash = msg.sender_name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % 3];

  const initials = msg.sender_name.charAt(0).toUpperCase();
  const time = new Date(msg.created_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  item.innerHTML = `
    <div class="g-avatar c-${color}">${initials}</div>
    <div class="g-msg-body">
      <div class="g-msg-info">
        <span class="g-sender">${msg.sender_name}</span>
        <span class="g-time">${isOptimistic ? "sending..." : time}</span>
      </div>
      <div class="g-text">${msg.message}</div>
    </div>
  `;
  return item;
}

// Toast notification helper
function showToast(message, isError) {
  let toast = document.getElementById("custom-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "custom-toast";
    toast.className = "custom-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `custom-toast ${isError ? "error" : ""} show`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

/* ==========================================================================
   AI JOB RECOMMENDER SIMULATOR (Exhibit 03)
   ========================================================================== */
function initJobRecommender() {
  const statusBadge = document.getElementById("recommender-api-status");
  const tabBtnFile = document.getElementById("tab-btn-file");
  const tabBtnText = document.getElementById("tab-btn-text");
  const panelFile = document.getElementById("tab-panel-file");
  const panelText = document.getElementById("tab-panel-text");
  const slider = document.getElementById("recommender-top-k");
  const topKDisplay = document.getElementById("top-k-display");

  const dragArea = document.getElementById("recommender-drag-area");
  const fileInput = document.getElementById("recommender-file-input");
  const promptContent = document.getElementById("drag-drop-prompt");
  const fileInfo = document.getElementById("selected-file-info");
  const filenameEl = document.getElementById("selected-filename");
  const filesizeEl = document.getElementById("selected-filesize");
  const removeBtn = document.getElementById("remove-file-btn");
  const submitFileBtn = document.getElementById("btn-submit-file");

  const submitTextBtn = document.getElementById("btn-submit-text");
  const textInput = document.getElementById("recommender-text-input");
  const retryBtn = document.getElementById("recommender-retry-btn");

  if (!statusBadge) return;

  // 1. Check API Health on load
  checkApiHealth();

  async function checkApiHealth() {
    try {
      const res = await fetch("https://irhamnajibazimulqowi-ai-job-recommender-api.hf.space/health");
      if (res.ok) {
        const data = await res.json();
        statusBadge.textContent = `Online: ${data.jobs_database_size.toLocaleString()} Active Jobs`;
        statusBadge.className = "ml-card-status"; // removes 'soon' which makes it gold
        statusBadge.style.borderColor = "var(--jade-glow)";
        statusBadge.style.color = "var(--jade)";
        statusBadge.style.background = "var(--jade-dim)";
      } else {
        throw new Error();
      }
    } catch (e) {
      statusBadge.textContent = "Offline / Sleeping";
      statusBadge.className = "ml-card-status soon";
      statusBadge.style.borderColor = "var(--gold-glow)";
      statusBadge.style.color = "var(--gold)";
      statusBadge.style.background = "var(--gold-dim)";
    }
  }

  // 2. Tab Navigation
  if (tabBtnFile && tabBtnText && panelFile && panelText) {
    tabBtnFile.addEventListener("click", () => {
      tabBtnFile.classList.add("active");
      tabBtnFile.setAttribute("aria-selected", "true");
      tabBtnText.classList.remove("active");
      tabBtnText.setAttribute("aria-selected", "false");
      panelFile.style.display = "block";
      panelText.style.display = "none";
    });

    tabBtnText.addEventListener("click", () => {
      tabBtnText.classList.add("active");
      tabBtnText.setAttribute("aria-selected", "true");
      tabBtnFile.classList.remove("active");
      tabBtnFile.setAttribute("aria-selected", "false");
      panelText.style.display = "block";
      panelFile.style.display = "none";
    });
  }

  // 3. Recommendation Slider
  if (slider && topKDisplay) {
    slider.addEventListener("input", (e) => {
      topKDisplay.textContent = `${e.target.value} Matches`;
    });
  }

  // 4. Drag & Drop File Handling
  let selectedFile = null;

  if (dragArea && fileInput && promptContent && fileInfo && filenameEl && filesizeEl && removeBtn && submitFileBtn) {
    dragArea.addEventListener("click", () => {
      fileInput.click();
    });

    dragArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      dragArea.classList.add("drag-over");
    });

    ["dragleave", "dragend"].forEach(type => {
      dragArea.addEventListener(type, () => {
        dragArea.classList.remove("drag-over");
      });
    });

    dragArea.addEventListener("drop", (e) => {
      e.preventDefault();
      dragArea.classList.remove("drag-over");
      if (e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });

    function handleFileSelection(file) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext !== "pdf" && ext !== "docx") {
        showToast("File format must be PDF or DOCX.", true);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("File size exceeds 5MB limit.", true);
        return;
      }
      selectedFile = file;
      filenameEl.textContent = file.name;
      filesizeEl.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      
      promptContent.style.display = "none";
      fileInfo.style.display = "flex";
      submitFileBtn.disabled = false;
    }

    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      resetFileSelection();
    });

    function resetFileSelection() {
      selectedFile = null;
      fileInput.value = "";
      promptContent.style.display = "flex";
      // Restore SVG and text
      promptContent.innerHTML = `
        <div class="upload-icon" style="margin-bottom: 12px; opacity: 0.85; color: var(--text-muted);">
          <svg class="icon-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        </div>
        <p class="drag-drop-text" style="font-size: 13px; margin-bottom: 6px; font-weight: 500;">
          Drag & drop your CV file (PDF/DOCX) here
        </p>
        <p style="font-size: 11px; color: var(--text-muted);">
          or click to browse from your device (Max 5MB)
        </p>
      `;
      fileInfo.style.display = "none";
      submitFileBtn.disabled = true;
    }
  }

  // 5. Loader Overlay
  let progressInterval = null;

  function startLoading() {
    const loader = document.getElementById("recommender-loader");
    const loaderText = document.getElementById("recommender-loader-text");
    const progressBar = document.getElementById("recommender-loader-progress");
    const errorBlock = document.getElementById("recommender-error");
    const resultsBlock = document.getElementById("recommender-results");

    errorBlock.style.display = "none";
    resultsBlock.style.display = "none";
    loader.style.display = "flex";
    progressBar.style.width = "0%";

    const statuses = [
      "Analyzing CV file...",
      "Extracting skills & competencies...",
      "Analyzing experience history...",
      "Matching profile with 5,000 jobs...",
      "Calculating semantic match score...",
      "Formulating learning suggestions roadmap..."
    ];
    
    let progress = 0;
    let statusIdx = 0;
    loaderText.textContent = statuses[0];

    progressInterval = setInterval(() => {
      progress += (100 - progress) * 0.06;
      progressBar.style.width = `${progress}%`;
      
      if (Math.round(progress) % 15 === 0 && statusIdx < statuses.length - 1) {
        statusIdx = Math.min(statusIdx + 1, statuses.length - 1);
        loaderText.textContent = statuses[statusIdx];
      }
    }, 200);
  }

  function stopLoading(success) {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    const loader = document.getElementById("recommender-loader");
    const progressBar = document.getElementById("recommender-loader-progress");
    if (success) {
      progressBar.style.width = "100%";
      setTimeout(() => {
        loader.style.display = "none";
      }, 300);
    } else {
      loader.style.display = "none";
    }
  }

  // 6. Submissions
  if (submitFileBtn) {
    submitFileBtn.addEventListener("click", async () => {
      if (!selectedFile) return;
      const topK = slider.value;
      startLoading();

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("top_k", topK);

      try {
        const res = await fetch("https://irhamnajibazimulqowi-ai-job-recommender-api.hf.space/recommend/file", {
          method: "POST",
          body: formData
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to retrieve recommendations from the file.");
        }
        const data = await res.json();
        stopLoading(true);
        renderRecommendations(data.recommendations);
      } catch (err) {
        stopLoading(false);
        showError(err.message);
      }
    });
  }

  if (submitTextBtn) {
    submitTextBtn.addEventListener("click", async () => {
      const textVal = textInput.value.trim();
      if (!textVal) {
        showToast("Please paste your CV text or profile description.", true);
        return;
      }
      const topK = slider.value;
      startLoading();

      try {
        const res = await fetch("https://irhamnajibazimulqowi-ai-job-recommender-api.hf.space/recommend/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textVal, top_k: parseInt(topK) })
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to retrieve recommendations from the text.");
        }
        const data = await res.json();
        stopLoading(true);
        renderRecommendations(data.recommendations);
      } catch (err) {
        stopLoading(false);
        showError(err.message);
      }
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      document.getElementById("recommender-error").style.display = "none";
    });
  }

  function showError(msg) {
    const errorBlock = document.getElementById("recommender-error");
    const errorText = document.getElementById("recommender-error-text");
    errorText.textContent = msg || "Connection to the recommender server failed. Please try again later.";
    errorBlock.style.display = "block";
    document.getElementById("recommender-results").style.display = "none";
  }

  // 7. Results Rendering
  function renderRecommendations(jobs) {
    const container = document.getElementById("recommender-jobs-container");
    const countEl = document.getElementById("recommender-results-count");
    const resultsBlock = document.getElementById("recommender-results");
    
    container.innerHTML = "";
    countEl.textContent = `${jobs.length} Matches Found`;
    
    if (jobs.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 32px; color: var(--text-secondary);">
          <div style="color: var(--text-muted); margin-bottom: 8px;">
            <svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <p style="margin-top: 8px;">No suitable matches found. Try updating or adding more details to your CV.</p>
        </div>
      `;
      resultsBlock.style.display = "block";
      return;
    }

    jobs.forEach((job, idx) => {
      const score = Math.round(job.match_score);
      
      let colorClass = "score-green";
      let strokeColor = "var(--jade)";
      if (score < 50) {
        colorClass = "score-maple";
        strokeColor = "var(--maple)";
      } else if (score < 75) {
        colorClass = "score-gold";
        strokeColor = "var(--gold)";
      }

      const strokeDash = `${score}, 100`;
      const salaryText = formatSalary(job.min_salary, job.max_salary);

      const semanticPct = Math.round(job.breakdown.text_similarity);
      const skillsPct = Math.round(job.breakdown.skills_match);
      const expPct = Math.round(job.breakdown.experience_match);
      const eduPct = Math.round(job.breakdown.education_match);

      const matchedBadges = (job.explanation.matched_skills || [])
        .map(skill => `<span class="skill-badge matched">${skill}</span>`)
        .join("");
      
      const missingBadges = (job.explanation.missing_skills || [])
        .map(skill => `<span class="skill-badge missing">${skill}</span>`)
        .join("");

      let roadmapItems = "";
      if (job.explanation.roadmap && job.explanation.roadmap.length > 0) {
        roadmapItems = job.explanation.roadmap
          .map(item => `<li><strong>${item.skill}</strong>: ${item.suggestion}</li>`)
          .join("");
      }

      const card = document.createElement("div");
      card.className = "recommender-job-card";
      card.style.animationDelay = `${idx * 0.1}s`;
      
      const detailsGridClass = roadmapItems ? "job-card-details-grid" : "job-card-details-grid no-roadmap";

      card.innerHTML = `
        <div class="job-card-header">
          <div class="job-card-info">
            <h4 class="job-card-title">${job.job_title}</h4>
            <p class="job-card-company">${job.company_name}</p>
            
            <!-- Metadata Pills Row -->
            <div class="job-meta-row" style="margin-top: 10px;">
              <div class="job-meta-item" title="Location">
                <svg class="icon-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--cyan);"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>${job.location || "Remote / Unspecified"}</span>
              </div>
              <div class="job-meta-item" title="Estimated Salary">
                <svg class="icon-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--jade);"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                <span>${salaryText}</span>
              </div>
              <div class="job-meta-item" title="Experience Level">
                <svg class="icon-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--indigo);"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                <span>${job.experience_level || "All Levels"}</span>
              </div>
            </div>
          </div>
          
          <!-- Match Score Circle -->
          <div class="radial-progress" title="Match Score: ${score}%">
            <svg width="52" height="52" viewBox="0 0 36 36">
              <path class="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke-width="2.8" />
              <path class="circle"
                stroke-dasharray="${strokeDash}"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="${strokeColor}" stroke-width="2.8" stroke-linecap="round" />
            </svg>
            <div class="percentage ${colorClass}">${score}%</div>
          </div>
        </div>

        ${job.explanation.reason ? `<blockquote class="job-explanation">"${job.explanation.reason}"</blockquote>` : ""}

        <!-- Breakdown Grid -->
        <div class="breakdown-grid">
          <div class="breakdown-item">
            <span class="breakdown-label">Semantic</span>
            <span class="breakdown-val ${getScoreColorClass(semanticPct)}">${semanticPct}%</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Skills</span>
            <span class="breakdown-val ${getScoreColorClass(skillsPct)}">${skillsPct}%</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Experience</span>
            <span class="breakdown-val ${getScoreColorClass(expPct)}">${expPct}%</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Education</span>
            <span class="breakdown-val ${getScoreColorClass(eduPct)}">${eduPct}%</span>
          </div>
        </div>

        <!-- Skills & Roadmap Details Split Grid -->
        <div class="${detailsGridClass}">
          <!-- Match Analysis Column -->
          <div class="job-card-analysis-col" style="display: flex; flex-direction: column; gap: 12px;">
            ${matchedBadges ? `
              <div class="skills-badge-row">
                <span class="breakdown-label" style="display:block; margin-bottom:6px;">Matched Skills</span>
                <div class="skills-badge-list">${matchedBadges}</div>
              </div>
            ` : ""}
            ${missingBadges ? `
              <div class="skills-badge-row">
                <span class="breakdown-label" style="display:block; margin-bottom:6px;">Missing Skills</span>
                <div class="skills-badge-list">${missingBadges}</div>
              </div>
            ` : ""}
          </div>
          
          <!-- Roadmap Column -->
          ${roadmapItems ? `
            <div class="job-card-roadmap-col">
              <div class="roadmap-container">
                <h5 class="roadmap-title" style="display: flex; align-items: center; gap: 6px;">
                  <svg class="icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gold);"><path d="M9 18h6m-5 4h4m1-12a5 5 0 1 0-8 0c0 1.3.4 2.5 1.1 3.5L10 17h4l1.9-3.5C16.6 12.5 17 11.3 17 10z"></path></svg>
                  Learning Roadmap
                </h5>
                <ul class="roadmap-list">
                  ${roadmapItems}
                </ul>
              </div>
            </div>
          ` : ""}
        </div>
      `;
      container.appendChild(card);
    });

    resultsBlock.style.display = "block";
    
    setTimeout(() => {
      resultsBlock.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }

  function getScoreColorClass(s) {
    if (s >= 75) return "score-green";
    if (s >= 50) return "score-gold";
    return "score-maple";
  }

  function formatSalary(min, max) {
    if (min === null || max === null) return "Negotiable";
    const formatNum = (num) => {
      if (num >= 1000000) return "Rp " + (num / 1000000).toFixed(1).replace(".0", "") + "M";
      if (num >= 1000) return "Rp " + (num / 1000).toFixed(0) + "K";
      return "Rp " + num;
    };
    return `${formatNum(min)} - ${formatNum(max)}`;
  }
}


