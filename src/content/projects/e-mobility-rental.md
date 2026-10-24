---
order: 24
slug: e-mobility-rental
title: "e-Mobility Rental"
kind: desktop
year: 2024
summary: "Multithreaded simulation of an electric vehicle rental company."
description: "Multithreaded simulation of an electric car, bike and scooter rental company. Every rental runs in its own thread on a shared 20×20 city map, for exactly as many seconds as it lasts."
highlights:
  - "Rentals in a time slot run in parallel and are joined before the next slot starts"
  - "Invoices per ride, daily and summary reports, a binary file per vehicle"
  - "Nothing hard-coded: prices, map size and formats in app.properties; BigDecimal money"
  - "123 JUnit 5 tests, including a headless simulation run · CI builds the JAR and Javadoc"
stack: ["Java", "Swing", "Multithreading", "Maven", "JUnit"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/e-Mobility-Rental-System"
image: "../../assets/emobility_rental/preview.webp"
imageAlt: "e-Mobility Rental: vehicles moving across the city map, with active rentals and invoices"
featured: false
caseStudy: false
---
