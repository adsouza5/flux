# Flux — Universal Unit & Currency Converter

> 17 measurement types, live currency rates, and a voice interface — all running in the browser.

## Overview

Flux converts between hundreds of units across 17 categories: length, mass, temperature, volume, speed, area, time, digital storage, pressure, energy, power, frequency, angle, force, torque, fuel economy, and live currency exchange. Queries can be typed in natural language or spoken — in-browser **Whisper** transcribes audio locally so audio never leaves the device. Live FX rates are fetched from the **Frankfurter** public API. A **Web Audio API** visualizer shifts colour dynamically per conversion category.

## Features

- **17 conversion categories** — hundreds of unit pairs
- **Live currency rates** — Frankfurter API (ECB-sourced, updated daily)
- **Voice input** — in-browser Whisper transcription, fully local (no audio uploaded)
- **Natural language parsing** — understands "convert 5 miles to km" or "100 USD to EUR"
- **Audio visualizer** — frequency-reactive bars, colour-coded per category
- **Flip conversion** — one-click source/target swap
- **Chat interface** — conversational history with suggestion chips

## Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Voice | OpenAI Whisper (in-browser via transformers.js) |
| Currency rates | Frankfurter API |
| Audio | Web Audio API |
| NLP parsing | Custom regex + token matching |

## Live Demo

Available at [adamdsouza.com](https://adamdsouza.com) → Flux project card.

## License

MIT
