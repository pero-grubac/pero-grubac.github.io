---
order: 23
slug: secure-repository
title: "Secure Repository"
kind: tool
year: 2023
summary: "A document vault on a private OpenSSL certificate authority."
description: "A document vault on a private OpenSSL certificate authority. Every document gets its own key, is signed, split into parts, and each part is encrypted and signed on its own, so a tampered part is named before anything is decrypted."
highlights:
  - "Private CA (4096-bit RSA); X.509 user certificates valid 180 days, revoked through a CRL"
  - "Per-document AES-256 key wrapped with RSA-OAEP; 4–9 parts, each encrypted then signed"
  - "Two-factor sign-in: password (PBKDF2, 600,000 iterations) plus certificate"
  - "144 tests, including integration tests against real OpenSSL · CI on Windows and Linux"
stack: ["C#", ".NET", "OpenSSL", "PKI", "Cryptography", "xUnit"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/Secure-Repository"
image: "../../assets/secure_repository/preview.webp"
imageAlt: "Secure Repository: signing in with a certificate and downloading a verified document"
featured: false
caseStudy: false
---
