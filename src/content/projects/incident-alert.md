---
order: 1
slug: incident-alert
title: "Incident Alert"
kind: system
year: 2024
summary: "Citizens report incidents on a map; moderators approve them first."
description: "Citizens report incidents on a map with photos; nothing reaches the public map until a moderator approves it. Four ASP.NET Core 10 services: a public API, a moderation service with its own database, ML.NET k-means grouping of similar reports, and statistics with hot spots and daily trends. Reports, approvals and categories travel as MassTransit events over RabbitMQ, photos included. Accounts are approved by an admin, and Google ID tokens are verified on the server. 94 backend and 108 frontend tests; CI runs an end-to-end smoke test against the whole Docker stack and publishes the images to GHCR."
flow: "React apps → ASP.NET services ⇄ RabbitMQ + PostgreSQL"
highlights: []
stack: ["ASP.NET", "C#", "React", "RabbitMQ", "MassTransit", "PostgreSQL", "ML.NET", "Leaflet", "Docker", "Microservices", "JWT", "REST APIs"]
links:
  repos:
    - label: "Backend"
      url: "https://github.com/pero-grubac/IncidentAlert"
    - label: "Frontend"
      url: "https://github.com/pero-grubac/IncidentAlertFrontend"
    - label: "Management"
      url: "https://github.com/pero-grubac/IncidentAlertFrontend-Mangement"
image: "../../assets/incident_alert/demo.webp"
imageAlt: "Incident Alert: a map of Bosnia and Herzegovina with incident pins and clusters, next to a panel with period and category filters and the latest reported incidents"
video: "/assets/incident_alert/demo.mp4"
featured: true
caseStudy: true
---
