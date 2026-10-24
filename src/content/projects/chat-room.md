---
order: 3
slug: chat-room
title: "Chat Room"
kind: system
year: 2024
summary: "Secure forum with two-factor sign-in and TLS on every hop."
metaDescription: "Chat Room, a secure forum in Spring Boot and React: admin-approved accounts, moderated comments, two-factor sign-in, TLS on every hop, a WAF and a SIEM."
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

## What it does

Chat Room is a moderated discussion forum I built for the project assignment of the Internet Security course (Sigurnost na internetu) at ETF Banja Luka.

Registered users discuss topics in rooms, by default Science, Culture, Sports and Music. Nobody gets in on their own: a new account waits until an administrator approves it and decides its role, permissions and rooms, and the user is told by email either way. Every new comment waits for a moderator of its room before anyone else sees it.

There are three roles. Users read the latest 20 published comments of every room and post their own. Moderators can also publish, adjust, forbid or delete pending comments, but only in the rooms assigned to them and only as far as their permissions (add, update, delete) allow. Administrators can do all of that in every room, approve or reject registrations, block and restore accounts, and read the security log. Signing in takes two steps, a password and then a one-time code sent by email, and Google sign-in follows the same rule.

## Architecture

The browser only talks to Nginx. Nginx terminates TLS, serves the React app and forwards everything under `/api` to the Spring Boot backend over HTTPS, after checking the backend's certificate against the project's own certificate authority and its revocation list. Only the backend talks to MySQL (over TLS, with the CA and the host name checked), to the mail server that sends the login codes, and to Google.

Inside the backend, every request passes the same chain: a rate limit on sign-in and registration, the JWT filter, the application firewall (WAF) on the request body, and a role and permission check on the endpoint, before it reaches the controllers and services, where the room checks live. Every security-sensitive event along the way goes to the SIEM, which writes it to a JSON log file and to the database.

A small Certificate Controller, an OpenSSL certificate authority, runs as a one-off container before the others start. It issues, tracks and revokes the certificates of Nginx, the backend and MySQL, and publishes the CA certificate and the revocation list next to them.

## Decisions and why

- **The JWT lives in an httpOnly cookie.** Scripts on the page, injected ones included, cannot read it or send it elsewhere, and SameSite=Strict stops other sites from riding on it, which is why the forum needs no CSRF tokens.
- **I keep a session list on the server.** A token is accepted only if it equals the one stored with the user, so signing out, being blocked, tripping the WAF or signing in again ends a session at once. The cost is one database read per request.
- **Permissions apply per room**, and they are checked in the service layer on every moderation call, so no endpoint can forget them.
- **Exact permission sets.** Changing a role sets the permissions to exactly what the administrator chose, so an administrator demoted to moderator does not keep delete rights by accident.
- **Codes that cannot be farmed.** A login code expires after five minutes and is gone after one attempt, right or wrong; together with the rate limit, guessing is not an option.
- **WAF rules match attacks, not words.** A rule describes the shape of an attack (`UNION SELECT`, `' OR 1=1`, an HTML tag, `${`, `../`), so ordinary sentences pass. Parameter binding in JPA and React's escaping remain the main defence; the WAF stops obvious probes and feeds the SIEM.
- **Every hop is verified, not only encrypted.** A revoked or foreign certificate breaks the connection instead of being accepted silently.
- **The CA key stays put.** Only the Certificate Controller can read the CA's private key; every other container sees just its own certificate and key, read-only.

## Security

Beyond the decisions above:

- Passwords need 8 to 72 characters with upper and lower case, a digit and a special character, checked on the server too, and they are stored with BCrypt.
- For Google sign-in, the server checks the access token with Google: it must have been issued to this app and belong to a verified email. A profile sent by the browser is never trusted.
- Sign-in and registration are rate-limited per client IP, answering 429 with a Retry-After header.
- The SIEM records 18 kinds of events (failed and successful sign-ins, rejected or reused tokens, denied access, WAF hits, rate limits, account changes) with the user, the IP and the time. Recording never fails the request that triggered it, and line breaks are neutralised so nobody can forge log entries.
- Every error is an RFC 7807 problem response with a fitting status, and unexpected errors reach the client only as "Unexpected error".

## Testing and deployment

The backend has 219 tests and the React app 86. The backend tests need neither MySQL nor Docker: they run the full Spring context on an in-memory H2 database with email and Google mocked, and cover two-factor sign-in and the cookie, bypass attempts, the whole permission matrix, moderation per room, blocking, and the SIEM records. The WAF alone has 49 tests, with 24 attack payloads that must be caught and 11 ordinary sentences that must pass.

The whole stack (the Certificate Controller, MySQL, the backend, Nginx with the React app, and Mailpit to catch the login codes) starts with one Docker Compose command. A smoke test signs in as the administrator through Nginx with the full two-factor flow, calls protected endpoints, signs out, and checks that every certificate verifies against the CA and that MySQL refuses unencrypted connections. CI runs it after the backend and frontend jobs, runs only the jobs whose part changed, caches Maven, npm and the Docker layers, and generates a fresh JWT key so no secret lives in the repository.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
