---
order: 21
slug: monte-carlo-pi
title: "Monte Carlo π"
kind: desktop
year: 2023
summary: "Estimates π by throwing random points at a square, shown live."
metaDescription: "Monte Carlo π, a C# desktop app that estimates π by throwing random points at a square and shows them land live, at about a billion points per second."
description: "Estimates π by throwing random points at a square and shows them land live, turning correct digits green. Runs at about a billion points per second on 12 cores."
highlights:
  - "Own xoshiro256** generator with SplitMix64 streams: reproducible however work is split"
  - "Parallel.For over chunks of 2²⁰ points; a WriteableBitmap keeps millions on screen"
  - "Convergence chart with the theoretical 95% band"
  - "28 tests · \"until decimals match\" mode with reproducible seeds"
stack: ["C#", ".NET", "WPF", "MVVM", "Parallel", "xUnit"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/Monte-Carlo-based-Pi-Calculator"
image: "../../assets/monte_carlo/preview.webp"
imageAlt: "Monte Carlo π: millions of points in the circle, the estimate and the convergence chart"
featured: false
caseStudy: true
---

## What it does

Monte Carlo π runs the classic experiment live on the Windows desktop. A circle of radius 1 covers π/4 of the square [−1, 1]² around it, so four times the share of random points that land inside approaches π. As the square fills, the estimate shows its correct decimals in green, and a log-scale chart shows the error shrinking inside the theoretical band where 95% of runs end up. It has two modes:

- **Number of points**: any count, typed as 1e6, 2.5M or 1B, or a preset. The run stops after exactly that many.
- **Until decimals match**: 1 to 8 decimals. The run stops at the first point where the estimate's decimals equal π's, or after 10 billion points, and the app shows how many points 95% certainty would take.

A run can be paused, resumed and reset, and the app shows the error, the 95% interval, points per second and elapsed time. A seed repeats a run point for point. The first points arrive slowly so you can watch them land; then the run speeds up to about 1 billion points per second on 12 cores, and the window stays responsive. In the demo recording, four decimals matched after 3.7 million points, a thousand times sooner than 95% certainty would need.

## How it works

The simulation is a plain .NET library with no UI. The WPF window, built with MVVM and CommunityToolkit.Mvvm, runs it batch by batch on the thread pool. Inside a batch, whole chunks of 2²⁰ points run in parallel with Parallel.For, each from its own random stream, and the library returns the new totals plus 4,000 captured points. The view model passes those to the point view, which draws them into a WriteableBitmap, then updates the statistics and adds a log-spaced point to the chart. For the first 300,000 points the batch grows by 12% per frame; after that, each batch is sized from the measured speed to take about 100 ms.

The random numbers come from xoshiro256**, implemented in the core. Point number *i* always comes from stream ⌊i / 2²⁰⌋ of the seed, and the independent streams come from SplitMix64.

## Decisions and why

- **Reproducible however the work is split.** Because a point's stream is fixed by its number, a run gives the same result in one call or a thousand, on one thread or twelve. The tests check it, and the decimal-search demo stops at the same point, 3,698,148, in the app as in a plain loop.
- **My own random generator.** new Random(seed) falls back to an old, slow algorithm for compatibility. xoshiro256** is small, fast and seedable.
- **The full circle.** The first version used a quarter circle in [0, 1]². The full circle gives the same ratio and a picture that reads at a glance.
- **Decimals compared by truncation.** Two matching decimals means the estimate is in [3.14, 3.15). The old check compared a relative error against π, which made no promise about the digits and could loop forever on the UI thread.
- **A responsive window.** The old version froze while computing. Now batches run on the thread pool and points go into a bitmap, so drawing costs the same at a thousand points as at a billion.

## Testing and deployment

28 xUnit tests cover the estimate, the statistics and reproducibility. On every push to master, GitHub Actions builds the app, runs the tests and produces a self-contained Windows .exe that needs no .NET installation. Edits to the README, images or license do not start a build.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
