/**

- Nirvana Stickman Assistant SDK v1.0.0
- Production-grade embeddable AI assistant
- (c) Nirvana Enterprises
  */
  (function (global, factory) {
  typeof exports === ‘object’ && typeof module !== ‘undefined’
  ? module.exports = factory()
  : typeof define === ‘function’ && define.amd
  ? define(factory)
  : (global.NirvanaAssistant = factory());
  }(typeof globalThis !== ‘undefined’ ? globalThis : typeof window !== ‘undefined’ ? window : this, function () {
  ‘use strict’;

// ─────────────────────────────────────────────
// 1. CONSTANTS & DEFAULTS
// ─────────────────────────────────────────────
const VERSION = ‘1.0.0’;
const SDK_ID  = ‘nirvana-assistant-sdk’;

const DEFAULTS = {
apiKey       : ‘’,
apiEndpoint  : ‘https://api.nirvana.ai/v1/assist’,
position     : ‘bottom-right’,
primaryColor : ‘#4F46E5’,
language     : ‘hinglish’,
businessType : ‘local_services’,
stickDelay   : 5000,   // ms before offering help
editThreshold: 3,      // edits before suggestion
rageClickMs  : 400,    // window for rage-click detection
rageClickCount: 3,
aiTimeout    : 8000,   // AI call timeout
debug        : false,
};

// ─────────────────────────────────────────────
// 2. FALLBACK MESSAGES (offline / AI failure)
// ─────────────────────────────────────────────
const FALLBACKS = {
phone  : “📱 10-digit mobile number daalo, bina +91 ke. Jaise: 9876543210”,
email  : “📧 Valid email daalo — jaise: name@gmail.com”,
name   : “✍️ Apna poora naam likhein — First aur Last name dono.”,
address: “🏠 Door number, street, aur city zaroor likhein.”,
service: “🔧 Jo service chahiye usse select karein.”,
date   : “📅 Sahi date format mein likhein: DD/MM/YYYY”,
default: “💡 Koi problem ho toh yeh field dhyan se bharein. Help chahiye? Chat karein!”,
};

// ─────────────────────────────────────────────
// 3. SVG STICKMAN FRAMES (inline, no dependency)
// ─────────────────────────────────────────────
const SVG = {
idle: `
<svg width="60" height="90" viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg" class="nsdk-stickman">

  <!-- Head -->

  <circle cx="30" cy="14" r="11" fill="none" stroke="STROKE" stroke-width="3"/>
  <!-- Eyes -->
  <circle cx="26" cy="12" r="1.5" fill="STROKE"/>
  <circle cx="34" cy="12" r="1.5" fill="STROKE"/>
  <!-- Smile -->
  <path d="M25 17 Q30 21 35 17" fill="none" stroke="STROKE" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Body -->
  <line x1="30" y1="25" x2="30" y2="55" stroke="STROKE" stroke-width="3" stroke-linecap="round"/>
  <!-- Arms idle -->
  <line x1="30" y1="33" x2="14" y2="44" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="33" x2="46" y2="44" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Legs -->
  <line x1="30" y1="55" x2="18" y2="75" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="55" x2="42" y2="75" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
</svg>`,

```
walk: `
```

<svg width="60" height="90" viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg" class="nsdk-stickman nsdk-walk">
  <circle cx="30" cy="14" r="11" fill="none" stroke="STROKE" stroke-width="3"/>
  <circle cx="26" cy="12" r="1.5" fill="STROKE"/>
  <circle cx="34" cy="12" r="1.5" fill="STROKE"/>
  <path d="M25 17 Q30 21 35 17" fill="none" stroke="STROKE" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="30" y1="25" x2="30" y2="55" stroke="STROKE" stroke-width="3" stroke-linecap="round"/>
  <!-- Walking arms -->
  <line x1="30" y1="33" x2="12" y2="28" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="33" x2="48" y2="40" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Walking legs -->
  <line x1="30" y1="55" x2="14" y2="70" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="55" x2="44" y2="68" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
</svg>`,

```
point: `
```

<svg width="60" height="90" viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg" class="nsdk-stickman">
  <circle cx="30" cy="14" r="11" fill="none" stroke="STROKE" stroke-width="3"/>
  <circle cx="26" cy="12" r="1.5" fill="STROKE"/>
  <circle cx="34" cy="12" r="1.5" fill="STROKE"/>
  <path d="M25 17 Q30 21 35 17" fill="none" stroke="STROKE" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="30" y1="25" x2="30" y2="55" stroke="STROKE" stroke-width="3" stroke-linecap="round"/>
  <!-- Pointing arm -->
  <line x1="30" y1="33" x2="56" y2="22" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="57" cy="21" r="2" fill="STROKE"/>
  <!-- Other arm down -->
  <line x1="30" y1="33" x2="16" y2="47" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="55" x2="18" y2="75" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="55" x2="42" y2="75" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
</svg>`,

```
talk: `
```

<svg width="60" height="90" viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg" class="nsdk-stickman nsdk-talk">
  <circle cx="30" cy="14" r="11" fill="none" stroke="STROKE" stroke-width="3"/>
  <circle cx="26" cy="12" r="1.5" fill="STROKE"/>
  <circle cx="34" cy="12" r="1.5" fill="STROKE"/>
  <!-- Open mouth -->
  <ellipse cx="30" cy="18" rx="4" ry="2.5" fill="STROKE"/>
  <line x1="30" y1="25" x2="30" y2="55" stroke="STROKE" stroke-width="3" stroke-linecap="round"/>
  <!-- Gesturing arms -->
  <line x1="30" y1="33" x2="10" y2="26" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="33" x2="50" y2="26" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="55" x2="18" y2="75" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="55" x2="42" y2="75" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
</svg>`,

```
celebrate: `
```

<svg width="60" height="90" viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg" class="nsdk-stickman nsdk-celebrate">
  <circle cx="30" cy="14" r="11" fill="none" stroke="STROKE" stroke-width="3"/>
  <circle cx="26" cy="12" r="1.5" fill="STROKE"/>
  <circle cx="34" cy="12" r="1.5" fill="STROKE"/>
  <!-- Big smile -->
  <path d="M23 16 Q30 23 37 16" fill="none" stroke="STROKE" stroke-width="2" stroke-linecap="round"/>
  <line x1="30" y1="25" x2="30" y2="55" stroke="STROKE" stroke-width="3" stroke-linecap="round"/>
  <!-- Arms raised up -->
  <line x1="30" y1="33" x2="10" y2="15" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="33" x2="50" y2="15" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Jumping legs -->
  <line x1="30" y1="55" x2="16" y2="72" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="55" x2="44" y2="72" stroke="STROKE" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Stars -->
  <text x="48" y="10" font-size="10">✨</text>
  <text x="4"  y="10" font-size="10">✨</text>
</svg>`,
  };

// ─────────────────────────────────────────────
// 4. CSS INJECTION
// ─────────────────────────────────────────────
function injectStyles(color) {
if (document.getElementById(‘nsdk-styles’)) return;
const s = document.createElement(‘style’);
s.id = ‘nsdk-styles’;
s.textContent = `
:root {
–nsdk-primary: ${color};
–nsdk-primary-dark: #3730a3;
–nsdk-bg: #ffffff;
–nsdk-text: #1f2937;
–nsdk-muted: #6b7280;
–nsdk-border: #e5e7eb;
–nsdk-radius: 16px;
–nsdk-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.1);
}

```
  #nsdk-container {
    position: fixed;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  #nsdk-container.bottom-right { bottom: 20px; right: 20px; }
  #nsdk-container.bottom-left  { bottom: 20px; left: 20px; }
  #nsdk-container.top-right    { top: 20px; right: 20px; }
  #nsdk-container.top-left     { top: 20px; left: 20px; }

  /* Stickman wrapper */
  #nsdk-stickman-wrap {
    cursor: pointer;
    user-select: none;
    position: relative;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 4px 8px rgba(79,70,229,0.35));
    transition: transform 0.2s ease;
    margin-left: auto;
  }
  #nsdk-stickman-wrap:hover { transform: scale(1.08); }
  #nsdk-stickman-wrap svg { width: 52px; height: 52px; }

  /* Float animation */
  @keyframes nsdk-float {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-6px); }
  }
  .nsdk-stickman { animation: nsdk-float 3s ease-in-out infinite; }

  /* Walk animation */
  @keyframes nsdk-walk {
    0%,100% { transform: translateX(0) rotate(0deg); }
    25%      { transform: translateX(2px) rotate(1deg); }
    75%      { transform: translateX(-2px) rotate(-1deg); }
  }
  .nsdk-walk { animation: nsdk-float 1.5s ease-in-out infinite, nsdk-walk-body 0.5s ease-in-out infinite; }

  @keyframes nsdk-walk-body {
    0%,100% { transform: rotate(0deg); }
    50%      { transform: rotate(2deg); }
  }

  /* Talk bounce */
  @keyframes nsdk-talk {
    0%,100% { transform: scaleY(1); }
    50%      { transform: scaleY(1.04); }
  }
  .nsdk-talk { animation: nsdk-talk 0.4s ease-in-out infinite; }

  /* Celebrate */
  @keyframes nsdk-celebrate {
    0%,100% { transform: translateY(0) rotate(0deg) scale(1); }
    25%      { transform: translateY(-10px) rotate(-5deg) scale(1.05); }
    75%      { transform: translateY(-10px) rotate(5deg) scale(1.05); }
  }
  .nsdk-celebrate { animation: nsdk-celebrate 0.6s ease-in-out infinite; }

  /* Chat panel */
  #nsdk-panel {
    position: absolute;
    bottom: 74px;
    right: 0;
    width: 300px;
    background: var(--nsdk-bg);
    border-radius: var(--nsdk-radius);
    box-shadow: var(--nsdk-shadow);
    overflow: hidden;
    transform-origin: bottom right;
    transform: scale(0.8) translateY(10px);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
    border: 1px solid var(--nsdk-border);
    max-height: 460px;
    display: flex;
    flex-direction: column;
  }
  #nsdk-panel.open {
    transform: scale(1) translateY(0);
    opacity: 1;
    pointer-events: all;
  }

  /* Panel header */
  #nsdk-header {
    background: var(--nsdk-primary);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    flex-shrink: 0;
  }
  #nsdk-header-avatar {
    width: 34px; height: 34px;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  #nsdk-header-info { flex: 1; }
  #nsdk-header-name { font-weight: 700; font-size: 13px; }
  #nsdk-header-status { font-size: 11px; opacity: 0.85; display: flex; align-items: center; gap: 4px; }
  #nsdk-header-status::before {
    content: '';
    width: 6px; height: 6px;
    background: #4ade80;
    border-radius: 50%;
    display: inline-block;
    box-shadow: 0 0 0 2px rgba(74,222,128,0.3);
  }
  #nsdk-close-btn {
    background: rgba(255,255,255,0.2);
    border: none; color: #fff;
    width: 26px; height: 26px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  #nsdk-close-btn:hover { background: rgba(255,255,255,0.35); }

  /* Messages */
  #nsdk-messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    scroll-behavior: smooth;
  }
  #nsdk-messages::-webkit-scrollbar { width: 4px; }
  #nsdk-messages::-webkit-scrollbar-track { background: transparent; }
  #nsdk-messages::-webkit-scrollbar-thumb { background: var(--nsdk-border); border-radius: 2px; }

  .nsdk-msg {
    max-width: 85%;
    padding: 9px 13px;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.5;
    animation: nsdk-msg-in 0.3s cubic-bezier(0.34,1.56,0.64,1);
    word-break: break-word;
  }
  @keyframes nsdk-msg-in {
    from { opacity:0; transform: translateY(8px) scale(0.95); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }
  .nsdk-msg-bot {
    background: #f3f4f6;
    color: var(--nsdk-text);
    border-bottom-left-radius: 4px;
    align-self: flex-start;
  }
  .nsdk-msg-user {
    background: var(--nsdk-primary);
    color: #fff;
    border-bottom-right-radius: 4px;
    align-self: flex-end;
  }
  .nsdk-msg-typing {
    background: #f3f4f6;
    align-self: flex-start;
    padding: 12px 16px;
  }
  .nsdk-dots { display: flex; gap: 4px; }
  .nsdk-dots span {
    width: 6px; height: 6px;
    background: var(--nsdk-muted);
    border-radius: 50%;
    animation: nsdk-dot 1.2s infinite;
  }
  .nsdk-dots span:nth-child(2) { animation-delay: 0.2s; }
  .nsdk-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes nsdk-dot {
    0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
    40%          { transform: scale(1); opacity: 1; }
  }

  /* Quick replies */
  #nsdk-quick-replies {
    padding: 6px 12px 2px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex-shrink: 0;
  }
  .nsdk-qr-btn {
    font-size: 11.5px;
    padding: 5px 11px;
    border: 1.5px solid var(--nsdk-primary);
    color: var(--nsdk-primary);
    background: transparent;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
    white-space: nowrap;
  }
  .nsdk-qr-btn:hover {
    background: var(--nsdk-primary);
    color: #fff;
  }

  /* Input area */
  #nsdk-input-wrap {
    padding: 10px 12px;
    border-top: 1px solid var(--nsdk-border);
    display: flex;
    gap: 8px;
    align-items: flex-end;
    flex-shrink: 0;
  }
  #nsdk-input {
    flex: 1;
    border: 1.5px solid var(--nsdk-border);
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 13px;
    font-family: inherit;
    resize: none;
    outline: none;
    max-height: 80px;
    overflow-y: auto;
    color: var(--nsdk-text);
    transition: border-color 0.2s;
    line-height: 1.4;
  }
  #nsdk-input:focus { border-color: var(--nsdk-primary); }
  #nsdk-input::placeholder { color: var(--nsdk-muted); }
  #nsdk-send-btn {
    width: 34px; height: 34px;
    background: var(--nsdk-primary);
    border: none; border-radius: 10px;
    color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background 0.2s, transform 0.1s;
    font-size: 14px;
  }
  #nsdk-send-btn:hover { background: var(--nsdk-primary-dark); }
  #nsdk-send-btn:active { transform: scale(0.92); }

  /* Notification badge */
  #nsdk-badge {
    position: absolute;
    top: -4px; right: -4px;
    width: 18px; height: 18px;
    background: #ef4444;
    border-radius: 50%;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    display: none;
    align-items: center;
    justify-content: center;
    border: 2px solid #fff;
    animation: nsdk-badge-in 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes nsdk-badge-in {
    from { transform: scale(0); }
    to   { transform: scale(1); }
  }

  /* Tooltip bubble */
  #nsdk-tooltip {
    position: absolute;
    bottom: 74px;
    right: 0;
    background: var(--nsdk-primary);
    color: #fff;
    padding: 9px 14px;
    border-radius: 12px 12px 2px 12px;
    font-size: 12.5px;
    max-width: 220px;
    line-height: 1.4;
    box-shadow: 0 4px 20px rgba(79,70,229,0.35);
    opacity: 0;
    pointer-events: none;
    transform: translateY(6px);
    transition: opacity 0.25s ease, transform 0.25s ease;
    cursor: pointer;
    white-space: pre-wrap;
  }
  #nsdk-tooltip.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: all;
  }

  /* Field highlight */
  .nsdk-field-highlight {
    outline: 2.5px solid var(--nsdk-primary) !important;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(79,70,229,0.15) !important;
    transition: outline 0.2s, box-shadow 0.2s;
  }

  /* Mobile responsive */
  @media (max-width: 480px) {
    #nsdk-panel {
      width: calc(100vw - 32px);
      right: -8px;
    }
    #nsdk-container.bottom-right,
    #nsdk-container.bottom-left {
      bottom: 16px;
      right: 16px;
      left: auto;
    }
  }

  /* Powered by */
  #nsdk-powered {
    text-align: center;
    font-size: 10px;
    color: var(--nsdk-muted);
    padding: 4px 0 8px;
    flex-shrink: 0;
  }
  #nsdk-powered a {
    color: var(--nsdk-primary);
    text-decoration: none;
  }
`;
document.head.appendChild(s);
```

}

// ─────────────────────────────────────────────
// 5. BEHAVIOR TRACKER
// ─────────────────────────────────────────────
class BehaviorTracker {
constructor(callbacks) {
this.callbacks   = callbacks;
this.fieldData   = {};      // per-field state
this.rageClicks  = {};
this.timers      = {};
this._raf        = null;
this._listeners  = [];
this.activeField = null;
}

```
_fieldKey(el) {
  return el.name || el.id || el.placeholder || el.type || 'unknown';
}

_throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last < ms) return;
    last = now;
    fn(...args);
  };
}

start() {
  const onFocus = (e) => {
    const el = e.target;
    if (!this._isTrackable(el)) return;
    const key = this._fieldKey(el);
    this.activeField = el;
    if (!this.fieldData[key]) {
      this.fieldData[key] = { edits: 0, startTime: Date.now(), errors: 0 };
    }
    this.fieldData[key].focusTime = Date.now();
    clearTimeout(this.timers[key]);
    this.callbacks.onFocus(el, key);
    // Inactivity timer
    this.timers[key] = setTimeout(() => {
      this.callbacks.onStuck(el, key, Date.now() - this.fieldData[key].focusTime);
    }, DEFAULTS.stickDelay);
  };

  const onBlur = (e) => {
    const el = e.target;
    if (!this._isTrackable(el)) return;
    const key = this._fieldKey(el);
    clearTimeout(this.timers[key]);
    this.activeField = null;
  };

  const onInput = this._throttle((e) => {
    const el = e.target;
    if (!this._isTrackable(el)) return;
    const key = this._fieldKey(el);
    const fd  = this.fieldData[key];
    if (!fd) return;
    fd.edits++;
    clearTimeout(this.timers[key]);
    // Reset stuck timer
    this.timers[key] = setTimeout(() => {
      this.callbacks.onStuck(el, key, DEFAULTS.stickDelay);
    }, DEFAULTS.stickDelay);
    if (fd.edits >= DEFAULTS.editThreshold) {
      this.callbacks.onRepeatedEdit(el, key, fd.edits);
    }
  }, 300);

  const onClick = (e) => {
    const el  = e.target;
    const key = el.id || el.className || 'doc';
    const now = Date.now();
    if (!this.rageClicks[key]) this.rageClicks[key] = [];
    this.rageClicks[key] = this.rageClicks[key].filter(t => now - t < DEFAULTS.rageClickMs);
    this.rageClicks[key].push(now);
    if (this.rageClicks[key].length >= DEFAULTS.rageClickCount) {
      this.callbacks.onRageClick(el);
      this.rageClicks[key] = [];
    }
  };

  // Error detection via MutationObserver
  const observer = new MutationObserver(this._throttle((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) {
          const text = node.textContent || '';
          const cls  = (node.className || '') + (node.getAttribute ? node.getAttribute('role') || '' : '');
          if (/error|invalid|required|alert/i.test(cls) || /\berror\b|\binvalid\b/i.test(text)) {
            const nearestInput = this._findNearbyInput(node);
            this.callbacks.onError(nearestInput, node.textContent.trim());
          }
        }
      }
    }
  }, 200));
  observer.observe(document.body, { childList: true, subtree: true });

  // Bind
  document.addEventListener('focusin',  onFocus,  { passive: true });
  document.addEventListener('focusout', onBlur,   { passive: true });
  document.addEventListener('input',    onInput,  { passive: true });
  document.addEventListener('click',    onClick,  { passive: true });

  this._listeners = [
    ['focusin',  onFocus],
    ['focusout', onBlur],
    ['input',    onInput],
    ['click',    onClick],
  ];
  this._observer = observer;
}

stop() {
  this._listeners.forEach(([ev, fn]) => document.removeEventListener(ev, fn));
  if (this._observer) this._observer.disconnect();
  Object.values(this.timers).forEach(clearTimeout);
}

_isTrackable(el) {
  return el && (
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT'
  ) && el.type !== 'submit' && el.type !== 'button' && el.type !== 'checkbox' && el.type !== 'radio';
}

_findNearbyInput(node) {
  const form = node.closest ? node.closest('form') : null;
  if (!form) return null;
  // Find last focused input in form
  return form.querySelector('input:focus, textarea:focus, select:focus') ||
         form.querySelector('input, textarea, select');
}
```

}

// ─────────────────────────────────────────────
// 6. AI ENGINE (client-side call)
// ─────────────────────────────────────────────
class AIEngine {
constructor(config) {
this.config = config;
this._pending = false;
}

```
async ask(context) {
  if (this._pending) return null;
  this._pending = true;
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), this.config.aiTimeout || DEFAULTS.aiTimeout);

  try {
    const prompt = this._buildPrompt(context);
    const res = await fetch(this.config.apiEndpoint, {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key'   : this.config.apiKey,
      },
      body   : JSON.stringify({ prompt, context, language: this.config.language }),
      signal : controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.message || data.response || null;
  } catch (err) {
    if (this.config.debug) console.warn('[Nirvana AI] Error:', err.message);
    return null; // Triggers fallback
  } finally {
    clearTimeout(timeout);
    this._pending = false;
  }
}

_buildPrompt(ctx) {
  return `You are a helpful form assistant for "${ctx.pageName || 'a website'}" (${this.config.businessType}).
```

Field: “${ctx.fieldName}”
Event: ${ctx.event}
${ctx.errorText ? `Error shown: "${ctx.errorText}"` : ‘’}
${ctx.timeSpent ? `Time stuck: ${Math.round(ctx.timeSpent / 1000)}s` : ‘’}
Language: ${this.config.language === ‘hinglish’ ? ‘Reply in friendly Hinglish (Hindi+English mix), max 2 sentences, use 1 emoji.’ : ‘Reply in English, max 2 sentences, use 1 emoji.’}
Be short, friendly, and specific to the field.`;
}

```
getFallback(fieldKey) {
  const k = fieldKey.toLowerCase();
  for (const [keyword, msg] of Object.entries(FALLBACKS)) {
    if (k.includes(keyword)) return msg;
  }
  return FALLBACKS.default;
}
```

}

// ─────────────────────────────────────────────
// 7. STICKMAN ANIMATION CONTROLLER
// ─────────────────────────────────────────────
class StickmanController {
constructor(wrap, primaryColor) {
this.wrap  = wrap;
this.color = primaryColor;
this.state = ‘idle’;
this._walkTimer = null;
}

```
setState(state) {
  if (this.state === state) return;
  this.state = state;
  const svgStr = (SVG[state] || SVG.idle).replace(/STROKE/g, this.color);
  this.wrap.innerHTML = svgStr;
}

async walkToField(fieldEl) {
  this.setState('walk');
  await this._delay(700);
  this.setState('point');
  await this._delay(500);
  this.setState('talk');
}

celebrate() {
  this.setState('celebrate');
  setTimeout(() => this.setState('idle'), 2500);
}

idle() { this.setState('idle'); }

_delay(ms) { return new Promise(r => setTimeout(r, ms)); }
```

}

// ─────────────────────────────────────────────
// 8. CHAT UI
// ─────────────────────────────────────────────
class ChatUI {
constructor(container, config) {
this.container = container;
this.config    = config;
this.isOpen    = false;
this._unread   = 0;
}

```
build() {
  // Stickman toggle
  const stickWrap = document.createElement('div');
  stickWrap.id = 'nsdk-stickman-wrap';

  // Badge
  const badge = document.createElement('div');
  badge.id = 'nsdk-badge';
  stickWrap.appendChild(badge);

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.id = 'nsdk-tooltip';

  // Panel
  const panel = document.createElement('div');
  panel.id = 'nsdk-panel';
  panel.innerHTML = `
    <div id="nsdk-header">
      <div id="nsdk-header-avatar">🤖</div>
      <div id="nsdk-header-info">
        <div id="nsdk-header-name">Nirvana Assistant</div>
        <div id="nsdk-header-status">Online — Ready to help</div>
      </div>
      <button id="nsdk-close-btn" aria-label="Close">✕</button>
    </div>
    <div id="nsdk-messages" role="log" aria-live="polite"></div>
    <div id="nsdk-quick-replies"></div>
    <div id="nsdk-input-wrap">
      <textarea id="nsdk-input" rows="1" placeholder="Kuch poochna hai? Type karo..." aria-label="Message input"></textarea>
      <button id="nsdk-send-btn" aria-label="Send">➤</button>
    </div>
    <div id="nsdk-powered">Powered by <a href="https://nirvana.ai" target="_blank">Nirvana AI</a></div>
  `;

  this.container.appendChild(tooltip);
  this.container.appendChild(panel);
  this.container.appendChild(stickWrap);

  this._bindEvents();
  return { stickWrap, tooltip, panel };
}

_bindEvents() {
  const stickWrap = document.getElementById('nsdk-stickman-wrap');
  const panel     = document.getElementById('nsdk-panel');
  const closeBtn  = document.getElementById('nsdk-close-btn');
  const sendBtn   = document.getElementById('nsdk-send-btn');
  const input     = document.getElementById('nsdk-input');
  const tooltip   = document.getElementById('nsdk-tooltip');

  stickWrap.addEventListener('click', () => {
    tooltip.classList.remove('visible');
    this.toggle();
  });
  tooltip.addEventListener('click', () => {
    tooltip.classList.remove('visible');
    this.open();
  });
  closeBtn.addEventListener('click', () => this.close());

  sendBtn.addEventListener('click', () => this._sendUserMsg());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this._sendUserMsg();
    }
  });
  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
  });
}

_sendUserMsg() {
  const input = document.getElementById('nsdk-input');
  const text  = input.value.trim();
  if (!text) return;
  this.addMessage(text, 'user');
  input.value = '';
  input.style.height = 'auto';
  if (this.onUserMessage) this.onUserMessage(text);
}

open() {
  const panel = document.getElementById('nsdk-panel');
  panel.classList.add('open');
  this.isOpen  = true;
  this._unread = 0;
  this._updateBadge();
  document.getElementById('nsdk-input').focus();
}

close() {
  document.getElementById('nsdk-panel').classList.remove('open');
  this.isOpen = false;
}

toggle() { this.isOpen ? this.close() : this.open(); }

addMessage(text, role = 'bot') {
  const msgs  = document.getElementById('nsdk-messages');
  const div   = document.createElement('div');
  div.className = `nsdk-msg nsdk-msg-${role}`;
  div.textContent = text;
  msgs.appendChild(div);
  requestAnimationFrame(() => { msgs.scrollTop = msgs.scrollHeight; });

  if (role === 'bot' && !this.isOpen) {
    this._unread++;
    this._updateBadge();
  }
}

showTyping() {
  const msgs = document.getElementById('nsdk-messages');
  const div  = document.createElement('div');
  div.id        = 'nsdk-typing';
  div.className = 'nsdk-msg nsdk-msg-typing';
  div.innerHTML = '<div class="nsdk-dots"><span></span><span></span><span></span></div>';
  msgs.appendChild(div);
  requestAnimationFrame(() => { msgs.scrollTop = msgs.scrollHeight; });
}

hideTyping() {
  const el = document.getElementById('nsdk-typing');
  if (el) el.remove();
}

showTooltip(text) {
  const t = document.getElementById('nsdk-tooltip');
  t.textContent = text;
  t.classList.add('visible');
  if (this._tooltipTimer) clearTimeout(this._tooltipTimer);
  this._tooltipTimer = setTimeout(() => t.classList.remove('visible'), 6000);
}

setQuickReplies(replies, onClick) {
  const qr = document.getElementById('nsdk-quick-replies');
  qr.innerHTML = '';
  replies.forEach(r => {
    const btn = document.createElement('button');
    btn.className   = 'nsdk-qr-btn';
    btn.textContent = r;
    btn.addEventListener('click', () => {
      qr.innerHTML = '';
      onClick(r);
    });
    qr.appendChild(btn);
  });
}

highlightField(el) {
  // Remove previous highlights
  document.querySelectorAll('.nsdk-field-highlight').forEach(e => e.classList.remove('nsdk-field-highlight'));
  if (el) el.classList.add('nsdk-field-highlight');
  setTimeout(() => { if (el) el.classList.remove('nsdk-field-highlight'); }, 4000);
}

_updateBadge() {
  const badge = document.getElementById('nsdk-badge');
  if (this._unread > 0) {
    badge.textContent = this._unread;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}
```

}

// ─────────────────────────────────────────────
// 9. MAIN ASSISTANT CLASS
// ─────────────────────────────────────────────
class NirvanaAssistant {
constructor() {
this._config     = null;
this._inited     = false;
this._tracker    = null;
this._ai         = null;
this._ui         = null;
this._stickman   = null;
this._container  = null;
this._stickWrap  = null;
}

```
init(userConfig = {}) {
  if (this._inited) {
    if (DEFAULTS.debug) console.warn('[Nirvana] Already initialized.');
    return;
  }

  this._config = Object.assign({}, DEFAULTS, userConfig);
  injectStyles(this._config.primaryColor);
  this._buildDOM();
  this._ai      = new AIEngine(this._config);
  this._tracker = new BehaviorTracker({
    onFocus        : this._onFocus.bind(this),
    onStuck        : this._onStuck.bind(this),
    onRepeatedEdit : this._onRepeatedEdit.bind(this),
    onError        : this._onError.bind(this),
    onRageClick    : this._onRageClick.bind(this),
  });
  this._tracker.start();
  this._inited = true;

  // Welcome message after 3s
  setTimeout(() => {
    if (!this._ui.isOpen) {
      this._stickman.setState('talk');
      this._ui.showTooltip('👋 Namaste! Form bharne mein help chahiye?');
      setTimeout(() => this._stickman.setState('idle'), 2500);
    }
  }, 3000);

  if (this._config.debug) console.log('[Nirvana Assistant] v' + VERSION + ' initialized.');
}

_buildDOM() {
  if (document.getElementById(SDK_ID)) return;
  const container  = document.createElement('div');
  container.id     = SDK_ID;
  container.setAttribute('id', 'nsdk-container');
  container.className = this._config.position;
  document.body.appendChild(container);
  this._container = container;

  this._ui = new ChatUI(container, this._config);
  const { stickWrap } = this._ui.build();
  this._stickWrap = stickWrap;

  this._stickman = new StickmanController(stickWrap, this._config.primaryColor);
  this._stickman.setState('idle');

  this._ui.onUserMessage = async (text) => {
    await this._handleUserQuery(text);
  };
}

async _onFocus(el, fieldKey) {
  this._ui.highlightField(el);
  await this._stickman.walkToField(el);
  setTimeout(() => this._stickman.setState('idle'), 1200);
}

async _onStuck(el, fieldKey, timeSpent) {
  const ctx = {
    fieldName: fieldKey,
    event    : 'user_stuck',
    timeSpent,
    pageName : document.title,
  };
  const msg = await this._getAIOrFallback(ctx, fieldKey);
  this._ui.showTooltip(msg);
  this._ui.addMessage(msg, 'bot');
  await this._stickman.walkToField(el);
  this._ui.highlightField(el);
  this._showContextualQuickReplies(fieldKey);
  this._stickman.setState('point');
}

async _onRepeatedEdit(el, fieldKey, count) {
  if (count !== DEFAULTS.editThreshold) return; // fire once
  const ctx = {
    fieldName: fieldKey,
    event    : 'repeated_edit',
    pageName : document.title,
  };
  const msg = await this._getAIOrFallback(ctx, fieldKey);
  this._ui.addMessage(msg, 'bot');
  this._stickman.setState('talk');
  setTimeout(() => this._stickman.setState('idle'), 1500);
}

async _onError(el, errorText) {
  const fieldKey = el ? (el.name || el.id || 'field') : 'field';
  const ctx = {
    fieldName: fieldKey,
    event    : 'error_shown',
    errorText,
    pageName : document.title,
  };
  const msg = await this._getAIOrFallback(ctx, fieldKey);
  this._ui.showTooltip('⚠️ ' + msg);
  this._ui.addMessage('⚠️ ' + msg, 'bot');
  if (el) { this._ui.highlightField(el); }
  this._stickman.setState('talk');
}

_onRageClick(el) {
  const msg = '😅 Lagta hai kuch problem aa rahi hai? Main help kar sakta hoon!';
  this._ui.showTooltip(msg);
  this._ui.addMessage(msg, 'bot');
  this._stickman.setState('talk');
  setTimeout(() => this._stickman.setState('idle'), 2000);
  this._ui.setQuickReplies(['Help chahiye', 'Form reset karo', 'Contact karo'], (r) => {
    this._ui.addMessage(r, 'user');
    this._handleUserQuery(r);
  });
}

async _handleUserQuery(text) {
  this._ui.showTyping();
  this._stickman.setState('talk');
  const ctx = {
    fieldName: this._tracker.activeField
      ? (this._tracker.activeField.name || this._tracker.activeField.id || 'general')
      : 'general',
    event    : 'user_question',
    userText : text,
    pageName : document.title,
  };
  const msg = await this._getAIOrFallback(ctx, 'default');
  this._ui.hideTyping();
  this._ui.addMessage(msg, 'bot');
  this._stickman.setState('idle');
}

async _getAIOrFallback(ctx, fieldKey) {
  const aiMsg = await this._ai.ask(ctx);
  return aiMsg || this._ai.getFallback(fieldKey);
}

_showContextualQuickReplies(fieldKey) {
  const k = fieldKey.toLowerCase();
  let replies = ['Kya daalna hai?', 'Example dikhao', 'Skip kar sakte hain?'];
  if (k.includes('phone')) replies = ['Format kya hai?', 'WhatsApp number chalega?', 'Landline de sakte hain?'];
  if (k.includes('email')) replies = ['Email kya hota hai?', 'Gmail se chalega?'];
  if (k.includes('address')) replies = ['Pincode zaroori hai?', 'Area naam daalo'];

  this._ui.setQuickReplies(replies, (r) => {
    this._ui.addMessage(r, 'user');
    this._handleUserQuery(r + ' for ' + fieldKey);
  });
}

// Public API
celebrate()    { this._stickman && this._stickman.celebrate(); }
sendMessage(m) { this._ui && this._ui.addMessage(m, 'bot'); }
destroy() {
  if (this._tracker) this._tracker.stop();
  const el = document.getElementById('nsdk-container');
  if (el) el.remove();
  const st = document.getElementById('nsdk-styles');
  if (st) st.remove();
  this._inited = false;
}
```

}

return new NirvanaAssistant();
}));
