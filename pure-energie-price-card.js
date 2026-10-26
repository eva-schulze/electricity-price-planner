// Energy price card and badges for Home Assistant (beta).
// Draws dynamic electricity prices for today and tomorrow as bars, per hour or
// per quarter hour, read from the price list a price sensor keeps in its
// attributes. Tested with Pure Energie Prices
// (https://github.com/venraij/hacs-pure-energy-prices); the formats of Nord
// Pool, ENTSO-e and Frank Energie are recognised from their code but untested.
// No external libraries, no network requests. MIT licence, see LICENSE.
//
// All settings can be changed in the card editor (Edit dashboard, then the
// card's pencil), or in YAML:
//   type: custom:pure-energie-price-card
//   entity: sensor.pure_energie_electricity_import
//   attribute: prices               (optional; normally found automatically.
//                                    Several: "raw_today, raw_tomorrow")
//   time_key: start                 (optional, field with the start time; dots
//                                    for nested fields, e.g. date.full)
//   price_key: value                (optional, field with the price)
//   price_factor: 0.01              (optional, e.g. for prices in cents)
//   show_title: true                (optional, false hides the title)
//   title: Electricity price        (optional; empty uses the default title in
//                                    the dashboard's language)
//   show_summary: true              (optional, false hides the text above the
//                                    chart; or per line: summary_now,
//                                    summary_cheapest, summary_block)
//   show_info: true                 (optional, false hides the price line
//                                    below the chart)
//   height: 180                     (optional, chart height in pixels)
//   fixed_scale: true               (optional, use y_max as the top of the scale)
//   y_max: 0.40                     (optional, fixed top of the scale in €/kWh;
//                                    a higher price still stretches the scale)
//   decimals: 2                     (optional, decimals for prices in the text)
//   font_size: 14                   (optional, text size in pixels; the chart's
//                                    labels scale along)
//   palette: traffic                (optional: traffic, colorblind, grey, custom)
//   color_low: "#0072b2"            (optional, cheapest colour for palette custom;
//                                    also [r, g, b])
//   color_high: "#e69f00"           (optional, most expensive colour for custom)
//   color_steps: 3                  (optional, 2 to 6 colour bands)
//   block_hours: 3                  (optional, show the cheapest block of this
//                                    many consecutive hours; 0 = off)
//   block_color: "#43a047"          (optional, bracket colour; by default the
//                                    palette's colour for the cheapest prices)
//   night_shading: true             (optional, false turns night shading off)
//   night_start: 22                 (optional, first shaded hour)
//   night_end: 6                    (optional, last shaded hour, included)
// Width: in a sections dashboard, use the card's Layout tab.
//
// The same file also provides a badge for the top of a dashboard view:
//   type: custom:pure-energie-price-badge
//   entity: sensor.pure_energie_electricity_import
//   show: now                       (now, cheapest, block, at or average)
//   range: upcoming                 (for cheapest, block and average: upcoming,
//                                    today, tomorrow or both)
//   block_hours: 3                  (for show: block)
//   hour: 6                         (for show: at; the next time it is 06:00,
//                                    averaged over the hour for quarter hours)
//   attribute, time_key, price_key, price_factor as for the card
//   name: Washing machine           (optional, replaces the label)
//   icon: mdi:washing-machine       (optional)
//   decimals, palette, color_low, color_high, color_steps as for the card;
//   the icon takes the colour of the price.
//
// Texts follow the Home Assistant language: English, Dutch, German, French or
// Spanish (others fall back to English). Prices use that language's format.

const VERSION = "2.0.0-beta.1";
const HOUR = 3600000;

const TEXTS = {
  en: {
    title: "Electricity price",
    now: "Now",
    cheapest: "Cheapest still to come",
    at: "at",
    block: (n) => `Cheapest ${n} hours still to come`,
    avg: "average",
    tomorrow: "tomorrow",
    hint: "Hover over, tap or drag across the bars to see a price.",
    choose: "Choose a price sensor in the card settings.",
    missing: (e) => `Entity ${e} not found.`,
    empty: "No prices available yet.",
    bNow: "Now",
    bCheapest: "Cheapest",
    bBlock: (n) => `Cheapest ${n} h`,
    bAt: "At",
    unknown: "not known yet",
    ranges: { upcoming: "", today: "today", tomorrow: "tomorrow", both: "today + tomorrow" },
    bAvg: "Average",
    rest: "still to come",
  },
  nl: {
    title: "Stroomprijs",
    now: "Nu",
    cheapest: "Goedkoopst nog te komen",
    at: "om",
    block: (n) => `Goedkoopste ${n} uur nog te komen`,
    avg: "gemiddeld",
    tomorrow: "morgen",
    hint: "Beweeg over de balken, tik erop of sleep eroverheen om een prijs te zien.",
    choose: "Kies een prijssensor in de kaartinstellingen.",
    missing: (e) => `Entiteit ${e} niet gevonden.`,
    empty: "Nog geen prijzen beschikbaar.",
    bNow: "Nu",
    bCheapest: "Goedkoopst",
    bBlock: (n) => `Goedkoopste ${n} uur`,
    bAt: "Om",
    unknown: "nog niet bekend",
    ranges: { upcoming: "", today: "vandaag", tomorrow: "morgen", both: "vandaag + morgen" },
    bAvg: "Gemiddeld",
    rest: "nog te komen",
  },
  de: {
    title: "Strompreis",
    now: "Jetzt",
    cheapest: "Am günstigsten noch",
    at: "um",
    block: (n) => `Günstigste ${n} kommende Stunden`,
    avg: "Durchschnitt",
    tomorrow: "morgen",
    hint: "Über die Balken fahren, tippen oder wischen, um einen Preis zu sehen.",
    choose: "Wähle in den Karteneinstellungen einen Preissensor.",
    missing: (e) => `Entität ${e} nicht gefunden.`,
    empty: "Noch keine Preise verfügbar.",
    bNow: "Jetzt",
    bCheapest: "Am günstigsten",
    bBlock: (n) => `Günstigste ${n} Std.`,
    bAt: "Um",
    unknown: "noch nicht bekannt",
    ranges: { upcoming: "", today: "heute", tomorrow: "morgen", both: "heute + morgen" },
    bAvg: "Durchschnitt",
    rest: "noch kommend",
  },
  fr: {
    title: "Prix de l’électricité",
    now: "Maintenant",
    cheapest: "Le moins cher à venir",
    at: "à",
    block: (n) => `Les ${n} heures les moins chères à venir`,
    avg: "moyenne",
    tomorrow: "demain",
    hint: "Survolez, touchez ou faites glisser sur les barres pour voir un prix.",
    choose: "Choisissez un capteur de prix dans les paramètres de la carte.",
    missing: (e) => `Entité ${e} introuvable.`,
    empty: "Pas encore de prix disponibles.",
    bNow: "Maintenant",
    bCheapest: "Le moins cher",
    bBlock: (n) => `${n} h les moins chères`,
    bAt: "À",
    unknown: "pas encore connu",
    ranges: { upcoming: "", today: "aujourd’hui", tomorrow: "demain", both: "aujourd’hui + demain" },
    bAvg: "Moyenne",
    rest: "à venir",
  },
  es: {
    title: "Precio de la electricidad",
    now: "Ahora",
    cheapest: "Más barato por venir",
    at: "a las",
    block: (n) => `Las ${n} horas más baratas por venir`,
    avg: "media",
    tomorrow: "mañana",
    hint: "Pasa el cursor, toca o desliza sobre las barras para ver un precio.",
    choose: "Elige un sensor de precio en los ajustes de la tarjeta.",
    missing: (e) => `Entidad ${e} no encontrada.`,
    empty: "Aún no hay precios disponibles.",
    bNow: "Ahora",
    bCheapest: "Más barato",
    bBlock: (n) => `${n} h más baratas`,
    bAt: "A las",
    unknown: "aún no se conoce",
    ranges: { upcoming: "", today: "hoy", tomorrow: "mañana", both: "hoy + mañana" },
    bAvg: "Media",
    rest: "por venir",
  },
};

// Colour palettes: cheapest, middle (null = blend the two ends), most
// expensive, and the colour space the steps in between are blended in.
const PALETTES = {
  traffic: { stops: ["var(--success-color, #43a047)", "var(--warning-color, #ff9800)", "var(--error-color, #db4437)"], space: "oklch" },
  // Blue to orange: the pair that stays apart for red-green colour blindness.
  // Blended in a straight line (oklab), so the middle turns neutral instead of
  // passing through green.
  colorblind: { stops: ["#0072b2", null, "#e69f00"], space: "oklab" },
  // Strength of the text colour, so it works in light and dark themes.
  grey: {
    stops: [
      "color-mix(in srgb, var(--primary-text-color, #212121) 25%, var(--card-background-color, #fff))",
      null,
      "var(--primary-text-color, #212121)",
    ],
    space: "srgb",
  },
};

// The user's Home Assistant language if the card has texts for it, else English.
function language(hass) {
  const lang = (hass && ((hass.locale && hass.locale.language) || hass.language)) || "en";
  const code = lang.toLowerCase().slice(0, 2);
  return TEXTS[code] ? code : "en";
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// A colour from the config: [r, g, b] (the editor's colour picker) or a CSS
// colour string such as "#0072b2". Anything else falls back.
function cssColour(v, fallback) {
  if (Array.isArray(v) && v.length === 3) return `rgb(${v.map((n) => Math.round(Number(n)) || 0).join(",")})`;
  if (typeof v === "string" && /^(#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d\s.,%]+\))$/i.test(v.trim())) return v.trim();
  return fallback;
}

// A price in the language's own format: "€0.28", "€ 0,28", "0,28 €".
function euro(v, decimals, lang) {
  return new Intl.NumberFormat(lang || "en", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);
}

function num(v, decimals, lang) {
  return new Intl.NumberFormat(lang || "en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
}

function hh(d) {
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

function weekday(d, hass) {
  return d.toLocaleDateString(language(hass), { weekday: "short" });
}

// Price lists come in the formats of several integrations. Each entry needs a
// start time and a price; the first field name that is present is used. Own
// names can be set with time_key / price_key (a dot for nested fields).
const TIME_KEYS = ["date.full", "start", "startsAt", "from", "time", "datetime", "start_time", "date"];
const PRICE_KEYS = ["price", "value", "total", "electricity_price", "price_tax_included.amount"];
// Attributes that hold a price list, tried in this order: Pure Energie Prices,
// ENTSO-e and Frank Energie (prices), Nord Pool (raw_today / raw_tomorrow),
// split lists (prices_today / prices_tomorrow), forecasts.
const LIST_ATTRIBUTES = [["prices"], ["raw_today", "raw_tomorrow"], ["prices_today", "prices_tomorrow"], ["forecast"]];

function pick(obj, path) {
  return String(path).split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

// "2026-10-26 14:00" without a zone is local time; ISO strings with a zone are
// converted; numbers are Unix seconds or milliseconds.
function toDate(v) {
  if (typeof v === "number") return new Date(v < 1e12 ? v * 1000 : v);
  if (typeof v !== "string" || !v.trim()) return null;
  const d = new Date(v.trim().replace(" ", "T"));
  return isNaN(d) ? null : d;
}

function listNames(attrs, c) {
  if (c.attribute) return String(c.attribute).split(",").map((n) => n.trim()).filter(Boolean);
  return LIST_ATTRIBUTES.find((group) => group.some((n) => Array.isArray(attrs[n]))) || [];
}

// All prices of the sensor as { t, price }, sorted, one per start time.
function readPrices(state, c = {}) {
  const attrs = (state && state.attributes) || {};
  const timeKeys = c.time_key ? [c.time_key] : TIME_KEYS;
  const priceKeys = c.price_key ? [c.price_key] : PRICE_KEYS;
  const factor = Number(c.price_factor) || 1;
  const found = new Map();
  for (const name of listNames(attrs, c)) {
    for (const item of Array.isArray(attrs[name]) ? attrs[name] : []) {
      if (!item || typeof item !== "object") continue;
      let t = null;
      for (const k of timeKeys) if ((t = toDate(pick(item, k)))) break;
      let price = null;
      for (const k of priceKeys) {
        const v = pick(item, k);
        if (v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v))) { price = Number(v); break; }
      }
      if (t && price !== null) found.set(t.getTime(), { t, price: price * factor });
    }
  }
  return [...found.values()].sort((a, b) => a.t - b.t);
}

// The length of one price period in minutes: the most common gap between
// start times (15, 30 or 60), hourly when unclear.
function slotMinutes(list) {
  const counts = {};
  for (let j = 1; j < list.length; j++) {
    const gap = Math.round((list[j].t - list[j - 1].t) / 60000);
    if (gap === 15 || gap === 30 || gap === 60) counts[gap] = (counts[gap] || 0) + 1;
  }
  const best = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  return best ? Number(best) : 60;
}

// Today and tomorrow as price periods from local midnight, with the sensor's
// prices placed in them. Shared by the card and the badge.
function priceDays(state, c = {}) {
  const list = readPrices(state, c);
  const slotMin = slotMinutes(list);
  const slotMs = slotMin * 60000;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const tomorrow = new Date(start);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  // Rounding keeps the slots right on the 23- and 25-hour days of a clock change.
  const slots = Math.round((end - start) / slotMs);
  const split = Math.round((tomorrow - start) / slotMs);
  const nowSlot = Math.floor((Date.now() - start) / slotMs);
  const bars = [];
  for (const p of list) {
    const i = Math.round((p.t - start) / slotMs);
    if (i >= 0 && i < slots) bars.push({ i, t: p.t, price: p.price });
  }
  return { start, slots, split, nowSlot, bars, slotMin, slotMs };
}

// The run of `hours` consecutive hours, starting after the current period,
// with the lowest average price. Null when off or not enough data.
function cheapestBlock(bars, nowSlot, hours, slotMin = 60) {
  const h = Math.min(Math.max(Math.round(Number(hours) || 0), 0), 12);
  if (h < 1) return null;
  const n = Math.round((h * 60) / slotMin);
  const bySlot = new Map(bars.map((b) => [b.i, b]));
  let best = null;
  for (const b of bars) {
    if (b.i <= nowSlot) continue;
    let sum = 0, ok = true;
    for (let k = 0; k < n; k++) {
      const x = bySlot.get(b.i + k);
      if (!x) { ok = false; break; }
      sum += x.price;
    }
    if (ok && (!best || sum / n < best.avg)) {
      best = { from: b.i, to: b.i + n - 1, start: b.t, end: new Date(b.t.getTime() + h * HOUR), avg: sum / n, hours: h };
    }
  }
  return best;
}

// Colour for a position f in the price range (0 = cheapest, 1 = most
// expensive): `color_steps` equal bands across the chosen palette.
function bandColour(c, f) {
  const n = Math.min(Math.max(Math.round(Number(c.color_steps) || 3), 2), 6);
  const p = Math.min(Math.floor(f * n), n - 1) / (n - 1);
  const pal = PALETTES[c.palette] || PALETTES.traffic;
  let [low, mid, high] = pal.stops;
  let space = pal.space;
  if (c.palette === "custom") {
    low = cssColour(c.color_low, "#0072b2");
    high = cssColour(c.color_high, "#e69f00");
    mid = null;
    space = "oklch";
  }
  const mix = (a, b, x) => `color-mix(in ${space}, ${b} ${Math.round(x * 100)}%, ${a})`;
  if (!mid) return mix(low, high, p);
  return p <= 0.5 ? mix(low, mid, p * 2) : mix(mid, high, (p - 0.5) * 2);
}

class PriceChartCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("pure-energie-price-card-editor");
  }

  static getStubConfig(hass) {
    // Pre-fill the first sensor that carries a price list.
    const entity = Object.keys(hass.states).find(
      (id) => id.startsWith("sensor.") && listNames(hass.states[id].attributes || {}, {}).length > 0
    );
    return { entity: entity || "" };
  }

  setConfig(config) {
    this._config = { decimals: 2, height: 180, ...config };
    // Text size in px; the chart's labels and margins scale with it.
    this._fs = Math.min(Math.max(Number(this._config.font_size) || 14, 10), 24);
    this._k = this._fs / 14;
    this._key = null;
    if (this._hass) this.hass = this._hass;
  }

  set hass(hass) {
    // Home Assistant calls this on every state change anywhere; only redraw
    // when the price sensor changed or a new hour started.
    this._hass = hass;
    this._t = TEXTS[language(hass)];
    const state = hass.states[this._config.entity];
    // Redraw when the sensor changes, and each quarter hour for the "now" marker.
    const key = (state ? state.last_updated : "missing") + "|" + Math.floor(Date.now() / 900000) + "|" + language(hass);
    if (key === this._key) return;
    this._key = key;
    this._state = state;
    this._render();
  }

  connectedCallback() {
    // Redraw the chart whenever its box changes size: a wider or narrower
    // card, or the height a sections dashboard gives the card.
    if (!this._observer) this._observer = new ResizeObserver(() => this._draw());
    const box = this.shadowRoot && this.shadowRoot.querySelector(".chart");
    if (box) this._observer.observe(box);
  }

  disconnectedCallback() {
    if (this._observer) this._observer.disconnect();
  }

  getCardSize() {
    return Math.ceil((Number(this._config.height) + 90) / 50);
  }

  getGridOptions() {
    // Sections dashboards: full width by default, resizable down to half.
    return { columns: 12, min_columns: 6, rows: "auto", min_rows: 4 };
  }

  _day(d) {
    return weekday(d, this._hass);
  }

  _render() {
    if (!this._config) return;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const t = this._t || TEXTS.en;
    const state = this._state;

    const { start, slots, split, nowSlot, bars, slotMin, slotMs } = priceDays(state, this._config);
    this._bars = bars;
    this._slotMs = slotMs;
    this._block = cheapestBlock(bars, nowSlot, this._config.block_hours, slotMin);

    let body;
    if (!this._config.entity) {
      body = `<p class="msg">${t.choose}</p>`;
    } else if (!state) {
      body = `<p class="msg">${esc(t.missing(this._config.entity))}</p>`;
    } else if (!bars.length) {
      body = `<p class="msg">${t.empty}</p>`;
    } else {
      this._ctx = { bars, slots, split, nowSlot, start, slotMin, slotMs };
      const summary = this._config.show_summary === false ? "" : this._summary(bars, nowSlot);
      const info = this._config.show_info === false ? "" : `<div class="info">${t.hint}</div>`;
      body = summary + `<div class="chart"></div>${info}`;
    }
    this._drawn = null;

    const custom = typeof this._config.title === "string" ? this._config.title.trim() : "";
    const titleText = this._config.show_title === false ? "" : custom || t.title;
    const title = titleText ? ` header="${esc(titleText)}"` : "";
    this.shadowRoot.innerHTML = `
      <style>
        /* The card fills the cell a sections dashboard gives it. The chart
           takes the configured height, and grows or shrinks when the cell is
           taller or lower, so nothing spills over neighbouring cards. */
        :host { display: block; height: 100%; }
        ha-card { overflow: hidden; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; }
        .wrap { padding: 12px 16px; flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
        .summary, .info, .msg { flex: none; }
        .chart { position: relative; flex: 1 1 auto; height: ${Math.max(Number(this._config.height) || 180, 80)}px; min-height: 60px; cursor: pointer; touch-action: pan-y; }
        .chart svg { position: absolute; inset: 0; display: block; }
        ha-card[header] .wrap { padding-top: 0; }
        .msg { color: var(--secondary-text-color); margin: 0; }
        .summary { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-bottom: 8px; font-size: ${this._fs}px; }
        .summary span { color: var(--secondary-text-color); }
        .summary b { color: var(--primary-text-color); font-weight: 500; }
        text { fill: var(--secondary-text-color); font-size: ${Math.round(11 * this._k * 10) / 10}px; font-family: inherit; }
        .grid { stroke: var(--divider-color, rgba(127,127,127,.3)); stroke-width: 1; }
        .guide { stroke: var(--secondary-text-color); stroke-width: .6; opacity: .35; }
        .tick { stroke: var(--secondary-text-color); stroke-width: 1; }
        .split { stroke: var(--secondary-text-color); stroke-dasharray: 3 3; }
        .night { fill: var(--primary-text-color); opacity: .12; }
        .block { stroke-width: 2.5; fill: none; }
        .past { opacity: .35; }
        .now { stroke: var(--primary-text-color); stroke-width: 1.5; }
        .sel { stroke: var(--primary-text-color); stroke-width: 2.5; opacity: 1; }
        .info { margin-top: 8px; min-height: 1.6em; font-size: ${this._fs}px; color: var(--secondary-text-color); }
        .info b { color: var(--primary-text-color); font-weight: 500; }
      </style>
      <ha-card${title}>
        <div class="wrap">${body}</div>
      </ha-card>`;

    // Show the price of a bar right away: hover with a mouse, or tap and drag
    // sideways on a touchscreen. The hour comes from the pointer's x position,
    // so the whole column above and below a bar counts.
    const box = this.shadowRoot.querySelector(".chart");
    if (box) {
      const pick = (ev) => {
        if (!this._plot) return;
        const r = box.getBoundingClientRect();
        this._select(Math.floor((ev.clientX - r.left - this._plot.L) / this._plot.bw));
      };
      box.addEventListener("pointerdown", pick);
      box.addEventListener("pointermove", pick);
      if (!this._observer) this._observer = new ResizeObserver(() => this._draw());
      this._observer.disconnect();
      this._observer.observe(box);
      this._draw();
    }
  }

  // Draw the chart at the exact pixel size of its box, so text stays sharp.
  _draw() {
    const box = this.shadowRoot && this.shadowRoot.querySelector(".chart");
    if (!box || !this._ctx) return;
    const W = Math.floor(box.clientWidth), H = Math.floor(box.clientHeight);
    if (!W || !H || (this._drawn && this._drawn.W === W && this._drawn.H === H)) return;
    this._drawn = { W, H };
    box.innerHTML = this._chart(Math.max(W, 200), Math.max(H, 60));
    if (this._sel != null) this._select(this._sel);
  }

  _select(i) {
    const b = this._bars.find((x) => x.i === i);
    if (!b || (i === this._sel && this.shadowRoot.querySelector("rect.sel"))) return;
    this._sel = i;
    const root = this.shadowRoot;
    root.querySelectorAll("rect.sel").forEach((r) => r.classList.remove("sel"));
    const bar = root.querySelector(`rect[data-bar="${i}"]`);
    if (bar) bar.classList.add("sel");
    const next = new Date(b.t.getTime() + this._slotMs);
    const info = root.querySelector(".info");
    if (info) info.innerHTML = `${esc(this._day(b.t))} ${hh(b.t)}–${hh(next)}: <b>${euro(b.price, this._config.decimals, language(this._hass))}</b>`;
  }

  _summary(bars, nowSlot) {
    const t = this._t || TEXTS.en;
    const parts = [];
    const now = bars.find((b) => b.i === nowSlot);
    const d = this._config.decimals;
    if (now && this._config.summary_now !== false) parts.push(`<span>${t.now} <b>${euro(now.price, d, language(this._hass))}</b></span>`);
    const ahead = bars.filter((b) => b.i > nowSlot);
    if (ahead.length && this._config.summary_cheapest !== false) {
      const best = ahead.reduce((a, b) => (b.price < a.price ? b : a));
      parts.push(`<span>${t.cheapest} <b>${euro(best.price, d, language(this._hass))}</b> ${t.at} <b>${this._day(best.t)} ${hh(best.t)}</b></span>`);
    }
    const blk = this._block;
    if (blk && this._config.summary_block !== false) {
      parts.push(`<span>${t.block(blk.hours)}: <b>${this._day(blk.start)} ${hh(blk.start)}–${hh(blk.end)}</b>, ${t.avg} <b>${euro(blk.avg, d, language(this._hass))}</b></span>`);
    }
    return parts.length ? `<div class="summary">${parts.join("")}</div>` : "";
  }

  _colour(f) {
    return bandColour(this._config, f);
  }

  // Bracket colour: the user's own colour, or else the palette's colour for
  // the cheapest prices (for grey scale the text colour, as its cheapest grey
  // is too pale for a thin line).
  _blockColour() {
    const c = this._config;
    if (c.block_color != null && c.block_color_custom !== false) {
      const own = cssColour(c.block_color, null);
      if (own) return own;
    }
    if (c.palette === "custom") return cssColour(c.color_low, "#0072b2");
    if (c.palette === "grey") return "var(--primary-text-color, #212121)";
    return (PALETTES[c.palette] || PALETTES.traffic).stops[0];
  }

  _chart(W, H) {
    const t = this._t || TEXTS.en;
    const { bars, slots, split, nowSlot, start, slotMin, slotMs } = this._ctx;
    const k = this._k;
    const L = 38 * k, R = 4, T = 10, B = 20 * k;
    const pw = W - L - R, ph = H - T - B, bw = pw / slots;
    const values = bars.map((b) => b.price);
    const min = Math.min(...values), max = Math.max(...values);
    // With a fixed scale the top stays the same from day to day; a price above
    // it still stretches the axis so no bar is cut off.
    const fixed = this._config.fixed_scale ?? this._config.y_max != null;
    const scaleTop = Math.max(max, fixed ? Number(this._config.y_max) || 0 : 0);

    // Price lines every 5 cents, or a multiple of 5 (10, 15, 20 …) when the
    // chart is too low to keep the labels at least 22 px apart. The scale is
    // rounded out to whole steps, so the top and bottom lines are labelled.
    // Unusually large values (a price list in cents or €/MWh without a
    // factor) get steps of 1, 2, 5 × 10ⁿ, so the number of lines stays small.
    const steps = [];
    for (let k = 1; k <= 20; k++) steps.push(0.05 * k);
    for (let e = 0; e < 12; e++) steps.push(2 * 10 ** e, 5 * 10 ** e, 10 * 10 ** e);
    let step, lo, hi;
    for (step of steps) {
      lo = Math.floor(Math.min(0, min) / step + 1e-9) * step;
      hi = Math.max(Math.ceil(scaleTop / step - 1e-9) * step, lo + step);
      if ((ph * step) / (hi - lo) >= 22 * this._k) break;
    }
    const y = (v) => T + ((hi - v) / (hi - lo)) * ph;

    let svg = "";

    // Shade the night hours behind the bars.
    const ns = this._config.night_start ?? 22, ne = this._config.night_end ?? 6;
    const isNight = (i) => {
      if (this._config.night_shading === false) return false;
      const h = new Date(start.getTime() + i * slotMs).getHours();
      return ns > ne ? h >= ns || h <= ne : h >= ns && h <= ne;
    };
    for (let i = 0; i < slots; ) {
      if (!isNight(i)) { i++; continue; }
      let j = i;
      while (j < slots && isNight(j)) j++;
      svg += `<rect class="night" x="${L + i * bw}" y="${T}" width="${(j - i) * bw}" height="${ph}"/>`;
      i = j;
    }

    const lines = Math.round((hi - lo) / step);
    for (let n = 0; n <= lines; n++) {
      const v = lo + n * step;
      svg += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>`;
      svg += `<text x="${L - 4}" y="${y(v) + 4 * k}" text-anchor="end">${num(v, 2, language(this._hass))}</text>`;
    }

    // Lines sit on hour boundaries, at the left edge of the bar that hour
    // starts: a tick at every hour; at every labelled hour a longer tick, the
    // label and a faint guide line running up between the bars. A wider card
    // gets labels more often (every 1, 2, 3 or 6 hours). With quarter hours,
    // four bars share one hour.
    const hourWidth = bw * (60 / slotMin);
    const every = [1, 2, 3, 6].find((s) => s * hourWidth >= (s === 3 ? 17 : 24) * k) || 6;
    for (let i = 0; i < slots; i++) {
      const time = new Date(start.getTime() + i * slotMs);
      if (time.getMinutes() !== 0) continue;
      const h = time.getHours();
      const cx = L + i * bw;
      const major = h % every === 0;
      if (major && i !== split) svg += `<line class="guide" x1="${cx}" x2="${cx}" y1="${T}" y2="${T + ph}"/>`;
      svg += `<line class="tick" x1="${cx}" x2="${cx}" y1="${T + ph}" y2="${T + ph + (major ? 4 : 2)}"/>`;
      if (major) svg += `<text x="${cx}" y="${H - 3}" text-anchor="middle">${h}</text>`;
    }

    for (const b of bars) {
      const f = max > min ? (b.price - min) / (max - min) : 0.5;
      const cls = [];
      if (b.i < nowSlot) cls.push("past");
      if (b.i === nowSlot) cls.push("now");
      const top = y(Math.max(b.price, 0)), bottom = y(Math.min(b.price, 0));
      // A 1 px gap between bars, unless they are too thin for it.
      const gap = bw >= 4 ? 1 : 0;
      svg += `<rect class="${cls.join(" ")}" style="fill: ${esc(this._colour(f))}" data-bar="${b.i}" x="${L + b.i * bw + gap / 2}" y="${top}" width="${Math.max(bw - gap, 0.5)}" height="${Math.max(bottom - top, 0.5)}"/>`;
    }

    // The cheapest block: a bracket just above its tallest bar.
    const blk = this._block;
    if (blk) {
      const tallest = Math.max(...bars.filter((b) => b.i >= blk.from && b.i <= blk.to).map((b) => b.price));
      const by = Math.max(y(Math.max(tallest, 0)) - 6, T - 6);
      const x1 = L + blk.from * bw + 1, x2 = L + (blk.to + 1) * bw - 1;
      svg += `<path class="block" style="stroke: ${esc(this._blockColour())}" d="M${x1},${by + 5} V${by} H${x2} V${by + 5}"/>`;
    }

    // Remembered so a pointer position can be turned into an hour.
    this._plot = { L, bw };

    // A dashed line where tomorrow starts.
    const sx = L + split * bw;
    svg += `<line class="split" x1="${sx}" x2="${sx}" y1="${T}" y2="${T + ph}"/>`;
    svg += `<text x="${sx + 3}" y="${T + 10 * k}">${t.tomorrow}</text>`;

    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t.title)}">${svg}</svg>`;
  }
}

// Card editor: Home Assistant's own form, so it looks like the built-in cards.
// Fields that only matter for another setting appear once that setting needs
// them (for example the scale maximum only when the fixed maximum is on).
const EDITOR_TEXTS = {
  en: {
    labels: {
      entity: "Price sensor",
      source_custom: "Set the data format myself",
      attribute: "Attribute with the price list",
      time_key: "Field with the start time",
      price_key: "Field with the price",
      price_factor: "Multiply prices by",
      show_title: "Show title",
      title: "Title",
      show_summary: "Show text above the chart",
      summary_now: "Price now",
      summary_cheapest: "Cheapest hour still to come",
      summary_block: "Mention it in the text above the chart",
      show_info: "Show the price line below the chart",
      height: "Chart height",
      fixed_scale: "Fixed maximum for the scale",
      y_max: "Maximum of the scale",
      decimals: "Decimals for prices",
      font_size: "Text size",
      palette: "Colours",
      color_low: "Colour for the cheapest prices",
      color_high: "Colour for the most expensive prices",
      color_steps: "Number of colours",
      block_hours: "Cheapest block (hours)",
      block_color_custom: "Own colour for the bracket",
      block_color: "Bracket colour",
      night_shading: "Night shading",
      night_start: "From (hour)",
      night_end: "Until (hour, included)",
    },
    helpers: {
      entity: "The sensor of your price integration that carries the price list (for Pure Energie Prices: not the “raw” or “percentile” sensors).",
      title: "Leave empty for the default title.",
      source_custom: "Only needed when the card shows no prices. The formats of Pure Energie Prices, Nord Pool, ENTSO-e and Frank Energie are recognised automatically (beta).",
      attribute: "Name of the sensor attribute, for example prices, or raw_today, raw_tomorrow (comma between several).",
      time_key: "For example start or date.full (a dot for a nested field).",
      price_key: "For example price or value.",
      price_factor: "For example 0.01 when the integration gives cents, 0.001 for €/MWh.",
      show_summary: "Switch off to hide all text above the chart, or choose below which lines to show.",
      show_info: "The line with the price of the bar you hover over or tap. Off: the bar is still highlighted.",
      y_max: "A higher price still stretches the scale.",
      color_steps: "2 to 6. The price range is split into this many equal bands.",
      block_hours: "Shows the cheapest run of this many hours still to come. 0 = off.",
      block_color_custom: "Off: the bracket uses the colour of the cheapest prices.",
      font_size: "10 to 24. The chart's labels grow and shrink along. The title follows your theme.",
    },
    palettes: {
      traffic: "Green – orange – red",
      colorblind: "Blue – orange (colour-blind friendly)",
      grey: "Simple modern grey scale",
      custom: "Custom",
    },
  },
  nl: {
    labels: {
      entity: "Prijssensor",
      source_custom: "Gegevensformaat zelf instellen",
      attribute: "Attribuut met de prijslijst",
      time_key: "Veld met de begintijd",
      price_key: "Veld met de prijs",
      price_factor: "Prijzen vermenigvuldigen met",
      show_title: "Titel tonen",
      title: "Titel",
      show_summary: "Tekst boven de grafiek tonen",
      summary_now: "Prijs nu",
      summary_cheapest: "Goedkoopste uur dat nog komt",
      summary_block: "Vermelden in de tekst boven de grafiek",
      show_info: "Prijsregel onder de grafiek tonen",
      height: "Hoogte van de grafiek",
      fixed_scale: "Vast maximum voor de schaal",
      y_max: "Maximum van de schaal",
      decimals: "Decimalen voor prijzen",
      font_size: "Tekstgrootte",
      palette: "Kleuren",
      color_low: "Kleur voor de goedkoopste prijzen",
      color_high: "Kleur voor de duurste prijzen",
      color_steps: "Aantal kleuren",
      block_hours: "Goedkoopste blok (uren)",
      block_color_custom: "Eigen kleur voor de haak",
      block_color: "Kleur van de haak",
      night_shading: "Nachtschaduw",
      night_start: "Vanaf (uur)",
      night_end: "Tot en met (uur)",
    },
    helpers: {
      entity: "De sensor van je prijsintegratie met de prijslijst (bij Pure Energie Prices: niet de “raw”- of “percentile”-sensoren).",
      title: "Laat leeg voor de standaardtitel.",
      source_custom: "Alleen nodig als de kaart geen prijzen toont. De formaten van Pure Energie Prices, Nord Pool, ENTSO-e en Frank Energie worden automatisch herkend (bèta).",
      attribute: "Naam van het sensorattribuut, bijvoorbeeld prices, of raw_today, raw_tomorrow (komma tussen meerdere).",
      time_key: "Bijvoorbeeld start of date.full (een punt voor een genest veld).",
      price_key: "Bijvoorbeeld price of value.",
      price_factor: "Bijvoorbeeld 0,01 als de integratie centen geeft, 0,001 bij €/MWh.",
      show_summary: "Zet uit om alle tekst boven de grafiek te verbergen, of kies hieronder welke regels je wilt zien.",
      show_info: "De regel met de prijs van de balk waar je overheen beweegt of op tikt. Uit: de balk wordt nog wel gemarkeerd.",
      y_max: "Een hogere prijs rekt de schaal toch op.",
      color_steps: "2 tot 6. Het prijsbereik wordt in zoveel gelijke stukken verdeeld.",
      block_hours: "Toont de goedkoopste aaneengesloten uren die nog komen. 0 = uit.",
      block_color_custom: "Uit: de haak krijgt de kleur van de goedkoopste prijzen.",
      font_size: "10 tot 24. De labels in de grafiek schalen mee. De titel volgt je thema.",
    },
    palettes: {
      traffic: "Groen – oranje – rood",
      colorblind: "Blauw – oranje (geschikt bij kleurenblindheid)",
      grey: "Eenvoudige moderne grijstinten",
      custom: "Eigen kleuren",
    },
  },
  de: {
    labels: {
      entity: "Preissensor",
      source_custom: "Datenformat selbst festlegen",
      attribute: "Attribut mit der Preisliste",
      time_key: "Feld mit der Startzeit",
      price_key: "Feld mit dem Preis",
      price_factor: "Preise multiplizieren mit",
      show_title: "Titel anzeigen",
      title: "Titel",
      show_summary: "Text über dem Diagramm anzeigen",
      summary_now: "Preis jetzt",
      summary_cheapest: "Günstigste kommende Stunde",
      summary_block: "Im Text über dem Diagramm nennen",
      show_info: "Preiszeile unter dem Diagramm anzeigen",
      height: "Diagrammhöhe",
      fixed_scale: "Festes Maximum für die Skala",
      y_max: "Maximum der Skala",
      decimals: "Nachkommastellen für Preise",
      font_size: "Schriftgröße",
      palette: "Farben",
      color_low: "Farbe für die günstigsten Preise",
      color_high: "Farbe für die teuersten Preise",
      color_steps: "Anzahl der Farben",
      block_hours: "Günstigster Block (Stunden)",
      block_color_custom: "Eigene Farbe für die Klammer",
      block_color: "Farbe der Klammer",
      night_shading: "Nachtschattierung",
      night_start: "Ab (Stunde)",
      night_end: "Bis (Stunde, einschließlich)",
    },
    helpers: {
      entity: "Der Sensor deiner Preisintegration mit der Preisliste (bei Pure Energie Prices: nicht die „raw“- oder „percentile“-Sensoren).",
      title: "Leer lassen für den Standardtitel.",
      source_custom: "Nur nötig, wenn die Karte keine Preise zeigt. Die Formate von Pure Energie Prices, Nord Pool, ENTSO-e und Frank Energie werden automatisch erkannt (Beta).",
      attribute: "Name des Sensorattributs, zum Beispiel prices, oder raw_today, raw_tomorrow (Komma zwischen mehreren).",
      time_key: "Zum Beispiel start oder date.full (ein Punkt für ein verschachteltes Feld).",
      price_key: "Zum Beispiel price oder value.",
      price_factor: "Zum Beispiel 0,01, wenn die Integration Cent liefert, 0,001 bei €/MWh.",
      show_summary: "Ausschalten, um den ganzen Text über dem Diagramm auszublenden, oder unten wählen, welche Zeilen erscheinen.",
      show_info: "Die Zeile mit dem Preis des Balkens, über den du fährst oder den du antippst. Aus: Der Balken wird trotzdem markiert.",
      y_max: "Ein höherer Preis streckt die Skala trotzdem.",
      color_steps: "2 bis 6. Der Preisbereich wird in so viele gleiche Stufen geteilt.",
      block_hours: "Zeigt die günstigsten aufeinanderfolgenden Stunden, die noch kommen. 0 = aus.",
      block_color_custom: "Aus: Die Klammer hat die Farbe der günstigsten Preise.",
      font_size: "10 bis 24. Die Beschriftungen im Diagramm wachsen mit. Der Titel folgt deinem Design.",
    },
    palettes: {
      traffic: "Grün – Orange – Rot",
      colorblind: "Blau – Orange (für Farbenblinde geeignet)",
      grey: "Schlichte moderne Graustufen",
      custom: "Eigene Farben",
    },
  },
  fr: {
    labels: {
      entity: "Capteur de prix",
      source_custom: "Définir moi-même le format des données",
      attribute: "Attribut contenant la liste des prix",
      time_key: "Champ de l’heure de début",
      price_key: "Champ du prix",
      price_factor: "Multiplier les prix par",
      show_title: "Afficher le titre",
      title: "Titre",
      show_summary: "Afficher le texte au-dessus du graphique",
      summary_now: "Prix actuel",
      summary_cheapest: "Heure la moins chère à venir",
      summary_block: "Le mentionner dans le texte au-dessus du graphique",
      show_info: "Afficher la ligne de prix sous le graphique",
      height: "Hauteur du graphique",
      fixed_scale: "Maximum fixe pour l’échelle",
      y_max: "Maximum de l’échelle",
      decimals: "Décimales des prix",
      font_size: "Taille du texte",
      palette: "Couleurs",
      color_low: "Couleur des prix les plus bas",
      color_high: "Couleur des prix les plus élevés",
      color_steps: "Nombre de couleurs",
      block_hours: "Bloc le moins cher (heures)",
      block_color_custom: "Couleur personnalisée pour le crochet",
      block_color: "Couleur du crochet",
      night_shading: "Ombrage de nuit",
      night_start: "À partir de (heure)",
      night_end: "Jusqu’à (heure, incluse)",
    },
    helpers: {
      entity: "Le capteur de votre intégration de prix qui contient la liste des prix (pour Pure Energie Prices : pas les capteurs « raw » ou « percentile »).",
      title: "Laissez vide pour le titre par défaut.",
      source_custom: "Nécessaire seulement si la carte n’affiche aucun prix. Les formats de Pure Energie Prices, Nord Pool, ENTSO-e et Frank Energie sont reconnus automatiquement (bêta).",
      attribute: "Nom de l’attribut du capteur, par exemple prices, ou raw_today, raw_tomorrow (virgule entre plusieurs).",
      time_key: "Par exemple start ou date.full (un point pour un champ imbriqué).",
      price_key: "Par exemple price ou value.",
      price_factor: "Par exemple 0,01 si l’intégration donne des centimes, 0,001 pour des €/MWh.",
      show_summary: "Désactivez pour masquer tout le texte au-dessus du graphique, ou choisissez ci-dessous les lignes à afficher.",
      show_info: "La ligne qui affiche le prix de la barre survolée ou touchée. Désactivé : la barre reste mise en évidence.",
      y_max: "Un prix plus élevé étend quand même l’échelle.",
      color_steps: "2 à 6. La plage de prix est divisée en autant de bandes égales.",
      block_hours: "Affiche la suite d’heures consécutives la moins chère à venir. 0 = désactivé.",
      block_color_custom: "Désactivé : le crochet prend la couleur des prix les plus bas.",
      font_size: "10 à 24. Les libellés du graphique suivent. Le titre suit votre thème.",
    },
    palettes: {
      traffic: "Vert – orange – rouge",
      colorblind: "Bleu – orange (adapté au daltonisme)",
      grey: "Niveaux de gris simples et modernes",
      custom: "Couleurs personnalisées",
    },
  },
  es: {
    labels: {
      entity: "Sensor de precio",
      source_custom: "Definir yo el formato de los datos",
      attribute: "Atributo con la lista de precios",
      time_key: "Campo con la hora de inicio",
      price_key: "Campo con el precio",
      price_factor: "Multiplicar los precios por",
      show_title: "Mostrar título",
      title: "Título",
      show_summary: "Mostrar texto encima del gráfico",
      summary_now: "Precio ahora",
      summary_cheapest: "Hora más barata por venir",
      summary_block: "Mencionarlo en el texto encima del gráfico",
      show_info: "Mostrar la línea de precio debajo del gráfico",
      height: "Altura del gráfico",
      fixed_scale: "Máximo fijo para la escala",
      y_max: "Máximo de la escala",
      decimals: "Decimales de los precios",
      font_size: "Tamaño del texto",
      palette: "Colores",
      color_low: "Color de los precios más bajos",
      color_high: "Color de los precios más altos",
      color_steps: "Número de colores",
      block_hours: "Bloque más barato (horas)",
      block_color_custom: "Color propio para el corchete",
      block_color: "Color del corchete",
      night_shading: "Sombreado nocturno",
      night_start: "Desde (hora)",
      night_end: "Hasta (hora, incluida)",
    },
    helpers: {
      entity: "El sensor de tu integración de precios con la lista de precios (en Pure Energie Prices: no los sensores «raw» ni «percentile»).",
      title: "Déjalo vacío para el título predeterminado.",
      source_custom: "Solo hace falta si la tarjeta no muestra precios. Los formatos de Pure Energie Prices, Nord Pool, ENTSO-e y Frank Energie se reconocen automáticamente (beta).",
      attribute: "Nombre del atributo del sensor, por ejemplo prices, o raw_today, raw_tomorrow (coma entre varios).",
      time_key: "Por ejemplo start o date.full (un punto para un campo anidado).",
      price_key: "Por ejemplo price o value.",
      price_factor: "Por ejemplo 0,01 si la integración da céntimos, 0,001 para €/MWh.",
      show_summary: "Desactívalo para ocultar todo el texto encima del gráfico, o elige abajo qué líneas mostrar.",
      show_info: "La línea que muestra el precio de la barra que señalas o tocas. Desactivado: la barra se sigue resaltando.",
      y_max: "Un precio más alto amplía la escala igualmente.",
      color_steps: "De 2 a 6. El rango de precios se divide en tantas franjas iguales.",
      block_hours: "Muestra las horas consecutivas más baratas que aún quedan. 0 = desactivado.",
      block_color_custom: "Desactivado: el corchete usa el color de los precios más bajos.",
      font_size: "De 10 a 24. Las etiquetas del gráfico se ajustan. El título sigue tu tema.",
    },
    palettes: {
      traffic: "Verde – naranja – rojo",
      colorblind: "Azul – naranja (apto para daltonismo)",
      grey: "Escala de grises sencilla y moderna",
      custom: "Colores propios",
    },
  },
};

// The cheapest colour of each palette as [r, g, b], so the bracket's colour
// picker starts at the colour the bracket actually has.
const PALETTE_LOW_RGB = { traffic: [67, 160, 71], colorblind: [0, 114, 178], grey: [33, 33, 33] };
const CUSTOM_LOW_RGB = [0, 114, 178];
const CUSTOM_HIGH_RGB = [230, 159, 0];

function lowRgb(c) {
  if (c.palette === "custom") return Array.isArray(c.color_low) ? c.color_low : CUSTOM_LOW_RGB;
  return PALETTE_LOW_RGB[c.palette] || PALETTE_LOW_RGB.traffic;
}

const num_ = (min, max, step, unit) => ({ number: { min, max, step, mode: "box", ...(unit ? { unit_of_measurement: unit } : {}) } });
const choice = (options) => ({ select: { mode: "dropdown", options: Object.entries(options).map(([value, label]) => ({ value, label })) } });
const pair = (a, b) => ({ type: "grid", name: "", schema: [a, b] });
const colourPair = () => pair({ name: "color_low", selector: { color_rgb: {} } }, { name: "color_high", selector: { color_rgb: {} } });

// The data format fields, shown only when "Set the data format myself" is on.
function sourceFields(c) {
  const fields = [{ name: "source_custom", selector: { boolean: {} } }];
  if (c.source_custom) {
    fields.push(
      { name: "attribute", selector: { text: {} } },
      { name: "time_key", selector: { text: {} } },
      { name: "price_key", selector: { text: {} } },
      { name: "price_factor", selector: { number: { min: 0, max: 1000, step: "any", mode: "box" } } }
    );
  }
  return fields;
}

function editorSchema(tx, c) {
  const schema = [
    { name: "entity", required: true, selector: { entity: { domain: "sensor" } } },
    ...sourceFields(c),
    { name: "show_title", selector: { boolean: {} } },
  ];
  if (c.show_title !== false) schema.push({ name: "title", selector: { text: {} } });
  schema.push({ name: "show_summary", selector: { boolean: {} } });
  if (c.show_summary !== false) {
    schema.push({ name: "summary_now", selector: { boolean: {} } }, { name: "summary_cheapest", selector: { boolean: {} } });
  }
  schema.push(
    { name: "show_info", selector: { boolean: {} } },
    { name: "height", selector: num_(80, 600, 10, "px") },
    { name: "fixed_scale", selector: { boolean: {} } }
  );
  if (c.fixed_scale) schema.push({ name: "y_max", selector: num_(0.05, 2, 0.01, "€/kWh") });
  schema.push(
    { name: "decimals", selector: num_(0, 4, 1) },
    { name: "font_size", selector: num_(10, 24, 1, "px") },
    { name: "palette", selector: choice(tx.palettes) }
  );
  if (c.palette === "custom") schema.push(colourPair());
  schema.push({ name: "color_steps", selector: num_(2, 6, 1) }, { name: "block_hours", selector: num_(0, 12, 1) });
  if (Number(c.block_hours) > 0) {
    if (c.show_summary !== false) schema.push({ name: "summary_block", selector: { boolean: {} } });
    schema.push({ name: "block_color_custom", selector: { boolean: {} } });
    if (c.block_color_custom) schema.push({ name: "block_color", selector: { color_rgb: {} } });
  }
  schema.push({ name: "night_shading", selector: { boolean: {} } });
  if (c.night_shading !== false) {
    schema.push(pair({ name: "night_start", selector: num_(0, 23, 1) }, { name: "night_end", selector: num_(0, 23, 1) }));
  }
  return schema;
}

// A settings form drawn with Home Assistant's own form element. Subclasses say
// which fields apply to the current settings, their defaults and their texts.
class FormEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    const changed = !this._hass || language(this._hass) !== language(hass);
    this._hass = hass;
    if (changed && this._config) this._render();
    else if (this._form) this._form.hass = hass;
  }

  _render() {
    const tx = this.texts(language(this._hass));
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => {
        const config = this.normalize({ ...ev.detail.value });
        for (const k of Object.keys(config)) {
          if (config[k] === undefined || config[k] === null) delete config[k];
        }
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = this.withDefaults(this._config);
    this._form.computeLabel = (s) => tx.labels[s.name] || s.name;
    this._form.computeHelper = (s) => tx.helpers[s.name];
    this._form.hass = this._hass;
    this._form.schema = this.schema(tx, data);
    this._form.data = data;
  }
}

class PriceChartCardEditor extends FormEditor {
  texts(lang) {
    return EDITOR_TEXTS[lang];
  }

  withDefaults(c) {
    return {
      show_title: true,
      show_summary: true,
      summary_now: true,
      summary_cheapest: true,
      summary_block: true,
      show_info: true,
      height: 180,
      decimals: 2,
      font_size: 14,
      palette: "traffic",
      color_steps: 3,
      block_hours: 0,
      night_shading: true,
      night_start: 22,
      night_end: 6,
      ...c,
      source_custom: c.source_custom ?? !!(c.attribute || c.time_key || c.price_key || c.price_factor),
      fixed_scale: c.fixed_scale ?? c.y_max != null,
      block_color_custom: c.block_color_custom ?? c.block_color != null,
    };
  }

  schema(tx, c) {
    return editorSchema(tx, c);
  }

  // Fill in a sensible start value when a field appears, and forget the
  // bracket colour when it is switched off, so switching it on again starts
  // from the current palette.
  normalize(c) {
    if (!c.source_custom) for (const k of ["attribute", "time_key", "price_key", "price_factor"]) delete c[k];
    if (c.fixed_scale && c.y_max == null) c.y_max = 0.4;
    if (c.palette === "custom") {
      if (c.color_low == null) c.color_low = CUSTOM_LOW_RGB;
      if (c.color_high == null) c.color_high = CUSTOM_HIGH_RGB;
    }
    if (!c.block_color_custom) delete c.block_color;
    else if (c.block_color == null) c.block_color = lowRgb(c);
    return c;
  }
}

// Badge for the top of a dashboard view: the price now, the cheapest hour
// still to come, the cheapest block, or the price at a chosen hour.
const BADGE_ICONS = {
  now: "mdi:flash",
  cheapest: "mdi:arrow-down-bold-circle-outline",
  block: "mdi:timer-sand",
  at: "mdi:clock-outline",
  average: "mdi:approximately-equal",
};

class PriceBadge extends HTMLElement {
  static getStubConfig(hass) {
    return { ...PriceChartCard.getStubConfig(hass), show: "now" };
  }

  static getConfigElement() {
    return document.createElement("pure-energie-price-badge-editor");
  }

  setConfig(config) {
    if (!config.entity) throw new Error("Set 'entity' to the price sensor");
    this._config = { show: "now", range: "upcoming", decimals: 2, block_hours: 3, hour: 6, ...config };
    this._key = null;
    if (this._hass) this.hass = this._hass;
  }

  set hass(hass) {
    this._hass = hass;
    const state = hass.states[this._config.entity];
    const key = (state ? state.last_updated : "missing") + "|" + Math.floor(Date.now() / 900000) + "|" + language(hass);
    if (key === this._key) return;
    this._key = key;
    this._render(state);
  }

  _render(state) {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const c = this._config;
    const t = TEXTS[language(this._hass)];
    const d = c.decimals;
    const { nowSlot, split, bars, slotMin } = priceDays(state, c);
    const day = (time) => weekday(time, this._hass);
    // A dash while a price is not known yet; the tooltip says so in words.
    let label = "", value = "–", price = null;

    // Which hours "cheapest", "block" and "average" look at: the hours still
    // to come (default), all of today, all of tomorrow, or both days.
    const range = ["today", "tomorrow", "both"].includes(c.range) ? c.range : "upcoming";
    const inRange = bars.filter((b) =>
      range === "today" ? b.i < split : range === "tomorrow" ? b.i >= split : range === "both" ? true : b.i > nowSlot
    );
    const rangeLabel = t.ranges[range] ? ` ${t.ranges[range]}` : "";

    if (c.show === "cheapest") {
      label = t.bCheapest + rangeLabel;
      if (inRange.length) {
        const best = inRange.reduce((a, b) => (b.price < a.price ? b : a));
        label += ` · ${day(best.t)} ${hh(best.t)}`;
        price = best.price;
        value = euro(price, d, language(this._hass));
      }
    } else if (c.show === "block") {
      const blk = cheapestBlock(inRange, range === "upcoming" ? nowSlot : -1, c.block_hours || 3, slotMin);
      label = t.bBlock(blk ? blk.hours : Math.round(Number(c.block_hours) || 3)) + rangeLabel;
      if (blk) {
        price = blk.avg;
        value = `${day(blk.start)} ${hh(blk.start)}–${hh(blk.end)} · ${euro(price, d, language(this._hass))}`;
      }
    } else if (c.show === "average") {
      label = `${t.bAvg} ${t.ranges[range] || t.rest}`;
      if (inRange.length) {
        price = inRange.reduce((sum, b) => sum + b.price, 0) / inRange.length;
        value = euro(price, d, language(this._hass));
      }
    } else if (c.show === "at") {
      // The next time the clock shows this hour: today if it has not passed
      // yet (the current hour counts), otherwise tomorrow once it is known.
      // With quarter hours, the hour's four prices are averaged.
      const h = Math.min(Math.max(Math.round(Number(c.hour) || 0), 0), 23);
      const hourStart = new Date();
      hourStart.setMinutes(0, 0, 0);
      const candidates = bars.filter((b) => b.t.getHours() === h && b.t >= hourStart);
      label = `${t.bAt} ${String(h).padStart(2, "0")}:00`;
      if (candidates.length) {
        const first = candidates[0];
        const same = candidates.filter((b) => b.t.toDateString() === first.t.toDateString());
        label += ` (${day(first.t)})`;
        price = same.reduce((sum, b) => sum + b.price, 0) / same.length;
        value = euro(price, d, language(this._hass));
      }
    } else {
      label = t.bNow;
      const now = bars.find((b) => b.i === nowSlot);
      if (now) {
        price = now.price;
        value = euro(price, d, language(this._hass));
      }
    }
    if (typeof c.name === "string" && c.name.trim()) label = c.name.trim();
    if (!state) value = t.missing(c.entity);

    // The icon takes the colour of the price, compared with all prices known.
    let colour = "var(--secondary-text-color)";
    if (price != null && bars.length) {
      const values = bars.map((b) => b.price);
      const min = Math.min(...values), max = Math.max(...values);
      colour = bandColour(c, max > min ? Math.min(Math.max((price - min) / (max - min), 0), 1) : 0.5);
    }
    const icon = typeof c.icon === "string" && c.icon ? c.icon : BADGE_ICONS[c.show] || BADGE_ICONS.now;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; }
        .badge { display: flex; align-items: center; gap: 8px; height: var(--ha-badge-size, 36px); padding: 0 14px 0 8px;
          box-sizing: border-box; border-radius: var(--ha-badge-border-radius, 18px); white-space: nowrap;
          background: var(--ha-card-background, var(--card-background-color, #fff));
          border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
          box-shadow: var(--ha-card-box-shadow, none); font-family: inherit; }
        ha-icon { --mdc-icon-size: 18px; display: flex; }
        .text { display: flex; flex-direction: column; line-height: 1.2; }
        .label { font-size: 10px; font-weight: 500; color: var(--secondary-text-color); }
        .value { font-size: 12px; font-weight: 500; color: var(--primary-text-color); }
      </style>
      <div class="badge" title="${esc(label)}: ${esc(price == null ? t.unknown : value)}">
        <ha-icon icon="${esc(icon)}" style="color: ${esc(colour)}"></ha-icon>
        <div class="text"><span class="label">${esc(label)}</span><span class="value">${esc(value)}</span></div>
      </div>`;
  }
}

const BADGE_EDITOR_TEXTS = {
  en: {
    labels: {
      show: "What should the badge show?",
      range: "Which hours to search",
      block_hours: "Length of the block (hours)",
      hour: "Hour",
      entity: "Price sensor",
      name: "Label",
      icon: "Icon",
      palette: "Icon colours",
    },
    helpers: {
      show: "The fields below change with this choice.",
      range: "Only the hours still to come, all of today, all of tomorrow, or both days. Tomorrow's prices usually arrive in the afternoon; until then the badge shows a dash.",
      block_hours: "1 to 12 consecutive hours, for example 3 for a washing machine programme. The badge shows when the block starts and ends, and its average price.",
      hour: "0 to 23. The badge shows the price for the next time the clock reaches this hour: today if it has not passed yet, otherwise tomorrow once that price is known. Example: 6 shows the price from 06:00 to 07:00.",
      entity: "The sensor of your price integration that carries the price list (for Pure Energie Prices: not the “raw” or “percentile” sensors).",
      name: "The small text above the price. Leave empty for the automatic text, for example “Cheapest 3 h”.",
      icon: "Leave empty for the automatic icon.",
      decimals: "Digits after the decimal point, 0 to 4.",
      palette: "The icon takes the colour of the price, compared with all known prices: cheap to expensive.",
      color_low: "Used for the cheapest prices.",
      color_high: "Used for the most expensive prices.",
      color_steps: "2 to 6. How many shades there are between cheap and expensive.",
    },
    show: {
      now: "Price now",
      cheapest: "Cheapest hour",
      block: "Cheapest block of hours",
      at: "Price at a set hour",
      average: "Average price",
    },
    range: { upcoming: "Hours still to come", today: "Today (whole day)", tomorrow: "Tomorrow (whole day)", both: "Today and tomorrow" },
  },
  nl: {
    labels: {
      show: "Wat moet de badge tonen?",
      range: "Welke uren doorzoeken",
      block_hours: "Lengte van het blok (uren)",
      hour: "Uur",
      entity: "Prijssensor",
      name: "Label",
      icon: "Pictogram",
      palette: "Kleuren van het pictogram",
    },
    helpers: {
      show: "De velden hieronder passen zich aan deze keuze aan.",
      range: "Alleen de uren die nog komen, heel vandaag, heel morgen of beide dagen. De prijzen van morgen komen meestal in de middag; tot dan toont de badge een streepje.",
      block_hours: "1 tot 12 aaneengesloten uren, bijvoorbeeld 3 voor een wasprogramma. De badge toont begin en einde van het blok en de gemiddelde prijs.",
      hour: "0 tot 23. De badge toont de prijs voor de eerstvolgende keer dat de klok dit uur bereikt: vandaag als het nog niet voorbij is, anders morgen zodra die prijs bekend is. Voorbeeld: 6 toont de prijs van 06:00 tot 07:00.",
      entity: "De sensor van je prijsintegratie met de prijslijst (bij Pure Energie Prices: niet de “raw”- of “percentile”-sensoren).",
      name: "De kleine tekst boven de prijs. Laat leeg voor de automatische tekst, bijvoorbeeld „Goedkoopste 3 uur”.",
      icon: "Laat leeg voor het automatische pictogram.",
      decimals: "Cijfers achter de komma, 0 tot 4.",
      palette: "Het pictogram krijgt de kleur van de prijs, vergeleken met alle bekende prijzen: van goedkoop tot duur.",
      color_low: "Voor de goedkoopste prijzen.",
      color_high: "Voor de duurste prijzen.",
      color_steps: "2 tot 6. Hoeveel tinten er tussen goedkoop en duur zijn.",
    },
    show: {
      now: "Prijs nu",
      cheapest: "Goedkoopste uur",
      block: "Goedkoopste blok uren",
      at: "Prijs op een vast uur",
      average: "Gemiddelde prijs",
    },
    range: { upcoming: "Uren die nog komen", today: "Vandaag (hele dag)", tomorrow: "Morgen (hele dag)", both: "Vandaag en morgen" },
  },
  de: {
    labels: {
      show: "Was soll das Badge zeigen?",
      range: "Welche Stunden durchsuchen",
      block_hours: "Länge des Blocks (Stunden)",
      hour: "Stunde",
      entity: "Preissensor",
      name: "Beschriftung",
      icon: "Symbol",
      palette: "Farben des Symbols",
    },
    helpers: {
      show: "Die Felder darunter passen sich dieser Auswahl an.",
      range: "Nur die kommenden Stunden, den ganzen heutigen Tag, den ganzen morgigen Tag oder beide Tage. Die Preise für morgen kommen meist am Nachmittag; bis dahin zeigt das Badge einen Strich.",
      block_hours: "1 bis 12 aufeinanderfolgende Stunden, zum Beispiel 3 für ein Waschprogramm. Das Badge zeigt Beginn und Ende des Blocks und den Durchschnittspreis.",
      hour: "0 bis 23. Das Badge zeigt den Preis für das nächste Mal, wenn die Uhr diese Stunde erreicht: heute, wenn sie noch nicht vorbei ist, sonst morgen, sobald der Preis bekannt ist. Beispiel: 6 zeigt den Preis von 06:00 bis 07:00.",
      entity: "Der Sensor deiner Preisintegration mit der Preisliste (bei Pure Energie Prices: nicht die „raw“- oder „percentile“-Sensoren).",
      name: "Der kleine Text über dem Preis. Leer lassen für den automatischen Text, zum Beispiel „Günstigste 3 Std.“.",
      icon: "Leer lassen für das automatische Symbol.",
      decimals: "Nachkommastellen, 0 bis 4.",
      palette: "Das Symbol hat die Farbe des Preises, verglichen mit allen bekannten Preisen: von günstig bis teuer.",
      color_low: "Für die günstigsten Preise.",
      color_high: "Für die teuersten Preise.",
      color_steps: "2 bis 6. Wie viele Abstufungen es zwischen günstig und teuer gibt.",
    },
    show: {
      now: "Preis jetzt",
      cheapest: "Günstigste Stunde",
      block: "Günstigster Stundenblock",
      at: "Preis zu einer festen Stunde",
      average: "Durchschnittspreis",
    },
    range: { upcoming: "Kommende Stunden", today: "Heute (ganzer Tag)", tomorrow: "Morgen (ganzer Tag)", both: "Heute und morgen" },
  },
  fr: {
    labels: {
      show: "Que doit afficher le badge ?",
      range: "Heures à examiner",
      block_hours: "Durée du bloc (heures)",
      hour: "Heure",
      entity: "Capteur de prix",
      name: "Libellé",
      icon: "Icône",
      palette: "Couleurs de l’icône",
    },
    helpers: {
      show: "Les champs ci-dessous s’adaptent à ce choix.",
      range: "Seulement les heures à venir, toute la journée d’aujourd’hui, toute celle de demain, ou les deux. Les prix de demain arrivent en général l’après-midi ; d’ici là, le badge affiche un tiret.",
      block_hours: "1 à 12 heures consécutives, par exemple 3 pour un programme de lave-linge. Le badge affiche le début et la fin du bloc et son prix moyen.",
      hour: "0 à 23. Le badge affiche le prix pour la prochaine fois que l’horloge atteint cette heure : aujourd’hui si elle n’est pas encore passée, sinon demain dès que ce prix est connu. Exemple : 6 affiche le prix de 06:00 à 07:00.",
      entity: "Le capteur de votre intégration de prix qui contient la liste des prix (pour Pure Energie Prices : pas les capteurs « raw » ou « percentile »).",
      name: "Le petit texte au-dessus du prix. Laissez vide pour le texte automatique, par exemple « 3 h les moins chères ».",
      icon: "Laissez vide pour l’icône automatique.",
      decimals: "Chiffres après la virgule, 0 à 4.",
      palette: "L’icône prend la couleur du prix, comparé à tous les prix connus : du moins cher au plus cher.",
      color_low: "Pour les prix les plus bas.",
      color_high: "Pour les prix les plus élevés.",
      color_steps: "2 à 6. Le nombre de nuances entre bon marché et cher.",
    },
    show: {
      now: "Prix actuel",
      cheapest: "Heure la moins chère",
      block: "Bloc d’heures le moins cher",
      at: "Prix à une heure fixe",
      average: "Prix moyen",
    },
    range: { upcoming: "Heures à venir", today: "Aujourd’hui (toute la journée)", tomorrow: "Demain (toute la journée)", both: "Aujourd’hui et demain" },
  },
  es: {
    labels: {
      show: "¿Qué debe mostrar la insignia?",
      range: "Horas que se buscan",
      block_hours: "Duración del bloque (horas)",
      hour: "Hora",
      entity: "Sensor de precio",
      name: "Etiqueta",
      icon: "Icono",
      palette: "Colores del icono",
    },
    helpers: {
      show: "Los campos de abajo cambian según esta elección.",
      range: "Solo las horas que quedan, todo el día de hoy, todo el de mañana o ambos días. Los precios de mañana suelen llegar por la tarde; hasta entonces la insignia muestra un guion.",
      block_hours: "De 1 a 12 horas seguidas, por ejemplo 3 para un programa de lavadora. La insignia muestra el inicio y el fin del bloque y su precio medio.",
      hour: "De 0 a 23. La insignia muestra el precio de la próxima vez que el reloj llegue a esta hora: hoy si aún no ha pasado, si no mañana en cuanto se conozca ese precio. Ejemplo: 6 muestra el precio de 06:00 a 07:00.",
      entity: "El sensor de tu integración de precios con la lista de precios (en Pure Energie Prices: no los sensores «raw» ni «percentile»).",
      name: "El texto pequeño encima del precio. Déjalo vacío para el texto automático, por ejemplo «3 h más baratas».",
      icon: "Déjalo vacío para el icono automático.",
      decimals: "Cifras después de la coma, de 0 a 4.",
      palette: "El icono toma el color del precio, comparado con todos los precios conocidos: de barato a caro.",
      color_low: "Para los precios más bajos.",
      color_high: "Para los precios más altos.",
      color_steps: "De 2 a 6. Cuántos tonos hay entre barato y caro.",
    },
    show: {
      now: "Precio ahora",
      cheapest: "Hora más barata",
      block: "Bloque de horas más barato",
      at: "Precio a una hora fija",
      average: "Precio medio",
    },
    range: { upcoming: "Horas por venir", today: "Hoy (todo el día)", tomorrow: "Mañana (todo el día)", both: "Hoy y mañana" },
  },
};

class PriceBadgeEditor extends FormEditor {
  texts(lang) {
    const card = EDITOR_TEXTS[lang], badge = BADGE_EDITOR_TEXTS[lang];
    return { ...badge, labels: { ...card.labels, ...badge.labels }, helpers: { ...card.helpers, ...badge.helpers }, palettes: card.palettes };
  }

  withDefaults(c) {
    return {
      show: "now",
      range: "upcoming",
      block_hours: 3,
      hour: 6,
      decimals: 2,
      palette: "traffic",
      color_steps: 3,
      ...c,
      source_custom: c.source_custom ?? !!(c.attribute || c.time_key || c.price_key || c.price_factor),
    };
  }

  // First the choice of what to show, then only the fields that choice uses,
  // then the general fields. Each field on its own row, so its help text sits
  // right below it.
  schema(tx, c) {
    const schema = [{ name: "show", selector: choice(tx.show) }];
    if (c.show === "block") schema.push({ name: "block_hours", selector: num_(1, 12, 1) });
    if (c.show === "cheapest" || c.show === "block" || c.show === "average") schema.push({ name: "range", selector: choice(tx.range) });
    if (c.show === "at") schema.push({ name: "hour", selector: num_(0, 23, 1) });
    schema.push(
      { name: "entity", required: true, selector: { entity: { domain: "sensor" } } },
      ...sourceFields(c),
      { name: "name", selector: { text: {} } },
      { name: "icon", selector: { icon: {} } },
      { name: "decimals", selector: num_(0, 4, 1) },
      { name: "palette", selector: choice(tx.palettes) }
    );
    if (c.palette === "custom") {
      schema.push({ name: "color_low", selector: { color_rgb: {} } }, { name: "color_high", selector: { color_rgb: {} } });
    }
    schema.push({ name: "color_steps", selector: num_(2, 6, 1) });
    return schema;
  }

  normalize(c) {
    if (!c.source_custom) for (const k of ["attribute", "time_key", "price_key", "price_factor"]) delete c[k];
    if (c.palette === "custom") {
      if (c.color_low == null) c.color_low = CUSTOM_LOW_RGB;
      if (c.color_high == null) c.color_high = CUSTOM_HIGH_RGB;
    }
    return c;
  }
}

// Each element is guarded, so loading the file twice (for example manually
// and via HACS) does not break the dashboard.
for (const [name, cls] of [
  ["pure-energie-price-card", PriceChartCard],
  ["pure-energie-price-card-editor", PriceChartCardEditor],
  ["pure-energie-price-badge", PriceBadge],
  ["pure-energie-price-badge-editor", PriceBadgeEditor],
]) {
  if (!customElements.get(name)) customElements.define(name, cls);
}
console.info(`pure-energie-price-card ${VERSION}`);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "pure-energie-price-card",
  name: "Pure Energie price card",
  description: "Hourly electricity prices for today and tomorrow",
  preview: true,
});
window.customBadges = window.customBadges || [];
window.customBadges.push({
  type: "pure-energie-price-badge",
  name: "Pure Energie price badge",
  description: "Price now, cheapest hour or block still to come, or the price at a set hour",
  preview: true,
});
