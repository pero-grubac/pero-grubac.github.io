---
order: 22
slug: echo-player
title: "Echo Player"
kind: desktop
year: 2023
summary: "Adds a feedback echo to WAV recordings, with a live preview."
description: "Adds a feedback echo to WAV recordings, with a live preview while you shape it and every repeat drawn in the waveform. Preview and output share one NAudio provider, so what you hear is exactly what gets saved."
highlights:
  - "Delay 20–2000 ms, feedback 0–90%, mix; 5 presets from Slapback to Canyon"
  - "The whole tail is kept until the repeats fade to −60 dB (at most 30 s)"
  - "Batch processing in parallel, with progress and cancellation; bit depth preserved"
  - "36 tests · the core has no audio-hardware dependency"
stack: ["C#", ".NET", "WPF", "MVVM", "NAudio", "xUnit"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/Echo-player"
image: "../../assets/echo_player/preview.webp"
imageAlt: "Echo Player: original and echoed waveforms with the echo controls"
featured: false
caseStudy: false
---
