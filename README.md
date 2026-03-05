# ⚡ Code Sync - Real-Time Collaborative Editor

![Code Sync Banner](https://via.placeholder.com/1200x400.png?text=Code+Sync+-+Code.+Sync.+Ship.)

**Code Sync** is a high-performance, real-time collaborative code editor built for developers, interviewers, and peers to write, compile, and discuss code seamlessly. Featuring a premium OLED dark theme, live floating cursors, and an integrated remote code execution engine.

---

## ✨ Features That Stand Out

- **👨‍💻 Real-Time Collaboration:** Millisecond-latency code syncing across multiple clients.
- **🖱️ Live Floating Cursors:** Figma-style live cursors with neon name tags to track peer movements.
- **🚀 Remote Code Execution:** Instantly compile and run code in multiple languages (C++, Java, Python, JavaScript) directly from the browser.
- **💬 Integrated Group Chat:** Real-time messaging within the coding room to discuss logic and algorithms.
- **🎨 Premium OLED UI:** Glassmorphism effects, neon gradients, and typewriter animations for a top-tier developer experience.
- **🔒 Secure Rooms:** Unique Room IDs ensure your coding sessions remain private and distraction-free.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
- **Library:** React.js (Hooks, Context API)
- **Styling:** Tailwind CSS (Custom OLED theme, Animations)
- **Editor Core:** Microsoft Monaco Editor (`@monaco-editor/react`)
- **Routing:** React Router DOM

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express.js
- **WebSockets:** Socket.io (For real-time bi-directional communication)
- **Execution Engine:** Piston API / Docker (Isolated code execution)

---

## 📸 Sneak Peek (Screenshots)

*(Add your actual screenshots here by replacing the links)*

| Join Room (OLED Theme) | Editor Workspace |
| :---: | :---: |
| ![Join Room](https://via.placeholder.com/400x250.png?text=Login+Screen) | ![Editor](https://via.placeholder.com/400x250.png?text=Editor+Workspace) |

---

## 🚀 Run It Locally (Installation Guide)

Want to test it out on your own machine? Follow these steps:

**1. Clone the repository:**
```bash
git clone [https://github.com/your-username/code-sync.git](https://github.com/Ashutoshporwal-ashu/code-sync.git)
cd code-sync