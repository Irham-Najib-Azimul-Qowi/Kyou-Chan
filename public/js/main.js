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
    const scrollPos = window.scrollY + 160;

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

  // Handle smooth scroll clicks manually if needed (already handled by CSS scroll-behavior)
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

  const numNodes = 36;
  const nodes = [];
  const connectionDist = 100;

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
      radius: Math.random() * 2 + 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Get current design colors
    const isLight = document.documentElement.classList.contains("light-theme");
    const dotColor = isLight ? "rgba(8, 145, 178, 0.3)" : "rgba(0, 240, 255, 0.25)";
    const lineColor = isLight ? "rgba(8, 145, 178, 0.06)" : "rgba(0, 240, 255, 0.06)";
    const hoverLineColor = isLight ? "rgba(79, 70, 229, 0.12)" : "rgba(99, 102, 241, 0.15)";

    // Update & draw nodes
    nodes.forEach(node => {
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
          ctx.lineWidth = 1 - dist / connectionDist;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Connect to mouse
      if (mouse.x !== null && mouse.y !== null) {
        const mouseDist = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (mouseDist < connectionDist + 20) {
          ctx.strokeStyle = hoverLineColor;
          ctx.lineWidth = (1.2 - mouseDist / (connectionDist + 20)) * 1.5;
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
