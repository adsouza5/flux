import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { convert, formatResult, TYPE_META, UNIT_OPTIONS } from './fluxConvert';
import { parseQuery } from './fluxParser';
import { useWhisper } from './useWhisper';
import FluxVisualizer from './FluxVisualizer';
import { track } from '../../analytics';
import './FluxShowcase.css';

const TYPES = Object.keys(TYPE_META);

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

const MIC_LABEL = {
  idle: 'Speak a conversion', loading: 'Loading voice model…',
  recording: 'Recording — click to stop', transcribing: 'Transcribing…',
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

  const { state: whisperState, loadPct, toggle: toggleMic, analyserRef } = useWhisper({
    onResult: useCallback((text) => {
      setTextInput(text);
      const parsed = parseQuery(text);
      if (parsed) {
        setActiveType(parsed.type);
        setFromUnit(parsed.from);
        setToUnit(parsed.to);
        setAmount(String(parsed.amount));
        runConvert({ type: parsed.type, from: parsed.from, to: parsed.to, amountVal: parsed.amount, label: text });
      } else {
        addMsg({ role: 'user', kind: 'text', text });
        addMsg({ role: 'bot', kind: 'error', text: 'Could not parse that conversion. Try saying "100 kilometers to miles".' });
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
  const statusText = whisperState === 'loading'
    ? `Loading voice model… ${loadPct > 0 ? `${loadPct}%` : ''}`
    : whisperState === 'recording'   ? 'Recording — click mic to stop'
    : whisperState === 'transcribing' ? 'Transcribing…'
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
          <h1>Fl<span>u</span>x</h1>
          <p>Universal converter · 17 types · type or speak any conversion</p>
        </header>

        {/* Type selector */}
        <div className="flux-type-bar">
          {TYPES.map(t => {
            const m = TYPE_META[t];
            return (
              <button
                key={t}
                className={`flux-type-pill${activeType === t ? ' active' : ''}`}
                onClick={() => handleTypeChange(t)}
                style={activeType === t ? {
                  '--ar': m.color[0], '--ag': m.color[1], '--ab': m.color[2],
                } : {}}
              >
                <span className="flux-type-pill-icon">{m.icon}</span>
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Converter controls */}
        <div className="flux-converter">
          <div className="flux-select-wrap">
            <select
              className="flux-select"
              value={fromUnit}
              onChange={e => setFromUnit(e.target.value)}
            >
              {units.map(u => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>

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

          <div className="flux-select-wrap">
            <select
              className="flux-select"
              value={toUnit}
              onChange={e => setToUnit(e.target.value)}
            >
              {units.map(u => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>

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
                <div
                  className="flux-bubble"
                  style={{ '--ar': msg.meta.color[0], '--ag': msg.meta.color[1], '--ab': msg.meta.color[2] }}
                >
                  <div className="flux-result">
                    <div className="flux-result-head">
                      <span className="flux-result-value">{formatResult(msg.result)}</span>
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
                      <span className="flux-result-badge">{msg.meta.icon} {msg.meta.label}</span>
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
              placeholder={micBusy ? MIC_LABEL[whisperState] : 'Or type naturally: "100 km to miles"'}
              disabled={micBusy}
            />
            <button
              className={`flux-mic${micActive ? ' flux-mic--listening' : ''}${whisperState === 'loading' || whisperState === 'transcribing' ? ' flux-mic--busy' : ''}`}
              onClick={toggleMic}
              disabled={whisperState === 'loading' || whisperState === 'transcribing'}
              title={MIC_LABEL[whisperState]}
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
          <div className="flux-hint">Voice powered by Whisper · runs locally in your browser · no data sent to any server</div>
        </div>
      </div>
    </div>
  );
}
