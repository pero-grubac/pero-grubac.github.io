---
order: 2
slug: e-mobility-hub
title: "eMobilityHub"
kind: system
year: 2025
summary: "Electric vehicle rental platform: four apps on one database."
description: "Electric vehicle rental platform made of four apps on one database: an Angular back office for admins, operators and managers, a mobile-first JSP shop where clients rent, pay by card and get a PDF invoice, a JSP promotions portal, and the Spring Boot API. Operators see the fleet on an OpenStreetMap map; managers get revenue and fault statistics."
flow: "Angular → Nginx → Spring Boot API + JSP apps → MySQL"
highlights: []
stack: ["Spring Boot", "Java", "Angular", "TypeScript", "JSP", "MySQL", "Spring Security", "Flyway", "OpenAPI", "Leaflet", "Testcontainers", "Docker", "Nginx", "JWT"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/e-Mobility-Hub"
image: "../../assets/e-mobility-hub/demo.webp"
imageAlt: "eMobilityHub: the employee portal sign-in form, next to a panel for the fleet of electric cars, bicycles and scooters"
video: "/assets/e-mobility-hub/demo.mp4"
featured: true
caseStudy: true
---

## What it does

I built eMobilityHub as a rental platform for electric cars, bicycles and scooters, for a fictional rental company. It is four applications on one MySQL database, one for each kind of user:

- **Employees** use an Angular back office. Administrators manage the fleet, manufacturers, clients and employees and import vehicles from CSV. Operators follow the rentals and see every vehicle on a map, coloured by its status. Managers can do both, and they also set the rental prices and read the revenue and fault statistics.
- **Clients** use a mobile-first web shop built with JSP. They register, pick a vehicle, set the start location, show an ID document and a driver's licence for a car, pay by card, ride with a live clock and running price, and get a PDF invoice when they finish. They can also report a broken vehicle and see all their rentals.
- **Managers** publish promotions and announcements in a separate JSP portal, and both are also available as RSS feeds.
- A **Spring Boot API** sits behind the back office and the promotions portal.

## Architecture

The Angular back office is served by Nginx, which also forwards its API calls to Spring Boot, so the browser talks to one origin and the session cookie stays first-party. The promotions portal calls the API from its own server, with the manager's token in a Bearer header. RSS readers get the feeds straight from the API.

The client web shop is a classic Model 2 application (servlets and JSP) on its own Tomcat, and it reads and writes MySQL directly over JDBC: the assignment did not allow it to use the REST API.

The API owns the database schema. Flyway migrates it when the API starts and Hibernate only validates it; in Docker, the two JSP apps wait until the API reports healthy, because the schema has to exist first. Inside the API, every request passes the JWT filter, CSRF protection and the role rules before it reaches the controllers, services and JPA repositories. Vehicle images are kept in their own volume.

## Decisions and why

- **One API, several front ends.** I put the back office and the promotions portal on the same REST API, so the business rules and role checks live in one place.
- **A cookie for browsers, a Bearer header for servers.** Browsers get the JWT in an httpOnly, SameSite=Strict cookie that scripts cannot read, and a CSRF token is required exactly when that cookie authenticates a write. The promotions portal is a server-side client, so it sends a Bearer header and needs no CSRF token.
- **The same origin everywhere.** Nginx in Docker, and a proxy during development, put the single-page app and the API on one origin, so the cookie stays first-party and there is no CORS to get wrong.
- **The API owns the schema.** Docker, the integration tests and CI all build the database from the same Flyway migrations.
- **Joined inheritance for vehicles.** Common columns live in one table and each vehicle type has its own, so the statistics can group revenue by vehicle type in a JPQL query.
- **Shared CRUD base classes.** I wrote paging, CRUD, renting, breaking and fixing, and image handling once; each vehicle type only adds its own fields.
- **The CSV import goes row by row.** A bad row is reported with its row number and the reason, and every valid row is still saved.

## Security

- Every endpoint has an explicit role rule on the server, and anything not listed is denied. The Angular menus only mirror those rules.
- Passwords are hashed with BCrypt.
- A broken token counts as anonymous, not as an error: an expired or forged token never causes a server error, the rules answer 401 or 403, and a 401 sends the back office to the sign-in page.

## Testing and deployment

The API has 104 tests, the two JSP apps 73 and the Angular app 64. The API tests run the real security configuration through MockMvc (401 versus 403, broken tokens, cookie flags, when CSRF is required) and the whole API on MySQL 8 in Testcontainers, with the schema from Flyway and a 27-case role matrix. The client shop's data access is tested on a MySQL database built from the API's migrations: one active ride per client, rented or broken vehicles refused, and invoices only for their owner.

CI runs only what changed: it works out which apps a commit touched and runs the API, JSP and Angular jobs for those. Then it builds every image, starts the stack with health checks, checks that every app answers, and signs in through Nginx to verify the cookie session and the CSRF protection. Maven, npm, the Angular build and the Docker layers are cached, and a newer push cancels the run before it. On main, the four images are published to the GitHub Container Registry.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
