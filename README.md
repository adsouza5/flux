# Flux — Universal Unit & Currency Converter

> 17 conversion categories, live FX rates, and a voice interface — all running in the browser with no backend required.

Live at **[www.iadamdsouza.com](https://www.iadamdsouza.com)**

## How It Works

```
User input  (typed or spoken)
      │
      ├─▶  Web Speech API  ─▶  browser-native transcription
      │
      └─▶  Whisper (transformers.js)  ─▶  in-browser WASM inference
                                              (audio never leaves device)
      │
      ▼
  NLP parser  (regex + token matching)
      │
      ├─▶  unit conversion  ─▶  local formula lookup
      │
      └─▶  currency conversion  ─▶  Frankfurter API (ECB, daily rates)
                                            │
                                       result + Web Audio visualizer
```

## Features

- **17 conversion categories** — length, mass, temperature, volume, speed, area, time, digital storage, pressure, energy, power, frequency, angle, force, torque, fuel economy, currency
- **Live FX rates** — Frankfurter API (ECB-sourced, updated daily)
- **Voice input** — in-browser Whisper via transformers.js; audio processed locally, never uploaded
- **Natural language parsing** — understands `convert 5 miles to km` or `100 USD to EUR`
- **Audio visualizer** — Web Audio API frequency bars, colour-coded per conversion category
- **Flip conversion** — one-click source/target swap
- **Chat interface** — conversational history with suggestion chips

## Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Voice (primary) | Web Speech API |
| Voice (fallback) | OpenAI Whisper via transformers.js (WASM) |
| Currency rates | Frankfurter API |
| Audio | Web Audio API |
| NLP parsing | Custom regex + token matching |

## Local Development

```bash
git clone https://github.com/adsouza5/flux
cd flux
npm install
npm run dev
# App on :5173
```

## License

MIT
