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
caseStudy: true
---

## What it does

ePJ2 is an e-mobility company that rents out electric cars, bikes and scooters in the city of Java. I built this application for the Programming Languages 2 course at the Faculty of Electrical Engineering in Banja Luka. It reads the company's vehicles and rentals from two CSV files and replays its business on a live 20×20 city map:

- **Rentals run in time order.** All rentals that start at the same date and time run together, each in its own thread, for exactly as many seconds as they last. Between time slots there is a 5-second pause with a countdown.
- **Vehicles drive across the map.** Each one shows its ID, its battery level, the rest of its route and its destination. Cars, e-bikes and e-scooters drain their battery on every field and recharge when it runs out.
- **Vehicles break down.** A breakdown is recorded with the date, time and reason, and the ride is free.
- **Every ride gets an invoice**, a text file with every price item, from the user and their documents (a car needs an ID card or a passport, and a driver's licence) to the route, the discount, the promotion and the total.
- **Reports are saved as it goes.** A daily report at the end of each day, and at the end a summary report and a special report: the vehicle with the most revenue of each type, each serialized to its own binary file.

While it runs, separate screens show every vehicle with its live battery level and number of breakdowns, every breakdown, the business results so far, and the top vehicles, deserialized from those files. A bad input line, such as a duplicate ID, an unknown vehicle, a field outside the map or an overlapping rental, is reported with its line number and the reason and skipped, so one mistake does not stop the simulation.

## How it works

The price of a ride is the unit price of its vehicle type times its duration in seconds, multiplied by a higher distance factor if at least one field of the route is in the outer city. Every 10th rental in time order gets a discount and a rental with a promotion a promotional reduction, both a share of the amount, and the total is the amount minus both. In the task's own example, a scooter rides for 5 seconds, leaves the inner city and has a promotion: the amount is 15.00, the promotion 1.05 and the total 13.95.

The simulation runs in a background thread and knows nothing about Swing. It reports what happens through a listener interface, and the main window is one listener. Rentals are grouped by date and then by start time. For each slot, the simulation starts one thread per rental, joins them all, pauses, and moves on. A rental thread moves its vehicle field by field, draining the battery as it goes, then records a breakdown if there is one and writes the invoice. Routes are straight lines with at most one turn: horizontally to the target column, then vertically to the target field. After the last slot of a day the daily report is saved; after the last slot of all, the summary and the special report.

## Decisions and why

- **Nothing in the code.** Every price, rate, file name, date format, colour and text is read from a properties file, because the test data can change for every defence of the project. Per-type keys are looked up by vehicle type, so there are no `instanceof` chains for prices.
- **A simulation without Swing.** The main window passes every event to the Swing thread with `SwingUtilities.invokeLater`, so components are only touched there, and the same simulation runs in the tests without a GUI.
- **Real durations.** A ride's duration is split evenly over the fields of its route, so it lasts exactly as many seconds as in the input file.
- **Thread-safe vehicles.** The battery level is `volatile` and draining is `synchronized`. Breakdowns are kept in a `CopyOnWriteArrayList`, because rental threads write them while the screens read them.
- **Money in `BigDecimal`.** Every amount is rounded to 2 decimals (HALF_UP), so the reports add up exactly.

## Testing and deployment

123 JUnit 5 tests cover the configuration, the parsers, the routes, the vehicles, the billing (the task's own example included), every report item and the loading of the sample data. The simulation tests run the real simulation without a GUI: time slots run in order, the rentals of a slot run in parallel, the next slot waits for the previous one, and a ride lasts its duration. The GUI is not tested.

GitHub Actions builds the project, runs the tests and generates the Javadoc on every push to main and every pull request, but only when something that affects the build has changed. On a push to main it keeps the JAR and the Javadoc as build artifacts for 14 days.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
