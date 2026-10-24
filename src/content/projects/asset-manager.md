---
order: 10
slug: asset-manager
title: "AssetManager"
kind: mobile
year: 2024
summary: "Android app that tracks company assets, who has them and where."
metaDescription: "AssetManager, a Flutter app for Android that tracks company assets, who has them and where, with camera barcode scanning and an OpenStreetMap view."
description: "Android app for tracking company assets — furniture, electronics, office supplies — who has them and where they are."
repeatsSummary: true
highlights:
  - "Full CRUD, with barcodes typed in or scanned with the camera"
  - "OpenStreetMap view: city pins that list the assets at each location"
  - "Inventory lists that record changes of employee and location"
  - "Riverpod + SQLite · English / Serbian · light and dark theme"
stack: ["Flutter", "Dart", "SQLite", "Riverpod", "OpenStreetMap", "Android"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/AssetManager"
  apk: "https://github.com/pero-grubac/AssetManager/releases/latest"
image: "../../assets/asset_manager/preview.webp"
imageAlt: "AssetManager: the home screen, an asset's details with its photo and barcode, and the workers list"
featured: false
caseStudy: true
---

## What it does

AssetManager is an Android app for tracking a company's assets, such as furniture, electronics and office supplies, the workers responsible for them, and where they are. Everything is stored on the device, so it needs no account and no server.

- **Assets** have a name, description, barcode, price, date and a photo from the camera or the gallery. A barcode can be typed in or scanned with the camera, letters and leading zeros included, and the app can display it as a scannable Code 128 barcode, with a QR code as a fallback.
- **Workers** have a name, phone and email. **Locations** are picked from the current GPS position, by tapping the map or from saved locations, and the address is looked up from the map position. Tapping a location's pin on the map lists every asset currently there.
- **Census lists** are inventory checks. Each item records an asset's old and new worker and its old and new location, and scanning a barcode fills in the asset's last known worker and location. A census list exports as CSV that opens correctly in Excel.
- **Lists** can be searched by several fields and refreshed with a pull. Swiping right deletes an item, with Undo, and swiping left edits it. Anything still used by a census list cannot be deleted.
- **Backup** puts all data and photos into one ZIP file, which restores on the same phone or another one. A failed or interrupted restore is rolled back automatically.

The app is in English and Serbian (Latin), with a system, light and dark theme.

## How it works

An asset's current worker and location come from its latest census item. The models are data classes with their own validation, the repositories hold all SQL and file access, including backup and restore, and a Riverpod notifier drives each list. SQLite stores the data, with migrations, and go_router handles navigation, with a bottom bar that keeps each section's state.

The maps use OpenStreetMap tiles, and addresses come from OpenStreetMap's Nominatim service, so no API keys are needed. The app follows their fair-use policies: it identifies itself, caches map tiles, sends at most one address lookup per second, and shows the "© OpenStreetMap contributors" attribution.

## Testing and deployment

The unit and widget tests run on an in-memory SQLite database and need no device. CI runs the analyzer, the tests, a check that the generated translations are up to date, and a debug build on every push and pull request.

A release workflow checks that the tag matches the app's version, runs the analyzer and the tests, builds an APK per CPU type and a Google Play app bundle, and publishes them as a GitHub Release, with the changelog section as the release notes. Releases are signed with an upload key.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
