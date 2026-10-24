---
order: 21
slug: monte-carlo-pi
title: "Monte Carlo π"
kind: desktop
year: 2023
summary: "Estimates π by throwing random points at a square, shown live."
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
caseStudy: false
---
