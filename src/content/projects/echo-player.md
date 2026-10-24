---
order: 22
slug: echo-player
title: "Echo Player"
kind: desktop
year: 2023
summary: "Adds a feedback echo to WAV recordings, with a live preview."
metaDescription: "Echo Player, a C# desktop app that adds a feedback echo to WAV recordings, with a live preview, every repeat drawn in the waveform, and batch processing."
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
caseStudy: true
---

## What it does

Echo Player works on one or more WAV files at a time. They are dropped on the window or added with a button; files that are not valid WAV are skipped with a message. Three controls shape the echo: the delay (20 to 2000 ms), the feedback (0 to 90%, which sets how many repeats there are) and the mix (the level of the first repeat). Five presets, Slapback, Room, Classic, Hall and Canyon, set all three at once.

The echo changes while the file plays. A click on the waveform jumps to that point, and the echo can be switched off to compare the result with the original. The original and the result are drawn on one timeline, with a dashed line where the original ends and the tail begins.

When it sounds right, Process all writes an echoed copy of every file, in parallel, with progress for each one and a Stop button that removes partial files. An existing file is never overwritten. If the echo pushes samples past full scale, the app says how many, so the mix can be lowered.

## How it works

The echo is a delay line that feeds itself. For every channel, with a delay of D samples, the delay line is `d[n] = x[n] + feedback · d[n − D]` and the output is `y[n] = x[n] + mix · d[n − D]`. Repeat j of a sound therefore has the level `mix · feedback^(j − 1)`. With the default settings (350 ms, 45% feedback, 60% mix) that gives 9 repeats above −60 dB, and an output 3.15 s longer than the input.

The echo lives in a plain .NET library that knows nothing about WPF and uses only NAudio.Core. When a slider moves, the preview's settings change under a lock while the audio thread keeps playing, and the next buffer already uses the new delay. After 120 ms without changes, the echoed waveform is recomputed in the background, and an older computation that has not finished is cancelled.

## Decisions and why

- **One echo for preview and output.** The echo is an NAudio `ISampleProvider`, so the same object plays through the sound card and writes the file, and the preview cannot drift from the result.
- **Feedback instead of a single repeat.** The first version added one repeat at a fixed 50% level. A delay line that feeds itself gives natural, fading repeats, and a feedback of 0 still gives the single repeat.
- **The tail is part of the output.** The output runs until the repeats fall below −60 dB, capped at 30 seconds, instead of stopping with the input and cutting the echo off.
- **The format is kept.** The old version always wrote 32-bit float stereo; now 16-bit stays 16-bit, 24-bit stays 24-bit and mono stays mono.
- **Settings change while playing.** The delay line is sized for the longest delay up front, so a new delay only moves the read position, without reallocating on the audio thread.
- **Nothing blocks the window.** Files are processed and waveforms computed on background threads.

## Testing and deployment

36 xUnit tests cover the echo, the tail, the file processing and the waveforms. The core uses only NAudio.Core, so they run without audio hardware. On every push, GitHub Actions builds and tests the app and produces a self-contained Windows .exe. Edits to the README, images, samples or licence don't start a build.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
