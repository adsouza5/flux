import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { convert, formatResult, TYPE_META, UNIT_OPTIONS } from './fluxConvert';
import { parseQuery } from './fluxParser';
import { useWhisper } from './useWhisper';
import FluxVisualizer from './FluxVisualizer';
import { track } from '../../analytics';
import './FluxShowcase.css';

const TYPES = Object.keys(TYPE_META);

// ── Custom dropdown — fully styled, no OS chrome ──────────────────
function UnitSelect({ options, value, onChange }) {
  const [open, setOpen]     = useState(false);
  const [above, setAbove]   = useState(false);
  const wrapRef   = useRef(null);
  const listRef   = useRef(null);
  const selected  = options.find(o => o.value === value) || options[0];

  // Decide whether the list opens up or down based on available space
  useLayoutEffect(() => {
    if (!open || !wrapRef.current || !listRef.current) return;
    const rect     = wrapRef.current.getBoundingClientRect();
    const listH    = listRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    setAbove(spaceBelow < listH + 8 && rect.top > listH + 8);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const pick = (val) => { onChange(val); setOpen(false); };

  return (
    <div className={`fxd-wrap${open ? ' fxd-open' : ''}`} ref={wrapRef}>
      <button
        className="fxd-trigger"
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <span className="fxd-value">{selected?.label ?? '—'}</span>
        <span className="fxd-chevron">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <ul
          ref={listRef}
          className={`fxd-list${above ? ' fxd-list--above' : ''}`}
        >
          {options.map(o => (
            <li
              key={o.value}
              className={`fxd-item${o.value === value ? ' fxd-item--active' : ''}`}
              onMouseDown={() => pick(o.value)}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const SUGGESTIONS = {
  length:      ['100 km to miles', '6 feet to meters', '1 inch to centimeters'],
  mass:        ['70 kg to pounds', '1 ton to kg', '5 oz to grams'],
  temperature: ['100 celsius to fahrenheit', '98.6 fahrenheit to celsius', '300 kelvin to celsius'],
  volume:      ['1 gallon to liters', '500 ml to cups', '1 liter to fluid ounces'],
  speed:       ['60 mph to km/h', '1 mach to mph', '100 km/h to mph'],
  area:        ['1 acre to square meters', '1 hectare to acres', '100 sq ft to sq m'],
  time:        ['1 year to seconds', '24 hours to minutes', '1 week to hours'],
  digital:     ['1 GB to MB', '1 TB to GB', '100 megabytes to gigabytes'],
  pressure:    ['1 atm to psi', '14.7 psi to atm', '1 bar to pascals'],
  energy:      ['1 kWh to joules', '2000 calories to kilojoules', '1 BTU to joules'],
  power:       ['1 horsepower to watts', '100 kilowatts to horsepower', '1 kW to BTU/hr'],
  frequency:   ['100 MHz to GHz', '60 hertz to rpm', '1 GHz to kHz'],
  angle:       ['180 degrees to radians', '1 radian to degrees', '90 degrees to gradians'],
  force:       ['1 kgf to newtons', '100 newtons to lbf', '1 lbf to newtons'],
  torque:      ['100 Nm to ft-lbf', '1 ft-lbf to Nm', '50 kgf-m to Nm'],
  fuel:        ['30 mpg to L/100km', '10 L/100km to mpg', '40 km/L to mpg'],
  currency:    ['100 USD to EUR', '1000 JPY to USD', '50 GBP to euros'],
};

const TYPE_SHORT = {
  mass: 'Weight', digital: 'Storage', fuel: 'Fuel',
  temperature: 'Temp', frequency: 'Freq',
};

const MIC_LABEL = {
  idle: 'Speak a conversion',
  recording: 'Listening — click to stop',
};

let msgId = 0;
const mkId = () => ++msgId;

function makeWelcome(type) {
  return {
    id: mkId(), role: 'bot', kind: 'welcome',
    type, suggestions: SUGGESTIONS[type] || [],
  };
}

export default function FluxShowcase() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState('length');
  const units = UNIT_OPTIONS[activeType] || [];
  const [fromUnit, setFromUnit] = useState(units[0]?.value ?? '');
  const [toUnit,   setToUnit]   = useState(units[1]?.value ?? '');
  const [amount,   setAmount]   = useState('');
  const [messages, setMessages] = useState(() => [makeWelcome('length')]);
  const [loading,  setLoading]  = useState(false);
  const chatEndRef  = useRef(null);
  const amountRef   = useRef(null);
  const textInputRef = useRef(null);
  const [textInput, setTextInput] = useState('');

  // Sync unit dropdowns when type changes
  useEffect(() => {
    const opts = UNIT_OPTIONS[activeType] || [];
    setFromUnit(opts[0]?.value ?? '');
    setToUnit(opts[1]?.value ?? '');
  }, [activeType]);

  const typeColor = TYPE_META[activeType]?.color || [16, 185, 129];
  const [ar, ag, ab] = typeColor;

  const addMsg = useCallback(msg => setMessages(prev => [...prev, { id: mkId(), ...msg }]), []);

  const runConvert = useCallback(async ({ type, from, to, amountVal, label }) => {
    if (!amountVal || isNaN(amountVal)) {
      addMsg({ role: 'bot', kind: 'error', text: 'Enter a numeric amount first.' });
      return;
    }
    if (from === to) {
      addMsg({ role: 'bot', kind: 'error', text: 'From and To units are the same.' });
      return;
    }
    if (label) addMsg({ role: 'user', kind: 'text', text: label });
    setLoading(true);
    try {
      const { result, rate, date } = await convert({ type, amount: amountVal, from, to });
      const meta = TYPE_META[type];
      addMsg({ role: 'bot', kind: 'result', type, from, to, amount: amountVal, result, rate, date, meta });
      track.currencyConverted?.(from, to);
    } catch (err) {
      addMsg({ role: 'bot', kind: 'error', text: err.message || 'Conversion failed.' });
    } finally {
      setLoading(false);
    }
  }, [addMsg]);

  const handleConvert = useCallback(() => {
    runConvert({
      type: activeType, from: fromUnit, to: toUnit,
      amountVal: parseFloat(amount),
      label: `${amount} ${fromUnit} → ${toUnit}`,
    });
  }, [activeType, fromUnit, toUnit, amount, runConvert]);

  const handleSuggestion = useCallback((text) => {
    const parsed = parseQuery(text);
    if (parsed) {
      setActiveType(parsed.type);
      setFromUnit(parsed.from);
      setToUnit(parsed.to);
      setAmount(String(parsed.amount));
      runConvert({ type: parsed.type, from: parsed.from, to: parsed.to, amountVal: parsed.amount, label: text });
    }
  }, [runConvert]);

  const handleTextSend = useCallback(() => {
    const q = textInput.trim();
    if (!q || loading) return;
    setTextInput('');
    const parsed = parseQuery(q, activeType);
    if (parsed) {
      setActiveType(parsed.type);
      setFromUnit(parsed.from);
      setToUnit(parsed.to);
      setAmount(String(parsed.amount));
      runConvert({ type: parsed.type, from: parsed.from, to: parsed.to, amountVal: parsed.amount, label: q });
    } else {
      addMsg({ role: 'user', kind: 'text', text: q });
      addMsg({ role: 'bot', kind: 'error', text: 'Try: "100 km to miles" or "72°F to Celsius"' });
    }
  }, [textInput, loading, activeType, runConvert, addMsg]);

  const handleFlip = useCallback((msg) => {
    setActiveType(msg.type);
    setFromUnit(msg.to);
    setToUnit(msg.from);
    setAmount(String(msg.result));
    runConvert({
      type: msg.type, from: msg.to, to: msg.from,
      amountVal: msg.result,
      label: `${formatResult(msg.result)} ${msg.to} → ${msg.from}`,
    });
  }, [runConvert]);

  const handleTypeChange = useCallback((t) => {
    setActiveType(t);
    setMessages([makeWelcome(t)]);
    setTextInput('');
    setAmount('');
  }, []);

  const { state: whisperState, loadPct, toggle: toggleMic, toggleWake, analyserRef } = useWhisper({
    onResult: useCallback((text) => {
      const parsed = parseQuery(text);
      if (parsed) {
        setActiveType(parsed.type);
        setFromUnit(parsed.from);
        setToUnit(parsed.to);
        setAmount(String(parsed.amount));
        runConvert({ type: parsed.type, from: parsed.from, to: parsed.to, amountVal: parsed.amount, label: text });
      } else {
        addMsg({ role: 'user', kind: 'text', text });
        addMsg({ role: 'bot', kind: 'error', text: `Heard: "${text}" — could not parse. Try "100 kilometers to miles".` });
      }
    }, [runConvert, addMsg]),
    onError: useCallback((msg) => {
      addMsg({ role: 'bot', kind: 'error', text: msg });
    }, [addMsg]),
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const micBusy   = whisperState !== 'idle';
  const micActive = whisperState === 'recording';
  const wakeActive = whisperState === 'wake';
  const statusText = whisperState === 'recording' ? 'Listening — click mic to stop'
                   : whisperState === 'wake'      ? 'Say "convert …" anytime'
                   : '';

  return (
    <div
      className="flux-root"
      style={{ '--ar': ar, '--ag': ag, '--ab': ab }}
    >
      <FluxVisualizer state={whisperState} analyserRef={analyserRef} typeColor={typeColor} />

      <button className="flux-back" onClick={() => navigate('/', { state: { scrollTo: 'projects' } })}>
        ← Timeline
      </button>

      <div className="flux-layout">
        {/* Header */}
        <header className="flux-header">
          <div className="flux-logo-row">
            <svg className="flux-logomark" viewBox="0 0 24 18" fill="none" aria-hidden="true">
              <path d="M2 5h16M18 5l-3.5-3M18 5l-3.5 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 13H6M6 13l3.5-3M6 13l3.5 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="flux-wordmark">FLUX</span>
          </div>
          <p className="flux-tagline">Universal Converter</p>
          <div className="flux-header-pills">
            <span className="flux-header-pill">17 types</span>
            <span className="flux-header-pill">Voice input</span>
            <span className="flux-header-pill">Live FX rates</span>
            <span className="flux-header-pill">No account</span>
          </div>
        </header>

        {/* Type selector */}
        <div className="flux-type-grid">
          {TYPES.map(t => {
            const m = TYPE_META[t];
            const active = activeType === t;
            return (
              <button
                key={t}
                className={`flux-type-cell${active ? ' active' : ''}`}
                onClick={() => handleTypeChange(t)}
                style={active ? {
                  '--cr': m.color[0], '--cg': m.color[1], '--cb': m.color[2],
                } : {}}
                title={m.label}
              >
                <span className="flux-type-cell-icon">{m.icon}</span>
                <span className="flux-type-cell-label">{TYPE_SHORT[t] ?? m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Converter controls */}
        <div className="flux-converter">
          <UnitSelect options={units} value={fromUnit} onChange={setFromUnit} />

          <div className="flux-amount-wrap">
            <input
              ref={amountRef}
              className="flux-amount"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConvert()}
              placeholder="0"
            />
          </div>

          <span className="flux-arrow">→</span>

          <UnitSelect options={units} value={toUnit} onChange={setToUnit} />

          <button
            className="flux-swap"
            onClick={() => { setFromUnit(toUnit); setToUnit(fromUnit); }}
            title="Swap units"
          >
            ⇄
          </button>

          <button
            className="flux-convert-btn"
            onClick={handleConvert}
            disabled={!amount || loading}
          >
            Convert
          </button>
        </div>

        {/* Chat */}
        <div className="flux-chat">
          {messages.map(msg => (
            <div key={msg.id} className={`flux-msg flux-msg--${msg.role}`}>
              {msg.kind === 'welcome' && (
                <div className="flux-bubble">
                  <div>Select a unit above or just speak — Flux understands natural language for any of the {TYPES.length} conversion types.</div>
                  <div className="flux-suggestions">
                    {msg.suggestions.map(s => (
                      <button key={s} className="flux-suggestion" onClick={() => handleSuggestion(s)}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {msg.kind === 'text' && (
                <div className="flux-bubble">{msg.text}</div>
              )}

              {msg.kind === 'error' && (
                <div className="flux-bubble flux-bubble--error">{msg.text}</div>
              )}

              {msg.kind === 'result' && (
                <div className="flux-bubble">
                  <div className="flux-result">
                    <div className="flux-result-head">
                      <span
                        className="flux-result-value"
                        style={{ color: `rgb(${msg.meta.color.join(',')})` }}
                      >{formatResult(msg.result)}</span>
                      <span className="flux-result-unit">{msg.to}</span>
                    </div>
                    <div className="flux-result-eq">
                      {formatResult(msg.amount)} {msg.from} = {formatResult(msg.result)} {msg.to}
                    </div>
                    {msg.rate != null && (
                      <div className="flux-result-eq">
                        1 {msg.from} = {formatResult(msg.rate)} {msg.to}
                      </div>
                    )}
                    <div className="flux-result-meta">
                      <span
                        className="flux-result-badge"
                        style={{
                          color: `rgb(${msg.meta.color.join(',')})`,
                          background: `rgba(${msg.meta.color.join(',')},0.08)`,
                          border: `1px solid rgba(${msg.meta.color.join(',')},0.18)`,
                        }}
                      >{msg.meta.icon} {msg.meta.label}</span>
                      {msg.date && <span className="flux-result-date">Rate: {msg.date}</span>}
                      <button className="flux-flip" onClick={() => handleFlip(msg)}>⇄ Reverse</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flux-msg flux-msg--bot">
              <div className="flux-bubble">
                <div className="flux-typing">
                  <div className="flux-dot" /><div className="flux-dot" /><div className="flux-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Voice / text input */}
        <div className="flux-input-area">
          {statusText && (
            <div className={`flux-status flux-status--${whisperState}`}>{statusText}</div>
          )}
          <div className="flux-input-row">
            <input
              ref={textInputRef}
              className="flux-text-input"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleTextSend(); }}}
              placeholder={micActive ? MIC_LABEL.recording : 'Or type naturally: "100 km to miles"'}
              disabled={micBusy}
            />
            <button
              className={`flux-mic${micActive ? ' flux-mic--listening' : ''}`}
              onClick={toggleMic}
              disabled={wakeActive}
              title={micActive ? MIC_LABEL.recording : MIC_LABEL.idle}
            >
              {micActive ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
                </svg>
              )}
            </button>
            <button
              className={`flux-wake-btn${wakeActive ? ' flux-wake-btn--active' : ''}`}
              onClick={toggleWake}
              disabled={micActive}
              title={wakeActive ? 'Disable wake word' : 'Enable wake word — say "convert …"'}
            >
              {wakeActive && <span className="flux-wake-dot" />}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M5 10a7 7 0 0 0 14 0"/>
                <path d="M8 21h8M12 17v4"/>
                <path d="M2 8c0 0 1-2 4-2M22 8c0 0-1-2-4-2"/>
              </svg>
            </button>
            <button
              className="flux-send"
              onClick={handleTextSend}
              disabled={!textInput.trim() || loading || micBusy}
              title="Send"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
              </svg>
            </button>
          </div>
          <div className="flux-hint">
            {wakeActive
              ? 'Wake word active — just say "convert 100 km to miles" naturally'
              : 'Voice via Web Speech API · Chrome & Edge · or click mic to record'}
          </div>
        </div>
      </div>
    </div>
  );
}
