---
order: 23
slug: secure-repository
title: "Secure Repository"
kind: tool
year: 2023
summary: "A document vault on a private OpenSSL certificate authority."
metaDescription: "Secure Repository: a document vault on a private OpenSSL CA. Every document gets its own key and is split into parts, each encrypted and signed on its own."
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
caseStudy: true
---

## What it does

Secure Repository is a console application I wrote for a cryptography course. It stores documents so that someone who only has the disk can neither read them nor change them unnoticed: all they find are encrypted parts, encrypted keys and signatures. All the cryptography is done with OpenSSL, using the same commands as in the course labs, so every step can also be repeated by hand.

The application runs its own certificate authority, with a 4096-bit RSA key. Registering issues a user a 3072-bit RSA key pair and an X.509 certificate valid for 180 days, in a .pfx file protected by the user's own password. Signing in needs both that file and the password. A signed-in user can store, list, retrieve and delete their own documents, of any file type. A CA operator, who holds the CA password, can put a certificate on hold, so it cannot be used to sign in, and reactivate it later; the user's documents are kept.

## How it works

A stored document is never kept in one piece:

1. It gets its own random AES-256 key, which is stored only encrypted with the user's RSA public key (OAEP).
2. It is signed as a whole with the user's private key (RSA with SHA-256).
3. It is split at byte level into a random number of parts, 4 to 9 by default, each in its own folder.
4. Every part is encrypted with AES-256-CBC and then signed on its own. The plain parts exist only in a temporary folder, which is deleted afterwards.

Retrieving goes the other way. The document key is unwrapped in memory, and each part's signature is checked before that part is decrypted, so a damaged part is named by its number and nothing is written. The joined document is handed back only if its own signature matches, which also catches parts that were swapped or removed.

Signing in checks the password first, against a PBKDF2 hash, and then the certificate: it must open with the password, be issued by this CA, be neither expired nor revoked, and carry the public key stored for this user. If any check fails, the session ends with the reason.

## Decisions and why

- **A private CA instead of plain accounts.** Signing in needs something the user has (the .pfx) and something they know (the password), and access can be withdrawn by revoking the certificate without touching the user's data.
- **A key per document.** A leaked key exposes one document only. The key exists in plain form only in memory, while the document is stored or retrieved.
- **Sign first, then split, encrypt and sign again.** The document signature proves the parts were joined in the right order; the part signatures name the damaged part and keep tampered ciphertext away from decryption.
- **Signatures, not HMAC, on the parts.** OpenSSL's HMAC options accept the key only as a command-line argument, which would put it in the process list. A signature on each encrypted part gives the same encrypt-then-sign guarantee with the key that is already there.
- **The CRL and the CA index together.** OpenSSL checks the signed CRL, and the CA's index gives the reason (revoked or expired), so a certificate on hold is refused even if one of them is out of date.

## Security

- **The user's password protects the user's key.** The .pfx and the stored private key are encrypted with the user's own password, not with a shared constant, and the CA never keeps a copy of the private key.
- **Passwords** are hashed with PBKDF2-HMAC-SHA256, 600,000 iterations and a 16-byte random salt, compared in constant time, and masked with `*` while they are typed.
- **No shell, no secrets on the command line.** OpenSSL is started directly with an argument list, so a file name can never become a command, and passwords and keys reach it through environment variables, never the process list. Every name is validated as well.
- **The CA password is never in the code or the settings.** It lives in DPAPI on Windows, readable only by that Windows account, or in an environment variable.
- **Deleting a document** overwrites its wrapped key with random bytes and removes it before the parts, so leftover parts can never be decrypted again.

It has known limits: the CA runs on the same machine as the application, so whoever has the CA password is the CA operator, and on an SSD an overwritten wrapped key may survive in old blocks, although it is useless without the user's private key and password.

## Testing

The 144 tests include integration tests against real OpenSSL. They cover, among other things, foreign, expired and revoked certificates, reactivation, a certificate that belongs to someone else, damaged parts named by number, swapped and missing parts, a tampered signature or key, path traversal, and whole sessions through the menus, each run on a temporary copy with its own CA.

CI runs every test against real OpenSSL on Windows and Linux, fails if any NuGet package has a known vulnerability, and checks the CA setup script on a clean checkout.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
