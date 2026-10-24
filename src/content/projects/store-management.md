---
order: 9
slug: store-management
title: "Store Management"
kind: desktop
year: 2023
summary: "Desktop app for a retail store, with admin and cashier roles."
metaDescription: "Store Management, a C# desktop app for a retail store: a till with bar code scanning, admin and cashier roles, and sales as transactional stored procedures."
description: "Desktop app for running a retail store, with separate administrator and cashier roles."
repeatsSummary: true
highlights:
  - "Till with bar code scanning; expired or out-of-stock goods refused by the app and the DB"
  - "Dashboard: today's sales, stock value, low stock and expiry counts, 14-day sales chart"
  - "Sales run as transactional stored procedures with row locks · BCrypt passwords"
  - ".NET 10 · 3 languages · 90 unit + 30 Testcontainers integration tests"
stack: ["C#", ".NET", "MySQL", "WinForms", "Docker", "BCrypt", "xUnit", "Testcontainers"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/Store-Management-System"
image: "../../assets/store_management/preview.webp"
imageAlt: "Store Management: admin dashboard with the sales chart, and the cashier till with a cart"
featured: false
caseStudy: true
---

## What it does

Store Management is a Windows point-of-sale and inventory app for a small shop. I first built it for the Human–Computer Interaction course, and later rebuilt it with a modern interface, a tested data layer and CI.

Each role sees only what its job needs, and the sidebar lists just that role's sections. Cashiers sell at the till, browse products, see bills and print receipts. Administrators can do everything a cashier can, and they also manage products, procurement, staff, manufacturers, suppliers and categories, and read a searchable activity log of sign-ins, sales, procurements and every change.

- **Dashboard**: today's sales, the stock value, low-stock and expiry counts, a 14-day sales chart, the latest bills and a *Needs attention* list.
- **Till**: scan or type a bar code, or click product cards. Quantities take decimals for goods sold by weight, and a quantity above the stock turns red and disables *Charge*. Charging saves the bill, lowers the stock and opens the receipt, ready to print.
- **Products** as picture cards or as a table, with live search, a category filter and paging. Fields are checked as you type and on save, and a product that has been sold cannot be deleted.
- **Procurement** from a supplier at purchase prices, pre-filled with the last price paid, and **bills and procurements** for any date range, with details and printing.
- **Appearance per user**: every account has its own picture, accent colour, font, text size and language (Serbian Latin, Serbian Cyrillic or English), applied at once.

Badges mark stock and expiry: fewer than 10 pieces shows *Only N left*, and a best-before date within 30 days shows *Expires soon*. An out-of-stock product is not offered at the till, and an expired one is refused by both the till and the database.

## How it works

The WinForms app talks only to a class library that holds the data access and the rules and has no WinForms reference. All database calls are asynchronous, so the window never freezes while a query runs.

A sale goes like this. When the cashier scans a bar code or clicks a card, the inventory service checks that the product is in stock and not expired. On *Charge*, the sales repository calls a stored procedure with the user, the time and the bill lines as JSON. Inside one transaction, the procedure locks each product row, checks its expiry and stock, inserts the line at the current price and lowers the stock, then commits, or rolls back on any error, and returns the bill number. The app logs the activity, shows the receipt and reloads the products. A procurement works the same way through a second procedure, which raises the stock instead.

Errors raised in the procedures, such as insufficient stock or an expired product, and constraint violations, such as duplicates, products still in use or negative stock, reach the user as translated messages.

## Decisions and why

- **A UI-free core.** Data access and rules live in the class library, so they are tested without a screen, the forms stay thin, and the tests run on Linux in CI.
- **The database guards its own data.** Transactions with row locks, a CHECK constraint that keeps stock at zero or above, and unique keys stop overselling and duplicates even if two tills sell at once.
- **Paging and search in SQL.** Lists ask the database for one page at a time, so they stay fast with thousands of bills.
- **One look, built in code.** A small set of custom-drawn controls replaces the designer forms, and the user's colour is used only as an accent, so any choice stays readable.
- **Readable errors.** MySQL error numbers and procedure signals become stable codes, such as `IN_USE` or `INSUFFICIENT_STOCK`, which the UI translates.

## Security

- **Least privilege.** The app signs in to MySQL with a restricted account that can read and write data and call the procedures but cannot change the schema. An integration test proves it cannot drop tables.
- Passwords are hashed with BCrypt, and changing one requires the current password.
- Nobody can delete their own account or the last administrator.

## Testing and deployment

There are 90 unit tests and 30 integration tests. The unit tests cover the cart, the stock and expiry rules, product and staff validation in two cultures, paging and search patterns, and password hashing. The integration tests start MySQL 8 with Testcontainers and load the same schema script as Docker Compose. They cover, among other things, product CRUD, the unique and in-use protection, negative stock being rejected, sales at database prices with a rollback on insufficient stock or an expired product, procurement, sign-in, the staff rules, the dashboard and the restricted app account.

In CI, a job on Ubuntu runs the unit and integration tests and uploads the results and coverage, and a job on Windows builds the whole solution and fails on NuGet packages with known vulnerabilities. For version tags, a release job attaches a self-contained, single-file win-x64 build to a GitHub release, so the app runs without a .NET installation. Documentation-only changes don't start CI, and a newer push cancels the older run.
