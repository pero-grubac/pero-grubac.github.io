<div align="center">

# 🌐 pero-grubac.github.io

![HTML](https://img.shields.io/badge/HTML-Portfolio-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-Styling-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-deployed-4c1?style=flat-square&logo=github&logoColor=white)


[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-PORTFOLIO-4c8af5?style=for-the-badge)](https://pero-grubac.github.io)

</div>

---

## 📌 About

Portfolio website showcasing my projects, tech stack and contact information. Built from scratch without any frameworks — pure HTML, CSS and vanilla JavaScript.

---

## 🗂️ Projects

All 19 projects live in one **Projects** section with a single search bar (`grep -i …`) and kind filters (systems · live · mobile · desktop · tool). Searches and filters are kept in the URL, so a link like `?q=docker` or `#arcane-keep` opens that exact view.

**Featured systems** — always visible, each with a demo video:

1. **Incident Alert** — Microservices incident tracking system (ASP.NET · React · RabbitMQ · Docker)
2. **eMobilityHub** — Electric vehicle rental platform (Spring Boot · Angular · MySQL · Docker)
3. **Chat Room** — Secure forum with 2FA and OAuth2 (Spring Boot · React · JWT · Docker)
4. **Online Library System** — Distributed Java platform (Redis · WebSocket · RMI · RabbitMQ)

**Index** — one row per project; rows open in place with a preview, a short description and key highlights, and live apps launch straight from the row:

- **Live apps** — Arcane Keep, DevKit, GitHub Dashboard, Dev Timeline, Countdown, Catan Map Generator, excuse.exe, Sedmica, Lora Score Table, Yamb Table
- **Mobile** — FitForge, AssetManager, ETF Oglasi (Flutter · Dart · SQLite)
- **Desktop** — Store Management System (C# · .NET · WinForms · MySQL in Docker)
- **Tool** — GitHub Discord Bot (Python · discord.py · Flask · PostgreSQL)

### ⌨️ Keyboard

| Key | Action |
| --- | --- |
| `/` | Search projects |
| `Ctrl` + `K` | Command menu — jump to a project, launch an app, copy email |
| `t` | Toggle light / dark theme |
| `j` / `k` | Move between index rows · `Enter` opens · `o` launches a live app |
| `Esc` | Clear the search |

---

## 🛠️ Tech Stack

| Technology         | Usage                                            |
| ------------------- | ------------------------------------------------- |
| HTML5               | Structure                                          |
| CSS3                | Styling, OKLCH color tokens (light + dark), animations |
| Vanilla JavaScript  | Project search, command menu, keyboard shortcuts, light/dark toggle, staggered reveal |
| Google Fonts        | Space Grotesk (display) · Inter (body) · JetBrains Mono (code/labels) |
| Font Awesome        | Icons                                              |
| GitHub Pages        | Hosting                                            |

---

## 🚀 Setup & Run

No build step required — just open `index.html` in a browser or clone and serve locally:

```bash
git clone https://github.com/pero-grubac/pero-grubac.github.io.git
cd pero-grubac.github.io
# Open index.html in browser or use Live Server in VS Code
```

---

## 📁 Project Structure

```
pero-grubac.github.io/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── scripts.js
├── assets/
│   ├── avatar.jpeg
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── og-card.png          # link-preview image
│   ├── incident_alert/      # featured systems: demo.mp4 + poster image
│   ├── e-mobility-hub/
│   ├── chatroom/
│   ├── library/
│   ├── live/                # live app screenshots (WebP)
│   ├── fitforge/            # mobile & desktop: preview.webp built from real app screens
│   ├── asset_manager/
│   ├── etf_oglasi/
│   └── store_management/
└── README.md
```
