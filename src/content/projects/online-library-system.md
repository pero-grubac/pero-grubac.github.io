---
order: 4
slug: online-library-system
title: "Online Library System"
kind: system
year: 2024
summary: "Distributed library platform; each link uses the protocol that fits."
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
