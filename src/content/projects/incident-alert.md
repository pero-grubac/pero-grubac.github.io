---
order: 1
slug: incident-alert
title: "Incident Alert"
kind: system
year: 2024
summary: "Citizens report incidents on a map; moderators approve them first."
metaDescription: "Incident Alert: citizens report incidents on a map and moderators approve them first. Four ASP.NET Core 10 services over RabbitMQ, with React apps in front."
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

## What it does

Incident Alert lets citizens report what is happening around them, such as a fire, a flood, a traffic problem or a crime, at a place on the map and with photos. Nothing they send goes public straight away. Every report waits in a moderation queue, and only when a moderator approves it does it appear on the public map, count in the statistics and get grouped with similar reports.

Each audience has its own React app. Citizens use the public app without an account: they browse approved incidents by period and category, open a place to see everything reported there, and report something new. Moderators and administrators sign in to the moderation app, where they review the queue on a map, approve, reject or delete reports, manage the categories, and look at statistics, a hot-spot map and groups of similar reports. Both apps are in Serbian and English, with a light and a dark theme.

## Architecture

I split the backend into four ASP.NET Core 10 services. The two that keep data each own a PostgreSQL database. They never share tables: everything that crosses a service boundary is a message or an HTTP call.

- **IncidentAlert** is the public API. It serves approved incidents and their photos and accepts new reports.
- **IncidentAlert-Management** holds the moderation queue, the categories and the accounts, and signs moderators in.
- **IncidentAlert-ML** groups published incidents by the similarity of their text, with ML.NET text features and k-means.
- **IncidentAlert-Statistics** works out the busiest places and categories per period, the daily trend and the hot spots.

The public API and Management talk through RabbitMQ, using MassTransit. A new report travels from the public API to Management as an event, photos included, and waits there as pending. When a moderator approves it, Management publishes an approval event and removes the report from its queue; the public API then saves the incident, creating the place if it is new. Category changes travel the same way, from Management to the public API. ML and Statistics keep no data of their own: they read published incidents from the public API over HTTP and compute on request.

The moderation app calls Management, ML and Statistics with the same JWT. The public app only talks to the public API.

## Decisions and why

- **I made moderation a separate service with its own database.** Nothing a citizen sends reaches the public database until a moderator approves it, so the public API never has to filter out unreviewed data.
- **Messages carry the whole report, photos included.** That way Management never calls the public API, and an approval is still applied if the public service restarts in between, because RabbitMQ keeps the message.
- **Management owns the categories** and pushes every change to the public API as an event, so both sides check reports against the same list.
- **I kept Statistics and ML stateless.** They read published incidents and compute on request, so there is no third copy of the data to keep in sync.
- **Places are matched by name.** A report for a place that already exists reuses it, so every report for one place shows up together in the apps.
- **I wrote the mappings by hand instead of using AutoMapper.** The free AutoMapper versions are affected by a published vulnerability (GHSA-rvv3-g6hj-g44x) and the fixed ones need a commercial licence. Plain extension methods are checked by the compiler and easy to read.

## Security

- **Accounts are approved by a person.** Registering, or signing in with Google for the first time, only creates an account. An administrator has to give it the moderator role, so a stranger cannot sign up and start publishing.
- **The API never trusts the browser about identity.** For Google sign-in it checks the signature, audience and expiry of Google's ID token itself, and accepts only verified addresses of the student domain.
- **One signing key, three services.** Management signs the JWT, and ML and Statistics validate it with the same issuer, audience and key, so the analysis is not public.
- **No secrets in the repository.** Passwords and the signing key come from the environment, and the services refuse to start with a missing or short key, or with the development key in Production.
- **Uploaded file names are cut down to their last segment** before they touch the disk, so a crafted name cannot write outside the incident's folder.

## Testing and deployment

The backend has 94 automated tests: the services against an in-memory database, and the APIs hosted in memory with a test message bus and a fake Google. They cover the moderation flow (approving publishes and removes the report, nothing skips approval), sign-in and roles, accounts waiting for approval, Google sign-in with forged tokens and foreign addresses, every statistic and the ML grouping. The public app adds 52 tests and the moderation app 56, with Vitest and Testing Library.

Every service has a health endpoint, and the whole backend starts with one Docker Compose command. CI builds and tests the backend, then starts the stack and runs an end-to-end smoke test: it reports an incident, approves it as a moderator, waits for it on the public API, and checks that Statistics refuses a request without a token and answers one with it. On the default branch, the images of the four services and both apps are published to the GitHub Container Registry.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
