---
order: 3
slug: chat-room
title: "Chat Room"
kind: system
year: 2024
summary: "Secure forum with two-factor sign-in and TLS on every hop."
description: "Secure internet forum where accounts are approved by an admin and every comment waits for a room moderator. Two-factor sign-in with an emailed code, Google OAuth2, and revocable JWT sessions in an httpOnly cookie. TLS on every hop with certificates from an internal OpenSSL CA; a WAF hit ends the sender's session and a SIEM logs 18 kinds of security events. 219 backend and 86 frontend tests."
flow: "React → Nginx → Spring Boot (WAF · SIEM) → MySQL"
highlights: []
stack: ["Spring Boot", "Java", "React", "Vite", "MySQL", "Spring Security", "JWT", "OAuth2", "OpenSSL", "Flyway", "Docker", "Nginx"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/Chat-room"
image: "../../assets/chatroom/demo.webp"
imageAlt: "Chat Room: the login form with username, password and Google sign-in, on the first step of the two-factor sign-in"
video: "/assets/chatroom/demo.mp4"
featured: true
caseStudy: true
---
