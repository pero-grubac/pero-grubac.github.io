---
order: 7
slug: store-chain-management
title: "Store Chain Management"
kind: desktop
year: 2023
summary: "Retail chain desktop app; the MySQL database enforces the rules."
metaDescription: "Store Chain Management, a C# desktop app for a retail chain whose MySQL database enforces the business rules: 41 stored procedures, 21 triggers, 11 views."
description: "Desktop app for running a retail chain — stores, staff, stock, discounts, shopping and reports — built around a MySQL database that enforces the business rules itself."
highlights:
  - "17 tables, 41 stored procedures, 21 triggers, 5 functions and 11 views"
  - "An order is one transaction from a JSON cart, with a full rollback on missing stock"
  - "Admin, employee and customer roles; EAN-8, UPC-A, EAN-13 and GTIN-14 barcode checks"
  - "76 unit + 101 integration tests on Testcontainers MySQL 8.4 · tagged releases"
stack: ["C#", ".NET", "WinForms", "MySQL", "Dapper", "Docker", "Testcontainers"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/Store-Chain-Management-System"
image: "../../assets/store_chain/preview.webp"
imageAlt: "Store Chain Management: shopping view with products and the cart"
featured: false
caseStudy: true
---

## What it does

Store Chain Management is a Windows desktop application for a chain of shops, which started as a databases course project. Everyone signs in on the same screen, picks a role and gets a workspace built for it:

- **Administrators** have a dashboard with revenue, bill count, average basket and low-stock count for the last 7, 30 or 90 days, revenue charts per day and per store, and the best sellers. They manage stores, employees, customers and other administrators, run discounts and coupons, see every bill and can cancel one, and read the reports.
- **Employees** work with the products of their own store: barcode scanning, receiving goods, a low-stock list with the stock history, and manufacturers.
- **Customers** shop in any store with a cart and coupons, and see their own bills with every line and what they saved.

A discount applies to a product for a period; a coupon code is typed in the cart and can cover several products, and when both apply, the bigger one wins. Reports cover revenue per store and per day, the best sellers and the full stock history, and each one exports to CSV.

A barcode scanner works as a keyboard: a known code opens *receive goods*, and an unknown one opens *new product* with the code filled in. EAN-8, UPC-A, EAN-13 and GTIN-14 codes are checked by their check digit.

## How it works

The database is the heart of the system: 17 tables, 41 stored procedures, 21 triggers, 5 functions and 11 views. Prices with discounts, stock levels, bill totals, cancellations and the stock audit log are all computed and guarded in MySQL, so they stay correct no matter which client writes to the database.

The application has three layers. The WinForms pages never contain SQL: they validate input with the domain model, call a repository, and show either the result or the message from the database. The repositories use Dapper, call a procedure for every write and read from views, so the rules live in one place. Every database call is asynchronous.

The triggers do the bookkeeping. They reject bad barcodes, negative prices or stock and expiry dates in the past, and write every stock change to a history table with the reason and the user. A bill line needs a positive quantity, a product from the bill's store and enough stock. The triggers lower or return stock as lines change, keep each bill's total equal to the sum of its lines, and put a cancelled bill's goods back on the shelf; a cancelled bill cannot be reopened.

Placing an order is one procedure call. The cart goes in as JSON, with the customer, the store and the coupon code. The procedure validates them, starts a transaction and inserts the bill, then walks the cart with a cursor over `JSON_TABLE`, grouped by product, and prices each line with the bigger of the product's active discount and the coupon. Every line it inserts goes through the triggers. If there isn't enough stock, a trigger signals an error, the procedure rolls back and re-signals it, and the customer sees the message with the cart still filled. Otherwise the triggers lower the stock, add the line to the bill total and record the sale in the stock history; the procedure commits and returns the new bill number.

Other procedures use other parts of SQL: the daily revenue report uses a recursive CTE so days without sales still get a row, the best sellers are ranked with `RANK()`, and deleting a product that appears on bills deactivates it instead.

## Decisions and why

- **The database guards consistency.** Stock, bill totals, cancellations and the audit log are kept by triggers, an order is one transaction, and prices and discounts are computed in SQL. A client can show prices, but it never decides them.
- **Errors are sentences.** Business rules fail with `SIGNAL` and a message, and the data layer turns those, duplicate keys and foreign-key violations into messages the user can act on.
- **Barcodes are text and unique per store.** The same product, with the same EAN, is sold in every store with its own stock and price, and codes with leading zeros or letters work.
- **Money is `DECIMAL`.** There are no floating-point totals, and the cart rounds exactly like MySQL's `ROUND`, so it shows the same prices the database will charge.

## Security

- **Passwords are never stored or compared in plain text.** BCrypt is used everywhere, and a trigger rejects any password that is not a BCrypt hash, so plain text cannot be stored even by hand.
- The password change procedure builds its SQL dynamically, with the table name taken from a whitelist and the values passed as parameters.

## Testing and deployment

There are 76 unit tests and 101 integration tests. The unit tests cover the domain (the cart, prices rounded exactly like MySQL, barcode check digits, validation), BCrypt hashing, the SQL scripts themselves, and the UI, down to the menu depending on the role.

The integration tests start their own MySQL 8.4 container through Testcontainers and load the same scripts as Docker Compose, so they test exactly what the application runs on. They check the schema, the functions, the triggers, the repositories and the reports, and orders: the database price equals the cart price with discount and coupon, and missing stock rolls the whole order back. Without Docker they are skipped locally and fail in CI.

CI runs only when something that affects the build changes, so documentation edits use no runner minutes. A Windows job builds the solution and runs the unit and UI tests, and the database tests run on Linux, where containers are available. For version tags, once both pass, a release job zips a self-contained, single-file win-x64 build with the database scripts and the Docker Compose file and attaches it to a GitHub release.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
