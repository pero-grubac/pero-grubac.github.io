---
order: 20
slug: anova
title: "ANOVA"
kind: desktop
year: 2023
summary: "One-factor analysis of variance that updates as you type."
metaDescription: "ANOVA, a C# desktop app for one-factor analysis of variance: the F-test, the effects and a contrast between any two alternatives update as you type."
description: "One-factor analysis of variance on the desktop. The F-test, the effects and a contrast between any two alternatives update as you type, with critical values from exact inverse CDFs."
highlights:
  - "2–12 alternatives × 2–200 measurements; paste from Excel or open a CSV"
  - "Separate confidence levels for the F-test and the contrast (e.g. 97.5%)"
  - "SSA computed directly from the effects, not as SST − SSE, to keep precision"
  - "37 tests · CI builds a self-contained single-file .exe on every push"
stack: ["C#", ".NET", "WPF", "MVVM", "Math.NET", "xUnit"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/ANOVA-Application"
image: "../../assets/anova/preview.webp"
imageAlt: "ANOVA: measurements table, F-test result and the effects of each alternative"
featured: false
caseStudy: true
---

## What it does

ANOVA Application answers one question: do these alternatives really differ, or is the difference just noise? Each alternative, such as an algorithm, a configuration or a machine, is measured the same number of times. The app splits the variation into the part due to the alternatives and the part due to error, runs the F-test, and estimates a confidence interval for the difference between any two alternatives.

The measurements go into a grid of 2 to 12 alternatives and 2 to 200 measurements. They can be typed in, pasted from a spreadsheet, or opened or dragged in as a CSV file, including one saved in a locale with a decimal comma. Everything is on one screen and recalculates on every keystroke:

- **The F-test** gives the verdict, F and its critical value, the p-value, the ANOVA table and the share of the variation explained by the alternatives.
- **The effects chart** shows how far each alternative's mean is above or below the grand mean.
- **A contrast** between any two alternatives gives their difference, its standard error and a confidence interval drawn against zero. If the interval does not contain zero, the two differ significantly.

The F-test and the contrast each have their own confidence level, a preset or any typed value such as 97.5%. The measurements can be saved back to CSV and a full report exported. The app follows the Windows light or dark mode through the Fluent theme of WPF.

## How it works

The statistics and the CSV handling live in a plain .NET class library that knows nothing about WPF. The app talks to it through one view model, and the window only binds to it. On every edit the view model checks the cells: while one is empty or not a number, it reports how many are still missing instead of a result. Once every cell is valid, it runs the analysis and the contrast and hands the result cards their summaries, already formatted.

## Decisions and why

- **No UI in the core**, so every formula is unit-tested without starting a window.
- **Exact quantiles.** The critical values come from the inverse CDFs of the F and Student's t distributions in Math.NET Numerics, instead of scanning the CDF in small steps, so they are exact and instant at any confidence level.
- **SSA is computed directly** from the effects, as `n · Σ αj²`, and not as `SST − SSE`, which loses precision when the alternatives barely differ.
- **Cells keep the raw text.** A half-typed `3.` or `-` is not reformatted under the cursor, and a value that is not a number is highlighted instead of silently becoming zero.
- **Degenerate data has an answer.** With no error variation, F is shown as ∞, and as a dash when all the data is equal, instead of dividing by zero.
- **One screen.** I replaced the old three-step flow, which showed the results in a new window, with one window where everything recalculates as you type.
- **Charts drawn in code.** The effects chart and the interval plot are small WPF elements that render themselves, so they follow the theme and DPI without a charting dependency.

## Testing and deployment

37 xUnit tests cover the statistics and the CSV handling. On every push, GitHub Actions builds and tests the app and produces a self-contained Windows .exe that runs without a .NET installation. Edits to the README, images, samples or licence don't start a build.
