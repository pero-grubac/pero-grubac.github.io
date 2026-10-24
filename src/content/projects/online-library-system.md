---
order: 4
slug: online-library-system
title: "Online Library System"
kind: system
year: 2024
summary: "Distributed library: Java apps talking over sockets, RMI and queues."
metaDescription: "Online Library System: seven Java apps that talk over REST, TCP and TLS sockets, UDP multicast, RabbitMQ and RMI, with the protocol that fits each link."
description: "Distributed library platform of seven Java applications: three Swing clients for the library, members and suppliers, plus a REST API, a discovery server, a supplier server that downloads books from Project Gutenberg, and an RMI accounting server. Each link uses the protocol that fits it: REST, TCP and TLS sockets, UDP multicast, RabbitMQ and RMI. Supplier orders go through durable queues, invoices get 17% VAT over RMI, and nothing is Java-deserialized off the wire. 171 tests."
flow: "Java apps ⇄ REST · TCP/TLS · multicast · MQ · RMI + Redis"
highlights: []
stack: ["Java", "Redis", "Sockets", "TLS", "UDP Multicast", "RMI", "RabbitMQ", "JAX-RS", "Swing", "JWT", "REST APIs"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/Online-Library-System"
image: "../../assets/library/demo.webp"
imageAlt: "Online Library System: the librarian's desktop client with one book in the catalogue and the Choose Supplier dialog open"
video: "/assets/library/demo.mp4"
featured: true
caseStudy: true
---

## What it does

The Online Library System simulates an online library with three kinds of users. Members register, wait for the library to approve them, browse and preview e-books, reserve them or have them e-mailed as a ZIP, propose new books and chat. Library staff approve and manage members, keep the catalogue, confirm reservations and order new books from suppliers. Suppliers publish an offer of books downloaded from Project Gutenberg, review the library's orders, and ship the books with an invoice.

It is seven Java applications: three Swing desktop apps (Library, User and Supplier) and four servers. I used every communication technology of the course for the job it fits best: REST, TCP and TLS sockets, UDP multicast, RabbitMQ and RMI.

## Architecture

- **LibraryServer** is a REST API (JAX-RS on Tomcat). It keeps the members in an XML store and the catalogue in Redis, and e-mails books as a ZIP. The Library and User apps call it with a signed token.
- **DiscoveryServer** is a TCP registry of who is online and on which port. Suppliers and members register and keep their entry alive with a heartbeat, and the Library asks it which suppliers are online.
- **Ordering** uses three channels. The Library reads a supplier's offer over a TCP socket and sends the order through RabbitMQ, to a durable queue of that supplier, so an order waits while the supplier is offline. When the supplier approves it, the books and the invoice come back to the Library over TCP, and the books go into the catalogue.
- **Invoicing** is an RMI call: the supplier books each invoice with the AccountingServer, which adds 17% VAT and archives it as JSON.
- **SupplierServer** downloads books and covers from Project Gutenberg and keeps each supplier's copies; the Supplier app talks to it over TCP.
- **Chat**: members chat privately over TLS sockets, peer to peer, and as a group with the library over UDP multicast, which also carries book proposals and the library's answers.

All of these except RMI carry the same JSON messages, and every application uses one shared module with the model, the JSON format, the socket channel and the REST client.

## Decisions and why

- **One protocol per job.** The catalogue is shared state, so it sits behind REST. Discovery and bulk transfer are request and response, so they use sockets. Orders must reach a supplier that may be offline, so they go through a durable queue. Invoicing is a remote method call, so it uses RMI.
- **JSON instead of Java serialization.** A serialized object can run code while it is read, so I never deserialize anything from the network blindly: each message is plain JSON, and the receiver decodes it into the one type it expects. RMI cannot avoid serialization, so it accepts only the system's own classes, through a JEP 290 filter.
- **Discovery that heals itself.** Entries that stop renewing expire after 30 seconds, so a crashed client never stays listed.
- **One shared model.** The shared module holds the only copy of every message and model class, so a change shows up on both ends of a protocol at once.
- **Lists carry a preview, not the book.** Lists send the metadata, the cover and the first 100 lines; the full text travels only when it is needed, for delivery to the library and for e-mail.
- **Stable book keys.** A book is identified by author, title, language and release date, normalised into one Redis key, so the same book from two suppliers is stored once.

## Security

- Passwords are stored as salted PBKDF2-HMAC-SHA256 hashes with 600,000 iterations, and passwords saved in plain text by older versions are re-hashed at the member's next sign-in.
- Sessions are signed JWTs with a member or admin role, valid for 8 hours.
- Authorization is closed by default: an endpoint that doesn't declare who may call it needs a token, members get 403 on staff endpoints, members can only e-mail books to themselves, and a blocked member loses access at once, not when the token expires.
- Messages are capped at 32 MB, and secrets (the staff password, the token key, the mail password) come from environment variables, never from Git.

## Testing and deployment

171 tests run on every push in GitHub Actions, and every protocol is tested over a real socket, queue or registry. Socket and RMI tests open their own servers on free ports, the REST API runs in memory, and Redis and RabbitMQ run in throwaway containers through Testcontainers. The tests cover, among other things, 401 and 403 on every protected endpoint, a blocked member being cut off at once, discovery entries expiring without a heartbeat, VAT on quantities, an order sent while a supplier is offline arriving later, and foreign classes being rejected by the RMI filter.

Redis, RabbitMQ and the REST API run in Docker Compose; the desktop apps and the other servers are runnable jars from one multi-module Maven build. CI builds every module, runs all the tests and builds the Docker image.
