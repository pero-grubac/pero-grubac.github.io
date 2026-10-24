---
order: 7
slug: store-chain-management
title: "Store Chain Management"
kind: desktop
year: 2023
summary: "Retail chain desktop app; the MySQL database enforces the rules."
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
caseStudy: false
---
