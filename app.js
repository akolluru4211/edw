// EdWorld Co - Application Core Logic Engine

(function () {
  'use strict';

  // Inlined Database Seed Data
  const EDCO_MOCK_DATA = {
    users: [
      {
        id: "user_alice",
        name: "Alice Chen",
        headline: "Python Developer & Mentor",
        location: "San Francisco, CA",
        bio: "Full-stack developer focused on Python backend engineering and API design. Love teaching beginners and collaborating on open-source projects.",
        skills: ["Python", "Django", "PostgreSQL", "React", "Docker"],
        oauth_providers: ["google", "github"],
        email_verified: true,
        provider_ids: { google: "11029381...", github: "alicechen" },
        followers_count: 142,
        following_count: 98,
        points: 2450,
        badges: ["course_completer", "python_master", "streaker", "mentor"],
        role: "mentor",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
      },
      {
        id: "user_bob",
        name: "Bob Johnson",
        headline: "React Enthusiast & Student",
        location: "New York, NY",
        bio: "Learning front-end web development. Currently mastering JavaScript and CSS. Looking to connect with Python mentors to understand backends.",
        skills: ["React", "HTML5", "CSS3", "JavaScript"],
        oauth_providers: ["google"],
        email_verified: true,
        provider_ids: { google: "11038291..." },
        followers_count: 42,
        following_count: 56,
        points: 980,
        badges: ["course_completer", "first_project"],
        role: "student",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      },
      {
        id: "user_carol",
        name: "Carol Lee",
        headline: "UI/UX Designer & Frontend Engineer",
        location: "London, UK",
        bio: "Fascinated by layout algorithms, CSS Grid, custom HSL styling, and fluid motion design. Creating accessible and beautiful user experiences.",
        skills: ["CSS3", "Figma", "HTML5", "JavaScript", "React"],
        oauth_providers: ["github"],
        email_verified: true,
        provider_ids: { github: "caroldesigner" },
        followers_count: 256,
        following_count: 180,
        points: 1920,
        badges: ["course_completer", "streaker", "first_project"],
        role: "student",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
      },
      {
        id: "user_diana",
        name: "Diana Prince",
        headline: "Senior Cloud Infrastructure Architect",
        location: "Austin, TX",
        bio: "Over 10 years of experience managing AWS/GCP pipelines. Teaching Python scripting for server operations and infrastructure deployment.",
        skills: ["Python", "AWS", "Docker", "Kubernetes", "Linux"],
        oauth_providers: ["linkedin"],
        email_verified: true,
        provider_ids: { linkedin: "diana-prince-cloud" },
        followers_count: 512,
        following_count: 124,
        points: 3820,
        badges: ["lifelong_learner", "mentor", "connector"],
        role: "instructor",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
      }
    ],

    courses: [
      {
        id: "course_python",
        title: "Python Fundamentals",
        instructor_id: "user_alice",
        instructor_name: "Alice Chen",
        description: "Master Python programming from the ground up: variables, control structures, conditional statements, lists, and functions.",
        category: "programming",
        level: "beginner",
        enrolled_count: 1230,
        avg_rating: 4.7,
        thumbnail: "🐍",
        modules: [
          {
            id: "module_py_intro",
            title: "Module 1: Introduction to Python",
            sequence: 1,
            lessons: [
              {
                id: "lesson_py_intro_1",
                title: "What is Python?",
                sequence: 1,
                duration_minutes: 15,
                video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
                content: `<h3>Welcome to Python Fundamentals!</h3>
                <p>Python is a high-level, general-purpose, dynamic programming language designed with an emphasis on code readability. It uses significant indentation rather than braces or semi-colons.</p>
                <p>Common use cases include web backend development, data analysis, machine learning algorithms, scripting utilities, and cloud management pipelines.</p>
                <p>Let's download the cheatsheet and complete the quiz to move forward.</p>`,
                resources: [
                  { title: "Python Installation Guide.pdf", type: "pdf", url: "#" },
                  { title: "Hello World Cheatsheet.txt", type: "code", url: "#" }
                ],
                quiz: {
                  id: "quiz_py_intro_1",
                  question: "Who created the Python programming language in the late 1980s?",
                  options: [
                    "Guido van Rossum",
                    "Dennis Ritchie",
                    "Bjarne Stroustrup",
                    "James Gosling"
                  ],
                  correctIndex: 0
                }
              },
              {
                id: "lesson_py_intro_2",
                title: "Variables & Types",
                sequence: 2,
                duration_minutes: 20,
                video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
                content: `<h3>Understanding Variables and Basic Types</h3>
                <p>In Python, variables are created automatically when you assign a value to them. Variables don't need to be declared with any particular type, and can even change type after they have been set.</p>
                <p>Basic Types:</p>
                <ul>
                  <li><strong>int:</strong> Integer numbers (e.g. x = 5)</li>
                  <li><strong>float:</strong> Floating-point decimal numbers (e.g. pi = 3.14)</li>
                  <li><strong>str:</strong> String text sequence enclosed in quotes (e.g. name = "EdWorld")</li>
                  <li><strong>bool:</strong> Boolean True or False states (e.g. is_active = True)</li>
                </ul>`,
                resources: [
                  { title: "variables_practice.py", type: "code", url: "#" }
                ],
                quiz: {
                  id: "quiz_py_intro_2",
                  question: "Which of the following is an invalid variable declaration in Python?",
                  options: [
                    "my_var = 10",
                    "1_my_var = 20",
                    "_my_var = 30",
                    "MYVAR = 40"
                  ],
                  correctIndex: 1
                }
              }
            ]
          },
          {
            id: "module_py_control",
            title: "Module 2: Control Flow",
            sequence: 2,
            lessons: [
              {
                id: "lesson_py_control_1",
                title: "If Statements & Conditionals",
                sequence: 1,
                duration_minutes: 18,
                video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
                content: `<h3>Making Decisions with Conditionals</h3>
                <p>Python uses standard mathematical logic checks to run blocks of code only if a condition is met. The syntax uses the keywords <code>if</code>, <code>elif</code>, and <code>else</code>.</p>
                <p>Crucial: Indentation determines scope in Python. A block starts with a colon (:) and must be indented consistently (standard is 4 spaces).</p>`,
                resources: [
                  { title: "conditionals_sandbox.py", type: "code", url: "#" }
                ],
                quiz: {
                  id: "quiz_py_control_1",
                  question: "Which keyword is Python's abbreviation for 'else if'?",
                  options: [
                    "else if",
                    "elseif",
                    "elif",
                    "elsif"
                  ],
                  correctIndex: 2
                }
              }
            ]
          }
        ]
      },
      {
        id: "course_web",
        title: "Web Development Bootcamp",
        instructor_id: "user_bob",
        instructor_name: "Bob Johnson",
        description: "Learn HTML5, CSS3, and JavaScript ES6+ to build beautiful responsive websites and interact with DOM nodes.",
        category: "web",
        level: "beginner",
        enrolled_count: 3450,
        avg_rating: 4.9,
        thumbnail: "🌐",
        modules: [
          {
            id: "module_web_html",
            title: "Module 1: Semantic HTML5",
            sequence: 1,
            lessons: [
              {
                id: "lesson_web_html_1",
                title: "Semantic markup elements",
                sequence: 1,
                duration_minutes: 15,
                video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
                content: `<h3>Semantic HTML Elements</h3>
                <p>Semantic elements clearly describe their meaning in a human- and machine-readable way.</p>
                <p>Examples of non-semantic elements: <code>&lt;div&gt;</code> and <code>&lt;span&gt;</code> - Tells us nothing about its content.</p>
                <p>Examples of semantic elements: <code>&lt;form&gt;</code>, <code>&lt;table&gt;</code>, <code>&lt;article&gt;</code>, <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;section&gt;</code> - Clearly defines its content.</p>`,
                resources: [
                  { title: "HTML5 Cheat Sheet.pdf", type: "pdf", url: "#" }
                ],
                quiz: {
                  id: "quiz_web_html_1",
                  question: "Which of the following is a semantic HTML5 tag representing a self-contained article composition?",
                  options: [
                    "<div>",
                    "<section>",
                    "<article>",
                    "<span>"
                  ],
                  correctIndex: 2
                }
              }
            ]
          }
        ]
      },
      {
        id: "course_css",
        title: "Advanced Responsive CSS",
        instructor_id: "user_carol",
        instructor_name: "Carol Lee",
        description: "Master CSS Flexbox, Grid, Subgrids, HSL variable palettes, blur filters, and high-fidelity glassmorphism.",
        category: "design",
        level: "advanced",
        enrolled_count: 850,
        avg_rating: 4.8,
        thumbnail: "🎨",
        modules: [
          {
            id: "module_css_grid",
            title: "Module 1: CSS Grid & Flexbox",
            sequence: 1,
            lessons: [
              {
                id: "lesson_css_grid_1",
                title: "Glassmorphic Panels & Backdrop Filters",
                sequence: 1,
                duration_minutes: 22,
                video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
                content: `<h3>Styling with Modern Glassmorphism</h3>
                <p>Glassmorphism involves creating panels that mimic frosted glass. This relies on semi-transparent backgrounds, borders, and a backdrop blur filter.</p>
                <pre><code>.glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }</code></pre>`,
                resources: [
                  { title: "glassmorphism_templates.css", type: "code", url: "#" }
                ],
                quiz: {
                  id: "quiz_css_grid_1",
                  question: "Which CSS property is responsible for applying the frosted blur filter to elements behind the target?",
                  options: [
                    "filter: blur()",
                    "backdrop-filter: blur()",
                    "background-filter: blur()",
                    "opacity: blur()"
                  ],
                  correctIndex: 1
                }
              }
            ]
          }
        ]
      }
    ],

    projects: [
      {
        id: "project_1",
        title: "E-Commerce Stripe Storefront",
        description: "Full-stack client storefront with real-time checkout updates, credit card flow simulation, and a dashboard analytics portal.",
        creator_id: "user_alice",
        creator_name: "Alice Chen",
        creator_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        thumbnail: "🛍️",
        github_url: "https://github.com/alice/ecommerce-stripe",
        live_url: "https://stripe-shop-demo.com",
        technologies: ["React", "Node.js", "Express", "Stripe API"],
        features: ["Product search", "Persistent shopping cart", "Mock Stripe checkout validation", "Analytics charts"],
        views_count: 1240,
        likes_count: 85,
        liked_by: ["user_bob"],
        created_at: "2026-06-01T12:00:00Z",
        comments: [
          {
            id: "comment_p1_1",
            author_id: "user_bob",
            author_name: "Bob Johnson",
            author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            content: "Wow, the visual charts inside the admin dashboard look incredibly polished. What library did you use?",
            created_at: "2026-06-05T09:30:00Z"
          },
          {
            id: "comment_p1_2",
            author_id: "user_alice",
            author_name: "Alice Chen",
            author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            content: "Thanks Bob! I ended up using ChartJS with some custom gradient fills to match the dark theme.",
            created_at: "2026-06-05T14:20:00Z"
          }
        ]
      },
      {
        id: "project_2",
        title: "CSS Layout Playground",
        description: "Interactive visual environment for tweaking flexbox attributes, grid dimensions, gap rules, and HSL transparency.",
        creator_id: "user_carol",
        creator_name: "Carol Lee",
        creator_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        thumbnail: "🎨",
        github_url: "https://github.com/carol/css-playground",
        live_url: "https://css-play-world.com",
        technologies: ["JavaScript", "HTML5", "CSS Grid", "Flexbox"],
        features: ["Draggable grids", "Code generator export", "Live DOM node inspector"],
        views_count: 840,
        likes_count: 42,
        liked_by: [],
        created_at: "2026-06-08T15:00:00Z",
        comments: [
          {
            id: "comment_p2_1",
            author_id: "user_alice",
            author_name: "Alice Chen",
            author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            content: "This is a super helpful learning resource! Sharing this with my Python beginners.",
            created_at: "2026-06-09T10:00:00Z"
          }
        ]
      }
    ],

    badges: {
      course_completer: { name: "Course Completer", desc: "Successfully completed your first course lesson.", icon: "🎓" },
      python_master: { name: "Python Master", desc: "Score 80%+ on all Python fundamental quizzes.", icon: "🐍" },
      streaker: { name: "Streak Tracker", desc: "Maintain a 7-day learning streak on EdWorld Co.", icon: "🔥" },
      mentor: { name: "Python Mentor", desc: "Accepted and completed your first mentorship request.", icon: "🤝" },
      connector: { name: "Super Connector", desc: "Grow active network to 5+ active connections.", icon: "🕸️" },
      first_project: { name: "First Project", desc: "Publish your first portfolio project to the showcase.", icon: "🚀" },
      lifelong_learner: { name: "Lifelong Learner", desc: "Earned more than 300 points across the platform.", icon: "🧠" }
    }
  };

  // ==========================================
  // 1. FIREBASE CONFIGURATION & INITIALIZATION
  // ==========================================
  const firebaseConfig = {
    apiKey: "AIzaSyC5MncM9ZFvQTHG-yYLwBmFfipB2hf3B7o",
    authDomain: "edworld-career-os-2026.firebaseapp.com",
    projectId: "edworld-career-os-2026",
    storageBucket: "edworld-career-os-2026.firebasestorage.app",
    messagingSenderId: "850137062639",
    appId: "1:850137062639:web:a23718e64df90a4e944f1a",
    measurementId: "G-SPRLZN94C2"
  };

  // Initialize Firebase App
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();
  const auth = firebase.auth();

  // ==========================================
  // 1c. OPENROUTER API INTEGRATION & DYNAMIC AI SETTINGS
  // ==========================================
  
  // Retrieve config from localStorage (defaults to free model)
  function getOpenRouterConfig() {
    return {
      apiKey: localStorage.getItem('openrouter_api_key') || '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',
      model: localStorage.getItem('openrouter_model') || 'meta-llama/llama-3-8b-instruct:free'
    };
  }

  function saveOpenRouterConfig(key, model) {
    if (key !== undefined) localStorage.setItem('openrouter_api_key', key.trim());
    if (model !== undefined) localStorage.setItem('openrouter_model', model.trim());
    console.log('[OpenRouter] Configuration saved.');
  }

  // Helper to open the AI Settings popup/modal
  window.__edcoShowAiSettingsModal = function() {
    const config = getOpenRouterConfig();
    const modalHtml = `
      <h3 style="font-size: 20px; margin-bottom: 8px; border-bottom: 1px solid var(--border-card); padding-bottom: 8px;"><i class="fas fa-robot" style="color: var(--primary);"></i> OpenRouter Settings</h3>
      <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 20px;">
        To unlock real-time AI Mentoring and smart Careers RAG, enter your personal OpenRouter API Key. You can get one for free at <a href="https://openrouter.ai/" target="_blank" style="color:var(--primary); text-decoration:underline;">openrouter.ai</a>.
      </p>
      
      <form id="openrouter-settings-form">
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">OpenRouter API Key</label>
          <div style="position: relative;">
            <input type="password" id="popup-openrouter-key" class="form-input" style="padding-right: 40px;" value="${config.apiKey}" placeholder="sk-or-v1-...">
            <i class="fas fa-eye-slash" id="toggle-popup-key-visibility" style="position: absolute; right: 12px; top: 12px; cursor: pointer; color: var(--text-muted);"></i>
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 24px;">
          <label class="form-label">Preferred AI Model</label>
          <select id="popup-openrouter-model" class="form-input">
            <option value="meta-llama/llama-3-8b-instruct:free" ${config.model === 'meta-llama/llama-3-8b-instruct:free' ? 'selected' : ''}>Meta: Llama 3 8B Instruct (Free) - Recommended</option>
            <option value="google/gemini-2.5-flash" ${config.model === 'google/gemini-2.5-flash' ? 'selected' : ''}>Google: Gemini 2.5 Flash</option>
            <option value="deepseek/deepseek-chat" ${config.model === 'deepseek/deepseek-chat' ? 'selected' : ''}>DeepSeek: DeepSeek Chat (V3)</option>
            <option value="meta-llama/llama-3-70b-instruct" ${config.model === 'meta-llama/llama-3-70b-instruct' ? 'selected' : ''}>Meta: Llama 3 70B Instruct</option>
          </select>
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button type="button" class="secondary-btn" id="btn-close-popup-settings" style="height: 36px; padding: 0 16px;">Cancel</button>
          <button type="submit" class="glow-btn" style="height: 36px; padding: 0 16px;">Save & Apply</button>
        </div>
      </form>
    `;
    
    openModal(modalHtml);
    
    // Toggle Visibility
    const passInput = document.getElementById('popup-openrouter-key');
    document.getElementById('toggle-popup-key-visibility').onclick = function() {
      if (passInput.type === 'password') {
        passInput.type = 'text';
        this.className = 'fas fa-eye';
      } else {
        passInput.type = 'password';
        this.className = 'fas fa-eye-slash';
      }
    };
    
    // Close
    document.getElementById('btn-close-popup-settings').onclick = closeModal;
    
    // Submit
    document.getElementById('openrouter-settings-form').onsubmit = function(e) {
      e.preventDefault();
      const newKey = document.getElementById('popup-openrouter-key').value;
      const newModel = document.getElementById('popup-openrouter-model').value;
      saveOpenRouterConfig(newKey, newModel);
      closeModal();
      showToast('OpenRouter API Configuration updated successfully!', 'success');
      logUserAction('update_openrouter_settings', `API Settings updated: model=${newModel}`);
    };
  };

  // Helper to ensure key exists
  function ensureOpenRouterKey() {
    const config = getOpenRouterConfig();
    if (config.apiKey) return true;
    window.__edcoShowAiSettingsModal();
    showToast('OpenRouter API Key is required for this action. Please configure it.', 'warning');
    return false;
  }

  // Master function to fetch completions from OpenRouter
  async function fetchOpenRouterCompletion(messages, systemPrompt = '') {
    const config = getOpenRouterConfig();
    if (!config.apiKey) {
      throw new Error('API Key missing. Please configure OpenRouter.');
    }
    
    const formattedMessages = [];
    if (systemPrompt) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }
    formattedMessages.push(...messages);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'EdWorld Co'
      },
      body: JSON.stringify({
        model: config.model,
        messages: formattedMessages
      })
    });
    
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errMsg = errBody.error?.message || `HTTP ${response.status}`;
      throw new Error(`OpenRouter Error: ${errMsg}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  // ==========================================
  // 1b. FIREBASE CLOUD MESSAGING (FCM) — GRACEFUL INIT
  // ==========================================
  let messaging = null;
  try {
    if ('Notification' in window && firebase.messaging && firebase.messaging.isSupported()) {
      messaging = firebase.messaging();
      console.log('[FCM] Messaging instance initialized successfully.');
    } else {
      console.warn('[FCM] Push notifications are not supported in this browser environment.');
    }
  } catch (fcmInitErr) {
    console.warn('[FCM] Failed to initialize messaging:', fcmInitErr.message);
    messaging = null;
  }

  /**
   * Request FCM push notification permission and subscribe for a token.
   * Handles all failure modes gracefully with user-facing toasts.
   */
  async function requestFCMPermission() {
    if (!messaging) {
      console.warn('[FCM] Messaging not available — skipping permission request.');
      return null;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('[FCM] Notification permission denied by user.');
        showToast('Notifications are disabled. Enable them in your browser settings to receive updates.', 'warning');
        return null;
      }
      // Attempt to get the FCM token
      const token = await messaging.getToken({
        vapidKey: firebaseConfig.messagingSenderId // fallback; real VAPID key should be set in production
      });
      if (token) {
        console.log('[FCM] Token obtained:', token.substring(0, 20) + '...');
        // Save token to user profile in Firestore
        if (state.currentUser) {
          await db.collection('users').doc(state.currentUser.id).update({ fcmToken: token });
        }
        return token;
      } else {
        console.warn('[FCM] No registration token available. Request permission to generate one.');
        return null;
      }
    } catch (fcmErr) {
      // Catch specific known error codes
      const errCode = fcmErr.code || '';
      const errMsg = fcmErr.message || '';
      if (errCode.includes('token-subscribe-failed') || errMsg.includes('token-subscribe-failed')) {
        console.warn('[FCM] Token subscription failed. This usually means the VAPID key or Cloud Messaging API key is misconfigured. Check Firebase Console > Project Settings > Cloud Messaging.');
        showToast('Push notification setup failed: API key mismatch. Check your Firebase Cloud Messaging configuration.', 'warning');
      } else if (errCode.includes('permission-blocked')) {
        console.warn('[FCM] Notifications blocked by browser settings.');
        showToast('Notifications blocked by your browser. Enable them in site settings.', 'warning');
      } else {
        console.warn('[FCM] Unexpected error during token retrieval:', errMsg);
        showToast('Could not enable push notifications. You\'ll still receive in-app alerts.', 'warning');
      }
      return null;
    }
  }

  // Listen for foreground messages (if messaging is available)
  if (messaging) {
    try {
      messaging.onMessage((payload) => {
        console.log('[FCM] Foreground message received:', payload);
        const title = payload.notification?.title || 'EdWorld Co';
        const body = payload.notification?.body || 'You have a new notification.';
        showToast(`${title}: ${body}`, 'info');
      });
    } catch (e) {
      console.warn('[FCM] Could not set up foreground message listener:', e.message);
    }
  }

  let state = {
    currentUser: null,
    users: [],
    courses: [],
    projects: [],
    badges: {},
    connections: [],
    messages: [],
    notifications: [],
    opportunities: [],
    streak: 3,
    activity: [40, 80, 20, 60, 10, 90, 0],
    eventsGigs: [],
    purchases: [],
    ambassadorApplications: [],
    withdrawals: [],
    userActions: [],
    simulatePostJuly: false
  };

  let unsubscribeStreams = [];
  let activeChatUnsubscribe = null;

  async function seedFirestoreIfNeeded() {
    try {
      const usersSnap = await db.collection('users').limit(1).get();
      if (usersSnap.empty) {
        console.log("Seeding Firestore databases with mock data...");
        const seed = EDCO_MOCK_DATA;

        // Seed users
        for (const u of seed.users) {
          await db.collection('users').doc(u.id).set(u);
        }

        // Seed courses
        for (const c of seed.courses) {
          await db.collection('courses').doc(c.id).set(c);
        }

        // Seed projects
        for (const p of seed.projects) {
          await db.collection('projects').doc(p.id).set(p);
        }

        // Seed opportunities (default data)
        const defaultOpportunities = [
          {
            id: "opp_stripe",
            title: "Software Engineer Intern (Python)",
            company: "Stripe",
            description: "Full-stack developer focused on Python backend engineering and API design. Work on payment integration and merchant endpoints.",
            requirements: "Pursuing BS/MS in CS. Experience with Python, Django or Flask, and relational databases like PostgreSQL. Good understanding of APIs.",
            skills: ["Python", "Django", "PostgreSQL", "React", "Docker"],
            salary: "$45 - $60 / hour",
            location: "Remote (US/Canada)",
            type: "Internship",
            apply_url: "#apply-stripe",
            postedAt: new Date().toISOString()
          },
          {
            id: "opp_google",
            title: "Cloud Infrastructure Architect",
            company: "Google",
            description: "Design and implement scalable cloud infrastructure architectures. Work with Kubernetes, Docker, and Python pipelines for server automation.",
            requirements: "Strong background in Cloud platforms (GCP/AWS). Experience with Docker, Kubernetes, Linux systems, and scripting in Python.",
            skills: ["Python", "Docker", "Kubernetes", "Linux", "AWS"],
            salary: "$120,000 - $160,000 / year",
            location: "Sunnyvale, CA",
            type: "Full-time",
            apply_url: "#apply-google",
            postedAt: new Date().toISOString()
          },
          {
            id: "opp_canva",
            title: "Frontend Engineer Intern",
            company: "Canva",
            description: "Build beautiful user experiences, interactive widgets, responsive layouts using HTML5, CSS3, and React. Work with cross-functional designer teams.",
            requirements: "Strong understanding of React, JavaScript (ES6+), semantic HTML5, and CSS3 layouts. Passion for UI/UX and animation.",
            skills: ["React", "HTML5", "CSS3", "JavaScript"],
            salary: "$35 - $45 / hour",
            location: "Remote (Australia)",
            type: "Internship",
            apply_url: "#apply-canva",
            postedAt: new Date().toISOString()
          }
        ];
        for (const opp of defaultOpportunities) {
          await db.collection('opportunities').doc(opp.id).set(opp);
        }

        // Seed connections
        const defaultConnections = [
          { from_user_id: "user_alice", to_user_id: "user_bob", status: "accepted", created_at: new Date().toISOString() },
          { from_user_id: "user_carol", to_user_id: "user_alice", status: "accepted", created_at: new Date().toISOString() },
          { from_user_id: "user_diana", to_user_id: "user_bob", status: "pending", created_at: new Date().toISOString() }
        ];
        for (const conn of defaultConnections) {
          const connId = `conn_${conn.from_user_id}_${conn.to_user_id}`;
          await db.collection('connections').doc(connId).set(conn);
        }

        // Seed messages
        const defaultMessages = [
          {
            id: "msg_1",
            sender_id: "user_alice",
            recipient_id: "user_bob",
            content: "Hey Bob! Let's collaborate on the Stripe e-commerce project soon.",
            created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
            is_read: true,
            reactions: { "👍": ["user_bob"] }
          },
          {
            id: "msg_2",
            sender_id: "user_bob",
            recipient_id: "user_alice",
            content: "That sounds awesome Alice. I am working through the React hooks module right now.",
            created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
            is_read: true,
            reactions: {}
          }
        ];
        for (const msg of defaultMessages) {
          await db.collection('messages').doc(msg.id).set(msg);
        }
      }

      // Seed Events & Gigs independently of users
      const egSnap = await db.collection('events_gigs').limit(1).get();
      if (egSnap.empty) {
        console.log("Seeding events & gigs...");
        const defaultEventsGigs = [
          {
            id: "eg_1",
            title: "EdWorld Hackathon 2026",
            description: "Participate in our annual summer hackathon. Build innovative AI solutions and win exciting cash prizes up to $5000!",
            type: "event",
            date: "2026-06-25",
            time: "10:00 AM",
            location: "Virtual / Discord",
            pointsReward: 100,
            image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400"
          },
          {
            id: "eg_2",
            title: "Build Landing Page for local client",
            description: "Looking for a React developer to build a modern landing page for an organic food startup. Delivery in 1 week.",
            type: "gig",
            budget: "$250",
            duration: "7 days",
            skills: ["React", "CSS3", "HTML5"],
            pointsReward: 50
          },
          {
            id: "eg_3",
            title: "AI & Careers Webinar",
            description: "Learn how to optimize your resume for ATS and pass mock coding interviews using our latest RAG features.",
            type: "event",
            date: "2026-06-20",
            time: "4:00 PM",
            location: "Zoom Webinars",
            pointsReward: 30,
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400"
          },
          {
            id: "eg_4",
            title: "Python API Developer for EdTech platform",
            description: "Create Flask/Django APIs to integrate payment gateways and user databases. Temporary 1-month freelance role.",
            type: "gig",
            budget: "$800 / month",
            duration: "30 days",
            skills: ["Python", "Django", "PostgreSQL"],
            pointsReward: 150
          }
        ];
        for (const eg of defaultEventsGigs) {
          await db.collection('events_gigs').doc(eg.id).set(eg);
        }
      }
    } catch (e) {
      console.error("Failed to seed Firestore data", e);
    }
  }

  function startRealTimeStreams() {
    unsubscribeStreams.forEach(unsub => unsub());
    unsubscribeStreams = [];

    // Stream users
    unsubscribeStreams.push(db.collection('users').onSnapshot(snap => {
      state.users = snap.docs.map(doc => doc.data());
      updateGlobalUserData();
      
      const viewName = window.location.hash.replace('#', '') || 'dashboard';
      if (viewName === 'connections') renderConnectionsList();
      if (viewName === 'leaderboard') renderLeaderboards();
      if (viewName === 'dashboard') renderDashboardSuggestions();
    }));

    // Stream connections
    unsubscribeStreams.push(db.collection('connections').onSnapshot(snap => {
      state.connections = snap.docs.map(doc => doc.data());
      const viewName = window.location.hash.replace('#', '') || 'dashboard';
      if (viewName === 'connections') {
        renderConnectionsList();
        renderRecommendedCarousel();
      }
      if (viewName === 'dashboard') renderDashboard();
    }));

    // Stream projects
    unsubscribeStreams.push(db.collection('projects').onSnapshot(snap => {
      state.projects = snap.docs.map(doc => doc.data());
      const viewName = window.location.hash.replace('#', '') || 'dashboard';
      if (viewName === 'projects') renderProjectsGrid();
    }));

    // Stream notifications
    if (state.currentUser) {
      unsubscribeStreams.push(db.collection('notifications')
        .where('recipient_id', '==', state.currentUser.id)
        .onSnapshot(snap => {
          state.notifications = snap.docs.map(doc => doc.data());
          updateGlobalUserData();
          const dropdown = document.getElementById('dropdown-notifications');
          if (dropdown && dropdown.classList.contains('active')) {
            renderNotificationsDropdown();
          }
        }));
    }

    // Stream opportunities (Careers)
    unsubscribeStreams.push(db.collection('opportunities').onSnapshot(snap => {
      state.opportunities = snap.docs.map(doc => {
        const d = doc.data();
        if (!d.id) d.id = doc.id;
        return d;
      });
      
      buildRagIndex();
      
      const viewName = window.location.hash.replace('#', '') || 'dashboard';
      if (viewName === 'jobs') {
        renderJobsList();
      }
    }));

    // Stream events & gigs
    unsubscribeStreams.push(db.collection('events_gigs').onSnapshot(snap => {
      state.eventsGigs = snap.docs.map(doc => doc.data());
      const viewName = window.location.hash.replace('#', '') || 'dashboard';
      if (viewName === 'dashboard') renderDashboardEventsGigs();
      if (viewName === 'events-gigs') renderEventsGigsView();
    }));

    // Stream payments
    unsubscribeStreams.push(db.collection('payments').onSnapshot(snap => {
      state.purchases = snap.docs.map(doc => doc.data());
      const viewName = window.location.hash.replace('#', '') || 'dashboard';
      if (viewName === 'admin') renderAdminPane();
    }));

    // Stream ambassador applications
    unsubscribeStreams.push(db.collection('ambassador_applications').onSnapshot(snap => {
      state.ambassadorApplications = snap.docs.map(doc => doc.data());
      const viewName = window.location.hash.replace('#', '') || 'dashboard';
      if (viewName === 'admin') renderAdminPane();
    }));

    // Stream withdrawals
    unsubscribeStreams.push(db.collection('withdrawals').onSnapshot(snap => {
      state.withdrawals = snap.docs.map(doc => doc.data());
      const viewName = window.location.hash.replace('#', '') || 'dashboard';
      if (viewName === 'admin') renderAdminPane();
    }));

    // Stream user action logs
    unsubscribeStreams.push(db.collection('user_actions').orderBy('timestamp', 'desc').limit(100).onSnapshot(snap => {
      state.userActions = snap.docs.map(doc => doc.data());
      const viewName = window.location.hash.replace('#', '') || 'dashboard';
      if (viewName === 'admin') renderAdminPane();
    }));
  }

  function subscribeToActiveChat(recipientId) {
    if (activeChatUnsubscribe) {
      activeChatUnsubscribe();
      activeChatUnsubscribe = null;
    }

    if (!state.currentUser || !recipientId) return;

    activeChatUnsubscribe = db.collection('messages')
      .onSnapshot(snap => {
        state.messages = snap.docs.map(doc => doc.data());
        const viewName = window.location.hash.replace('#', '') || 'dashboard';
        if (viewName === 'messages') {
          renderConversationsList();
          renderActiveChatPane();
        }
      });
  }

  // Load static badges definitions
  state.badges = EDCO_MOCK_DATA.badges;

  function saveState() {
    // Kept as dummy function to prevent reference errors elsewhere
  }

  // ==========================================
  // 2. HELPER UTILITIES
  // ==========================================
  function showToast(text, type = 'info', actionUrl = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg glass-panel ${type}-toast`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'notify') icon = 'fa-bell';

    toast.innerHTML = `
      <i class="fas ${icon} toast-icon" style="color: var(--${type === 'notify' ? 'secondary' : type === 'success' ? 'success' : 'primary'});"></i>
      <div class="toast-body">${text}</div>
    `;

    if (actionUrl) {
      toast.style.cursor = 'pointer';
      toast.addEventListener('click', () => {
        window.location.hash = actionUrl;
        toast.remove();
      });
    }

    container.appendChild(toast);
    
    // Play system beep sound
    playAudioBeep(type);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Web Audio Synth for notifications
  function playAudioBeep(type) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === 'success') {
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(450, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      }
    } catch (e) {
      // Audio context block safeguard
    }
  }

  function formatTime(isoString) {
    const date = new Date(isoString);
    let hrs = date.getHours();
    let mins = date.getMinutes();
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12;
    mins = mins < 10 ? '0' + mins : mins;
    return `${hrs}:${mins} ${ampm}`;
  }

  // Modal handlers
  function openModal(htmlContent) {
    const modal = document.getElementById('general-modal');
    const area = document.getElementById('general-modal-content-area');
    area.innerHTML = `
      <span class="close-modal-btn" id="btn-close-general-modal"><i class="fas fa-times"></i></span>
      ${htmlContent}
    `;
    modal.classList.add('active');
    
    document.getElementById('btn-close-general-modal').addEventListener('click', closeModal);
  }

  function closeModal() {
    const modal = document.getElementById('general-modal');
    modal.classList.remove('active');
  }

  // ==========================================
  // 3. AUTHENTICATION & ONBOARDING SYSTEM
  // ==========================================
  let onboardSkills = [];

  function checkAuth() {
    // Listen for Firebase Auth changes
    auth.onAuthStateChanged(async (firebaseUser) => {
      const authOverlay = document.getElementById('auth-overlay');
      if (firebaseUser) {
        // User is logged in
        const userRef = db.collection('users').doc(firebaseUser.uid);
        const userSnap = await userRef.get();
        
        if (!userSnap.exists) {
          // User document does not exist, trigger onboarding wizard
          state.currentUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : `User_${firebaseUser.uid.slice(0, 6)}`),
            email: firebaseUser.email || `${firebaseUser.uid}@${(firebaseUser.providerData[0]?.providerId || 'oauth').split('.')[0]}.placeholder.com`,
            headline: "Student Learner",
            location: "San Francisco, CA",
            bio: "Mastering development stack on EdWorld Co.",
            skills: [],
            college: "GITAM University",
            degree: "B.Tech",
            branch: "Computer Science & Engineering",
            graduationYear: 2026,
            github: "",
            linkedin: "",
            portfolio: "",
            oauth_providers: firebaseUser.providerData.map(p => p.providerId) || ["email"],
            email_verified: firebaseUser.emailVerified || true,
            provider_ids: { email: firebaseUser.uid },
            followers_count: 0,
            following_count: 0,
            points: 0,
            badges: [],
            role: "student",
            avatar: firebaseUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            userProgress: {
              enrolledCourses: {},
              completedLessons: [],
              quizScores: {}
            }
          };
          await userRef.set(state.currentUser);
          authOverlay.style.display = 'none';
          showOnboardingWizard();
        } else {
          // Exists, set current user
          state.currentUser = userSnap.data();
          authOverlay.style.display = 'none';
          
          // Check if name or email is missing and update if available from provider
          let needsUpdate = false;
          if (!state.currentUser.name && firebaseUser.displayName) {
            state.currentUser.name = firebaseUser.displayName;
            needsUpdate = true;
          }
          if (!state.currentUser.name && firebaseUser.email) {
            state.currentUser.name = firebaseUser.email.split('@')[0];
            needsUpdate = true;
          }
          if (!state.currentUser.email && firebaseUser.email) {
            state.currentUser.email = firebaseUser.email;
            needsUpdate = true;
          }
          if (needsUpdate) {
            await userRef.update({
              name: state.currentUser.name,
              email: state.currentUser.email
            });
          }
          
          // Post-login redirect to #dashboard if we are on landing/login page
          if (!window.location.hash || window.location.hash === '#login' || window.location.hash === '#') {
            window.location.hash = '#dashboard';
          }
          
          // Setup real-time listener for current user updates
          userRef.onSnapshot(doc => {
            if (doc.exists) {
              state.currentUser = doc.data();
              updateGlobalUserData();
            }
          });
          
          // Start streams
          startRealTimeStreams();
          initializeApplication();
        }
      } else {
        // User is logged out
        state.currentUser = null;
        authOverlay.style.display = 'flex';
        setupAuthListeners();
      }
    });
  }

  function setupAuthListeners() {
    document.getElementById('btn-login-google').onclick = () => loginWithProvider('google');
    document.getElementById('btn-login-github').onclick = () => loginWithProvider('github');
    
    let authMode = 'login';
    const shortcutBtn = document.getElementById('btn-onboard-register-shortcut');
    const authTitle = document.querySelector('.auth-card-title');
    const authSubtitle = document.querySelector('.auth-card-subtitle');
    const submitBtn = document.querySelector('#email-auth-form button[type="submit"]');

    if (shortcutBtn) {
      shortcutBtn.onclick = (e) => {
        e.preventDefault();
        if (authMode === 'login') {
          authMode = 'register';
          if (authTitle) authTitle.textContent = "Create Account";
          if (authSubtitle) authSubtitle.textContent = "Sign up for a new account to launch your career.";
          if (submitBtn) submitBtn.innerHTML = `Register & Get Started &nbsp;<i class="fas fa-user-plus"></i>`;
          shortcutBtn.textContent = "Sign In";
          shortcutBtn.parentElement.firstChild.textContent = "Already have an account? ";
        } else {
          authMode = 'login';
          if (authTitle) authTitle.textContent = "Welcome Back";
          if (authSubtitle) authSubtitle.textContent = "Enter your credentials to access your professional workspace.";
          if (submitBtn) submitBtn.innerHTML = `Sign In to Edworld Co. &nbsp;<i class="fas fa-arrow-right"></i>`;
          shortcutBtn.textContent = "Register Now";
          shortcutBtn.parentElement.firstChild.textContent = "Don't have an account yet? ";
        }
      };
    }

    document.getElementById('email-auth-form').onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      
      if (authMode === 'register') {
        try {
          await auth.createUserWithEmailAndPassword(email, password);
          showToast("Account created! Set up your profile.", "success");
        } catch (signUpErr) {
          showToast(signUpErr.message, "danger");
        }
      } else {
        try {
          await auth.signInWithEmailAndPassword(email, password);
          showToast("Signed in successfully!", "success");
        } catch (err) {
          if (err.code === 'auth/user-not-found') {
            try {
              await auth.createUserWithEmailAndPassword(email, password);
              showToast("Account created! Set up your profile.", "success");
            } catch (signUpErr) {
              showToast(signUpErr.message, "danger");
            }
          } else {
            showToast(err.message, "danger");
          }
        }
      }
    };
  }

  async function loginWithProvider(providerName) {
    let provider;
    if (providerName === 'google') {
      provider = new firebase.auth.GoogleAuthProvider();
    } else if (providerName === 'github') {
      provider = new firebase.auth.GithubAuthProvider();
      provider.addScope('read:user');
      provider.addScope('user:email');
    } else {
      return;
    }
    
    try {
      await auth.signInWithPopup(provider);
      showToast(`Authenticated via ${providerName}!`, "success");
    } catch (err) {
      console.error(`${providerName} login error`, err);
      showToast(`Authentication failed: ${err.message}`, "danger");
    }
  }

  function showOnboardingWizard() {
    const overlay = document.getElementById('onboarding-overlay');
    overlay.classList.add('active');
    
    // Pre-populate input values from Google/GitHub OAuth data
    document.getElementById('onboard-name').value = state.currentUser.name || '';
    document.getElementById('onboard-headline').value = state.currentUser.headline || '';
    document.getElementById('onboard-location').value = state.currentUser.location || '';
    document.getElementById('onboard-bio').value = state.currentUser.bio || '';
    
    document.getElementById('onboard-college').value = state.currentUser.college || '';
    document.getElementById('onboard-degree').value = state.currentUser.degree || '';
    document.getElementById('onboard-branch').value = state.currentUser.branch || '';
    document.getElementById('onboard-grad-year').value = state.currentUser.graduationYear || '2026';
    
    onboardSkills = [];
    renderOnboardTags();

    // Step 1 buttons
    document.getElementById('btn-onboard-next-1').onclick = () => {
      const name = document.getElementById('onboard-name').value.trim();
      const headline = document.getElementById('onboard-headline').value.trim();
      const college = document.getElementById('onboard-college').value.trim();
      const degree = document.getElementById('onboard-degree').value.trim();
      const branch = document.getElementById('onboard-branch').value.trim();
      const gradYear = document.getElementById('onboard-grad-year').value.trim();
      
      if (!name || !headline || !college || !degree || !branch || !gradYear) {
        showToast("Please fill in all details including academic parameters.", "warning");
        return;
      }
      
      state.currentUser.name = name;
      state.currentUser.headline = headline;
      state.currentUser.location = document.getElementById('onboard-location').value.trim() || "Global Village";
      state.currentUser.bio = document.getElementById('onboard-bio').value.trim() || "Hi, I'm new here!";
      
      state.currentUser.college = college;
      state.currentUser.degree = degree;
      state.currentUser.branch = branch;
      state.currentUser.graduationYear = Number(gradYear);
      
      togglePane(1, 2);
    };

    // Step 2 buttons
    document.getElementById('btn-onboard-back-2').onclick = () => togglePane(2, 1);
    document.getElementById('btn-onboard-next-2').onclick = () => {
      if (onboardSkills.length === 0) {
        showToast("Please add at least 1 skills tag to configure suggestions.", "warning");
        return;
      }
      state.currentUser.skills = onboardSkills;
      togglePane(2, 3);
    };

    // Skills tag input listeners
    const tagInput = document.getElementById('onboard-tag-input');
    tagInput.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = tagInput.value.trim().replace(/,/g, '');
        if (val && onboardSkills.length < 10 && !onboardSkills.includes(val)) {
          onboardSkills.push(val);
          renderOnboardTags();
          tagInput.value = '';
        }
      }
    };

    // Seeded clickable tags pool
    const pool = document.getElementById('suggested-tags-container');
    Array.from(pool.children).forEach(badge => {
      badge.onclick = () => {
        const val = badge.textContent;
        if (onboardSkills.length < 10 && !onboardSkills.includes(val)) {
          onboardSkills.push(val);
          renderOnboardTags();
        }
      };
    });

    // Step 3 buttons
    document.getElementById('btn-onboard-back-3').onclick = () => togglePane(3, 2);
    document.getElementById('btn-onboard-finish').onclick = async () => {
      // Save links
      state.currentUser.github = document.getElementById('onboard-github').value.trim() || "#";
      state.currentUser.linkedin = document.getElementById('onboard-linkedin').value.trim() || "#";
      state.currentUser.portfolio = document.getElementById('onboard-portfolio').value.trim() || "#";
      
      // Award profile completion bonus
      state.currentUser.points += 50;
      
      // Update in users database
      await db.collection('users').doc(state.currentUser.id).set(state.currentUser);
      
      // Seed welcome notification
      const notifId = "notif_welcome_" + Date.now();
      await db.collection('notifications').doc(notifId).set({
        id: notifId,
        recipient_id: state.currentUser.id,
        type: "achievement",
        actor_id: "system",
        title: "Profile Configured!",
        message: "Welcome aboard EdWorld Co! +50 registration points awarded.",
        is_read: false,
        created_at: new Date().toISOString()
      });
      
      overlay.classList.remove('active');
      showToast("Profile configured! Welcome to the dashboard.", "success");
      
      window.location.hash = '#dashboard';
      
      // Start streams & start app
      startRealTimeStreams();
      initializeApplication();
    };
  }

  function togglePane(fromStep, toStep) {
    document.getElementById(`onboarding-step-${fromStep}`).classList.remove('active');
    document.getElementById(`step-node-${fromStep}`).classList.remove('active');
    if (fromStep < toStep) {
      document.getElementById(`step-node-${fromStep}`).classList.add('completed');
    }
    
    document.getElementById(`onboarding-step-${toStep}`).classList.add('active');
    document.getElementById(`step-node-${toStep}`).classList.add('active');
  }

  function renderOnboardTags() {
    const list = document.getElementById('onboard-tags-badge-list');
    list.innerHTML = '';
    onboardSkills.forEach((tag, idx) => {
      const badge = document.createElement('span');
      badge.className = 'tag-badge';
      badge.innerHTML = `${tag} <span data-idx="${idx}">&times;</span>`;
      list.appendChild(badge);
      
      badge.querySelector('span').onclick = () => {
        onboardSkills.splice(idx, 1);
        renderOnboardTags();
      };
    });
  }

  function updateMobileHeader(viewName) {
    if (!state.currentUser) return;
    
    const titleEl = document.getElementById('mobile-header-title');
    const leftBtn = document.getElementById('mobile-header-left-btn');
    if (!titleEl || !leftBtn) return;
    
    // Map titles
    const titles = {
      'dashboard': 'Home',
      'courses': 'Learn',
      'projects': 'Workspace',
      'connections': 'Connect',
      'messages': 'Chat',
      'jobs': 'Jobs & Internships',
      'points': 'Points Wallet',
      'plans': 'Upgrade Plans',
      'leaderboard': 'Leaderboards',
      'admin': 'Admin Panel',
      'profile': 'My Profile',
      'ambassador': 'Ambassador Program',
      'portfolio-view': 'Portfolio Design',
      'search': 'Search Results'
    };
    
    titleEl.textContent = titles[viewName] || 'EdWorld Co';
    
    // Top-level views vs Sub-views
    const topLevelViews = ['dashboard', 'courses', 'projects', 'messages', 'profile'];
    if (topLevelViews.includes(viewName)) {
      // Show user avatar on left
      leftBtn.innerHTML = `<img src="${state.currentUser.avatar}" class="mobile-header-avatar" alt="Avatar">`;
      leftBtn.onclick = () => {
        window.location.hash = '#profile';
      };
    } else {
      // Show back arrow on left
      leftBtn.innerHTML = `<i class="fas fa-arrow-left"></i>`;
      leftBtn.onclick = () => {
        if (viewName === 'portfolio-view') {
          window.location.hash = '#projects';
        } else if (viewName === 'course-viewer') {
          window.location.hash = '#courses';
        } else {
          window.history.back();
        }
      };
    }
  }

  // ==========================================
  // 4. CORE ROUTING & SECTION DISPLAY
  // ==========================================
  function handleNavigation() {
    const hash = window.location.hash || '#dashboard';
    let viewName = hash.replace('#', '');
    
    // Update mobile top bar dynamically
    updateMobileHeader(viewName);
    
    // Check if sub-view search matches
    if (viewName.startsWith('search?q=')) {
      renderSearchView(decodeURIComponent(viewName.split('q=')[1]));
      viewName = 'search';
    }

    // Paywall check: Free until June 30, 2026. After July 1, 2026, requires plan.
    const isPostJuly = new Date() >= new Date("2026-07-01") || state.simulatePostJuly;
    const hasPlan = state.currentUser && state.currentUser.purchasedPlan && state.currentUser.purchasedPlan.status === 'active';
    const protectedViews = ['courses', 'projects', 'connections', 'messages', 'jobs', 'points', 'events-gigs', 'portfolio-view'];
    
    if (isPostJuly && !hasPlan && protectedViews.includes(viewName)) {
      showToast("Premium feature locked. Please purchase a plan to unlock all features.", "notify");
      window.location.hash = '#plans';
      return;
    }

    // Log action
    logUserAction('page_view', `Navigated to #${viewName}`);

    // Toggle nav active highlight
    const navItems = document.querySelectorAll('.nav-links .nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Toggle viewport sections
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => {
      if (sec.id === `view-${viewName}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Trigger page-specific loaders
    if (viewName === 'dashboard') renderDashboard();
    if (viewName === 'courses') renderCoursesIndex();
    if (viewName === 'projects') renderProjectsGrid();
    if (viewName === 'connections') renderConnectionsView();
    if (viewName === 'messages') renderMessagesView();
    if (viewName === 'jobs') renderJobsView();
    if (viewName === 'leaderboard') renderLeaderboards();
    if (viewName === 'profile') renderProfileView();
    if (viewName === 'points') renderPointsView();
    if (viewName === 'events-gigs') renderEventsGigsView();
    if (viewName === 'plans') renderPlansView();
    if (viewName === 'ambassador') {
      setupAmbassadorFormListener();
    }
    if (viewName === 'admin') renderAdminPane();
    if (viewName === 'portfolio-view') renderPortfolioView();
  }

  function renderPointsView() {
    if (!state.currentUser) return;
    
    document.getElementById('points-total').textContent = state.currentUser.points;
    const withdrawBtn = document.getElementById('btn-points-withdraw');
    
    if (state.currentUser.points >= 200) {
      withdrawBtn.removeAttribute('disabled');
      withdrawBtn.onclick = () => {
        const modalHtml = `
          <h3 style="font-size: 20px; margin-bottom: 8px; border-bottom: 1px solid var(--border-card); padding-bottom: 8px;"><i class="fas fa-wallet" style="color: var(--primary);"></i> Payout Request</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">
            You are requesting a withdrawal of <strong>200 points</strong>. Please select your payout method and provide details.
          </p>
          
          <form id="withdraw-details-form">
            <div style="display: flex; gap: 16px; margin-bottom: 20px;">
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 600; cursor: pointer;">
                <input type="radio" name="payout-type" value="upi" checked id="payout-upi-radio"> UPI ID
              </label>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 600; cursor: pointer;">
                <input type="radio" name="payout-type" value="bank" id="payout-bank-radio"> Bank Account
              </label>
            </div>
            
            <!-- UPI Fields -->
            <div id="payout-upi-fields" class="form-group" style="margin-bottom: 20px;">
              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label">UPI ID</label>
                <input type="text" id="payout-upi-id" class="form-input" placeholder="username@okaxis" required>
              </div>
              <div class="form-group">
                <label class="form-label">Beneficiary Name</label>
                <input type="text" id="payout-upi-name" class="form-input" value="${state.currentUser.name}" required>
              </div>
            </div>
            
            <!-- Bank Fields (hidden initially) -->
            <div id="payout-bank-fields" style="display: none; margin-bottom: 20px;">
              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label">Account Holder Name</label>
                <input type="text" id="payout-bank-holder" class="form-input" value="${state.currentUser.name}">
              </div>
              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label">Bank Account Number</label>
                <input type="text" id="payout-bank-acc" class="form-input" placeholder="123456789012">
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">IFSC Code</label>
                  <input type="text" id="payout-bank-ifsc" class="form-input" placeholder="SBIN0001234">
                </div>
                <div class="form-group">
                  <label class="form-label">Bank Name</label>
                  <input type="text" id="payout-bank-name" class="form-input" placeholder="State Bank of India">
                </div>
              </div>
            </div>
            
            <button type="submit" class="glow-btn" style="width: 100%; justify-content: center; height: 44px; border-radius: 8px;">
              Submit Payout Request &nbsp;<i class="fas fa-check"></i>
            </button>
          </form>
        `;
        
        openModal(modalHtml);
        
        // Toggle fields
        const upiRadio = document.getElementById('payout-upi-radio');
        const bankRadio = document.getElementById('payout-bank-radio');
        const upiFields = document.getElementById('payout-upi-fields');
        const bankFields = document.getElementById('payout-bank-fields');
        
        const upiInput = document.getElementById('payout-upi-id');
        const upiName = document.getElementById('payout-upi-name');
        const bankHolder = document.getElementById('payout-bank-holder');
        const bankAcc = document.getElementById('payout-bank-acc');
        const bankIfsc = document.getElementById('payout-bank-ifsc');
        const bankNameInput = document.getElementById('payout-bank-name');
        
        upiRadio.onchange = () => {
          upiFields.style.display = 'block';
          bankFields.style.display = 'none';
          upiInput.setAttribute('required', 'true');
          upiName.setAttribute('required', 'true');
          bankHolder.removeAttribute('required');
          bankAcc.removeAttribute('required');
          bankIfsc.removeAttribute('required');
          bankNameInput.removeAttribute('required');
        };
        
        bankRadio.onchange = () => {
          upiFields.style.display = 'none';
          bankFields.style.display = 'block';
          upiInput.removeAttribute('required');
          upiName.removeAttribute('required');
          bankHolder.setAttribute('required', 'true');
          bankAcc.setAttribute('required', 'true');
          bankIfsc.setAttribute('required', 'true');
          bankNameInput.setAttribute('required', 'true');
        };
        
        document.getElementById('withdraw-details-form').onsubmit = async (e) => {
          e.preventDefault();
          
          if (state.currentUser.points < 200) {
            closeModal();
            showToast("Insufficient points!", "error");
            return;
          }
          
          closeModal();
          
          const type = upiRadio.checked ? 'upi' : 'bank';
          let details = {};
          if (type === 'upi') {
            details = {
              upiId: upiInput.value.trim(),
              name: upiName.value.trim()
            };
          } else {
            details = {
              holderName: bankHolder.value.trim(),
              accountNumber: bankAcc.value.trim(),
              ifsc: bankIfsc.value.trim(),
              bankName: bankNameInput.value.trim()
            };
          }
          
          // Deduct 200 points
          state.currentUser.points -= 200;
          await db.collection('users').doc(state.currentUser.id).set(state.currentUser);
          
          // Create withdrawal request
          const withdrawalRequest = {
            id: `wd_${Date.now()}`,
            userId: state.currentUser.id,
            userName: state.currentUser.name,
            points: 200,
            type: type,
            details: details,
            status: 'pending',
            date: new Date().toISOString()
          };
          await db.collection('withdrawals').add(withdrawalRequest);
          
          // Log user action
          await logUserAction('withdrawal_request', `Requested withdrawal of 200 points via ${type.toUpperCase()}.`);
          
          showToast("Withdrawal request submitted for review!", "success");
          updateGlobalUserData();
          renderPointsView();
        };
      };
    } else {
      withdrawBtn.setAttribute('disabled', 'true');
      withdrawBtn.onclick = null;
    }
  }

  // ==========================================
  // 5. RENDERING logic for views
  // ==========================================

  function renderIdCard() {
    if (!state.currentUser) return '';
    return `
      <div class="id-card glass-panel" id="edworld-career-card">
        <div class="id-card-header-accent"></div>
        <div class="id-card-body">
          <div class="id-card-avatar-wrapper">
            <img src="${state.currentUser.avatar}" alt="Avatar" class="id-card-avatar" crossorigin="anonymous" />
            <span class="id-card-status-dot"></span>
          </div>
          <div class="id-card-details">
            <h3 class="id-card-name">${state.currentUser.name}</h3>
            <p class="id-card-email"><i class="far fa-envelope"></i> ${state.currentUser.email || 'no-email@edworld.com'}</p>
            ${state.currentUser.phoneNumber ? `<p class="id-card-email" style="margin-top: 2px;"><i class="fas fa-phone-alt" style="font-size: 10px; width: 14px;"></i> ${state.currentUser.phoneNumber}</p>` : ''}
            <div class="id-card-meta-row">
              <span class="id-card-role-tag">${(state.currentUser.role || 'student').toUpperCase()}</span>
              <span class="id-card-points-tag"><i class="fas fa-fire"></i> ${state.currentUser.points} pts</span>
            </div>
          </div>
        </div>
      </div>
      <div class="id-card-actions">
        <button class="btn-print-card" onclick="window.__edcoPrintCard()" title="Print ID Card">
          <i class="fas fa-print"></i> Print Card
        </button>
        <button class="btn-download-card" onclick="window.__edcoDownloadCard()" title="Download as PNG">
          <i class="fas fa-download"></i> Download PNG
        </button>
      </div>`;
  }

  // --- PRINT ID CARD ---
  window.__edcoPrintCard = function() {
    const card = document.getElementById('edworld-career-card');
    if (!card) { showToast('ID Card not found.', 'error'); return; }
    const wrapper = document.getElementById('print-card-wrapper');
    wrapper.innerHTML = '';
    wrapper.appendChild(card.cloneNode(true));
    wrapper.style.display = 'block';
    setTimeout(() => {
      window.print();
      setTimeout(() => { wrapper.style.display = 'none'; wrapper.innerHTML = ''; }, 500);
    }, 200);
    logUserAction('print_id_card', 'Printed career ID card.');
  };

  // --- DOWNLOAD ID CARD AS PNG ---
  window.__edcoDownloadCard = function() {
    const card = document.getElementById('edworld-career-card');
    if (!card) { showToast('ID Card not found.', 'error'); return; }
    // Use a simple canvas approach with html2canvas if available, otherwise fallback to print
    if (typeof html2canvas !== 'undefined') {
      html2canvas(card, { useCORS: true, backgroundColor: null, scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `EdWorld-ID-${state.currentUser?.name?.replace(/\s+/g, '_') || 'card'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('ID Card downloaded!', 'success');
      }).catch(() => {
        showToast('Download failed. Try Print Card instead.', 'warning');
      });
    } else {
      // Fallback: trigger print (Save as PDF)
      showToast('Downloading as PDF via print dialog...', 'info');
      window.__edcoPrintCard();
    }
    logUserAction('download_id_card', 'Downloaded career ID card as image.');
  };

  // --- TOP BAR & USER DATA INJECT ---
  function updateGlobalUserData() {
    if (!state.currentUser) return;

    // Sidebar User
    document.getElementById('sidebar-avatar').src = state.currentUser.avatar;
    document.getElementById('sidebar-name').textContent = state.currentUser.name;
    document.getElementById('sidebar-points-count').innerHTML = `<i class="fas fa-fire" style="color: var(--warning);"></i> ${state.currentUser.points} pts`;

    // Topbar User Pill
    document.getElementById('topbar-avatar').src = state.currentUser.avatar;
    document.getElementById('topbar-name').textContent = state.currentUser.name;

    // Mobile Avatars
    const mobNavAv = document.getElementById('mobile-nav-avatar');
    if (mobNavAv) mobNavAv.src = state.currentUser.avatar;
    const mobHeadAv = document.getElementById('mobile-header-avatar');
    if (mobHeadAv) mobHeadAv.src = state.currentUser.avatar;

    // Notifications counter
    const unread = state.notifications.filter(n => !n.is_read).length;
    const badge = document.getElementById('notification-badge');
    if (unread > 0) {
      badge.textContent = unread;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }

    const badgeMobile = document.getElementById('notification-badge-mobile');
    if (badgeMobile) {
      if (unread > 0) {
        badgeMobile.textContent = unread;
        badgeMobile.style.display = 'flex';
      } else {
        badgeMobile.style.display = 'none';
      }
    }

    // Mobile admin settings tab trigger visibility
    const profileMobileAdminBtn = document.getElementById('profile-mobile-admin-btn');
    if (profileMobileAdminBtn) {
      profileMobileAdminBtn.style.display = (state.currentUser.role === 'admin') ? 'flex' : 'none';
    }

    // Optional ID Card injection (if container exists)
    const idCardContainer = document.getElementById('id-card-container');
    if (idCardContainer) {
      idCardContainer.innerHTML = renderIdCard();
    }
  }

  // --- DASHBOARD SCREEN ---
  function renderDashboard() {
    document.getElementById('dash-welcome-name').textContent = state.currentUser.name.split(' ')[0];
    document.getElementById('dash-stat-points').textContent = state.currentUser.points;
    document.getElementById('dash-stat-streak').textContent = state.streak;

    // Calc summaries
    const lessonsCompletedCount = state.currentUser.userProgress?.completedLessons?.length || 0;
    document.getElementById('dash-summary-courses').textContent = `${lessonsCompletedCount} completed`;
    
    const activeConnections = state.connections.filter(c => 
      (c.from_user_id === state.currentUser.id || c.to_user_id === state.currentUser.id) && c.status === 'accepted'
    ).length;
    document.getElementById('dash-summary-connections').textContent = activeConnections;

    const badgeCount = state.currentUser.badges?.length || 0;
    document.getElementById('dash-summary-badges').textContent = badgeCount;

    // Render Activity Chart (weekly progress)
    const chart = document.getElementById('dashboard-activity-chart');
    chart.innerHTML = '';
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    state.activity.forEach((val, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'chart-bar-wrapper';
      wrapper.innerHTML = `
        <div class="chart-bar" style="height: ${val}%"></div>
        <span class="chart-day">${days[idx]}</span>
      `;
      chart.appendChild(wrapper);
    });

    // Render Connection Suggestions
    renderDashboardSuggestions();
  }

  // Calculate connection score using algorithm matching
  function calculateConnectionScore(userA, userB) {
    if (userA.id === userB.id) return 0;
    
    // 1. Shared skills (40%)
    const sharedSkills = userA.skills.filter(s => userB.skills.includes(s));
    const skillScore = userA.skills.length > 0 ? (sharedSkills.length / Math.max(userA.skills.length, 1)) * 100 : 50;

    // 2. Headline/Interests overlap (30%)
    const sharedInterests = userA.headline.toLowerCase().split(' ').filter(w => 
      w.length > 3 && userB.headline.toLowerCase().includes(w)
    ).length;
    const interestScore = sharedInterests > 0 ? 90 : 40;

    // 3. Location proximity (20%)
    const locA = userA.location.toLowerCase().split(',')[1] || userA.location;
    const locB = userB.location.toLowerCase().split(',')[1] || userB.location;
    const geoScore = locA.trim() === locB.trim() ? 100 : 30;

    // 4. Role complimentary match (10%)
    let roleScore = 50;
    if (userA.role === 'student' && userB.role === 'mentor') roleScore = 100;
    if (userA.role === 'mentor' && userB.role === 'student') roleScore = 100;

    const total = Math.round(skillScore * 0.4 + interestScore * 0.3 + geoScore * 0.2 + roleScore * 0.1);
    return Math.min(total, 100);
  }

  function renderDashboardSuggestions() {
    const list = document.getElementById('dash-suggestions-container');
    list.innerHTML = '';

    // Calculate score for each user
    const suggestions = state.users
      .filter(u => u.id !== state.currentUser.id)
      .map(user => {
        // Check if connection already exists
        const conn = state.connections.find(c => 
          (c.from_user_id === state.currentUser.id && c.to_user_id === user.id) ||
          (c.from_user_id === user.id && c.to_user_id === state.currentUser.id)
        );
        return {
          user,
          score: calculateConnectionScore(state.currentUser, user),
          connStatus: conn ? conn.status : null
        };
      })
      .filter(item => item.connStatus !== 'accepted' && item.connStatus !== 'blocked')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (suggestions.length === 0) {
      list.innerHTML = `<p style="font-size:12px; color:var(--text-muted);">No suggestions available currently.</p>`;
      return;
    }

    suggestions.forEach(item => {
      const div = document.createElement('div');
      div.className = 'user-suggest-item';
      
      const connectBtnHtml = item.connStatus === 'pending'
        ? `<span style="font-size:11px; color:var(--text-muted);"><i class="fas fa-clock"></i> Sent</span>`
        : `<button class="secondary-btn" style="padding: 4px 12px; font-size:11px;" data-id="${item.user.id}">Connect</button>`;

      div.innerHTML = `
        <div class="user-suggest-info">
          <img src="${item.user.avatar}" class="user-suggest-avatar" alt="Avatar">
          <div class="user-suggest-meta">
            <span class="user-suggest-name">${item.user.name}</span>
            <span class="user-suggest-title">${item.user.headline}</span>
            <span class="match-badge">${item.score}% Compatibility</span>
          </div>
        </div>
        ${connectBtnHtml}
      `;
      list.appendChild(div);

      const btn = div.querySelector('button');
      if (btn) {
        btn.onclick = () => sendConnectionRequest(item.user.id, btn);
      }
    });
  }

  function sendConnectionRequest(targetUserId, btnElement) {
    // Check pending limit
    const pendingSentCount = state.connections.filter(c => c.from_user_id === state.currentUser.id && c.status === 'pending').length;
    if (pendingSentCount >= 50) {
      showToast("Limit exceeded: Max 50 pending sent requests allowed.", "danger");
      return;
    }

    // Add request
    state.connections.push({
      from_user_id: state.currentUser.id,
      to_user_id: targetUserId,
      status: "pending",
      created_at: new Date().toISOString()
    });
    
    // Simulate other user receiving request: trigger a mock return request notification system!
    // For high fidelity, if we add Diana, she sends one back after 5 seconds
    setTimeout(() => {
      simulateIncomingConnectionRequest(targetUserId);
    }, 6000);

    saveState();
    
    if (btnElement) {
      btnElement.outerHTML = `<span style="font-size:11px; color:var(--text-muted);"><i class="fas fa-clock"></i> Sent</span>`;
    }
    showToast("Connection request sent!", "success");
    renderDashboard();
  }

  function simulateIncomingConnectionRequest(userId) {
    const user = state.users.find(u => u.id === userId);
    if (!user) return;

    state.connections.push({
      from_user_id: userId,
      to_user_id: state.currentUser.id,
      status: "pending",
      created_at: new Date().toISOString()
    });

    state.notifications.push({
      id: "notif_conn_" + Date.now(),
      type: "connection_request",
      actor_id: userId,
      title: "Connection Request",
      message: `${user.name} sent you a connection request.`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    saveState();
    updateGlobalUserData();
    showToast(`${user.name} sent you a connection request!`, "notify", "#connections");
  }

  // --- COURSES SECTION ---
  function renderCoursesIndex() {
    document.getElementById('courses-index-panel').style.display = 'block';
    document.getElementById('courses-viewer-panel').style.display = 'none';

    const grid = document.getElementById('courses-grid-container');
    grid.innerHTML = '';

    state.courses.forEach(course => {
      // Calc user progress percent
      const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
      const completedList = state.currentUser.userProgress?.completedLessons || [];
      const courseLessons = [];
      course.modules.forEach(m => m.lessons.forEach(l => courseLessons.push(l.id)));
      const completedCourseLessons = courseLessons.filter(lid => completedList.includes(lid)).length;
      
      const percent = totalLessons > 0 ? Math.round((completedCourseLessons / totalLessons) * 100) : 0;

      const card = document.createElement('div');
      card.className = 'glass-panel course-card';
      card.innerHTML = `
        <div class="course-thumbnail">
          ${course.thumbnail}
          <span class="course-card-tag">${course.level.toUpperCase()}</span>
        </div>
        <div class="course-card-content">
          <div>
            <h3 class="course-card-title">${course.title}</h3>
            <p class="course-card-desc">${course.description}</p>
          </div>
          <div>
            <div class="course-card-meta">
              <span><i class="fas fa-user-tie"></i> ${course.instructor_name}</span>
              <span><i class="fas fa-star" style="color:var(--warning);"></i> ${course.avg_rating}</span>
            </div>
            <div class="course-card-footer">
              <div>
                <div style="font-size: 10px; margin-bottom: 2px; color: var(--text-muted);">Progress: ${percent}%</div>
                <div class="course-progress-bar-container">
                  <div class="course-progress-bar" style="width: ${percent}%;"></div>
                </div>
              </div>
              <button class="glow-btn" style="padding: 6px 14px; font-size:12px;" data-id="${course.id}">
                ${percent === 100 ? 'Review' : percent > 0 ? 'Continue' : 'Start'}
              </button>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);

      card.querySelector('button').onclick = () => {
        loadCourseViewer(course.id);
      };
    });
  }

  function loadCourseViewer(courseId) {
    state.activeCourseId = courseId;
    document.getElementById('courses-index-panel').style.display = 'none';
    document.getElementById('courses-viewer-panel').style.display = 'block';

    const course = state.courses.find(c => c.id === courseId);
    document.getElementById('viewer-course-title').textContent = course.title;

    // Load curriculum list
    const list = document.getElementById('viewer-curriculum-container');
    list.innerHTML = '';

    const completedList = state.currentUser.userProgress?.completedLessons || [];

    let firstUncompletedLesson = null;

    course.modules.forEach(mod => {
      const moduleDiv = document.createElement('div');
      moduleDiv.style.marginBottom = '12px';
      moduleDiv.innerHTML = `<div class="course-sidebar-module-title">${mod.title}</div>`;
      
      const lessonsContainer = document.createElement('div');
      lessonsContainer.className = 'course-sidebar-lessons';
      
      mod.lessons.forEach(les => {
        const item = document.createElement('div');
        const isCompleted = completedList.includes(les.id);
        
        if (!isCompleted && !firstUncompletedLesson) {
          firstUncompletedLesson = les;
        }

        item.className = `sidebar-lesson-item ${isCompleted ? 'completed' : ''}`;
        item.innerHTML = `
          <span>${les.title}</span>
          ${isCompleted ? '<i class="fas fa-check-circle"></i>' : '<i class="far fa-circle"></i>'}
        `;
        lessonsContainer.appendChild(item);

        item.onclick = () => selectLesson(les);
      });
      moduleDiv.appendChild(lessonsContainer);
      list.appendChild(moduleDiv);
    });

    // Default to first lesson or first uncompleted
    const defaultLesson = firstUncompletedLesson || course.modules[0].lessons[0];
    if (defaultLesson) {
      selectLesson(defaultLesson);
    }

    // Handle close viewer
    document.getElementById('btn-close-course-viewer').onclick = () => {
      renderCoursesIndex();
    };
  }

  function selectLesson(lesson) {
    state.activeLessonId = lesson.id;
    
    // Mark sidebar item as active
    const items = document.querySelectorAll('.sidebar-lesson-item');
    items.forEach(el => {
      if (el.textContent.trim().startsWith(lesson.title)) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Video config
    const placeholder = document.querySelector('.lesson-video-placeholder');
    const player = document.getElementById('lesson-video-player');
    player.style.display = 'none';
    player.src = lesson.video_url;
    
    const playBtn = document.getElementById('btn-mock-play-video');
    playBtn.style.display = 'flex';
    document.getElementById('video-placeholder-status').textContent = 'Lesson Video Preview (Click to Play)';
    
    playBtn.onclick = () => {
      playBtn.style.display = 'none';
      player.style.display = 'block';
      player.play();
    };

    // Article Content
    document.getElementById('lesson-detail-title').textContent = lesson.title;
    document.getElementById('lesson-detail-body').innerHTML = lesson.content;

    // Resources download triggers
    const resList = document.getElementById('lesson-resources-list');
    resList.innerHTML = '';
    lesson.resources.forEach(res => {
      const a = document.createElement('a');
      a.className = 'secondary-btn';
      a.style.fontSize = '12px';
      a.style.padding = '6px 12px';
      a.innerHTML = `<i class="fas ${res.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-code'}"></i> ${res.title}`;
      a.href = '#';
      a.onclick = (e) => {
        e.preventDefault();
        showToast(`Downloaded asset: ${res.title}`, "success");
      };
      resList.appendChild(a);
    });

    // Render Quiz Form
    renderLessonQuiz(lesson);
  }

  function renderLessonQuiz(lesson) {
    const qtext = document.getElementById('quiz-question-text');
    const container = document.getElementById('quiz-options-container');
    const feedback = document.getElementById('quiz-feedback-banner');
    const submitBtn = document.getElementById('btn-submit-quiz');
    const nextBtn = document.getElementById('btn-next-lesson');

    feedback.style.display = 'none';
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'inline-block';
    
    qtext.textContent = lesson.quiz.question;
    container.innerHTML = '';

    // Check if user already passed this quiz
    const completedList = state.currentUser.userProgress?.completedLessons || [];
    const alreadyPassed = completedList.includes(lesson.id);

    lesson.quiz.options.forEach((opt, idx) => {
      const li = document.createElement('li');
      li.className = 'quiz-option-item';
      li.textContent = opt;
      
      if (alreadyPassed && idx === lesson.quiz.correctIndex) {
        li.classList.add('correct');
      }

      container.appendChild(li);

      if (!alreadyPassed) {
        li.onclick = () => {
          Array.from(container.children).forEach(el => el.classList.remove('selected'));
          li.classList.add('selected');
        };
      }
    });

    if (alreadyPassed) {
      submitBtn.style.display = 'none';
      feedback.style.display = 'block';
      feedback.style.color = 'var(--success)';
      feedback.innerHTML = '<i class="fas fa-check-circle"></i> Already completed! +25 quiz points earned.';
      checkCourseCompletionStatus();
    }

    submitBtn.onclick = () => {
      const selected = container.querySelector('.quiz-option-item.selected');
      if (!selected) {
        showToast("Please select an answer option.", "warning");
        return;
      }

      const selectedIndex = Array.from(container.children).indexOf(selected);
      const isCorrect = selectedIndex === lesson.quiz.correctIndex;

      selected.classList.remove('selected');

      if (isCorrect) {
        selected.classList.add('correct');
        feedback.style.display = 'block';
        feedback.style.color = 'var(--success)';
        feedback.innerHTML = '<i class="fas fa-check-circle"></i> Correct! +35 points awarded (+10 for lesson, +25 for quiz).';
        
        submitBtn.style.display = 'none';

        // Add to completed state
        if (!state.currentUser.userProgress) {
          state.currentUser.userProgress = { completedLessons: [] };
        }
        if (!state.currentUser.userProgress.completedLessons.includes(lesson.id)) {
          state.currentUser.userProgress.completedLessons.push(lesson.id);
        }

        // Award points
        state.currentUser.points += 35;
        
        // Save and update Sidebar user quick stats
        db.collection('users').doc(state.currentUser.id).set(state.currentUser);
        updateGlobalUserData();
        
        // Trigger unlocks check
        checkBadgeUnlocks();

        // Check if course completed
        checkCourseCompletionStatus();

      } else {
        selected.classList.add('wrong');
        feedback.style.display = 'block';
        feedback.style.color = 'var(--danger)';
        feedback.innerHTML = '<i class="fas fa-times-circle"></i> Incorrect. Try again!';
      }
    };
  }

  function checkCourseCompletionStatus() {
    const course = state.courses.find(c => c.id === state.activeCourseId);
    const completedList = state.currentUser.userProgress?.completedLessons || [];
    const courseLessons = [];
    course.modules.forEach(m => m.lessons.forEach(l => courseLessons.push(l.id)));
    const allDone = courseLessons.every(lid => completedList.includes(lid));

    if (allDone) {
      // Append certificate generator button if not already present
      const box = document.getElementById('lesson-quiz-box');
      if (!box.querySelector('#btn-generate-cert')) {
        const certBtn = document.createElement('button');
        certBtn.id = 'btn-generate-cert';
        certBtn.className = 'glow-btn';
        certBtn.style.marginTop = '16px';
        certBtn.style.width = '100%';
        certBtn.innerHTML = '<i class="fas fa-award"></i> Generate Course Certificate';
        box.appendChild(certBtn);
        
        certBtn.onclick = () => renderCertificateModal(course);
      }
    }
  }

  function renderCertificateModal(course) {
    const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = "CERT-EDCO-" + Math.floor(100000 + Math.random() * 900000);
    
    // SVG dynamic certificate vector representation
    const svgCert = `
      <svg width="500" height="350" viewBox="0 0 500 350" fill="none" xmlns="http://www.w3.org/2000/svg" style="border: 2px solid var(--primary); border-radius:8px; background:hsl(222, 47%, 5%);">
        <!-- Border details -->
        <rect x="15" y="15" width="470" height="320" rx="4" stroke="url(#accentGlow)" stroke-width="2"/>
        <rect x="22" y="22" width="456" height="306" rx="2" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        
        <!-- Text details -->
        <text x="250" y="70" fill="white" font-family="'Outfit', sans-serif" font-weight="800" font-size="20" text-anchor="middle">EDWORLD CO CERTIFICATE</text>
        <text x="250" y="90" fill="rgba(255,255,255,0.4)" font-family="'Inter', sans-serif" font-size="10" text-anchor="middle" letter-spacing="1.5">OF COURSE COMPLETION</text>
        
        <text x="250" y="145" fill="rgba(255,255,255,0.6)" font-family="'Inter', sans-serif" font-size="12" text-anchor="middle">This certifies that</text>
        <text x="250" y="180" fill="url(#primaryGlow)" font-family="'Outfit', sans-serif" font-weight="700" font-size="24" text-anchor="middle">${state.currentUser.name}</text>
        
        <text x="250" y="220" fill="rgba(255,255,255,0.6)" font-family="'Inter', sans-serif" font-size="12" text-anchor="middle">has successfully completed all requirements for</text>
        <text x="250" y="245" fill="white" font-family="'Outfit', sans-serif" font-weight="600" font-size="16" text-anchor="middle">${course.title}</text>
        
        <text x="250" y="285" fill="rgba(255,255,255,0.4)" font-family="'Inter', sans-serif" font-size="10" text-anchor="middle">Awarded: ${dateStr}</text>
        <text x="250" y="300" fill="rgba(255,255,255,0.3)" font-family="'Inter', sans-serif" font-size="8" text-anchor="middle">Certificate ID: ${certId}</text>

        <!-- Gradients -->
        <defs>
          <linearGradient id="primaryGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="hsl(180, 100%, 50%)"/>
            <stop offset="100%" stop-color="hsl(260, 100%, 70%)"/>
          </linearGradient>
          <linearGradient id="accentGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="hsl(180, 100%, 50%)"/>
            <stop offset="100%" stop-color="hsl(320, 100%, 60%)"/>
          </linearGradient>
        </defs>
      </svg>
    `;

    const modalHtml = `
      <div class="certificate-modal">
        <h2 style="font-size:24px; margin-bottom:8px;"><i class="fas fa-medal" style="color:var(--warning);"></i> Course Completed!</h2>
        <p style="font-size:13px; color:var(--text-secondary);">Here is your dynamic achievement credential. Print it or save your credential.</p>
        <div class="cert-svg-container" id="printable-cert-area">
          ${svgCert}
        </div>
        <div style="display:flex; gap:12px; justify-content:center; margin-top:20px;">
          <button class="glow-btn" id="btn-print-certificate"><i class="fas fa-print"></i> Print PDF</button>
          <button class="secondary-btn" id="btn-close-cert-modal">Close</button>
        </div>
      </div>
    `;

    openModal(modalHtml);

    document.getElementById('btn-close-cert-modal').onclick = closeModal;
    document.getElementById('btn-print-certificate').onclick = () => {
      // Simple mockup print logic
      showToast("Triggered system print alignment. Certificate saved!", "success");
    };
  }

  // Check and award gamified badges
  function checkBadgeUnlocks() {
    if (!state.currentUser.badges) {
      state.currentUser.badges = [];
    }

    const completedList = state.currentUser.userProgress?.completedLessons || [];
    
    // 1. Course Completer (1+ completed lessons)
    if (completedList.length >= 1 && !state.currentUser.badges.includes("course_completer")) {
      unlockBadge("course_completer");
    }

    // 2. Python Master (completed all python lessons)
    const pyCourse = state.courses.find(c => c.id === 'course_python');
    const pyLessons = [];
    pyCourse.modules.forEach(m => m.lessons.forEach(l => pyLessons.push(l.id)));
    const pyDone = pyLessons.every(lid => completedList.includes(lid));
    if (pyDone && !state.currentUser.badges.includes("python_master")) {
      unlockBadge("python_master");
    }

    // 3. Lifelong Learner (300+ total points)
    if (state.currentUser.points >= 300 && !state.currentUser.badges.includes("lifelong_learner")) {
      unlockBadge("lifelong_learner");
    }
  }

  async function unlockBadge(badgeId) {
    state.currentUser.badges.push(badgeId);
    // Award +50 points
    state.currentUser.points += 50;

    // Seed achievement notification
    const badge = state.badges[badgeId];
    const notifId = "notif_badge_" + badgeId + "_" + Date.now();
    await db.collection('notifications').doc(notifId).set({
      id: notifId,
      recipient_id: state.currentUser.id,
      type: "achievement",
      actor_id: "system",
      title: "Badge Unlocked! 🎉",
      message: `Earned '${badge.name}' badge! +50 achievement points awarded.`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    await db.collection('users').doc(state.currentUser.id).set(state.currentUser);
    updateGlobalUserData();
    
    showToast(`🎉 Unlocked Badge: ${badge.name}!`, "success", "#profile");
  }

  // --- PORTFOLIO PROJECT SHOWCASE ---
  function renderProjectsGrid() {
    const grid = document.getElementById('projects-grid-container');
    grid.innerHTML = '';

    state.projects.forEach(proj => {
      const isLiked = proj.liked_by.includes(state.currentUser.id);

      const card = document.createElement('div');
      card.className = 'glass-panel project-card';
      card.innerHTML = `
        <div class="project-card-image">
          ${proj.thumbnail}
        </div>
        <div class="project-card-content">
          <div>
            <h3 class="project-card-title">${proj.title}</h3>
            <p class="project-card-desc">${proj.description}</p>
            <div class="project-techs">
              ${proj.technologies.map(t => `<span class="project-tech-tag">${t}</span>`).join('')}
            </div>
          </div>
          <div>
            <div class="project-stats-row">
              <div class="project-stats-left">
                <span class="project-stat-item btn-like-project" data-id="${proj.id}" style="${isLiked ? 'color: var(--accent);' : ''}">
                  <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> <span>${proj.likes_count}</span>
                </span>
                <span class="project-stat-item">
                  <i class="far fa-comment"></i> <span>${proj.comments.length}</span>
                </span>
              </div>
              <span class="project-action-link view-details-link" data-id="${proj.id}" style="cursor:pointer;">View Details <i class="fas fa-chevron-right" style="font-size:10px;"></i></span>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);

      // Bind details link
      card.querySelector('.view-details-link').onclick = () => {
        openProjectDetailsModal(proj);
      };

      // Bind like toggle
      card.querySelector('.btn-like-project').onclick = () => {
        toggleProjectLike(proj);
      };
    });
  }

  function toggleProjectLike(proj) {
    const idx = proj.liked_by.indexOf(state.currentUser.id);
    if (idx === -1) {
      proj.liked_by.push(state.currentUser.id);
      proj.likes_count++;
      showToast("Project liked!", "success");
    } else {
      proj.liked_by.splice(idx, 1);
      proj.likes_count--;
    }
    saveState();
    renderProjectsGrid();
  }

  function openProjectDetailsModal(proj) {
    const commentsListHtml = proj.comments.map(c => `
      <div class="comment-item">
        <img src="${c.author_avatar}" class="comment-avatar" alt="Avatar">
        <div class="comment-body">
          <div class="comment-author-row">
            <span class="comment-author">${c.author_name}</span>
            <span class="comment-date">${c.created_at.includes('T') ? formatTime(c.created_at) : c.created_at}</span>
          </div>
          <div class="comment-text">${c.content}</div>
        </div>
      </div>
    `).join('');

    const modalHtml = `
      <div class="project-upload-modal" style="width:700px;">
        <h2 style="font-size:24px; margin-bottom:4px;">${proj.title}</h2>
        <p style="color:var(--text-muted); font-size:12px; margin-bottom:16px;">Created by ${proj.creator_name}</p>
        
        <div class="project-detail-layout">
          <div class="project-detail-left">
            <div class="project-large-banner">
              ${proj.thumbnail}
            </div>
            
            <h3 style="font-size:15px; margin-top:16px;">Project Features</h3>
            <ul style="padding-left:20px; font-size:13px; color:var(--text-secondary);">
              ${proj.features.map(f => `<li>${f}</li>`).join('')}
            </ul>

            <div class="project-detail-comments">
              <h3 style="font-size:15px; margin-bottom:12px;">Comments (${proj.comments.length})</h3>
              
              <div class="comment-composer">
                <textarea class="comment-textarea" id="project-comment-input" placeholder="Ask a question or leave feedback on this implementation..."></textarea>
                <div style="display:flex; justify-content:flex-end;">
                  <button class="glow-btn" id="btn-submit-project-comment" style="padding:6px 14px; font-size:12px;">Post Comment</button>
                </div>
              </div>

              <div class="comment-thread-list">
                ${commentsListHtml || '<p style="font-size:12px; color:var(--text-muted);">No comments yet.</p>'}
              </div>
            </div>
          </div>

          <div class="project-detail-right">
            <div class="glass-panel" style="padding:16px; display:flex; flex-direction:column; gap:12px;">
              <a href="${proj.github_url}" target="_blank" class="glow-btn" style="text-align:center; display:block; text-decoration:none; color:black;"><i class="fab fa-github"></i> Repository Code</a>
              <a href="${proj.live_url}" target="_blank" class="secondary-btn" style="text-align:center; display:block;"><i class="fas fa-external-link-alt"></i> Live Demo</a>
            </div>

            <div class="glass-panel" style="padding:16px;">
              <h4 style="font-size:13px; margin-bottom:8px;">Stack</h4>
              <div class="project-techs" style="margin:0;">
                ${proj.technologies.map(t => `<span class="project-tech-tag">${t}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    openModal(modalHtml);

    // Comment submission
    document.getElementById('btn-submit-project-comment').onclick = () => {
      const val = document.getElementById('project-comment-input').value.trim();
      if (!val) {
        showToast("Comment content cannot be blank.", "warning");
        return;
      }

      proj.comments.push({
        id: "comment_" + Date.now(),
        author_id: state.currentUser.id,
        author_name: state.currentUser.name,
        author_avatar: state.currentUser.avatar,
        content: val,
        created_at: new Date().toISOString()
      });

      // Award comment points
      state.currentUser.points += 5;
      
      saveState();
      updateGlobalUserData();
      
      showToast("Comment posted! +5 points awarded.", "success");
      
      // Refresh modal
      closeModal();
      setTimeout(() => openProjectDetailsModal(proj), 100);
      renderProjectsGrid();
    };
  }

  // Project Creation Setup
  document.getElementById('btn-trigger-upload-project').onclick = () => {
    const modalHtml = `
      <div class="project-upload-modal">
        <h2 style="font-size:22px; margin-bottom:4px;">Publish Showcase Project</h2>
        <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">Share your hard work with the EdWorld Co community and earn +100 points!</p>
        
        <form id="project-upload-form" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="proj-title">Project Title</label>
            <input type="text" id="proj-title" class="form-input" placeholder="e.g. Real-Time Chat Engine" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-desc">Short Description (max 120 chars)</label>
            <input type="text" id="proj-desc" class="form-input" placeholder="e.g. Real-time Node.js chat utilizing Websockets." required maxlength="120">
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-tech">Technologies (comma-separated)</label>
            <input type="text" id="proj-tech" class="form-input" placeholder="e.g. React, Node.js, Socket.io" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-github">GitHub Repository URL</label>
            <input type="url" id="proj-github" class="form-input" placeholder="https://github.com/user/repo" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-live">Live Demo URL</label>
            <input type="url" id="proj-live" class="form-input" placeholder="https://demo.com" required>
          </div>
          
          <button type="submit" class="glow-btn" style="margin-top:10px; width:100%;">Publish Showcase <i class="fas fa-cloud-upload-alt"></i></button>
        </form>
      </div>
    `;

    openModal(modalHtml);

    document.getElementById('project-upload-form').onsubmit = (e) => {
      e.preventDefault();
      
      const title = document.getElementById('proj-title').value.trim();
      const desc = document.getElementById('proj-desc').value.trim();
      const tech = document.getElementById('proj-tech').value.split(',').map(s => s.trim()).filter(Boolean);
      const github = document.getElementById('proj-github').value.trim();
      const live = document.getElementById('proj-live').value.trim();

      // Icon thumbnails pool
      const thumbs = ["💻", "🚀", "📊", "⚙️", "🔒", "🎨", "📱"];
      const thumb = thumbs[Math.floor(Math.random() * thumbs.length)];

      state.projects.push({
        id: "project_" + Date.now(),
        title,
        description: desc,
        creator_id: state.currentUser.id,
        creator_name: state.currentUser.name,
        creator_avatar: state.currentUser.avatar,
        thumbnail: thumb,
        github_url: github,
        live_url: live,
        technologies: tech,
        features: ["Fully modular codebase", "Responsive design layout", "Configured environment settings"],
        views_count: 1,
        likes_count: 0,
        liked_by: [],
        created_at: new Date().toISOString(),
        comments: []
      });

      // Award project points
      state.currentUser.points += 100;
      
      // Award badge if first project
      if (!state.currentUser.badges.includes("first_project")) {
        unlockBadge("first_project");
      }

      saveState();
      updateGlobalUserData();
      closeModal();
      
      showToast("Project successfully published to showcase! +100 points.", "success");
      renderProjectsGrid();
    };
  };

  // --- CONNECTIONS SECTION ---
  let connectionsActiveTab = 'active';

  function renderConnectionsView() {
    renderConnectionsList();
    renderRecommendedCarousel();

    // Bind filters
    document.getElementById('filter-connect-role').onchange = renderConnectionsList;
    document.getElementById('filter-connect-skill').onchange = renderConnectionsList;

    // Tabs
    document.getElementById('btn-tab-active-connections').onclick = () => {
      toggleConnectionsTab('active');
    };
    document.getElementById('btn-tab-pending-connections').onclick = () => {
      toggleConnectionsTab('pending');
    };
    document.getElementById('btn-tab-blocked-users').onclick = () => {
      toggleConnectionsTab('blocked');
    };
  }

  function toggleConnectionsTab(tabName) {
    connectionsActiveTab = tabName;
    
    document.getElementById('btn-tab-active-connections').className = `tab-btn ${tabName === 'active' ? 'active' : ''}`;
    document.getElementById('btn-tab-pending-connections').className = `tab-btn ${tabName === 'pending' ? 'active' : ''}`;
    document.getElementById('btn-tab-blocked-users').className = `tab-btn ${tabName === 'blocked' ? 'active' : ''}`;

    renderConnectionsList();
  }

  function renderRecommendedCarousel() {
    const track = document.getElementById('connect-suggestions-track');
    track.innerHTML = '';

    const suggestions = state.users
      .filter(u => u.id !== state.currentUser.id)
      .map(user => {
        const conn = state.connections.find(c => 
          (c.from_user_id === state.currentUser.id && c.to_user_id === user.id) ||
          (c.from_user_id === user.id && c.to_user_id === state.currentUser.id)
        );
        return {
          user,
          score: calculateConnectionScore(state.currentUser, user),
          connStatus: conn ? conn.status : null
        };
      })
      .filter(item => item.score > 70 && !item.connStatus)
      .sort((a, b) => b.score - a.score);

    if (suggestions.length === 0) {
      track.innerHTML = `<p style="font-size:12px; color:var(--text-muted); margin-left: 20px;">No recommended mentors matching criteria score > 70 currently.</p>`;
      return;
    }

    suggestions.forEach(item => {
      const card = document.createElement('div');
      card.className = 'glass-panel suggested-full-card';
      card.innerHTML = `
        <img src="${item.user.avatar}" class="suggested-card-avatar" alt="Avatar">
        <div>
          <div class="suggested-card-name">${item.user.name}</div>
          <div class="suggested-card-role">${item.user.headline}</div>
        </div>
        <div class="suggested-card-score"><i class="fas fa-sparkles"></i> ${item.score}% Match</div>
        <div class="suggested-card-skills">
          ${item.user.skills.map(s => `<span class="suggested-card-skill-tag">${s}</span>`).join('')}
        </div>
        <button class="glow-btn" style="padding: 6px 16px; font-size:11px; margin-top:8px;" data-id="${item.user.id}">Connect</button>
      `;
      track.appendChild(card);

      card.querySelector('button').onclick = (e) => {
        sendConnectionRequest(item.user.id, e.target);
      };
    });
  }

  function renderConnectionsList() {
    const grid = document.getElementById('connections-list-grid');
    grid.innerHTML = '';

    const roleFilter = document.getElementById('filter-connect-role').value;
    const skillFilter = document.getElementById('filter-connect-skill').value;

    let filteredUsers = state.users.filter(u => u.id !== state.currentUser.id);

    // Apply role and skill filters
    if (roleFilter !== 'all') {
      filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
    }
    if (skillFilter !== 'all') {
      filteredUsers = filteredUsers.filter(u => u.skills.includes(skillFilter));
    }

    // Now filter by connection active tab status
    const targetStatus = connectionsActiveTab === 'active' ? 'accepted' : connectionsActiveTab;
    
    let activeConnectionsList = [];

    filteredUsers.forEach(user => {
      const conn = state.connections.find(c => 
        (c.from_user_id === state.currentUser.id && c.to_user_id === user.id) ||
        (c.from_user_id === user.id && c.to_user_id === state.currentUser.id)
      );

      if (conn && conn.status === targetStatus) {
        // For pending, check directionality
        let isRequester = conn.from_user_id === state.currentUser.id;
        activeConnectionsList.push({ user, conn, isRequester });
      }
    });

    document.getElementById('connect-results-count').textContent = `Found ${activeConnectionsList.length} user(s)`;

    if (activeConnectionsList.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; font-size:13px; color:var(--text-muted); padding:32px;">No connections found in this list category.</p>`;
      return;
    }

    activeConnectionsList.forEach(item => {
      const card = document.createElement('div');
      card.className = 'glass-panel connection-list-card';
      
      let actionButtons = '';

      if (connectionsActiveTab === 'active') {
        actionButtons = `
          <div class="connection-actions-row">
            <button class="connection-action-icon-btn chat-shortcut" data-id="${item.user.id}" title="Send Direct Message"><i class="far fa-comment-alt"></i></button>
            <button class="connection-action-icon-btn decline unconnect-btn" data-id="${item.user.id}" title="Remove Connection"><i class="fas fa-user-minus"></i></button>
          </div>
        `;
      } else if (connectionsActiveTab === 'pending') {
        if (item.isRequester) {
          actionButtons = `<span style="font-size:12px; color:var(--text-muted);"><i class="fas fa-clock"></i> Sent Request</span>`;
        } else {
          actionButtons = `
            <div class="connection-actions-row">
              <button class="connection-action-icon-btn accept accept-btn" data-id="${item.user.id}" title="Accept Request"><i class="fas fa-check"></i></button>
              <button class="connection-action-icon-btn decline decline-btn" data-id="${item.user.id}" title="Decline Request"><i class="fas fa-times"></i></button>
            </div>
          `;
        }
      } else if (connectionsActiveTab === 'blocked') {
        actionButtons = `<button class="secondary-btn unblock-btn" style="padding:4px 10px; font-size:11px;" data-id="${item.user.id}">Unblock</button>`;
      }

      card.innerHTML = `
        <div class="connection-list-info">
          <img src="${item.user.avatar}" class="connection-list-avatar" alt="Avatar">
          <div class="connection-list-details">
            <span class="connection-list-name">${item.user.name}</span>
            <span class="connection-list-title">${item.user.headline}</span>
          </div>
        </div>
        ${actionButtons}
      `;
      grid.appendChild(card);

      // Bind buttons
      if (connectionsActiveTab === 'active') {
        card.querySelector('.chat-shortcut').onclick = () => {
          state.activeChatUserId = item.user.id;
          window.location.hash = '#messages';
        };
        card.querySelector('.unconnect-btn').onclick = () => removeConnection(item.user.id);
      } else if (connectionsActiveTab === 'pending' && !item.isRequester) {
        card.querySelector('.accept-btn').onclick = () => acceptConnectionRequest(item.user.id);
        card.querySelector('.decline-btn').onclick = () => declineConnectionRequest(item.user.id);
      } else if (connectionsActiveTab === 'blocked') {
        card.querySelector('.unblock-btn').onclick = () => unblockUser(item.user.id);
      }
    });
  }

  function acceptConnectionRequest(targetUserId) {
    const conn = state.connections.find(c => 
      c.from_user_id === targetUserId && c.to_user_id === state.currentUser.id && c.status === 'pending'
    );
    if (conn) {
      conn.status = 'accepted';
      conn.accepted_at = new Date().toISOString();
      
      // Award networking points
      state.currentUser.points += 15;

      // Unlocks check
      const acceptedCount = state.connections.filter(c => 
        (c.from_user_id === state.currentUser.id || c.to_user_id === state.currentUser.id) && c.status === 'accepted'
      ).length;
      if (acceptedCount >= 5 && !state.currentUser.badges.includes("connector")) {
        unlockBadge("connector");
      }

      saveState();
      updateGlobalUserData();
      showToast("Connection Request Accepted! +15 points.", "success");
      renderConnectionsView();
    }
  }

  function declineConnectionRequest(targetUserId) {
    state.connections = state.connections.filter(c => 
      !(c.from_user_id === targetUserId && c.to_user_id === state.currentUser.id && c.status === 'pending')
    );
    saveState();
    showToast("Connection request declined.", "info");
    renderConnectionsView();
  }

  function removeConnection(targetUserId) {
    state.connections = state.connections.filter(c => 
      !((c.from_user_id === state.currentUser.id && c.to_user_id === targetUserId && c.status === 'accepted') ||
        (c.from_user_id === targetUserId && c.to_user_id === state.currentUser.id && c.status === 'accepted'))
    );
    saveState();
    showToast("Connection removed.", "info");
    renderConnectionsView();
  }

  function unblockUser(targetUserId) {
    state.connections = state.connections.filter(c => 
      !((c.from_user_id === state.currentUser.id && c.to_user_id === targetUserId && c.status === 'blocked') ||
        (c.from_user_id === targetUserId && c.to_user_id === state.currentUser.id && c.status === 'blocked'))
    );
    saveState();
    showToast("User unblocked.", "success");
    renderConnectionsView();
  }

  // --- REAL-TIME MESSAGING ---
  function renderMessagesView() {
    renderConversationsList();
    renderActiveChatPane();

    document.getElementById('chat-sidebar-search').oninput = renderConversationsList;
  }

  function renderConversationsList() {
    const list = document.getElementById('chat-conversation-list');
    list.innerHTML = '';

    const query = document.getElementById('chat-sidebar-search').value.toLowerCase();

    // Find all users we have connection 'accepted' status with
    const connectionUsers = state.users.filter(u => {
      if (u.id === state.currentUser.id) return false;
      
      const conn = state.connections.find(c => 
        (c.from_user_id === state.currentUser.id && c.to_user_id === u.id && c.status === 'accepted') ||
        (c.from_user_id === u.id && c.to_user_id === state.currentUser.id && c.status === 'accepted')
      );
      return !!conn;
    });

    const matches = connectionUsers.filter(u => u.name.toLowerCase().includes(query));

    if (matches.length === 0) {
      list.innerHTML = `<p style="padding:16px; font-size:12px; color:var(--text-muted); text-align:center;">No chat connections found.</p>`;
      return;
    }

    matches.forEach(user => {
      const activeClass = state.activeChatUserId === user.id ? 'active' : '';

      // Get last message info
      const chatLogs = state.messages.filter(m => 
        (m.sender_id === state.currentUser.id && m.recipient_id === user.id) ||
        (m.sender_id === user.id && m.recipient_id === state.currentUser.id)
      ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      const lastMsg = chatLogs[chatLogs.length - 1];
      const preview = lastMsg ? lastMsg.content : "Start a conversation...";
      const timeStr = lastMsg ? formatTime(lastMsg.created_at) : '';

      const unreadCount = chatLogs.filter(m => m.recipient_id === state.currentUser.id && !m.is_read).length;

      const item = document.createElement('div');
      item.className = `conversation-item ${activeClass}`;
      item.innerHTML = `
        <div class="conversation-avatar">
          <img src="${user.avatar}" class="conversation-avatar-img" alt="Avatar">
          <span class="online-dot"></span>
        </div>
        <div class="conversation-item-info">
          <div class="conversation-item-header">
            <span class="conversation-item-name">${user.name}</span>
            <span class="conversation-item-time">${timeStr}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="conversation-item-preview">${preview}</span>
            ${unreadCount > 0 ? `<span class="conversation-item-unread-count">${unreadCount}</span>` : ''}
          </div>
        </div>
      `;
      list.appendChild(item);

      item.onclick = () => {
        state.activeChatUserId = user.id;
        
        // Mark messages as read
        chatLogs.forEach(m => {
          if (m.recipient_id === state.currentUser.id) {
            m.is_read = true;
          }
        });
        saveState();
        updateGlobalUserData();
        
        renderMessagesView();
      };
    });
  }

  function renderActiveChatPane() {
    const empty = document.getElementById('chat-empty-state');
    const active = document.getElementById('chat-active-panel');

    if (!state.activeChatUserId) {
      empty.style.display = 'flex';
      active.style.display = 'none';
      return;
    }

    empty.style.display = 'none';
    active.style.display = 'flex';

    const recipient = state.users.find(u => u.id === state.activeChatUserId);
    document.getElementById('chat-header-name').textContent = recipient.name;
    document.getElementById('chat-header-avatar').src = recipient.avatar;

    // Chat delete
    document.getElementById('btn-delete-conversation').onclick = () => {
      state.messages = state.messages.filter(m => 
        !((m.sender_id === state.currentUser.id && m.recipient_id === recipient.id) ||
          (m.sender_id === recipient.id && m.recipient_id === state.currentUser.id))
      );
      state.activeChatUserId = null;
      saveState();
      renderMessagesView();
      showToast("Chat log cleared.", "info");
    };

    // Render thread bubbles
    const thread = document.getElementById('chat-messages-thread');
    thread.innerHTML = '';

    const logs = state.messages.filter(m => 
      (m.sender_id === state.currentUser.id && m.recipient_id === recipient.id) ||
      (m.sender_id === recipient.id && m.recipient_id === state.currentUser.id)
    ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    logs.forEach(msg => {
      const isMine = msg.sender_id === state.currentUser.id;
      const row = document.createElement('div');
      row.className = `message-bubble-row ${isMine ? 'mine' : 'other'}`;
      
      const reactionsHtml = Object.entries(msg.reactions || {}).map(([emoji, users]) => `
        <span class="reaction-tag toggle-react-btn" data-emoji="${emoji}" data-msg="${msg.id}">
          ${emoji} <span>${users.length}</span>
        </span>
      `).join('');

      row.innerHTML = `
        <img src="${isMine ? state.currentUser.avatar : recipient.avatar}" class="message-bubble-avatar" alt="Avatar">
        <div class="message-bubble-content-wrapper">
          <div class="message-bubble">
            ${msg.content}
          </div>
          <div class="message-bubble-meta">
            <span>${formatTime(msg.created_at)}</span>
            ${isMine ? (msg.is_read ? '<i class="fas fa-check-double" style="color:var(--primary);"></i>' : '<i class="fas fa-check"></i>') : ''}
          </div>
          <div class="message-reactions">
            ${reactionsHtml}
          </div>
        </div>
      `;
      thread.appendChild(row);

      // Bind existing reaction tags
      row.querySelectorAll('.toggle-react-btn').forEach(btn => {
        btn.onclick = () => {
          const emo = btn.getAttribute('data-emoji');
          toggleMessageReaction(msg.id, emo);
        };
      });
    });

    // Scroll to bottom
    thread.scrollTop = thread.scrollHeight;

    // Emoji Drawer trigger
    const emojiDrawer = document.getElementById('chat-emoji-drawer');
    document.getElementById('btn-toggle-emoji').onclick = () => {
      emojiDrawer.classList.toggle('active');
    };

    // Bind emoji clicks
    Array.from(emojiDrawer.children).forEach(el => {
      el.onclick = () => {
        emojiDrawer.classList.remove('active');
        if (logs.length > 0) {
          const lastMsg = logs[logs.length - 1];
          toggleMessageReaction(lastMsg.id, el.textContent);
        } else {
          // Send emoji as message
          sendChatMessage(el.textContent);
        }
      };
    });

    // File Upload simulate
    document.getElementById('btn-chat-file-upload').onclick = () => {
      const url = "gs://edworld/workspace/attachments/" + Math.floor(Math.random()*10000) + ".pdf";
      sendChatMessage(`Uploaded File Attachment: <a href='#' onclick='return false;' style='text-decoration:underline;'><i class='fas fa-file-pdf'></i> ${url.split('/').pop()}</a>`);
    };

    // Send Button click
    const input = document.getElementById('chat-message-input');
    
    // Auto grow textarea size
    input.oninput = () => {
      input.style.height = '24px';
      input.style.height = input.scrollHeight + 'px';
    };

    document.getElementById('btn-send-message').onclick = () => {
      const val = input.value.trim();
      if (!val) return;
      sendChatMessage(val);
      input.value = '';
      input.style.height = '24px';
    };

    input.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('btn-send-message').click();
      }
    };
  }

  function sendChatMessage(text) {
    const recipientId = state.activeChatUserId;
    const msgId = "msg_" + Date.now();
    
    state.messages.push({
      id: msgId,
      sender_id: state.currentUser.id,
      recipient_id: recipientId,
      content: text,
      created_at: new Date().toISOString(),
      is_read: false,
      reactions: {}
    });

    saveState();
    renderMessagesView();

    // Trigger typing indicator and OpenRouter / Mock response bot logic!
    const indicator = document.getElementById('chat-typing-indicator');
    const recipient = state.users.find(u => u.id === recipientId);
    if (!recipient) return;
    
    setTimeout(() => {
      if (state.activeChatUserId === recipientId) {
        document.getElementById('chat-typing-text').textContent = `${recipient.name} is typing`;
        indicator.style.visibility = 'visible';
        
        // Scroll bottom
        const thread = document.getElementById('chat-messages-thread');
        if (thread) thread.scrollTop = thread.scrollHeight;
      }
 
      setTimeout(async () => {
        if (indicator) indicator.style.visibility = 'hidden';
        
        let reply = "I would love to help you build out that functionality soon! Let me review the spec details.";
        const lowercase = text.toLowerCase();
        
        if (lowercase.includes('python')) {
          reply = "For Python, check out Module 2 variables inside the courses page. I posted some setup guides there.";
        } else if (lowercase.includes('project') || lowercase.includes('portfolio')) {
          reply = "Sounds cool! Post the GitHub repository link to the Portfolio Workspace so we can comment and debug it together.";
        } else if (lowercase.includes('meet') || lowercase.includes('schedule')) {
          reply = "Let's schedule a study session this Friday at 4 PM. We can review modules and quiz solutions.";
        }

        const config = getOpenRouterConfig();
        const isMentor = recipient.role === 'mentor';

        if (isMentor && config.apiKey) {
          try {
            // Get last 10 messages for context
            const threadMessages = state.messages
              .filter(m => (m.sender_id === state.currentUser.id && m.recipient_id === recipientId) ||
                           (m.sender_id === recipientId && m.recipient_id === state.currentUser.id))
              .sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
              .slice(-10)
              .map(m => ({
                role: m.sender_id === state.currentUser.id ? 'user' : 'assistant',
                content: m.content
              }));

            const systemPrompt = `You are a helpful and experienced professional AI Mentor named ${recipient.name} on the EdWorld Co platform.
Your professional background: "${recipient.headline || 'Industry Professional'}".
Your biography: "${recipient.bio || 'Experienced mentor helping students succeed.'}".
The user's name is ${state.currentUser.name} and their headline is "${state.currentUser.headline || 'Student Learner'}".
Respond to the user's message in a professional, encouraging, and mentorship-oriented tone.
Keep the response concise (2-4 sentences) and highly relevant to their profile or career queries. Do not mention that you are an AI or language model.`;

            reply = await fetchOpenRouterCompletion(threadMessages, systemPrompt);
          } catch (err) {
            console.error('[OpenRouter Mentor Error]', err);
            reply = `*(AI Fallback)* ${reply}`;
          }
        } else if (isMentor) {
          // Notify user to setup key
          ensureOpenRouterKey();
        }

        state.messages.push({
          id: "msg_bot_" + Date.now(),
          sender_id: recipientId,
          recipient_id: state.currentUser.id,
          content: reply,
          created_at: new Date().toISOString(),
          is_read: state.activeChatUserId === recipientId, // if active, mark read
          reactions: {}
        });
 
        // If not active chat screen, push global notification bell trigger
        if (state.activeChatUserId !== recipientId) {
          state.notifications.push({
            id: "notif_msg_" + Date.now(),
            type: "message",
            actor_id: recipientId,
            title: "New Message",
            message: `${recipient.name}: ${reply.substring(0, 30)}...`,
            is_read: false,
            created_at: new Date().toISOString()
          });
          
          showToast(`New message from ${recipient.name}`, "notify", "#messages");
        }
 
        saveState();
        updateGlobalUserData();
        
        if (state.activeChatUserId === recipientId) {
          renderActiveChatPane();
        } else {
          renderConversationsList();
        }
      }, 1500);
 
    }, 1000);
  }

  function toggleMessageReaction(msgId, emoji) {
    const msg = state.messages.find(m => m.id === msgId);
    if (!msg) return;

    if (!msg.reactions) msg.reactions = {};
    if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

    const idx = msg.reactions[emoji].indexOf(state.currentUser.id);
    if (idx === -1) {
      msg.reactions[emoji].push(state.currentUser.id);
    } else {
      msg.reactions[emoji].splice(idx, 1);
      if (msg.reactions[emoji].length === 0) {
        delete msg.reactions[emoji];
      }
    }
    saveState();
    renderActiveChatPane();
  }

  // --- LEADERBOARDS SCREEN ---
  let activeLeaderboardType = 'global';

  function renderLeaderboards() {
    const globalBtn = document.getElementById('btn-leaderboard-global');
    const pythonBtn = document.getElementById('btn-leaderboard-python');
    
    globalBtn.className = activeLeaderboardType === 'global' ? 'glow-btn' : 'secondary-btn';
    pythonBtn.className = activeLeaderboardType === 'python' ? 'glow-btn' : 'secondary-btn';

    globalBtn.onclick = () => {
      activeLeaderboardType = 'global';
      renderLeaderboards();
    };
    pythonBtn.onclick = () => {
      activeLeaderboardType = 'python';
      renderLeaderboards();
    };

    const container = document.getElementById('leaderboard-rows-container');
    container.innerHTML = '';

    // Create dynamic rank sorting
    let list = JSON.parse(JSON.stringify(state.users));
    
    if (activeLeaderboardType === 'global') {
      list.sort((a, b) => b.points - a.points);
    } else {
      // Sort by Python-related skills matching points
      list.sort((a, b) => {
        // Alice has more python-specific skills
        const scoreA = a.skills.includes('Python') ? a.points + 200 : a.points;
        const scoreB = b.skills.includes('Python') ? b.points + 200 : b.points;
        return scoreB - scoreA;
      });
    }

    list.forEach((user, idx) => {
      const isMe = user.id === state.currentUser.id;
      const rank = idx + 1;
      
      let badge = `${rank}`;
      if (rank === 1) badge = '<span class="rank-badge gold"><i class="fas fa-crown"></i></span>';
      if (rank === 2) badge = '<span class="rank-badge silver"><i class="fas fa-medal"></i></span>';
      if (rank === 3) badge = '<span class="rank-badge bronze"><i class="fas fa-award"></i></span>';

      const tr = document.createElement('tr');
      tr.className = `leaderboard-row ${isMe ? 'me' : ''}`;
      tr.innerHTML = `
        <td class="rank-column">${badge}</td>
        <td>
          <div class="leaderboard-user-cell">
            <img src="${user.avatar}" class="leaderboard-avatar" alt="Avatar">
            <span class="leaderboard-username">${user.name} ${isMe ? '(You)' : ''}</span>
          </div>
        </td>
        <td><span style="font-size:12px; color:var(--text-secondary);">${user.headline}</span></td>
        <td class="leaderboard-points-cell">${user.points} pts</td>
      `;
      container.appendChild(tr);
    });
  }

  // --- USER PROFILE SCREEN ---
  let profileActiveTab = 'badges';

  function renderProfileView() {
    const u = state.currentUser;
    document.getElementById('profile-card-name').textContent = u.name;
    document.getElementById('profile-card-headline').textContent = u.headline;
    document.getElementById('profile-card-location').textContent = u.location;
    document.getElementById('profile-card-bio').textContent = u.bio;
    document.getElementById('profile-card-avatar').src = u.avatar;

    // Skills
    const skillsList = document.getElementById('profile-card-skills-container');
    skillsList.innerHTML = '';
    u.skills.forEach(s => {
      const span = document.createElement('span');
      span.className = 'profile-skill-badge';
      span.textContent = s;
      skillsList.appendChild(span);
    });

    // Links
    document.getElementById('profile-social-github').href = u.github || '#';
    document.getElementById('profile-social-linkedin').href = u.linkedin || '#';
    document.getElementById('profile-social-portfolio').href = u.portfolio || '#';

    // Tabs
    const badgesTabBtn = document.getElementById('btn-profile-tab-badges');
    const projectsTabBtn = document.getElementById('btn-profile-tab-projects');

    badgesTabBtn.className = `tab-btn ${profileActiveTab === 'badges' ? 'active' : ''}`;
    projectsTabBtn.className = `tab-btn ${profileActiveTab === 'projects' ? 'active' : ''}`;

    document.getElementById('profile-pane-badges').className = `tab-pane ${profileActiveTab === 'badges' ? 'active' : ''}`;
    document.getElementById('profile-pane-projects').className = `tab-pane ${profileActiveTab === 'projects' ? 'active' : ''}`;

    badgesTabBtn.onclick = () => {
      profileActiveTab = 'badges';
      renderProfileView();
    };
    projectsTabBtn.onclick = () => {
      profileActiveTab = 'projects';
      renderProfileView();
    };

    // Render unlocked badges lists
    if (profileActiveTab === 'badges') {
      const badgesContainer = document.getElementById('profile-badges-container');
      badgesContainer.innerHTML = '';

      Object.entries(state.badges).forEach(([id, badge]) => {
        const isUnlocked = u.badges?.includes(id);
        const card = document.createElement('div');
        card.className = `glass-panel badge-card ${isUnlocked ? 'unlocked' : ''}`;
        card.innerHTML = `
          <div class="badge-icon">${badge.icon}</div>
          <span class="badge-name">${badge.name}</span>
          <span class="badge-desc">${badge.desc}</span>
        `;
        badgesContainer.appendChild(card);
      });
    } else {
      // Render user owned projects
      const projectsContainer = document.getElementById('profile-projects-container');
      projectsContainer.innerHTML = '';
      
      const ownProjects = state.projects.filter(p => p.creator_id === u.id);
      
      if (ownProjects.length === 0) {
        projectsContainer.innerHTML = `<p style="grid-column:1/-1; text-align:center; font-size:12px; color:var(--text-muted); padding:32px;">No showcase projects published yet.</p>`;
        return;
      }

      ownProjects.forEach(proj => {
        const card = document.createElement('div');
        card.className = 'glass-panel project-card';
        card.innerHTML = `
          <div class="project-card-image">${proj.thumbnail}</div>
          <div class="project-card-content">
            <div>
              <h3 class="project-card-title">${proj.title}</h3>
              <p style="font-size:12px; color:var(--text-secondary); margin-bottom:8px;">${proj.description}</p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted);">
              <span><i class="fas fa-heart"></i> ${proj.likes_count} likes</span>
              <span class="project-action-link view-own-details" data-id="${proj.id}" style="cursor:pointer;">Details</span>
            </div>
          </div>
        `;
        projectsContainer.appendChild(card);

        card.querySelector('.view-own-details').onclick = () => {
          openProjectDetailsModal(proj);
        };
      });
    }

    // Avatar upload shortcut trigger simulation
    document.getElementById('btn-trigger-avatar-change').onclick = async () => {
      const urls = [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"
      ];
      // Swap avatar
      state.currentUser.avatar = urls[Math.floor(Math.random() * urls.length)];
      
      // Update creator avatar inside own projects
      for (const p of state.projects) {
        if (p.creator_id === state.currentUser.id) {
          p.creator_avatar = state.currentUser.avatar;
          await db.collection('projects').doc(p.id).set(p);
        }
      }

      // Update in users database
      await db.collection('users').doc(state.currentUser.id).set(state.currentUser);
      showToast("Avatar image updated!", "success");
    };

    // Edit profile details modal form
    document.getElementById('btn-trigger-edit-profile').onclick = () => {
      const modalHtml = `
        <div class="profile-edit-modal" style="max-height: 80vh; overflow-y: auto; padding-right: 8px;">
          <h2 style="font-size:22px; margin-bottom:16px;">Edit Profile Info</h2>
          <form id="profile-edit-form" class="auth-form">
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" for="edit-name">Full Name</label>
              <input type="text" id="edit-name" class="form-input" value="${u.name}" required>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label" for="edit-email">Email Address</label>
                <input type="email" id="edit-email" class="form-input" value="${u.email || ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="edit-phone">Phone Number</label>
                <input type="text" id="edit-phone" class="form-input" value="${u.phoneNumber || ''}" placeholder="e.g. +91 98765 43210">
              </div>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" for="edit-avatar">Profile Pic URL</label>
              <input type="text" id="edit-avatar" class="form-input" value="${u.avatar || ''}">
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" for="edit-college">College / University</label>
              <input type="text" id="edit-college" class="form-input" value="${u.college || ''}" required>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label" for="edit-degree">Degree</label>
                <input type="text" id="edit-degree" class="form-input" value="${u.degree || ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="edit-branch">Branch / Field</label>
                <input type="text" id="edit-branch" class="form-input" value="${u.branch || ''}" required>
              </div>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" for="edit-grad-year">Graduation Year</label>
              <input type="number" id="edit-grad-year" class="form-input" value="${u.graduationYear || '2026'}" required>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" for="edit-headline">Headline</label>
              <input type="text" id="edit-headline" class="form-input" value="${u.headline}" required>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" for="edit-location">Location</label>
              <input type="text" id="edit-location" class="form-input" value="${u.location}">
            </div>
            <div class="form-group" style="margin-bottom: 16px;">
              <label class="form-label" for="edit-bio">Biography (max 500 chars)</label>
              <textarea id="edit-bio" class="form-input" style="height:100px; resize:none;" maxlength="500">${u.bio}</textarea>
            </div>
            
            <button type="submit" class="glow-btn" style="margin-top:10px; width:100%;">Save Profile <i class="fas fa-save"></i></button>
          </form>
        </div>
      `;

      openModal(modalHtml);

      document.getElementById('profile-edit-form').onsubmit = async (e) => {
        e.preventDefault();
        
        state.currentUser.name = document.getElementById('edit-name').value.trim();
        state.currentUser.email = document.getElementById('edit-email').value.trim();
        state.currentUser.phoneNumber = document.getElementById('edit-phone').value.trim();
        state.currentUser.avatar = document.getElementById('edit-avatar').value.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
        state.currentUser.college = document.getElementById('edit-college').value.trim();
        state.currentUser.degree = document.getElementById('edit-degree').value.trim();
        state.currentUser.branch = document.getElementById('edit-branch').value.trim();
        state.currentUser.graduationYear = Number(document.getElementById('edit-grad-year').value);
        state.currentUser.headline = document.getElementById('edit-headline').value.trim();
        state.currentUser.location = document.getElementById('edit-location').value.trim() || "Global Village";
        state.currentUser.bio = document.getElementById('edit-bio').value.trim();

        // Update in users database
        await db.collection('users').doc(state.currentUser.id).set(state.currentUser);
        closeModal();
        showToast("Profile information saved!", "success");
      };
    };
  }

  // --- UNIVERSAL SEARCH VIEW ---
  function renderSearchView(query) {
    const heading = document.getElementById('search-query-header');
    heading.textContent = `Search results for "${query}"`;

    const coursesContainer = document.getElementById('search-courses-container');
    const projectsContainer = document.getElementById('search-projects-container');
    const usersContainer = document.getElementById('search-users-container');

    coursesContainer.innerHTML = '';
    projectsContainer.innerHTML = '';
    usersContainer.innerHTML = '';

    const q = query.toLowerCase();

    // 0. Search Ambassador Program (special page check)
    const isAmbassadorSearch = q.includes('ambassador') || q.includes('campus') || q.includes('program') || q.includes('rep') || q.includes('college');
    
    // Clear previous special search results if any
    const oldSpecial = document.getElementById('search-special-results');
    if (oldSpecial) oldSpecial.remove();
    
    const newSpecial = document.createElement('div');
    newSpecial.id = 'search-special-results';
    newSpecial.style.marginBottom = '24px';
    
    if (isAmbassadorSearch) {
      newSpecial.innerHTML = `
        <h3 style="font-size: 16px; margin-bottom:12px;"><i class="fas fa-star" style="color: var(--warning);"></i> Special Programs</h3>
        <div class="glass-panel" style="padding: 20px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--warning); border-radius: 12px; margin-bottom: 24px;">
          <div>
            <h4 style="font-size: 17px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
              <span style="background: rgba(245, 166, 35, 0.15); color: #F5A623; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">ACTIVE</span>
              Campus Ambassador Program
            </h4>
            <p style="font-size: 12.5px; color: var(--text-secondary); max-width: 550px; margin: 0;">
              Represent Edworld Co. at your college! Spread gamified learning, organize webinars, connect student developers, and earn badges & stipends.
            </p>
          </div>
          <button class="glow-btn" style="padding: 8px 18px; border-radius: 8px; font-size: 12.5px;" onclick="window.location.hash='#ambassador'">Apply Now <i class="fas fa-arrow-right"></i></button>
        </div>
      `;
      coursesContainer.parentNode.insertBefore(newSpecial, coursesContainer);
    }

    // 1. Search courses (matches title or description)
    const matchedCourses = state.courses.filter(c => 
      c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
    if (matchedCourses.length === 0) {
      coursesContainer.innerHTML = `<p style="font-size:12px; color:var(--text-muted);">No courses found.</p>`;
    } else {
      matchedCourses.forEach(course => {
        const div = document.createElement('div');
        div.className = 'glass-panel course-card';
        div.style.height = 'fit-content';
        div.innerHTML = `
          <div class="course-thumbnail" style="height:100px;">${course.thumbnail}</div>
          <div style="padding:16px;">
            <h3 style="font-size:16px; margin-bottom:4px;">${course.title}</h3>
            <p style="font-size:11px; color:var(--text-muted); margin-bottom:12px;">${course.description.substring(0, 70)}...</p>
            <button class="secondary-btn" style="padding:4px 10px; font-size:11px;" id="btn-search-c-${course.id}">View</button>
          </div>
        `;
        coursesContainer.appendChild(div);
        div.querySelector('button').onclick = () => {
          window.location.hash = '#courses';
          setTimeout(() => loadCourseViewer(course.id), 100);
        };
      });
    }

    // 2. Search projects
    const matchedProjects = state.projects.filter(p => 
      p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.technologies.some(t => t.toLowerCase().includes(q))
    );
    if (matchedProjects.length === 0) {
      projectsContainer.innerHTML = `<p style="font-size:12px; color:var(--text-muted);">No projects found.</p>`;
    } else {
      matchedProjects.forEach(proj => {
        const div = document.createElement('div');
        div.className = 'glass-panel project-card';
        div.style.height = 'fit-content';
        div.innerHTML = `
          <div style="padding:16px;">
            <h3 style="font-size:16px; margin-bottom:4px;">${proj.title}</h3>
            <p style="font-size:11px; color:var(--text-muted); margin-bottom:12px;">${proj.description}</p>
            <button class="secondary-btn" style="padding:4px 10px; font-size:11px;" id="btn-search-p-${proj.id}">Details</button>
          </div>
        `;
        projectsContainer.appendChild(div);
        div.querySelector('button').onclick = () => {
          window.location.hash = '#projects';
          setTimeout(() => openProjectDetailsModal(proj), 100);
        };
      });
    }

    // 3. Search users (matches name or expertise skills)
    const matchedUsers = state.users.filter(u => 
      u.id !== state.currentUser.id &&
      (u.name.toLowerCase().includes(q) || u.skills.some(s => s.toLowerCase().includes(q)) || u.headline.toLowerCase().includes(q))
    );
    if (matchedUsers.length === 0) {
      usersContainer.innerHTML = `<p style="grid-column:1/-1; text-align:center; font-size:12px; color:var(--text-muted);">No users found.</p>`;
    } else {
      matchedUsers.forEach(user => {
        const div = document.createElement('div');
        div.className = 'glass-panel connection-list-card';
        div.innerHTML = `
          <div class="connection-list-info">
            <img src="${user.avatar}" class="connection-list-avatar" alt="Avatar">
            <div class="connection-list-details">
              <span class="connection-list-name">${user.name}</span>
              <span class="connection-list-title">${user.headline}</span>
            </div>
          </div>
          <button class="secondary-btn" style="padding:4px 10px; font-size:11px;" id="btn-search-u-${user.id}">Profile</button>
        `;
        usersContainer.appendChild(div);
        div.querySelector('button').onclick = () => {
          // Open mock profile details card
          const detailsHtml = `
            <div class="profile-edit-modal" style="text-align:center;">
              <img src="${user.avatar}" style="width:80px; height:80px; border-radius:50%; margin-bottom:12px;" alt="Avatar">
              <h2 style="font-size:20px; margin-bottom:4px;">${user.name}</h2>
              <p style="color:var(--primary); font-size:12px; margin-bottom:12px; font-weight:700;">${user.headline}</p>
              <p style="font-size:13px; color:var(--text-secondary); margin-bottom:20px;">${user.bio}</p>
              <div style="display:flex; gap:8px; justify-content:center;">
                <button class="glow-btn" id="btn-search-modal-conn">Connect</button>
                <button class="secondary-btn" id="btn-search-modal-close">Close</button>
              </div>
            </div>
          `;
          openModal(detailsHtml);
          document.getElementById('btn-search-modal-close').onclick = closeModal;
          document.getElementById('btn-search-modal-conn').onclick = (e) => {
            sendConnectionRequest(user.id, e.target);
            closeModal();
          };
        };
      });
    }
  }

  // ==========================================
  // 5B. CAREERS & INTERNSHIPS RAG SYSTEM
  // ==========================================
  let ragIndex = [];
  const stopWords = new Set(["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cant", "cannot", "could", "couldnt", "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during", "each", "few", "for", "from", "further", "had", "hadnt", "has", "hasnt", "have", "havent", "having", "he", "hed", "hell", "hes", "her", "here", "heres", "hers", "herself", "him", "himself", "his", "how", "howes", "i", "id", "ill", "im", "ive", "if", "in", "into", "is", "isnt", "it", "its", "itself", "lets", "me", "more", "most", "mustnt", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shant", "she", "shed", "shell", "shes", "should", "shouldnt", "so", "some", "such", "than", "that", "thats", "the", "their", "theirs", "them", "themselves", "then", "there", "theres", "these", "they", "theyd", "theyll", "theyre", "theyve", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasnt", "we", "wed", "well", "were", "weve", "werent", "what", "whats", "when", "whens", "where", "wheres", "which", "while", "who", "whos", "whom", "why", "whys", "with", "wont", "would", "wouldnt", "you", "youd", "youll", "youre", "youve", "your", "yours", "yourself", "yourselves"]);

  function tokenize(text) {
    if (!text) return [];
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 1 && !stopWords.has(w));
  }

  function buildRagIndex() {
    ragIndex = [];
    const docs = state.opportunities || [];
    if (docs.length === 0) return;

    const docTokens = docs.map(d => {
      const content = `${d.title} ${d.company} ${d.description} ${d.requirements} ${(d.skills || []).join(' ')} ${d.location} ${d.type}`;
      return tokenize(content);
    });

    const df = {};
    docTokens.forEach(tokens => {
      const unique = new Set(tokens);
      unique.forEach(term => {
        df[term] = (df[term] || 0) + 1;
      });
    });

    const N = docs.length;

    ragIndex = docs.map((doc, docIdx) => {
      const tokens = docTokens[docIdx];
      const tf = {};
      tokens.forEach(t => {
        tf[t] = (tf[t] || 0) + 1;
      });

      const vector = {};
      let magnitude = 0;
      Object.keys(tf).forEach(term => {
        const tfVal = tf[term] / tokens.length;
        const idfVal = Math.log(1 + (N / (df[term] || 1)));
        const tfidf = tfVal * idfVal;
        vector[term] = tfidf;
        magnitude += tfidf * tfidf;
      });

      return {
        doc,
        vector,
        magnitude: Math.sqrt(magnitude)
      };
    });
  }

  function queryRagAgent(query) {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0 || ragIndex.length === 0) {
      return {
        reply: "I couldn't identify any specific keywords in your query. Please try searching for specific roles (e.g., 'Python developer'), locations ('remote'), or companies ('Stripe').",
        matches: []
      };
    }

    const queryTf = {};
    queryTokens.forEach(t => {
      queryTf[t] = (queryTf[t] || 0) + 1;
    });

    let queryMag = 0;
    const queryVector = {};
    const N = state.opportunities.length;
    
    Object.keys(queryTf).forEach(term => {
      const docFrequency = ragIndex.filter(item => item.vector[term] > 0).length || 1;
      const idf = Math.log(1 + (N / docFrequency));
      const tfidf = (queryTf[term] / queryTokens.length) * idf;
      queryVector[term] = tfidf;
      queryMag += tfidf * tfidf;
    });
    queryMag = Math.sqrt(queryMag);

    const scores = ragIndex.map(item => {
      let dotProduct = 0;
      Object.keys(queryVector).forEach(term => {
        if (item.vector[term]) {
          dotProduct += queryVector[term] * item.vector[term];
        }
      });

      const denominator = queryMag * item.magnitude;
      const score = denominator > 0 ? (dotProduct / denominator) : 0;
      return {
        doc: item.doc,
        score
      };
    });

    const matches = scores
      .filter(item => item.score > 0.02)
      .sort((a, b) => b.score - a.score);

    let reply = "";
    if (matches.length === 0) {
      reply = `I searched our database but couldn't find any direct matches for **"${query}"**. <br><br>
               However, I'd suggest checking out these popular active listings: <br>` +
               state.opportunities.slice(0, 3).map(o => `- **${o.title}** at **${o.company}** (${o.location})`).join('<br>');
      return { reply, matches: state.opportunities.slice(0, 2) };
    }

    const topDoc = matches[0].doc;
    reply = `Based on your request, I found **${matches.length}** matching opportunity: <br><br>`;
    
    matches.slice(0, 3).forEach((item, idx) => {
      const job = item.doc;
      reply += `${idx + 1}. **${job.title}** at **${job.company}** (${job.location} | ${job.type})<br>`;
      reply += `   * **Compensation**: ${job.salary || "Not Specified"}<br>`;
      reply += `   * **Core Skills**: ${(job.skills || []).join(', ')}<br>`;
      reply += `   * **Requirements**: ${job.requirements ? job.requirements.substring(0, 150) + "..." : "See posting details."}<br><br>`;
    });

    reply += `**Synthesized Recommendation**: <br>`;
    if (queryTokens.includes('python') || query.toLowerCase().includes('python')) {
      reply += `Since you are interested in Python, you should look at the **${topDoc.title}** role at **${topDoc.company}**. It aligns perfectly with backend skills and Docker container setups.`;
    } else if (queryTokens.includes('remote') || query.toLowerCase().includes('remote')) {
      reply += `For remote opportunities, **${topDoc.company}** offers excellent distributed working conditions. Make sure your portfolio showcases self-directed Git repositories.`;
    } else {
      reply += `The **${topDoc.title}** at **${topDoc.company}** appears to be a strong fit. I can help draft a targeted cover letter matching this role!`;
    }

    return {
      reply,
      matches: matches.map(m => m.doc)
    };
  }

  function renderJobsView() {
    renderJobsList();

    document.getElementById('jobs-search-input').oninput = renderJobsList;

    document.getElementById('btn-send-ai-chat').onclick = handleJobsAiChatSubmit;
    document.getElementById('ai-chat-input').onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleJobsAiChatSubmit();
      }
    };

    document.getElementById('btn-trigger-post-job').onclick = openPostJobModal;
  }

  function renderJobsList() {
    const container = document.getElementById('jobs-grid-container');
    const countSpan = document.getElementById('jobs-count');
    if (!container) return;
    container.innerHTML = '';

    const filterVal = document.getElementById('jobs-search-input').value.toLowerCase();
    const list = state.opportunities.filter(o => 
      o.title.toLowerCase().includes(filterVal) ||
      o.company.toLowerCase().includes(filterVal) ||
      o.description.toLowerCase().includes(filterVal) ||
      (o.skills || []).some(s => s.toLowerCase().includes(filterVal))
    );

    countSpan.textContent = `Showing ${list.length} job(s)`;

    if (list.length === 0) {
      container.innerHTML = `<p style="text-align:center; font-size:13px; color:var(--text-muted); padding:32px;">No career opportunities found matching criteria.</p>`;
      return;
    }

    list.forEach(job => {
      const card = document.createElement('div');
      card.className = 'job-opportunity-card';
      card.id = `job-card-${job.id}`;
      card.innerHTML = `
        <div class="job-card-header">
          <div>
            <div class="job-card-title">${job.title}</div>
            <div class="job-card-company">${job.company}</div>
          </div>
          <span style="font-size: 11px; padding: 2px 8px; background: var(--primary-glow); color: var(--primary); border-radius: 20px; font-weight: 600;">${job.type}</span>
        </div>
        <div class="job-card-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
          <span><i class="far fa-clock"></i> ${job.postedAt ? formatTime(job.postedAt) : 'Recent'}</span>
        </div>
        <p class="job-card-description">${job.description}</p>
        <div class="job-card-skills">
          ${(job.skills || []).map(s => `<span class="job-skill-tag">${s}</span>`).join('')}
        </div>
        <div class="job-card-footer">
          <span class="job-card-salary">${job.salary || 'Not disclosed'}</span>
          <button class="secondary-btn apply-opportunity-btn" style="padding: 4px 12px; font-size:11px;">Apply Now</button>
        </div>
      `;
      container.appendChild(card);

      card.querySelector('.apply-opportunity-btn').onclick = () => {
        showToast(`Navigating to application link for ${job.company}...`, "success");
      };
    });
  }

  async function handleJobsAiChatSubmit() {
    const input = document.getElementById('ai-chat-input');
    const thread = document.getElementById('ai-chat-thread');
    const query = input.value.trim();
    if (!query) return;

    const userRow = document.createElement('div');
    userRow.className = 'message-bubble-row mine';
    userRow.innerHTML = `
      <img src="${state.currentUser.avatar}" class="message-bubble-avatar" alt="Avatar">
      <div class="message-bubble-content-wrapper">
        <div class="message-bubble">
          ${query}
        </div>
        <div class="message-bubble-meta">
          <span>${formatTime(new Date().toISOString())}</span>
        </div>
      </div>
    `;
    thread.appendChild(userRow);
    input.value = '';
    thread.scrollTop = thread.scrollHeight;

    const typingRow = document.createElement('div');
    typingRow.className = 'message-bubble-row other typing-indicator-row';
    typingRow.innerHTML = `
      <div style="background: var(--primary-light); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--primary); margin-right: 8px; flex-shrink: 0;"><i class="fas fa-robot"></i></div>
      <div class="message-bubble-content-wrapper">
        <div class="message-bubble" style="background: var(--bg-hover); padding: 8px 12px;">
          <div class="typing-dot" style="display:inline-block; width:6px; height:6px; background:var(--text-muted); border-radius:50%; margin-right:2px; animation: bounce 1.4s infinite ease-in-out both;"></div>
          <div class="typing-dot" style="display:inline-block; width:6px; height:6px; background:var(--text-muted); border-radius:50%; margin-right:2px; animation: bounce 1.4s infinite ease-in-out both; animation-delay: 0.2s;"></div>
          <div class="typing-dot" style="display:inline-block; width:6px; height:6px; background:var(--text-muted); border-radius:50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: 0.4s;"></div>
        </div>
      </div>
    `;
    thread.appendChild(typingRow);
    thread.scrollTop = thread.scrollHeight;

    // Get local matches first
    const result = queryRagAgent(query);

    let citationHtml = '';
    if (result.matches && result.matches.length > 0) {
      citationHtml = `
        <div class="rag-citation-list">
          <span style="font-size:11px; font-weight:700; color:var(--text-muted);">SOURCE POSTINGS:</span>
          ${result.matches.slice(0, 2).map(job => `
            <div class="rag-citation-card" onclick="document.getElementById('job-card-${job.id}').scrollIntoView({behavior: 'smooth'}); showToast('Job highlighted!', 'info');">
              <div>
                <strong>${job.title}</strong> at ${job.company}
              </div>
              <i class="fas fa-chevron-right" style="font-size:10px; color:var(--primary);"></i>
            </div>
          `).join('')}
        </div>
      `;
    }

    const config = getOpenRouterConfig();
    let replyText = '';

    if (config.apiKey) {
      try {
        const systemPrompt = `You are the EdWorld Careers Assistant, a smart agent that helps users find job listings and prepare applications.
Here is the list of matching job listings found in our database:
${JSON.stringify(result.matches.slice(0, 3))}

Please answer the user's query using the provided job listings. Highlight matching roles, company names, requirements, and salaries.
Be helpful, concise, and professional. Use markdown bolding for job titles and companies.
If no listings are relevant, suggest how they might search better.`;

        replyText = await fetchOpenRouterCompletion([{ role: 'user', content: query }], systemPrompt);
      } catch (err) {
        console.error('[OpenRouter RAG Error]', err);
        replyText = `*(AI Fallback)* ${result.reply}`;
      }
    } else {
      ensureOpenRouterKey();
      replyText = result.reply;
    }

    typingRow.remove();

    const botRow = document.createElement('div');
    botRow.className = 'message-bubble-row other';
    botRow.innerHTML = `
      <div style="background: var(--primary-light); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--primary); margin-right: 8px; flex-shrink: 0;"><i class="fas fa-robot"></i></div>
      <div class="message-bubble-content-wrapper">
        <div class="message-bubble" style="background: var(--bg-hover); color: var(--text-main);">
          ${replyText.replace(/\n/g, '<br>')}
          ${citationHtml}
          
          <div class="rag-action-btn-row">
            <span class="rag-action-pill btn-rag-cover-letter" data-id="${result.matches[0]?.id || ''}">Draft Cover Letter</span>
            <span class="rag-action-pill btn-rag-interview" data-id="${result.matches[0]?.id || ''}">Mock Interview Me</span>
          </div>
        </div>
        <div class="message-bubble-meta">
          <span>${formatTime(new Date().toISOString())}</span>
        </div>
      </div>
    `;
    thread.appendChild(botRow);
    thread.scrollTop = thread.scrollHeight;

      const clBtn = botRow.querySelector('.btn-rag-cover-letter');
      if (clBtn) {
        clBtn.onclick = () => {
          const jobId = clBtn.getAttribute('data-id');
          const job = state.opportunities.find(o => o.id === jobId) || state.opportunities[0];
          if (!job) return;
          const letter = `
            <div style="padding: 20px;">
              <h3 style="font-size: 18px; margin-bottom: 12px;"><i class="fas fa-file-alt"></i> Cover Letter Draft</h3>
              <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 16px;">Tailored for <strong>${job.title}</strong> at <strong>${job.company}</strong></p>
              <textarea class="form-input" style="width:100%; height:250px; font-family:var(--font-body); font-size:13px; line-height:1.5; padding: 12px; resize:none;" readonly>
Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. As a developer with active skills in ${(job.skills || []).slice(0, 3).join(', ')}, I am excited about the opportunity to contribute to your team.

My background includes building responsive frontend layouts and designing backend API structures. I have successfully completed structured fundamentals tracks on EdWorld Co and showcased portfolio repositories for peer review.

Thank you for your time and consideration.

Sincerely,
\${state.currentUser.name}
              </textarea>
              <button class="glow-btn" style="margin-top: 16px; width: 100%;" onclick="navigator.clipboard.writeText(this.previousElementSibling.value); showToast('Cover letter copied!', 'success'); closeModal();">Copy to Clipboard</button>
            </div>
          `;
          openModal(letter);
        };
      }

      const interviewBtn = botRow.querySelector('.btn-rag-interview');
      if (interviewBtn) {
        interviewBtn.onclick = () => {
          const jobId = interviewBtn.getAttribute('data-id');
          const job = state.opportunities.find(o => o.id === jobId) || state.opportunities[0];
          if (!job) return;
          const questions = [
            `Can you explain your experience building projects using ${job.skills[0] || 'Python'}?`,
            `How would you design a scalable microservice infrastructure for ${job.company}?`,
            `What is the most challenging bug you've resolved in your showcase projects?`
          ];
          const quizHtml = `
            <div style="padding: 20px;">
              <h3 style="font-size:18px; margin-bottom:12px;"><i class="fas fa-user-tie"></i> Technical Mock Interview</h3>
              <p style="font-size:11px; color:var(--text-muted); margin-bottom:16px;">Simulated interview for <strong>${job.title}</strong> at <strong>${job.company}</strong></p>
              
              <div style="background:var(--bg-dark); padding:16px; border-radius:10px; margin-bottom:16px; font-size:14px; border: 1px solid var(--border-card);">
                <strong>Question</strong>: <br>
                "${questions[Math.floor(Math.random() * questions.length)]}"
              </div>
              <textarea class="form-input" style="width:100%; height:120px; font-size:13px; margin-bottom:16px; resize:none;" placeholder="Type your response here..."></textarea>
              <button class="glow-btn" style="width:100%;" onclick="showToast('Interview response recorded. Grade: A (85%)!', 'success'); closeModal();">Submit Response</button>
            </div>
          `;
          openModal(quizHtml);
        };
      }
  }

  function openPostJobModal() {
    const modalHtml = `
      <div class="project-upload-modal">
        <h2 style="font-size:22px; margin-bottom:4px;">Post Job Opportunity</h2>
        <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">Share active roles with the student community.</p>
        
        <form id="post-job-form" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="job-title">Job Title</label>
            <input type="text" id="job-title" class="form-input" placeholder="e.g. Software Engineer Intern" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="job-company">Company</label>
            <input type="text" id="job-company" class="form-input" placeholder="e.g. Stripe" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="job-desc">Job Description</label>
            <input type="text" id="job-desc" class="form-input" placeholder="e.g. Work on Python APIs..." required>
          </div>
          <div class="form-group">
            <label class="form-label" for="job-reqs">Requirements</label>
            <input type="text" id="job-reqs" class="form-input" placeholder="e.g. Pursuing CS, Python knowledge..." required>
          </div>
          <div class="form-group">
            <label class="form-label" for="job-skills">Skills (comma-separated)</label>
            <input type="text" id="job-skills" class="form-input" placeholder="e.g. Python, Docker, React" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="job-salary">Compensation / Salary</label>
            <input type="text" id="job-salary" class="form-input" placeholder="e.g. $45 - $60 / hour" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="job-loc">Location</label>
            <input type="text" id="job-loc" class="form-input" placeholder="e.g. Remote (US) or Sunnyvale, CA" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="job-type">Type</label>
            <select id="job-type" class="form-input" style="height:40px;">
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
          
          <button type="submit" class="glow-btn" style="margin-top:10px; width:100%;">Publish Opportunity <i class="fas fa-briefcase"></i></button>
        </form>
      </div>
    `;

    openModal(modalHtml);

    document.getElementById('post-job-form').onsubmit = async (e) => {
      e.preventDefault();
      
      const title = document.getElementById('job-title').value.trim();
      const company = document.getElementById('job-company').value.trim();
      const desc = document.getElementById('job-desc').value.trim();
      const reqs = document.getElementById('job-reqs').value.trim();
      const skills = document.getElementById('job-skills').value.split(',').map(s => s.trim()).filter(Boolean);
      const salary = document.getElementById('job-salary').value.trim();
      const location = document.getElementById('job-loc').value.trim();
      const type = document.getElementById('job-type').value;

      const oppId = "opp_" + Date.now();
      const newOpp = {
        id: oppId,
        title,
        company,
        description: desc,
        requirements: reqs,
        skills,
        salary,
        location,
        type,
        apply_url: "#apply-" + oppId,
        postedAt: new Date().toISOString()
      };

      try {
        await db.collection('opportunities').doc(oppId).set(newOpp);
        showToast("Opportunity posted successfully!", "success");
        closeModal();
      } catch (err) {
        showToast("Error publishing job opportunity", "danger");
      }
    };
  }

  // --- NOTIFICATION HANDLERS ---
  function setupNotificationCenter() {
    const toggle = document.getElementById('btn-toggle-notifications');
    const dropdown = document.getElementById('dropdown-notifications');
    const list = document.getElementById('notifications-list-container');

    toggle.onclick = (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
      if (dropdown.classList.contains('active')) {
        renderNotificationsDropdown();
      }
    };

    // Close notifications panel on click outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== toggle) {
        dropdown.classList.remove('active');
      }
    });

    document.getElementById('btn-mark-all-read').onclick = () => {
      state.notifications.forEach(n => n.is_read = true);
      saveState();
      updateGlobalUserData();
      renderNotificationsDropdown();
      showToast("All notifications marked as read.", "success");
    };

    document.getElementById('btn-clear-notifications').onclick = () => {
      state.notifications = [];
      saveState();
      updateGlobalUserData();
      renderNotificationsDropdown();
      showToast("Notifications cleared.", "info");
    };
  }

  function renderNotificationsDropdown() {
    const list = document.getElementById('notifications-list-container');
    list.innerHTML = '';

    if (state.notifications.length === 0) {
      list.innerHTML = `<p style="padding:24px; text-align:center; font-size:12px; color:var(--text-muted);">No notifications currently.</p>`;
      return;
    }

    // Sort newest first
    const logs = [...state.notifications].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

    logs.forEach(notif => {
      const item = document.createElement('div');
      item.className = `notification-item ${notif.is_read ? '' : 'unread'}`;
      
      let avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
      if (notif.actor_id !== 'system') {
        const user = state.users.find(u => u.id === notif.actor_id);
        if (user) avatar = user.avatar;
      } else {
        avatar = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150"; // system art avatar
      }

      let actionsHtml = '';
      if (notif.type === 'connection_request') {
        // Find if connection still pending
        const conn = state.connections.find(c => 
          c.from_user_id === notif.actor_id && c.to_user_id === state.currentUser.id && c.status === 'pending'
        );
        if (conn) {
          actionsHtml = `
            <div class="notification-actions">
              <button class="notification-btn accept notif-accept-btn" data-id="${notif.actor_id}">Accept</button>
              <button class="notification-btn decline notif-decline-btn" data-id="${notif.actor_id}">Decline</button>
            </div>
          `;
        }
      }

      item.innerHTML = `
        <img src="${avatar}" class="notification-avatar" alt="Avatar">
        <div class="notification-content">
          <div class="notification-text"><strong>${notif.title}</strong>: ${notif.message}</div>
          <span class="notification-time">${formatTime(notif.created_at)}</span>
          ${actionsHtml}
        </div>
      `;
      list.appendChild(item);

      // Mark single read on hover or click
      item.addEventListener('mouseenter', () => {
        if (!notif.is_read) {
          notif.is_read = true;
          saveState();
          updateGlobalUserData();
        }
      });

      // Bind notifications buttons
      const acceptBtn = item.querySelector('.notif-accept-btn');
      if (acceptBtn) {
        acceptBtn.onclick = (e) => {
          e.stopPropagation();
          acceptConnectionRequest(notif.actor_id);
          renderNotificationsDropdown();
        };
      }
      const declineBtn = item.querySelector('.notif-decline-btn');
      if (declineBtn) {
        declineBtn.onclick = (e) => {
          e.stopPropagation();
          declineConnectionRequest(notif.actor_id);
          renderNotificationsDropdown();
        };
      }
    });
  }

  // --- UNIVERSAL SEARCH BOX ---
  function setupSearchListener() {
    const input = document.getElementById('global-search-input');
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const val = input.value.trim();
        if (val) {
          window.location.hash = `#search?q=${encodeURIComponent(val)}`;
          input.value = '';
        }
      }
    };
  }

  // --- INITIALIZATION GATE ---
  function initializeApplication() {
    updateGlobalUserData();
    setupNotificationCenter();
    setupSearchListener();
    setupAdminClearLogsListener();
    
    // Bind global header profile pill shortcut
    document.getElementById('user-pill-shortcut').onclick = () => {
      window.location.hash = '#profile';
    };
    document.getElementById('sidebar-profile-shortcut').onclick = () => {
      window.location.hash = '#profile';
    };

    // Bind mobile notification bell shortcut to trigger desktop dropdown
    const mobBell = document.getElementById('mobile-notification-bell-btn');
    if (mobBell) {
      mobBell.onclick = (e) => {
        e.stopPropagation();
        const toggleBtn = document.getElementById('btn-toggle-notifications');
        if (toggleBtn) toggleBtn.click();
      };
    }

    // Route trigger
    handleNavigation();

    // Request FCM push notification permission (non-blocking, graceful)
    requestFCMPermission();
  }

  // Bind Routing Event listener
  window.addEventListener('hashchange', handleNavigation);

  // Run on startup
  window.addEventListener('DOMContentLoaded', async () => {
    await seedFirestoreIfNeeded();
    checkAuth();

    // --- SPLASH SCREEN: dismiss reactively once auth resolves ---
    auth.onAuthStateChanged(() => {
      const splash = document.getElementById('splash-screen');
      if (splash && !splash.classList.contains('hidden')) {
        splash.classList.add('hidden');
        // Clean up DOM after fade-out transition
        setTimeout(() => { splash.remove(); }, 600);
      }
    });

    // Safety fallback: hide splash after max 4 seconds regardless
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash && !splash.classList.contains('hidden')) {
        splash.classList.add('hidden');
        setTimeout(() => { splash.remove(); }, 600);
      }
    }, 4000);
  });

  // ==========================================
  // 6. NEW CODEBASE FUNCTIONS FOR ADDED PAGES
  // ==========================================

  // Action Logging Utility
  async function logUserAction(actionType, description) {
    if (!state.currentUser) return;
    const log = {
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      actionType: actionType,
      description: description,
      timestamp: new Date().toISOString()
    };
    try {
      await db.collection('user_actions').add(log);
    } catch (e) {
      console.error("Failed to log action:", e);
    }
  }

  // Events & Gigs Dashboard rectangular layout
  function renderDashboardEventsGigs() {
    const container = document.getElementById('dashboard-events-gigs-container');
    if (!container) return;
    container.innerHTML = '';
    
    const featured = state.eventsGigs.slice(0, 3);
    if (featured.length === 0) {
      container.innerHTML = `<p style="grid-column:1/-1; text-align:center; font-size:12px; color:var(--text-muted); padding:16px;">No upcoming events or active gigs available.</p>`;
      return;
    }
    
    featured.forEach(item => {
      const isEvent = item.type === 'event';
      const card = document.createElement('div');
      card.className = `glass-panel event-gig-rect-card`;
      card.style.display = 'flex';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'space-between';
      card.style.padding = '14px 18px';
      card.style.borderRadius = '12px';
      card.style.border = '1px solid var(--border-card)';
      card.style.borderLeft = `5px solid ${isEvent ? 'var(--primary)' : 'var(--secondary)'}`;
      card.style.marginBottom = '12px';
      card.style.background = 'var(--bg-card)';
      
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:16px; flex:1;">
          <div style="width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:${isEvent ? 'var(--primary-glow)' : 'var(--secondary-glow)'}; font-size:18px;">
            ${isEvent ? '📅' : '💼'}
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:10px; font-weight:800; text-transform:uppercase; color:${isEvent ? 'var(--primary)' : 'var(--secondary)'};">${item.type}</span>
              <span style="font-size:10px; background:rgba(250,204,21,0.15); color:#D97706; font-weight:700; padding:1px 6px; border-radius:4px;">+${item.pointsReward} pts</span>
            </div>
            <h4 style="font-size:14.5px; margin: 4px 0 2px 0; font-weight:700; color:var(--text-main);">${item.title}</h4>
            <p style="font-size:12px; color:var(--text-secondary); margin:0;">${isEvent ? `Date: ${item.date} | Time: ${item.time}` : `Budget: ${item.budget} | Duration: ${item.duration}`}</p>
          </div>
        </div>
        <button class="secondary-btn" style="padding:6px 14px; font-size:12px; border-radius:8px;" onclick="window.location.hash='#events-gigs'">View Details</button>
      `;
      container.appendChild(card);
    });
  }

  // Events & Gigs Detailed Page Loader
  let activeEgFilter = 'all';
  function renderEventsGigsView() {
    const container = document.getElementById('events-gigs-list-container');
    if (!container) return;
    container.innerHTML = '';
    
    const btnAll = document.getElementById('btn-eg-all');
    const btnEvents = document.getElementById('btn-eg-events');
    const btnGigs = document.getElementById('btn-eg-gigs');
    
    btnAll.className = `tab-btn ${activeEgFilter === 'all' ? 'active' : ''}`;
    btnEvents.className = `tab-btn ${activeEgFilter === 'event' ? 'active' : ''}`;
    btnGigs.className = `tab-btn ${activeEgFilter === 'gig' ? 'active' : ''}`;
    
    btnAll.onclick = () => { activeEgFilter = 'all'; renderEventsGigsView(); };
    btnEvents.onclick = () => { activeEgFilter = 'event'; renderEventsGigsView(); };
    btnGigs.onclick = () => { activeEgFilter = 'gig'; renderEventsGigsView(); };
    
    const filtered = state.eventsGigs.filter(item => activeEgFilter === 'all' || item.type === activeEgFilter);
    if (filtered.length === 0) {
      container.innerHTML = `<p style="grid-column:1/-1; text-align:center; font-size:13px; color:var(--text-muted); padding:48px;">No listings found matching this category.</p>`;
      return;
    }
    
    filtered.forEach(item => {
      const isEvent = item.type === 'event';
      const card = document.createElement('div');
      card.className = 'glass-panel event-gig-detailed-card';
      card.style.padding = '20px';
      card.style.borderRadius = '16px';
      card.style.border = '1px solid var(--border-card)';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.justifyContent = 'space-between';
      card.style.height = '100%';
      card.style.background = 'var(--bg-card)';
      
      card.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span style="font-size:11px; font-weight:800; text-transform:uppercase; padding:3px 8px; border-radius:6px; background:${isEvent ? 'var(--primary-glow)' : 'var(--secondary-glow)'}; color:${isEvent ? 'var(--primary)' : 'var(--secondary)'};">${item.type}</span>
            <span style="font-size:11px; background:rgba(250,204,21,0.15); color:#D97706; font-weight:700; padding:2px 8px; border-radius:6px;"><i class="fas fa-fire"></i> +${item.pointsReward} Points</span>
          </div>
          
          <h3 style="font-size:18px; margin-bottom:8px; font-weight:700; color:var(--text-main);">${item.title}</h3>
          <p style="font-size:13px; color:var(--text-secondary); margin-bottom:16px; line-height:1.5;">${item.description}</p>
          
          <div style="font-size:12.5px; color:var(--text-muted); margin-bottom:20px; display:flex; flex-direction:column; gap:6px;">
            ${isEvent ? `
              <div><i class="far fa-calendar-alt" style="width:16px;"></i> <strong>Date:</strong> ${item.date}</div>
              <div><i class="far fa-clock" style="width:16px;"></i> <strong>Time:</strong> ${item.time}</div>
              <div><i class="fas fa-map-marker-alt" style="width:16px;"></i> <strong>Location:</strong> ${item.location}</div>
            ` : `
              <div><i class="fas fa-wallet" style="width:16px;"></i> <strong>Budget:</strong> ${item.budget}</div>
              <div><i class="far fa-hourglass" style="width:16px;"></i> <strong>Duration:</strong> ${item.duration}</div>
              <div><i class="fas fa-tools" style="width:16px;"></i> <strong>Required Skills:</strong> ${item.skills.join(', ')}</div>
            `}
          </div>
        </div>
        
        <button class="glow-btn" style="width:100%; border-radius:8px; justify-content:center; background:${isEvent ? 'var(--primary)' : 'var(--secondary)'};" id="btn-eg-action-${item.id}">
          ${isEvent ? 'Register for Event' : 'Apply for Gig'}
        </button>
      `;
      
      container.appendChild(card);
      
      document.getElementById(`btn-eg-action-${item.id}`).onclick = () => {
        openEgRegistrationModal(item);
      };
    });
  }

  function openEgRegistrationModal(item) {
    const isEvent = item.type === 'event';
    const modalHtml = `
      <h3 style="font-size: 20px; margin-bottom: 8px; border-bottom: 1px solid var(--border-card); padding-bottom: 8px;">
        ${isEvent ? '📅 Event Registration' : '💼 Gig Application'}
      </h3>
      <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 20px;">
        You are applying for <strong>${item.title}</strong>. Upon successful completion, you will earn <strong>+${item.pointsReward} points</strong>!
      </p>
      
      <form id="eg-submit-form">
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-input" value="${state.currentUser ? state.currentUser.name : ''}" required readonly>
        </div>
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-input" value="${state.currentUser ? state.currentUser.email : ''}" required readonly>
        </div>
        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label">${isEvent ? 'Special Requirements / Questions' : 'Pitch / Previous Experience (Links)'}</label>
          <textarea class="form-input" style="height:100px; resize:none;" placeholder="${isEvent ? 'Any accessibility requests or comments...' : 'Tell us why you are a good fit for this gig...'}" required></textarea>
        </div>
        
        <button type="submit" class="glow-btn" style="width: 100%; justify-content: center; height: 44px; border-radius: 8px; background:${isEvent ? 'var(--primary)' : 'var(--secondary)'};">
          Confirm ${isEvent ? 'Registration' : 'Application'}
        </button>
      </form>
    `;
    
    openModal(modalHtml);
    
    document.getElementById('eg-submit-form').onsubmit = async (e) => {
      e.preventDefault();
      closeModal();
      
      const userEgRef = db.collection('events_gigs_registrations');
      await userEgRef.add({
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        userEmail: state.currentUser.email,
        title: item.title,
        type: item.type,
        pointsReward: item.pointsReward,
        timestamp: new Date().toISOString()
      });
      
      await logUserAction(isEvent ? 'event_register' : 'gig_apply', `Registered/Applied for "${item.title}".`);
      
      showToast(isEvent ? "Event registration successful!" : "Gig application submitted!", "success");
    };
  }

  // Plans UI Render
  function renderPlansView() {
    const banner = document.getElementById('user-current-plan-banner');
    if (!banner) return;
    
    const p = state.currentUser ? state.currentUser.purchasedPlan : null;
    if (p && p.status === 'active') {
      banner.style.background = 'rgba(34, 197, 94, 0.1)';
      banner.style.border = '1px solid rgba(34, 197, 94, 0.2)';
      banner.style.color = '#15803d';
      banner.innerHTML = `<i class="fas fa-check-circle"></i> You have an active <strong>${p.name} Plan</strong> (purchased on ${new Date(p.date).toLocaleDateString()}). All premium features are unlocked!`;
    } else {
      const isPostJuly = new Date() >= new Date("2026-07-01") || state.simulatePostJuly;
      if (isPostJuly) {
        banner.style.background = 'rgba(239, 68, 68, 0.1)';
        banner.style.border = '1px solid rgba(239, 68, 68, 0.2)';
        banner.style.color = '#b91c1c';
        banner.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <strong>Paywall Active</strong>: Free access ended on June 30, 2026. Please upgrade your plan to restore access to courses, jobs, and workspace features.`;
      } else {
        banner.style.background = 'rgba(2, 132, 199, 0.1)';
        banner.style.border = '1px solid rgba(2, 132, 199, 0.2)';
        banner.style.color = '#0369a1';
        banner.innerHTML = `<i class="fas fa-info-circle"></i> <strong>Free Trial Active</strong>: The website is fully available for everyone until <strong>June 30, 2026</strong>. From July 1st, plans will be enforced. Feel free to simulate the paywall or purchase a plan now!`;
      }
    }
    
    const payBtns = document.querySelectorAll('.pay-now-btn');
    payBtns.forEach(btn => {
      const planName = btn.getAttribute('data-plan');
      const price = btn.getAttribute('data-price');
      
      if (p && p.status === 'active' && p.name === planName) {
        btn.textContent = 'Active Plan';
        btn.setAttribute('disabled', 'true');
        btn.onclick = null;
      } else {
        btn.textContent = 'Pay Now';
        btn.removeAttribute('disabled');
        btn.onclick = () => {
          openPaymentModal(planName, price);
        };
      }
    });
    
    const paywallToggle = document.getElementById('test-paywall-toggle');
    if (paywallToggle) {
      paywallToggle.checked = state.simulatePostJuly;
      paywallToggle.onchange = (e) => {
        state.simulatePostJuly = e.target.checked;
        renderPlansView();
        showToast(`Date simulator updated: paywall is now ${state.simulatePostJuly ? 'enforced' : 'inactive (free trial mode)'}.`, "info");
      };
    }
  }

  function openPaymentModal(planName, price) {
    const modalHtml = `
      <h3 style="font-size: 20px; margin-bottom: 12px; border-bottom: 1px solid var(--border-card); padding-bottom: 8px;"><i class="fas fa-lock" style="color: var(--primary);"></i> Secure Payment Portal</h3>
      <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 20px;">
        You are upgrading to the <strong>${planName} Plan</strong> for <strong>$${price}/month</strong>. 
        Enjoy premium learning tracks, custom graphic portfolio design, and unlimited AI assistant searches.
      </p>
      
      <form id="simulate-payment-form">
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Cardholder Name</label>
          <input type="text" class="form-input" value="${state.currentUser ? state.currentUser.name : ''}" required>
        </div>
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Card Number</label>
          <input type="text" class="form-input" placeholder="4111 2222 3333 4444" required>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
          <div class="form-group">
            <label class="form-label">Expiry Date</label>
            <input type="text" class="form-input" placeholder="MM/YY" required>
          </div>
          <div class="form-group">
            <label class="form-label">CVV</label>
            <input type="password" class="form-input" placeholder="***" maxLength="3" required>
          </div>
        </div>
        
        <button type="submit" class="glow-btn" style="width: 100%; justify-content: center; height: 44px; border-radius: 8px;">
          Confirm Payment of $${price} &nbsp;<i class="fas fa-credit-card"></i>
        </button>
      </form>
    `;
    
    openModal(modalHtml);
    
    document.getElementById('simulate-payment-form').onsubmit = async (e) => {
      e.preventDefault();
      closeModal();
      
      const planDetails = {
        name: planName,
        price: `$${price}/mo`,
        date: new Date().toISOString(),
        status: 'active'
      };
      
      state.currentUser.purchasedPlan = planDetails;
      await db.collection('users').doc(state.currentUser.id).set(state.currentUser);
      
      const paymentRecord = {
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        userEmail: state.currentUser.email || 'no-email@edworld.com',
        planName: planName,
        price: `$${price}`,
        date: new Date().toISOString(),
        status: 'completed'
      };
      await db.collection('payments').add(paymentRecord);
      
      await logUserAction('purchase_plan', `Purchased the ${planName} Plan for $${price}.`);
      
      showToast(`Thank you! Successfully upgraded to the ${planName} Plan.`, "success");
      updateGlobalUserData();
      renderPlansView();
    };
  }

  // Campus Ambassador Form Handler
  function setupAmbassadorFormListener() {
    const form = document.getElementById('ambassador-application-form');
    if (!form) return;
    
    form.onsubmit = async (e) => {
      e.preventDefault();
      
      const appData = {
        id: `amb_${Date.now()}`,
        userId: state.currentUser ? state.currentUser.id : 'anonymous',
        name: document.getElementById('amb-name').value.trim(),
        email: document.getElementById('amb-email').value.trim(),
        phone: document.getElementById('amb-phone').value.trim(),
        whatsapp: document.getElementById('amb-whatsapp').value.trim(),
        linkedin: document.getElementById('amb-linkedin').value.trim(),
        college: document.getElementById('amb-college').value.trim(),
        course: document.getElementById('amb-course').value.trim(),
        year: document.getElementById('amb-year').value,
        rollNumber: document.getElementById('amb-roll').value.trim(),
        city: document.getElementById('amb-city').value.trim(),
        date: new Date().toISOString()
      };
      
      try {
        await db.collection('ambassador_applications').add(appData);
        await logUserAction('ambassador_apply', `Applied for Campus Ambassador Program from ${appData.college}.`);
        
        showToast("Application submitted! Redirecting to WhatsApp verify...", "success");
        
        const waMsg = `*New Edworld Co. Campus Ambassador Application*\n\n` +
                      `*Personal Details:*\n` +
                      `- Name: ${appData.name}\n` +
                      `- Email: ${appData.email}\n` +
                      `- Phone: ${appData.phone}\n` +
                      `- WhatsApp: ${appData.whatsapp}\n` +
                      `- Social Profile: ${appData.linkedin}\n\n` +
                      `*College Details:*\n` +
                      `- College: ${appData.college}\n` +
                      `- Course: ${appData.course}\n` +
                      `- Year: ${appData.year} Year\n` +
                      `- ID/Roll No: ${appData.rollNumber}\n` +
                      `- Location: ${appData.city}\n\n` +
                      `Please review my application for approval. Thanks!`;
                      
        const waUrl = `https://wa.me/917993936047?text=${encodeURIComponent(waMsg)}`;
        
        form.reset();
        
        setTimeout(() => {
          window.open(waUrl, '_blank');
        }, 1000);
        
      } catch (err) {
        console.error("Failed to submit ambassador app", err);
        showToast("Submission failed. Try again.", "error");
      }
    };
  }

  // Admin Panel Tab Controller
  let activeAdminTab = 'users';
  function renderAdminPane() {
    const tabs = ['users', 'payments', 'ambassadors', 'withdrawals', 'logs', 'ai'];
    tabs.forEach(t => {
      const btn = document.getElementById(`btn-admin-tab-${t}`);
      const pane = document.getElementById(`admin-pane-${t}`);
      if (btn && pane) {
        if (t === activeAdminTab) {
          btn.className = 'tab-btn active';
          pane.style.display = 'block';
        } else {
          btn.className = 'tab-btn';
          pane.style.display = 'none';
        }
        btn.onclick = () => {
          activeAdminTab = t;
          renderAdminPane();
        };
      }
    });
    
    if (activeAdminTab === 'users') {
      const tbody = document.getElementById('admin-users-rows');
      if (tbody) {
        tbody.innerHTML = '';
        state.users.forEach(u => {
          const planText = u.purchasedPlan ? `<span style="background:rgba(34,197,94,0.15); color:#22c55e; font-weight:700; padding:2px 8px; border-radius:4px;">${u.purchasedPlan.name}</span>` : `<span style="color:var(--text-muted);">None</span>`;
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="font-family:monospace; font-size:11.5px;">${u.id.substring(0, 10)}...</td>
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <img src="${u.avatar}" style="width:24px; height:24px; border-radius:50%;" />
                <span style="font-weight:600;">${u.name}</span>
              </div>
            </td>
            <td><span class="id-card-role-tag">${u.role}</span></td>
            <td><i class="fas fa-fire" style="color:var(--warning);"></i> ${u.points}</td>
            <td>${planText}</td>
            <td>
              <button class="secondary-btn" style="padding:2px 8px; font-size:11px;" id="btn-admin-give-pts-${u.id}">+200 pts</button>
            </td>
          `;
          tbody.appendChild(tr);
          
          document.getElementById(`btn-admin-give-pts-${u.id}`).onclick = async () => {
            u.points = (u.points || 0) + 200;
            await db.collection('users').doc(u.id).set(u);
            showToast(`Awarded 200 points to ${u.name}!`, "success");
          };
        });
      }
    }
    
    if (activeAdminTab === 'payments') {
      const tbody = document.getElementById('admin-payments-rows');
      if (tbody) {
        tbody.innerHTML = '';
        if (state.purchases.length === 0) {
          tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:16px;">No payments recorded yet.</td></tr>`;
          return;
        }
        state.purchases.forEach(p => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${p.userName}</strong><br><span style="font-size:11px; color:var(--text-muted);">${p.userEmail}</span></td>
            <td><span style="font-weight:700; color:var(--primary);">${p.planName} Plan</span></td>
            <td><strong>${p.price}</strong></td>
            <td>${new Date(p.date).toLocaleString()}</td>
            <td><span style="background:rgba(34,197,94,0.15); color:#22c55e; font-weight:700; padding:2px 8px; border-radius:4px; font-size:11px;">Completed</span></td>
          `;
          tbody.appendChild(tr);
        });
      }
    }
    
    if (activeAdminTab === 'ambassadors') {
      const tbody = document.getElementById('admin-ambassadors-rows');
      if (tbody) {
        tbody.innerHTML = '';
        if (state.ambassadorApplications.length === 0) {
          tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:16px;">No ambassador applications submitted yet.</td></tr>`;
          return;
        }
        state.ambassadorApplications.forEach(a => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${a.name}</strong><br><span style="font-size:11px; color:var(--text-muted);">${a.email}</span></td>
            <td>Phone: ${a.phone}<br>WhatsApp: ${a.whatsapp}<br><a href="${a.linkedin}" target="_blank" style="font-size:11px;">Social Profile</a></td>
            <td><strong>${a.college}</strong><br>${a.course}</td>
            <td>Roll: ${a.rollNumber}<br>City: ${a.city}</td>
            <td>${new Date(a.date).toLocaleString()}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }
    
    if (activeAdminTab === 'withdrawals') {
      const tbody = document.getElementById('admin-withdrawals-rows');
      if (tbody) {
        tbody.innerHTML = '';
        if (state.withdrawals.length === 0) {
          tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:16px;">No withdrawal requests recorded yet.</td></tr>`;
          return;
        }
        state.withdrawals.forEach(w => {
          const isPending = w.status === 'pending';
          let detailsText = '';
          if (w.type === 'upi') {
            detailsText = `UPI ID: <code>${w.details.upiId}</code><br>Name: ${w.details.name}`;
          } else {
            detailsText = `Bank: ${w.details.bankName}<br>Holder: ${w.details.holderName}<br>Acc: <code>${w.details.accountNumber}</code><br>IFSC: <code>${w.details.ifsc}</code>`;
          }
          
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${w.userName}</strong></td>
            <td><i class="fas fa-fire" style="color:var(--warning);"></i> ${w.points} pts</td>
            <td><span style="text-transform:uppercase; font-size:11px; font-weight:700;">${w.type}</span></td>
            <td style="font-size:12px; font-family:sans-serif;">${detailsText}</td>
            <td>${new Date(w.date).toLocaleString()}</td>
            <td>
              <span style="background:rgba(${isPending ? '234,179,8' : '34,197,94'},0.15); color:rgb(${isPending ? '202,138,4' : '22,163,74'}); font-weight:700; padding:2px 8px; border-radius:4px; font-size:11px;">
                ${w.status}
              </span>
            </td>
            <td>
              ${isPending ? `<button class="secondary-btn" style="padding:2px 8px; font-size:11px; font-weight:600; background:rgba(34,197,94,0.1); color:#22c55e; border-color:#22c55e;" id="btn-admin-approve-wd-${w.id}">Approve</button>` : `<span style="font-size:11px; color:var(--text-muted);">No action</span>`}
            </td>
          `;
          tbody.appendChild(tr);
          
          if (isPending) {
            document.getElementById(`btn-admin-approve-wd-${w.id}`).onclick = async () => {
              w.status = 'approved';
              const wdSnap = await db.collection('withdrawals').where('id', '==', w.id).get();
              if (!wdSnap.empty) {
                await db.collection('withdrawals').doc(wdSnap.docs[0].id).update({ status: 'approved' });
              }
              showToast("Withdrawal request approved successfully!", "success");
            };
          }
        });
      }
    }
    
    if (activeAdminTab === 'logs') {
      const consolePanel = document.getElementById('admin-logs-console');
      if (consolePanel) {
        consolePanel.innerHTML = '';
        if (state.userActions.length === 0) {
          consolePanel.innerHTML = `<span style="color:#64748b;">No system logs available.</span>`;
          return;
        }
        state.userActions.forEach(log => {
          const div = document.createElement('div');
          div.style.marginBottom = '6px';
          div.style.lineHeight = '1.4';
          div.innerHTML = `
            <span style="color:#64748b;">[${new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span style="color:#f43f5e; font-weight:700;">USER_ACTION</span>
            <span style="color:#38bdf8; font-weight:700;">${log.userName}</span>: 
            <span style="color:#22c55e;">${log.actionType}</span> - 
            <span style="color:#e2e8f0;">${log.description}</span>
          `;
          consolePanel.appendChild(div);
        });
      }
    }

    if (activeAdminTab === 'ai') {
      const config = getOpenRouterConfig();
      const keyInput = document.getElementById('admin-openrouter-key');
      const modelSelect = document.getElementById('admin-openrouter-model');
      const toggleBtn = document.getElementById('toggle-admin-key-visibility');
      const saveBtn = document.getElementById('btn-admin-save-ai-config');

      if (keyInput && modelSelect) {
        keyInput.value = config.apiKey;
        modelSelect.value = config.model;

        if (toggleBtn) {
          toggleBtn.onclick = () => {
            if (keyInput.type === 'password') {
              keyInput.type = 'text';
              toggleBtn.className = 'fas fa-eye';
            } else {
              keyInput.type = 'password';
              toggleBtn.className = 'fas fa-eye-slash';
            }
          };
        }

        if (saveBtn) {
          saveBtn.onclick = () => {
            const newKey = keyInput.value.trim();
            const newModel = modelSelect.value;
            saveOpenRouterConfig(newKey, newModel);
            showToast('AI Settings saved successfully!', 'success');
            logUserAction('save_admin_ai_config', `Saved AI config: model=${newModel}`);
          };
        }
      }
    }
  }

  function setupAdminClearLogsListener() {
    const btn = document.getElementById('btn-admin-clear-logs');
    if (btn) {
      btn.onclick = async () => {
        if (confirm("Are you sure you want to clear all user activity logs from the database?")) {
          const logsSnap = await db.collection('user_actions').get();
          const batch = db.batch();
          logsSnap.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          showToast("Activity logs cleared from database!", "success");
        }
      };
    }
  }

  // Randy Fahmi Graphic Design Styled Custom Portfolio Generator
  function renderPortfolioView() {
    const container = document.getElementById('portfolio-container-inner');
    if (!container) return;
    
    const u = state.currentUser;
    if (!u) {
      container.innerHTML = `<p style="text-align:center; padding:48px;">Please log in to view portfolio.</p>`;
      return;
    }
    
    const skillsListStr = u.skills.length > 0 ? u.skills.slice(0, -1).join(', ') + ' and ' + u.skills[u.skills.length - 1] : 'various web tools';
    const introText = `I'm <strong>${u.name}</strong>, a self-taught professional specializing in <strong>${u.headline}</strong>. With expertise in <strong>${skillsListStr}</strong>, I love creating high-performance applications that don't just work well — they tell a story. From clean backend databases and API architectures to responsive, custom styled user interfaces, I enjoy bringing complex ideas to life. For me, development is all about connecting creative technology with people in a functional way.`;
    
    let skillsHtml = '';
    const devIconsMap = {
      'Python': '<i class="fab fa-python" style="color:#F5A623;"></i> Pr',
      'React': '<i class="fab fa-react" style="color:#F5A623;"></i> Re',
      'JavaScript': '<i class="fab fa-js" style="color:#F5A623;"></i> Js',
      'CSS3': '<i class="fab fa-css3-alt" style="color:#F5A623;"></i> Cs',
      'HTML5': '<i class="fab fa-html5" style="color:#F5A623;"></i> Ht',
      'Docker': '<i class="fab fa-docker" style="color:#F5A623;"></i> Dk',
      'Django': '<i class="fas fa-leaf" style="color:#F5A623;"></i> Dj',
      'PostgreSQL': '<i class="fas fa-database" style="color:#F5A623;"></i> Pg',
      'AWS': '<i class="fab fa-aws" style="color:#F5A623;"></i> Aw',
      'Kubernetes': '<i class="fas fa-cubes" style="color:#F5A623;"></i> Kb',
      'Linux': '<i class="fab fa-linux" style="color:#F5A623;"></i> Lx',
      'Figma': '<i class="fab fa-figma" style="color:#F5A623;"></i> Fg',
      'Git': '<i class="fab fa-git-alt" style="color:#F5A623;"></i> Gt'
    };
    
    u.skills.forEach(skill => {
      const label = devIconsMap[skill] || `<i class="fas fa-cube"></i> ${skill.substring(0, 2)}`;
      skillsHtml += `
        <div class="port-skill-tag" style="background:#1A1A1A; color:#FFFFFF; border: 1.5px solid #000; padding: 8px 14px; border-radius: 8px; font-weight:700; display:flex; align-items:center; gap:8px; font-size:13px; box-shadow: 2px 2px 0px #000;">
          ${label} <span style="font-weight:400; font-size:10.5px; color:#aaa; margin-left:4px;">${skill}</span>
        </div>
      `;
    });
    
    let tocCardsHtml = '';
    const defaultCards = [
      { title: "Software Engineer", desc: "Full-stack web & app development", icon: "fa-laptop-code" },
      { title: "System Architect", desc: "Database & API scaling solutions", icon: "fa-server" },
      { title: "UI/UX Designer", desc: "Modern interfaces & typography", icon: "fa-paint-brush" },
      { title: "AI Integrator", desc: "Connecting RAG & LLMs", icon: "fa-brain" }
    ];
    
    const ownProjects = state.projects.filter(p => p.creator_id === u.id).slice(0, 4);
    const cardsToUse = ownProjects.length >= 2 ? ownProjects.map((p, idx) => ({
      title: p.title,
      desc: p.description.substring(0, 30) + '...',
      icon: idx === 0 ? "fa-laptop-code" : idx === 1 ? "fa-laptop" : idx === 2 ? "fa-cogs" : "fa-network-wired"
    })) : defaultCards;
    
    while (cardsToUse.length < 4) {
      cardsToUse.push(defaultCards[cardsToUse.length]);
    }
    
    cardsToUse.forEach(card => {
      tocCardsHtml += `
        <div class="port-toc-card" style="background:#F5A623; color:#1A1A1A; padding:24px; border-radius:24px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; min-height:160px; box-shadow: 4px 4px 0px #000; border:2.5px solid #1A1A1A;">
          <div style="font-size:32px; margin-bottom:12px;"><i class="fas ${card.icon}"></i></div>
          <h4 style="font-size:15px; font-weight:800; margin:0 0 4px 0; text-transform:uppercase; letter-spacing:0.5px;">${card.title}</h4>
          <p style="font-size:12px; font-weight:600; margin:0; opacity:0.8;">${card.desc}</p>
        </div>
      `;
    });
    
    let experienceHtml = '';
    const experiences = u.experiences && u.experiences.length > 0 ? u.experiences : [
      { role: `${u.headline || 'Student Developer'}`, company: `${u.college || 'Edworld Workspace'}`, period: `${(u.graduationYear ? (u.graduationYear - 2) : 2024)} - Present` },
      { role: "Software Engineer Intern", company: "Local Tech Firm", period: `${(u.graduationYear ? (u.graduationYear - 3) : 2023)} - ${(u.graduationYear ? (u.graduationYear - 2) : 2024)}` }
    ];
    // Right: Hello Bio, Skills, Experience
    const finalBio = state.customAiBio || introText;
    
    experienceHtml = '';
    experiences.forEach(exp => {
      experienceHtml += `
        <div style="margin-bottom:12px; border-bottom:1px solid #CCC; padding-bottom:10px;">
          <h5 style="margin:0; font-size:13.5px; font-weight:800; text-transform:uppercase; color:#1A1A1A;">${exp.role}</h5>
          <div style="font-size:12px; color:#555; display:flex; justify-content:space-between; margin-top:2px;">
            <span>${exp.company}</span>
            <strong>${exp.period}</strong>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = `
      <div style="padding: 48px 16px; max-width: 1000px; margin: auto; box-sizing: border-box;">
        <!-- HERO HEADER BLOCK -->
        <div class="port-hero-grid" style="border-bottom:3px solid #1A1A1A; padding-bottom:48px;">
          <div>
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
              <span style="background:#F5A623; color:#1A1A1A; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:800; text-transform:uppercase; border:1.5px solid #1A1A1A;">${u.role.toUpperCase()} PORTFOLIO</span>
            </div>
            <!-- LARGE BUBBLE Heading customized with user name -->
            <h1 class="hero-headline" style="font-size: 72px; font-family:'Outfit', 'Impact', sans-serif; font-weight:900; line-height:1.0; margin:0; text-transform:uppercase; letter-spacing:-2px; color:#1A1A1A; position:relative;">
              <span style="position:relative; z-index:2;">${u.name.split(' ')[0]}</span><br>
              <span style="color:transparent; -webkit-text-stroke: 2.5px #1A1A1A; position:relative; z-index:2;">${u.name.split(' ')[1] || 'PORTFOLIO'}.</span>
              <div style="position:absolute; width:180px; height:60px; background:#F5A623; border-radius:50px; top:35px; left:-20px; z-index:1; transform: rotate(-5deg);"></div>
            </h1>
            <p style="font-size:15px; font-weight:700; color:#555; margin-top:16px;">Selected Best Projects & Structured Skills Development Until 2026</p>
          </div>
          
          <!-- RIGHT IMAGE FRAME (Offset Yellow Backdrop with 3D Tilt Effect) -->
          <div class="right-image-frame portfolio-3d-avatar-container" style="display:flex; justify-content:center; align-items:center; position:relative;">
            <div style="position:absolute; width:220px; height:220px; background:#F5A623; border-radius:50%; border:2px solid #1A1A1A; top:10px; right:10px; z-index:1;"></div>
            <div class="portfolio-3d-avatar-frame" style="width:230px; height:270px; border:3px solid #1A1A1A; background:#FFF; border-radius:16px; overflow:hidden; z-index:2; position:relative; box-shadow: 6px 6px 0px #1A1A1A; display:flex; align-items:center; justify-content:center; padding:12px;">
              <img src="${u.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:8px; filter: grayscale(100%) contrast(110%);" />
            </div>
          </div>
        </div>
        
        <!-- ABOUT AND SKILLS BLOCK -->
        <div class="port-about-grid" style="padding:48px 0; border-bottom:3px solid #1A1A1A;">
          <!-- Left: Contacts & QR Code -->
          <div>
            <div style="background:#FFF; border:3px solid #1A1A1A; border-radius:24px; padding:24px; box-shadow: 6px 6px 0px #1A1A1A; margin-bottom:24px; display:flex; flex-direction:column; align-items:center;">
              <div style="display:flex; justify-content:center; margin-bottom:16px;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(u.portfolio || ('https://edworld.co/portfolio/' + u.id))}" style="width:130px; height:130px; border:2.5px solid #1A1A1A; padding:6px; border-radius:8px; background:#FFF;" crossorigin="anonymous" />
              </div>
              
              <h4 style="font-size:16px; font-weight:800; border-bottom:1.5px solid #1A1A1A; padding-bottom:6px; margin:0 0 12px 0; text-transform:uppercase; text-align:center; width:100%;">Let's Work Together</h4>
              <div style="font-size:12.5px; display:flex; flex-direction:column; gap:8px; width:100%;">
                <div><i class="far fa-envelope" style="color:#F5A623; width:16px;"></i> ${u.email || 'no-email@edworld.com'}</div>
                <div><i class="fab fa-github" style="color:#F5A623; width:16px;"></i> ${u.github ? u.github.replace('https://', '') : 'github.com/' + u.name.toLowerCase().replace(/\s+/g, '')}</div>
                <div><i class="fab fa-linkedin" style="color:#F5A623; width:16px;"></i> ${u.linkedin ? u.linkedin.replace('https://', '') : 'linkedin.com/in/' + u.name.toLowerCase().replace(/\s+/g, '')}</div>
                <div><i class="fas fa-globe" style="color:#F5A623; width:16px;"></i> ${u.portfolio ? u.portfolio.replace('https://', '') : 'edworld.co/portfolio/' + u.id.substring(0, 8)}</div>
              </div>
            </div>
          </div>
          
          <!-- Right: Hello Bio, Skills, Experience -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h2 style="font-size:32px; font-weight:900; margin:0; text-transform:uppercase; letter-spacing:-1px;">Hello.</h2>
              <button class="secondary-btn" id="btn-portfolio-ai-bio" style="padding:4px 10px; font-size:11px; background:#1A1A1A; color:#FFF; border:1.5px solid #000; border-radius:6px; font-weight:700; cursor:pointer; box-shadow: 2px 2px 0px #000; display:flex; align-items:center; gap:6px;">
                <i class="fas fa-magic"></i> AI Rewrite
              </button>
            </div>
            <p style="font-size:14.5px; color:#333; margin-bottom:32px; line-height:1.6;">${finalBio}</p>
            
            <div class="port-details-grid">
              <!-- Education & Experience -->
              <div>
                <h4 style="font-size:14px; font-weight:800; border-bottom:1.5px solid #1A1A1A; padding-bottom:4px; margin:0 0 12px 0; text-transform:uppercase; color:#1A1A1A;">Working Experience</h4>
                ${experienceHtml}
                
                <h4 style="font-size:14px; font-weight:800; border-bottom:1.5px solid #1A1A1A; padding-bottom:4px; margin:24px 0 12px 0; text-transform:uppercase; color:#1A1A1A;">Education</h4>
                <div>
                  <h5 style="margin:0; font-size:13px; font-weight:800; text-transform:uppercase; color:#1A1A1A;">${u.degree || 'B.Tech'} ${u.branch || 'Computer Science & Engineering'}</h5>
                  <span style="font-size:11.5px; color:#555;">${u.college || 'GITAM University'} &bull; ${(u.graduationYear ? (u.graduationYear - 4) : 2022)} - ${u.graduationYear || 2026}</span>
                </div>
              </div>
              
              <!-- Software Skills -->
              <div>
                <h4 style="font-size:14px; font-weight:800; border-bottom:1.5px solid #1A1A1A; padding-bottom:4px; margin:0 0 12px 0; text-transform:uppercase; color:#1A1A1A;">Software Skills</h4>
                <div style="display:flex; flex-wrap:wrap; gap:8px;">
                  ${skillsHtml}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- TABLE OF CONTENT SECTION (4 Grid Cards) -->
        <div style="padding:48px 0 24px 0;">
          <h3 style="font-size:20px; font-weight:900; text-transform:uppercase; margin:0 0 24px 0; text-align:center; letter-spacing:-0.5px;">Table of Content / Area of Expertise</h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:24px;">
            ${tocCardsHtml}
          </div>
        </div>
      </div>
    `;

    // Bind AI Rewrite Click handler
    const aiBioBtn = document.getElementById('btn-portfolio-ai-bio');
    if (aiBioBtn) {
      aiBioBtn.onclick = async () => {
        if (!ensureOpenRouterKey()) return;
        
        const originalText = aiBioBtn.innerHTML;
        aiBioBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Writing...`;
        aiBioBtn.disabled = true;
        showToast('Consulting OpenRouter Copywriter...', 'info');

        try {
          const systemPrompt = `You are a professional portfolio copywriter. Rewrite the user's bio introduction into a single punchy, professional, and brutalist-style paragraph (3-4 sentences).
Incorporate their name, headline, and key skills naturally. Keep it extremely engaging. Do not use formatting like lists. Only output the paragraph itself.`;
          
          const userPrompt = `Name: ${u.name}, Headline: ${u.headline}, Skills: ${skillsListStr}`;
          const generatedBio = await fetchOpenRouterCompletion([{ role: 'user', content: userPrompt }], systemPrompt);
          
          if (generatedBio) {
            state.customAiBio = generatedBio.trim();
            renderPortfolioView(); // Re-render instantly
            showToast('AI Portfolio Bio generated!', 'success');
            // Write to Firestore profile bio
            await db.collection('users').doc(u.id).update({ bio: state.customAiBio });
            logUserAction('generate_portfolio_ai_bio', 'Rewrote portfolio biography using OpenRouter.');
          }
        } catch (err) {
          console.error('[OpenRouter Bio Error]', err);
          showToast(`AI Rewrite failed: ${err.message}`, 'error');
        } finally {
          aiBioBtn.innerHTML = originalText;
          aiBioBtn.disabled = false;
        }
      };
    }
    
    logUserAction('view_custom_portfolio', `Viewed generated premium portfolio website.`);
  }

})();
