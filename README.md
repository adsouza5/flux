# Flux — Universal Unit Converter

> **17 conversion types · hundreds of units · voice via in-browser Whisper · live currency rates · audio-reactive visualizer**

[![Live Demo](https://img.shields.io/badge/Live_Demo-iadamdsouza.com-10b981?style=flat-square&logo=vercel)](https://iadamdsouza.com/projects/flux)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Whisper](https://img.shields.io/badge/Whisper-tiny.en-f97316?style=flat-square)](https://github.com/xenova/transformers.js)
[![Frankfurter](https://img.shields.io/badge/Currency-Frankfurter_API-10b981?style=flat-square)](https://api.frankfurter.dev)

---

## Overview

Flux is a universal conversion tool that understands natural language — type or speak any conversion query and it resolves the measurement type, units, and math automatically.

- **Type** `"100 km to miles"` or `"72°F to Celsius"` into the text bar
- **Select** from dropdowns for any of the 17 supported types
- **Speak** — Whisper runs fully in-browser (WebAssembly), no audio ever sent to any server
- **Switch types** — the UI accent color and visualizer glow shift dynamically per category

The audio-reactive background is a Catmull-Rom spline ring system (5 counter-rotating rings with 3-pass neon glow and a 120-particle pool) that responds to your microphone in real time.

---

## Conversion Types

| Category | Units |
|---|---|
| 📏 **Length** | mm, cm, m, km, in, ft, yd, mi, nmi, ly, au, pc, angstrom, … |
| ⚖️ **Mass / Weight** | mg, g, kg, t, oz, lb, st, ton, troy oz, carat, amu, … |
| 🌡️ **Temperature** | Celsius, Fahrenheit, Kelvin, Rankine, Delisle, Newton, Réaumur, Rømer |
| 🧪 **Volume** | ml, L, m³, tsp, tbsp, fl oz, cup, pt, qt, gal, bbl, … |
| 💨 **Speed** | m/s, km/h, mph, fps, kn, Mach, c |
| ⬛ **Area** | mm², cm², m², km², in², ft², yd², mi², acre, hectare, … |
| ⏱️ **Time** | ns, μs, ms, s, min, hr, day, wk, mo, yr, decade, century, millennium |
| 💾 **Data / Storage** | bit, byte, KB, MB, GB, TB, PB, EB, KiB, MiB, GiB, TiB, … |
| 🔵 **Pressure** | Pa, hPa, kPa, MPa, bar, atm, psi, torr, mmHg, inHg, … |
| ⚡ **Energy** | J, kJ, MJ, cal, kcal, Wh, kWh, BTU, eV, erg, ft·lbf, … |
| 🔋 **Power** | W, mW, kW, MW, GW, hp (mech/metric/elec), BTU/hr, … |
| 〰️ **Frequency** | Hz, kHz, MHz, GHz, THz, rpm, rps, rad/s |
| 📐 **Angle** | °, rad, grad, arcmin, arcsec, turn, mil (NATO), quadrant |
| 💪 **Force** | N, kN, MN, kgf, lbf, pdl, dyn, tonf, … |
| 🔩 **Torque** | N·m, kN·m, ft·lbf, in·lbf, kgf·m, ozf·in, … |
| ⛽ **Fuel Economy** | mpg (US/UK), km/L, L/100km |
| 💱 **Currency** | 30 currencies via live Frankfurter API (USD, EUR, GBP, JPY, …) |

---

## Architecture

```
src/
├── lib/
│   ├── fluxConvert.js     # Conversion engine — base-unit factor tables + formula handlers
│   └── fluxParser.js      # NLP parser — ~200 aliases, longest-match resolution
│
└── components/
    ├── FluxShowcase.js    # Main UI — type selector, dropdowns, chat history, voice
    ├── FluxShowcase.css   # Styles — CSS custom properties for dynamic type accent color
    ├── FluxVisualizer.js  # Canvas — Catmull-Rom spline rings, neon glow, particle system
    └── useWhisper.js      # Hook — Xenova/whisper-tiny.en via @xenova/transformers
```

### Conversion Engine (`lib/fluxConvert.js`)

Each unit type uses a **base-unit factor** approach:

```
result = amount × fromFactor / toFactor
```

Special cases handled separately:
- **Temperature** — formula conversion via Kelvin as intermediate
- **Fuel economy** — inverse relationship via L/100km as intermediate
- **Currency** — live rates from `api.frankfurter.dev/v1/latest`

### NLP Parser (`lib/fluxParser.js`)

Resolves natural language to `{ amount, from, to, type }`:

1. Extract the numeric value
2. Split on separator (`to`, `in`, `into`, `as`)
3. Match each half against the alias map using **longest-phrase-first** greedy search
4. Resolve cross-type conflicts via preferred type context

```js
parseQuery("72 fahrenheit in celsius")
// → { amount: 72, from: "F", to: "C", type: "temperature" }

parseQuery("100 km to miles")
// → { amount: 100, from: "km", to: "mi", type: "length" }
```

### Voice (`components/useWhisper.js`)

Uses `@xenova/transformers` to run **Whisper tiny.en** in WebAssembly:

- Model loads once (~40 MB), permanently cached in the browser
- `MediaRecorder` captures mic audio → `Float32Array` passed to the pipeline
- `AnalyserNode` feeds real-time FFT data to the visualizer while recording
- Works in all major browsers including Firefox (no Web Speech API dependency)

### Visualizer (`components/FluxVisualizer.js`)

Five concentric rings rendered on a `<canvas>` at 60 fps:

- **Catmull-Rom splines** — 72 sample points per ring, smooth closed-loop curves via `bezierCurveTo`
- **3-pass neon glow** — wide/transparent outer halo → mid bloom → sharp core line
- **Audio reactivity** — FFT frequency bins mapped to radial displacement per ring band
- **Particle system** — 120-particle pool, spawned at peaks above 70% amplitude, fade radially
- **Dynamic color** — accent RGB derived from `TYPE_META` per active conversion type; rings shift hue when you switch categories

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Voice / ASR | `@xenova/transformers` — Whisper tiny.en (WebAssembly, in-browser) |
| Audio | Web Audio API — `AnalyserNode`, `MediaRecorder` |
| Visualization | Canvas 2D API |
| Currency Data | [Frankfurter](https://api.frankfurter.dev) (ECB rates, free, no API key) |
| Routing | React Router v6 |
| Fonts | JetBrains Mono (UI accents) |

---

## Integration

Flux is embedded in [`portfolio-react`](https://github.com/adsouza5/portfolio-react) and served at `/projects/flux`. The conversion logic in `lib/` has no React dependencies and can be used standalone.

**To add to an existing React app:**

```bash
npm install @xenova/transformers
```

```jsx
import FluxShowcase from './components/FluxShowcase';

// In your router
<Route path="/flux" element={<FluxShowcase />} />
```

The only external runtime dependency is the Frankfurter API for live currency rates. All other conversions are computed locally with zero network calls.

---

## Examples

```
"100 kilometers to miles"      →  62.137 mi
"72 fahrenheit in celsius"     →  22.222 °C
"1 gigabyte to megabytes"      →  1,000 MB
"1 atm to psi"                 →  14.696 psi
"30 mpg to L/100km"            →  7.840 L/100km
"100 USD to EUR"               →  live rate via Frankfurter
```

All of the above work identically via voice — click the mic and speak naturally.

---

## License

MIT
