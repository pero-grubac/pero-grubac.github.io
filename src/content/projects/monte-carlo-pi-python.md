---
order: 19
slug: monte-carlo-pi-python
title: "Monte Carlo π · Python"
kind: live
year: 2023
summary: "Estimates π with NumPy: in the browser, a Jupyter notebook and a CLI."
description: "One NumPy package that estimates π three ways: in the browser, in a Jupyter notebook and on the command line. The web version runs real Python and NumPy locally through Pyodide, with no server."
highlights:
  - "About 45 million points per second on one core, about 28 million in the browser"
  - "Blocks instead of loops: close to 200 times faster than the first version"
  - "Stops exactly on a decimal match: per-block cumulative sum plus a PCG64 rewind"
  - "32 tests · pytest + ruff on Python 3.11 and 3.13 · notebook executed in CI"
stack: ["Python", "NumPy", "Pyodide", "WebAssembly", "Jupyter", "pytest"]
links:
  live: "/Monte-Carlo-based-Pi-Calculator-py/"
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/Monte-Carlo-based-Pi-Calculator-py"
image: "../../assets/live/Monte-Carlo-based-Pi-Calculator-py.webp"
imageAlt: "Monte Carlo π · Python: random points filling a circle inside a square, next to the current estimate, the point counts, the run settings and the convergence chart"
featured: false
caseStudy: false
---
