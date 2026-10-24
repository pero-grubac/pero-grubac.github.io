---
order: 19
slug: monte-carlo-pi-python
title: "Monte Carlo π · Python"
kind: live
applicationCategory: EducationalApplication
year: 2023
summary: "Estimates π with NumPy: in the browser, a Jupyter notebook and a CLI."
metaDescription: "Monte Carlo π · Python: one NumPy package that estimates π in the browser through Pyodide, in a Jupyter notebook and on the command line, with no server."
description: "One NumPy package that estimates π three ways: in the browser, in a Jupyter notebook and on the command line. The web version runs real Python and NumPy locally through Pyodide, with no server."
highlights:
  - "About 45 million points per second on one core, about 28 million in the browser"
  - "Blocks instead of loops: close to 200 times faster than the first version"
  - "Stops exactly on a decimal match: per-block cumulative sum plus a PCG64 rewind"
  - "32 tests · pytest + ruff on Python 3.11 and 3.13 · notebook executed in CI"
stack: ["Python", "NumPy", "Pyodide", "WebAssembly", "Jupyter", "pytest"]
links:
  live: "https://pero-grubac.github.io/Monte-Carlo-based-Pi-Calculator-py/"
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/Monte-Carlo-based-Pi-Calculator-py"
image: "../../assets/live/Monte-Carlo-based-Pi-Calculator-py.webp"
imageAlt: "Monte Carlo π · Python: random points filling a circle inside a square, next to the current estimate, the point counts, the run settings and the convergence chart"
featured: false
caseStudy: true
---

## What it does

A circle of radius 1 inside the square [−1, 1]² covers π/4 of it, so four times the share of random points that land inside the circle approaches π. The montecarlo_pi package does this with NumPy and says how precise the result is: the standard error, a 95% interval, the correct decimals, and how many points real certainty would take. The same package runs in three places:

- **In the browser**, the square fills live, the correct digits turn green and a chart follows the convergence. It is real Python and NumPy, running locally through Pyodide; the first visit downloads about 10 MB.
- **A Jupyter notebook** walks through the idea: one run, convergence, the points needed per decimal, and a thousand runs against the normal curve.
- **The command line** prints one estimate with its error, interval and speed.

A run throws a set number of points or goes until the decimals match, and a seed repeats it exactly in all three. Every extra correct decimal costs 100 times more points: being 95% sure of four decimals takes about 4.1 billion points, a minute and a half at NumPy speed. The decimal search usually stops far sooner, because a random estimate wanders through the right window by chance: with seed 19, four decimals match after 1,477 points, which is luck, not precision.

## How it works

Points are drawn as NumPy arrays, in blocks of about a million, which gives about 45 million points per second on one core and about 28 million in the browser.

"Until decimals match" stops at exactly the first point whose estimate falls in the target window, such as [3.1415, 3.1416) for four decimals. Before each block, the simulation saves the state of NumPy's PCG64 random stream. A cumulative sum of the inside counts then gives the estimate after every single point of the block. If one lands in the window, the simulation restores the saved state and advances the stream past exactly the points it used, so the stream continues right after that point, as if the points had been drawn one by one.

In the browser, JavaScript loads Pyodide, runs the loop and draws; each step calls a small Python bridge into the same Simulation class that the notebook and the command line use.

## Decisions and why

- **One package, three front ends.** The page does not reimplement the maths in JavaScript. It loads the same Python files into Pyodide, so a seed gives the same answer everywhere.
- **Blocks, not loops.** The first version drew one point at a time with np.random.uniform and appended tuples to a list. A million points as one array is close to 200 times faster (2 ms against 0.40 s per 100,000 points) and keeps memory flat.
- **Exact stops, still reproducible.** Because the stream is advanced past exactly the points used, a later run continues as if the block had not overshot.
- **A static page.** No server and no build step. A Streamlit app would need a server that sleeps when idle.
- **Small batches first.** The page starts at 25 points per frame, so the first points can be watched as they land, then sizes its batches from the measured speed to keep the page responsive.

## Testing and deployment

32 pytest tests and ruff run in GitHub Actions on Python 3.11 and 3.13, and CI also executes the notebook, so it never breaks. A second workflow publishes the page to GitHub Pages when the page or the package changes on master.
