// Electricity Price Planner: card, badges and usage card for Home Assistant.
// https://github.com/eva-schulze/electricity-price-planner
//
// Draws dynamic electricity prices for today and tomorrow as bars, per hour,
// half hour or quarter hour. Reads the price list a sensor keeps in its
// attributes, or asks an integration's action (EnergyZero, easyEnergy,
// Nord Pool, Tibber). Tested on a real installation with Pure Energie Prices;
// the other formats are recognised from those integrations' code and tested
// with sample data. No external libraries, no network requests of its own.
// MIT licence, see LICENSE.
//
// The file defines three elements:
//   custom:electricity-price-planner-card        the price chart
//   custom:electricity-price-planner-badge       one value, such as the price now
//   custom:electricity-price-planner-usage-card  your use per hour, by price
// All settings can be changed in their settings forms; the README lists every
// option with its YAML name and default.
//
// Texts follow the Home Assistant language: English, Dutch, German, French or
// Spanish (others fall back to English). Prices use that language's format.

const VERSION = "2.0.0";
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
    loading: "Loading prices…",
    feedTitle: "Feed-in price",
    highest: "Highest still to come",
    bestBlock: (n) => `Best ${n} hours still to come`,
    bHighest: "Highest",
    bBestBlock: (n) => `Best ${n} h`,
    bTrend: "Next price",
    bNegative: "Negative prices",
    none: "none",
    applianceDefault: "Washing machine",
    best: "best",
    usageTitle: "Usage and price",
    paid: "You paid on average",
    dayAvg: "day average",
    bestPossible: "best possible",
    score: "Score",
    great: "great timing",
    good: "good",
    ok: "could be better",
    noUsage: "No usage data for this day.",
    prevDay: "Previous day",
    nextDay: "Next day",
    chooseEnergy: "Choose an energy meter in the card settings.",
    todaySoFar: "Today so far",
    yesterday: "Yesterday",
    failed: (e) => `Could not load prices: ${e}`,
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
    loading: "Prijzen laden…",
    feedTitle: "Terugleverprijs",
    highest: "Hoogst nog te komen",
    bestBlock: (n) => `Beste ${n} uur nog te komen`,
    bHighest: "Hoogst",
    bBestBlock: (n) => `Beste ${n} uur`,
    bTrend: "Volgende prijs",
    bNegative: "Negatieve prijzen",
    none: "geen",
    applianceDefault: "Wasmachine",
    best: "beste",
    usageTitle: "Verbruik en prijs",
    paid: "Je betaalde gemiddeld",
    dayAvg: "daggemiddelde",
    bestPossible: "best mogelijk",
    score: "Score",
    great: "uitstekend getimed",
    good: "goed",
    ok: "kan beter",
    noUsage: "Geen verbruiksgegevens voor deze dag.",
    prevDay: "Vorige dag",
    nextDay: "Volgende dag",
    chooseEnergy: "Kies een energiemeter in de kaartinstellingen.",
    todaySoFar: "Vandaag tot nu",
    yesterday: "Gisteren",
    failed: (e) => `Prijzen konden niet worden geladen: ${e}`,
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
    loading: "Preise werden geladen…",
    feedTitle: "Einspeisepreis",
    highest: "Am höchsten noch",
    bestBlock: (n) => `Beste ${n} kommende Stunden`,
    bHighest: "Am höchsten",
    bBestBlock: (n) => `Beste ${n} Std.`,
    bTrend: "Nächster Preis",
    bNegative: "Negative Preise",
    none: "keine",
    applianceDefault: "Waschmaschine",
    best: "am besten",
    usageTitle: "Verbrauch und Preis",
    paid: "Du hast im Schnitt bezahlt",
    dayAvg: "Tagesschnitt",
    bestPossible: "bestmöglich",
    score: "Punktzahl",
    great: "sehr gut getimt",
    good: "gut",
    ok: "geht besser",
    noUsage: "Keine Verbrauchsdaten für diesen Tag.",
    prevDay: "Vorheriger Tag",
    nextDay: "Nächster Tag",
    chooseEnergy: "Wähle in den Karteneinstellungen einen Energiezähler.",
    todaySoFar: "Heute bisher",
    yesterday: "Gestern",
    failed: (e) => `Preise konnten nicht geladen werden: ${e}`,
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
    loading: "Chargement des prix…",
    feedTitle: "Prix de réinjection",
    highest: "Le plus élevé à venir",
    bestBlock: (n) => `Les ${n} meilleures heures à venir`,
    bHighest: "Le plus élevé",
    bBestBlock: (n) => `${n} h les meilleures`,
    bTrend: "Prix suivant",
    bNegative: "Prix négatifs",
    none: "aucun",
    applianceDefault: "Lave-linge",
    best: "idéal",
    usageTitle: "Consommation et prix",
    paid: "Vous avez payé en moyenne",
    dayAvg: "moyenne du jour",
    bestPossible: "meilleur possible",
    score: "Score",
    great: "excellent timing",
    good: "bien",
    ok: "peut mieux faire",
    noUsage: "Pas de données de consommation pour ce jour.",
    prevDay: "Jour précédent",
    nextDay: "Jour suivant",
    chooseEnergy: "Choisissez un compteur d’énergie dans les paramètres de la carte.",
    todaySoFar: "Aujourd’hui jusqu’ici",
    yesterday: "Hier",
    failed: (e) => `Impossible de charger les prix : ${e}`,
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
    loading: "Cargando precios…",
    feedTitle: "Precio de vertido",
    highest: "Más alto por venir",
    bestBlock: (n) => `Las ${n} mejores horas por venir`,
    bHighest: "Más alto",
    bBestBlock: (n) => `${n} h mejores`,
    bTrend: "Precio siguiente",
    bNegative: "Precios negativos",
    none: "ninguno",
    applianceDefault: "Lavadora",
    best: "mejor",
    usageTitle: "Consumo y precio",
    paid: "Pagaste de media",
    dayAvg: "media del día",
    bestPossible: "mejor posible",
    score: "Puntuación",
    great: "muy bien elegido",
    good: "bien",
    ok: "mejorable",
    noUsage: "No hay datos de consumo para este día.",
    prevDay: "Día anterior",
    nextDay: "Día siguiente",
    chooseEnergy: "Elige un contador de energía en los ajustes de la tarjeta.",
    todaySoFar: "Hoy hasta ahora",
    yesterday: "Ayer",
    failed: (e) => `No se pudieron cargar los precios: ${e}`,
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
// Rounds first, so a tiny negative price shows as 0.00, not -0.00.
function rounded(v, decimals) {
  const r = Number(v.toFixed(decimals));
  return r === 0 ? 0 : r;
}

function euro(v, decimals, lang, currency) {
  v = rounded(v, decimals);
  return new Intl.NumberFormat(lang || "en", {
    style: "currency",
    currency: currency || "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);
}

function num(v, decimals, lang) {
  v = rounded(v, decimals);
  return new Intl.NumberFormat(lang || "en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
}

function hh(d) {
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

function weekday(d, hass) {
  return d.toLocaleDateString(language(hass), { weekday: "short" });
}

// Price lists come in the formats of many integrations. Each entry needs a
// start time and a price; the first field name that is present is used. Own
// names can be set with time_key / price_key (a dot for nested fields).
const TIME_KEYS = ["date.full", "start", "startsAt", "start_time", "from", "time", "timestamp", "datetime", "valid_from", "hour", "date"];
const PRICE_KEYS = ["price", "value", "total", "value_inc_vat", "price_per_kwh", "per_kwh", "electricity_price", "price_tax_included.amount"];
// Attributes that hold a price list, tried in this order: Pure Energie Prices,
// ENTSO-e, Frank Energie, Rabot (prices); Nord Pool and Energi Data Service
// (raw_today / raw_tomorrow); split lists (prices_today / prices_tomorrow);
// Octopus Energy UK and Germany (rates); EPEX Spot and Tibber Prices (data);
// Amber (forecasts); forecasts. Spanish PVPC is read separately (price_00h …).
const LIST_ATTRIBUTES = [
  ["prices"], ["raw_today", "raw_tomorrow"], ["prices_today", "prices_tomorrow"], ["rates"], ["data"], ["forecasts"], ["forecast"],
];

// Integrations that offer prices only through an action, with the unit their
// prices come in.
const ACTION_SOURCES = {
  energyzero: { service: "get_energy_prices", unit: "kwh", vat: true },
  easyenergy: { service: "get_energy_usage_prices", unit: "kwh", vat: true },
  nordpool: { service: "get_prices_for_date", unit: "mwh" },
  tibber: { service: "get_prices", unit: "kwh" },
};

const UNIT_FACTORS = { kwh: 1, cent: 0.01, mwh: 0.001 };
const CURRENCIES = ["EUR", "GBP", "SEK", "NOK", "DKK", "CHF", "PLN", "CZK", "HUF", "RON", "BGN", "AUD", "USD"];

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

// Spanish PVPC keeps one attribute per hour: price_00h … price_23h for today,
// price_02h_d for the repeated hour when the clocks go back.
function pvpcItems(attrs) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const items = [];
  for (const [key, value] of Object.entries(attrs)) {
    const m = /^price_(next_day_)?(\d\d)h(_d)?$/.exec(key);
    if (!m || typeof value !== "number") continue;
    const t = new Date(today);
    if (m[1]) t.setDate(t.getDate() + 1);
    t.setHours(Number(m[2]));
    if (m[3]) t.setTime(t.getTime() + HOUR);
    items.push({ start: t.toISOString(), price: value });
  }
  return items;
}

function parseItems(items, c, factor, found) {
  const timeKeys = c.time_key ? [c.time_key] : TIME_KEYS;
  const priceKeys = c.price_key ? [c.price_key] : PRICE_KEYS;
  for (const item of items) {
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

// The unit the prices come in: chosen by the user, known for an action, or
// read from the sensor's unit ("ct/kWh", "€/MWh", "p/kWh" …). Everything is
// converted to the main currency unit per kWh.
function unitFactor(c, state) {
  let unit = c.price_unit && c.price_unit !== "auto" ? c.price_unit : null;
  if (!unit && ACTION_SOURCES[c.source]) unit = ACTION_SOURCES[c.source].unit;
  if (!unit) {
    const u = String((state && state.attributes.unit_of_measurement) || "").trim().toLowerCase();
    if (/mwh/.test(u)) unit = "mwh";
    else if (/^(ct|c|p|cent|cents|pence|öre|øre|gr|snt)(\/|\s|$)/.test(u)) unit = "cent";
    else unit = "kwh";
  }
  return (UNIT_FACTORS[unit] || 1) * (Number(c.price_factor) || 1);
}

// The currency: chosen by the user, or read from the sensor's unit, else euro.
function currencyOf(c, state) {
  if (c.currency && c.currency !== "auto") return c.currency;
  const u = String((state && state.attributes.unit_of_measurement) || "");
  const code = CURRENCIES.find((x) => u.toUpperCase().includes(x));
  if (code) return code;
  if (u.includes("£") || /^p\//i.test(u)) return "GBP";
  if (u.includes("zł")) return "PLN";
  if (u.includes("Kč")) return "CZK";
  return "EUR";
}

function localIso(d) {
  const p2 = (n) => String(Math.abs(n)).padStart(2, "0");
  const off = -d.getTimezoneOffset();
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}:00` +
    `${off >= 0 ? "+" : "-"}${p2(Math.floor(Math.abs(off) / 60))}:${p2(Math.abs(off) % 60)}`;
}

// Ask an integration's action for today's and tomorrow's prices.
async function fetchActionItems(hass, c) {
  const src = ACTION_SOURCES[c.source];
  const call = async (data) =>
    (await hass.callWS({ type: "call_service", domain: c.source, service: src.service, service_data: data, return_response: true })).response;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  if (c.source === "nordpool") {
    // One call per day; tomorrow fails or is empty until it is published.
    const items = [];
    for (const day of [0, 1]) {
      const d = new Date(start);
      d.setDate(d.getDate() + day);
      const data = { config_entry: c.config_entry, date: localIso(d).slice(0, 10) };
      if (c.area) data.areas = [c.area];
      if (c.currency && c.currency !== "auto") data.currency = c.currency;
      try {
        const res = (await call(data)) || {};
        const area = c.area && res[c.area] ? c.area : Object.keys(res)[0];
        items.push(...(res[area] || []));
      } catch (e) {
        if (day === 0) throw e;
      }
    }
    return items;
  }
  if (c.source === "tibber") {
    const homes = ((await call({ start: localIso(start), end: localIso(end) })) || {}).prices || {};
    const home = c.area && homes[c.area] ? c.area : Object.keys(homes)[0];
    return homes[home] || [];
  }
  const data = { config_entry: c.config_entry, incl_vat: c.incl_vat !== false, start: localIso(start), end: localIso(end) };
  return ((await call(data)) || {}).prices || [];
}

// Action prices are fetched once per source and shared by every card and
// badge on the page; they are fetched again after 30 minutes.
const actionCache = new Map();

function actionEntry(hass, c, onUpdate) {
  const key = JSON.stringify([c.source, c.config_entry, c.area, c.incl_vat, c.currency]);
  let entry = actionCache.get(key);
  if (!entry) {
    entry = { items: [], time: 0, loading: false, error: null, version: 0, listeners: new Set() };
    actionCache.set(key, entry);
  }
  if (onUpdate) entry.listeners.add(onUpdate);
  if (!entry.loading && Date.now() - entry.time > 30 * 60000 && hass && hass.callWS) {
    entry.loading = true;
    entry.time = Date.now();
    fetchActionItems(hass, c)
      .then((items) => { entry.items = items; entry.error = null; })
      .catch((e) => { entry.error = (e && e.message) || String(e); })
      .finally(() => {
        entry.loading = false;
        entry.version++;
        entry.listeners.forEach((f) => f());
      });
  }
  return entry;
}

// All prices as { t, price } in the main currency unit per kWh, sorted, one
// per start time, plus the state of an action fetch, if any.
function readPrices(hass, state, c = {}, onUpdate) {
  const factor = unitFactor(c, state);
  const found = new Map();
  let status = null;
  if (ACTION_SOURCES[c.source]) {
    const entry = actionEntry(hass, c, onUpdate);
    parseItems(entry.items, c, factor, found);
    status = { loading: entry.loading, error: entry.error, version: entry.version };
  } else {
    const attrs = (state && state.attributes) || {};
    for (const name of listNames(attrs, c)) parseItems(Array.isArray(attrs[name]) ? attrs[name] : [], c, factor, found);
    if (!found.size && !c.attribute) parseItems(pvpcItems(attrs), c, factor, found);
  }
  return { list: [...found.values()].sort((x, y) => x.t - y.t), status };
}

// A price card shares its settings, so badges can use the same colours,
// currency, units and data source. Badges without a sensor follow the last
// card that loaded.
const SHARED_KEYS = [
  "entity", "palette", "color_steps", "color_low", "color_high", "currency", "price_unit", "price_factor",
  "source", "attribute", "time_key", "price_key", "config_entry", "area", "incl_vat", "decimals", "mode",
];
const sharedSettings = (window.__energyPriceSettings = window.__energyPriceSettings || { byKey: new Map(), last: null });

function settingsKey(c) {
  if (ACTION_SOURCES[c.source]) return `${c.source}:${c.config_entry || ""}:${c.area || ""}`;
  return c.entity || "";
}

function shareSettings(c) {
  const key = settingsKey(c);
  if (!key) return;
  const picked = {};
  for (const k of SHARED_KEYS) if (c[k] != null) picked[k] = c[k];
  sharedSettings.byKey.set(key, picked);
  sharedSettings.last = picked;
  window.dispatchEvent(new CustomEvent("energy-price-settings"));
}

function followedSettings(c) {
  if (c.follow_chart === false) return c;
  const key = settingsKey(c);
  const shared = key ? sharedSettings.byKey.get(key) : sharedSettings.last;
  return shared ? { ...c, ...shared } : c;
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
function priceDays(list) {
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
// with the lowest average price (the highest with `opts.highest`, for feed-in
// prices). With `opts.from` and `opts.until` (hours) the whole run must lie in
// that daily window, for example from 22 until 7. Null when off or no data.
function cheapestBlock(bars, nowSlot, hours, slotMin = 60, opts = {}) {
  const h = Math.min(Math.max(Math.round(Number(hours) || 0), 0), 12);
  if (h < 1) return null;
  const n = Math.round((h * 60) / slotMin);
  const bySlot = new Map(bars.map((b) => [b.i, b]));
  const windowed = opts.from != null && opts.until != null && opts.from !== opts.until;
  const inWindow = (t) => {
    if (!windowed) return true;
    const x = t.getHours();
    return opts.from > opts.until ? x >= opts.from || x < opts.until : x >= opts.from && x < opts.until;
  };
  let best = null;
  for (const b of bars) {
    if (b.i <= nowSlot) continue;
    let sum = 0, ok = true;
    for (let k = 0; k < n; k++) {
      const x = bySlot.get(b.i + k);
      if (!x || !inWindow(x.t)) { ok = false; break; }
      sum += x.price;
    }
    const avg = sum / n;
    if (ok && (!best || (opts.highest ? avg > best.avg : avg < best.avg))) {
      best = { from: b.i, to: b.i + n - 1, start: b.t, end: new Date(b.t.getTime() + h * HOUR), avg, hours: h };
    }
  }
  return best;
}

function blockOpts(c) {
  const opts = { highest: c.mode === "feed_in" };
  if (c.block_window) {
    opts.from = Number(c.block_from ?? 22);
    opts.until = Number(c.block_until ?? 7);
  }
  return opts;
}

// Bars below zero get their own colour, apart from every palette.
const NEGATIVE_COLOUR = "var(--purple-color, #8e44ad)";

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
    return document.createElement("electricity-price-planner-card-editor");
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
    shareSettings(this._config);
    this._onPrices = this._onPrices || (() => { this._key = null; if (this._hass) this.hass = this._hass; });
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
    // Sections dashboards: the whole width of the section by default (also
    // when the section is made wider), resizable down to half.
    return { columns: "full", min_columns: 6, rows: "auto", min_rows: 4 };
  }

  _day(d) {
    return weekday(d, this._hass);
  }

  _render() {
    if (!this._config) return;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const t = this._t || TEXTS.en;
    const state = this._state;

    const c = this._config;
    const isAction = !!ACTION_SOURCES[c.source];
    const { list, status } = readPrices(this._hass, state, c, this._onPrices);
    this._cur = currencyOf(c, state);
    const { start, slots, split, nowSlot, bars, slotMin, slotMs } = priceDays(list);
    this._bars = bars;
    this._slotMs = slotMs;
    this._block = cheapestBlock(bars, nowSlot, this._config.block_hours, slotMin, blockOpts(this._config));

    let body;
    if (!isAction && !c.entity) {
      body = `<p class="msg">${t.choose}</p>`;
    } else if (!isAction && !state) {
      body = `<p class="msg">${esc(t.missing(c.entity))}</p>`;
    } else if (!bars.length) {
      const msg = status && status.error ? t.failed(status.error) : status && status.loading ? t.loading : t.empty;
      body = `<p class="msg">${esc(msg)}</p>`;
    } else {
      this._ctx = { bars, slots, split, nowSlot, start, slotMin, slotMs };
      const summary = this._config.show_summary === false ? "" : this._summary(bars, nowSlot);
      const info = this._config.show_info === false ? "" : `<div class="info">${t.hint}</div>`;
      body = summary + `<div class="chart"></div>${info}`;
    }
    this._drawn = null;

    const custom = typeof this._config.title === "string" ? this._config.title.trim() : "";
    const titleText = this._config.show_title === false ? "" : custom || (this._config.mode === "feed_in" ? t.feedTitle : t.title);
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
        .zero { stroke: var(--primary-text-color); stroke-width: 1; opacity: .55; }
        .avg { stroke: var(--primary-text-color); stroke-width: 1.2; stroke-dasharray: 5 4; opacity: .7; }
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
    if (info) info.innerHTML = `${esc(this._day(b.t))} ${hh(b.t)}–${hh(next)}: <b>${euro(b.price, this._config.decimals, language(this._hass), this._cur)}</b>`;
  }

  _summary(bars, nowSlot) {
    const t = this._t || TEXTS.en;
    const c = this._config;
    const money = (v) => euro(v, c.decimals, language(this._hass), this._cur);
    // For feed-in prices the best hour is the highest, not the cheapest.
    const feed = c.mode === "feed_in";
    const parts = [];
    const now = bars.find((b) => b.i === nowSlot);
    if (now && c.summary_now !== false) parts.push(`<span>${t.now} <b>${money(now.price)}</b></span>`);
    const ahead = bars.filter((b) => b.i > nowSlot);
    if (ahead.length && c.summary_cheapest !== false) {
      const best = ahead.reduce((a, b) => ((feed ? b.price > a.price : b.price < a.price) ? b : a));
      parts.push(`<span>${feed ? t.highest : t.cheapest} <b>${money(best.price)}</b> ${t.at} <b>${this._day(best.t)} ${hh(best.t)}</b></span>`);
    }
    const blk = this._block;
    if (blk && c.summary_block !== false) {
      const head = (feed ? t.bestBlock : t.block)(blk.hours);
      parts.push(`<span>${head}: <b>${this._day(blk.start)} ${hh(blk.start)}–${hh(blk.end)}</b>, ${t.avg} <b>${money(blk.avg)}</b></span>`);
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
    // Compact: only the bars, no price or hour labels.
    const compact = this._config.compact === true;
    const L = compact ? 4 : 38 * k, R = 4, T = compact ? 6 : 10, B = compact ? 4 : 20 * k;
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
      if (!compact) svg += `<text x="${L - 4}" y="${y(v) + 4 * k}" text-anchor="end">${num(v, 2, language(this._hass))}</text>`;
    }
    // A stronger line at zero when prices go below it.
    if (lo < 0) svg += `<line class="zero" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"/>`;

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
      if (compact) continue;
      svg += `<line class="tick" x1="${cx}" x2="${cx}" y1="${T + ph}" y2="${T + ph + (major ? 4 : 2)}"/>`;
      if (major) svg += `<text x="${cx}" y="${H - 3}" text-anchor="middle">${h}</text>`;
    }

    for (const b of bars) {
      // Feed-in: high prices are good, so the colours turn around.
      let f = max > min ? (b.price - min) / (max - min) : 0.5;
      if (this._config.mode === "feed_in") f = 1 - f;
      const fill = b.price < 0 && this._config.highlight_negative !== false ? NEGATIVE_COLOUR : this._colour(f);
      const cls = [];
      if (b.i < nowSlot) cls.push("past");
      if (b.i === nowSlot) cls.push("now");
      const top = y(Math.max(b.price, 0)), bottom = y(Math.min(b.price, 0));
      // A 1 px gap between bars, unless they are too thin for it.
      const gap = bw >= 4 ? 1 : 0;
      svg += `<rect class="${cls.join(" ")}" style="fill: ${esc(fill)}" data-bar="${b.i}" x="${L + b.i * bw + gap / 2}" y="${top}" width="${Math.max(bw - gap, 0.5)}" height="${Math.max(bottom - top, 0.5)}"/>`;
    }

    // Optional: a dashed line at each day's average price.
    if (this._config.show_average) {
      for (const [a0, a1] of [[0, split], [split, slots]]) {
        const day = bars.filter((b) => b.i >= a0 && b.i < a1);
        if (!day.length) continue;
        const avg = day.reduce((sum, b) => sum + b.price, 0) / day.length;
        svg += `<line class="avg" x1="${L + a0 * bw}" x2="${L + a1 * bw}" y1="${y(avg)}" y2="${y(avg)}"/>`;
        if (!compact) svg += `<text class="avgtext" x="${L + a1 * bw - 3}" y="${y(avg) - 3}" text-anchor="end">⌀ ${num(avg, 2, language(this._hass))}</text>`;
      }
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
    if (!compact) svg += `<text x="${sx + 3}" y="${T + 10 * k}">${t.tomorrow}</text>`;

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
      advanced: "Advanced settings",
      mode: "Prices shown",
      sec_text: "Text",
      sec_chart: "Chart",
      sec_colours: "Colours",
      sec_block: "Cheapest block",
      compact: "Compact (no axes)",
      show_average: "Average line",
      highlight_negative: "Highlight negative prices",
      block_window: "Only within set hours",
      block_from: "Earliest start (hour)",
      block_until: "Finished by (hour)",
      appliance_kwh: "Energy per run",
      appliance_hours: "Duration (hours)",
      energy_entity: "Energy meters",
      show_score: "Show score",
      source: "Where the prices come from",
      config_entry: "Integration entry",
      area: "Area or home",
      incl_vat: "Prices including VAT",
      price_unit: "Unit of the prices",
      currency: "Currency",
      follow_chart: "Use the price card's colours and settings",
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
      mode: "Feed-in: high prices are good, so the colours turn around and the card looks for the highest prices.",
      compact: "Only the bars, without price and hour labels. For small cards.",
      show_average: "A dashed line at each day's average price.",
      highlight_negative: "Bars below zero get their own colour (purple).",
      block_window: "For example from 22 until 7: the block must start and finish between 22:00 and 07:00.",
      appliance_kwh: "How much energy one run uses, for example 1 kWh for a washing machine at 40 °C.",
      appliance_hours: "How long one run takes. The badge shows the cost now and at the cheapest start.",
      energy_entity: "A sensor that counts your electricity use in kWh, for example the one in the Energy dashboard. Choose several to add them up, for example the high and low tariff (tariff 1 and 2). Do not also add a total of them, or use is counted twice.",
      show_score: "100 = all use in the cheapest hour of the day, 0 = all in the most expensive one.",
      source: "Most integrations keep the prices in the sensor. EnergyZero, easyEnergy, the built-in Nord Pool and Tibber only offer them through an action; choose them here.",
      config_entry: "The set-up integration that is asked for the prices.",
      area: "Nord Pool: the price area, for example NL or SE3 (empty: the first one). Tibber: the name of the home (empty: the first home).",
      incl_vat: "Ask the integration for prices including VAT.",
      price_unit: "Automatic reads the unit from the sensor. Choose cents if the prices are 100 times too high, per MWh if they are 1000 times too high.",
      currency: "Automatic reads the currency from the sensor's unit and otherwise uses euro.",
      follow_chart: "Takes colours, currency, units and data source from a price card on this dashboard (for the same sensor, or the last card that loaded if no sensor is chosen). Off: set them here.",
      source_custom: "Only needed when the card shows no prices. The formats of Pure Energie Prices, Nord Pool, ENTSO-e, Frank Energie, Octopus Energy, EPEX Spot and PVPC are recognised automatically.",
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
    modes: { purchase: "Purchase price", feed_in: "Feed-in price" },
    units: { auto: "Automatic", kwh: "Per kWh (for example €/kWh)", cent: "Cents per kWh (ct, p, öre)", mwh: "Per MWh" },
    sources: { attribute: "Sensor (most integrations)", energyzero: "EnergyZero", easyenergy: "easyEnergy", nordpool: "Nord Pool (built-in)", tibber: "Tibber" },
  },
  nl: {
    labels: {
      entity: "Prijssensor",
      source_custom: "Gegevensformaat zelf instellen",
      attribute: "Attribuut met de prijslijst",
      time_key: "Veld met de begintijd",
      price_key: "Veld met de prijs",
      price_factor: "Prijzen vermenigvuldigen met",
      advanced: "Geavanceerde instellingen",
      mode: "Getoonde prijzen",
      sec_text: "Tekst",
      sec_chart: "Grafiek",
      sec_colours: "Kleuren",
      sec_block: "Goedkoopste blok",
      compact: "Compact (zonder assen)",
      show_average: "Gemiddelde-lijn",
      highlight_negative: "Negatieve prijzen markeren",
      block_window: "Alleen binnen vaste uren",
      block_from: "Vroegste start (uur)",
      block_until: "Klaar om (uur)",
      appliance_kwh: "Energie per keer",
      appliance_hours: "Duur (uren)",
      energy_entity: "Energiemeters",
      show_score: "Score tonen",
      source: "Waar de prijzen vandaan komen",
      config_entry: "Integratie-item",
      area: "Gebied of woning",
      incl_vat: "Prijzen inclusief btw",
      price_unit: "Eenheid van de prijzen",
      currency: "Valuta",
      follow_chart: "Kleuren en instellingen van de prijskaart gebruiken",
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
      mode: "Teruglevering: hoge prijzen zijn gunstig, dus de kleuren draaien om en de kaart zoekt de hoogste prijzen.",
      compact: "Alleen de balken, zonder prijs- en uurlabels. Voor kleine kaarten.",
      show_average: "Een stippellijn op de gemiddelde prijs van elke dag.",
      highlight_negative: "Balken onder nul krijgen een eigen kleur (paars).",
      block_window: "Bijvoorbeeld van 22 tot 7: het blok moet tussen 22:00 en 07:00 beginnen en klaar zijn.",
      appliance_kwh: "Hoeveel energie één keer gebruikt, bijvoorbeeld 1 kWh voor een wasmachine op 40 °C.",
      appliance_hours: "Hoe lang één keer duurt. De badge toont de kosten nu en bij de goedkoopste start.",
      energy_entity: "Een sensor die je stroomverbruik in kWh telt, bijvoorbeeld die van het Energie-dashboard. Kies er meerdere om ze op te tellen, bijvoorbeeld hoog en laag tarief (tarief 1 en 2). Voeg dan niet ook een totaal daarvan toe, anders telt het verbruik dubbel.",
      show_score: "100 = al het verbruik in het goedkoopste uur van de dag, 0 = alles in het duurste.",
      source: "De meeste integraties houden de prijzen in de sensor bij. EnergyZero, easyEnergy, de ingebouwde Nord Pool en Tibber bieden ze alleen via een actie aan; kies die hier.",
      config_entry: "De ingestelde integratie die om de prijzen wordt gevraagd.",
      area: "Nord Pool: het prijsgebied, bijvoorbeeld NL of SE3 (leeg: het eerste). Tibber: de naam van de woning (leeg: de eerste woning).",
      incl_vat: "Vraag de integratie om prijzen inclusief btw.",
      price_unit: "Automatisch leest de eenheid van de sensor. Kies centen als de prijzen 100 keer te hoog zijn, per MWh als ze 1000 keer te hoog zijn.",
      currency: "Automatisch leest de valuta uit de eenheid van de sensor en gebruikt anders de euro.",
      follow_chart: "Neemt kleuren, valuta, eenheden en gegevensbron over van een prijskaart op dit dashboard (voor dezelfde sensor, of de laatst geladen kaart als er geen sensor is gekozen). Uit: stel ze hier in.",
      source_custom: "Alleen nodig als de kaart geen prijzen toont. De formaten van Pure Energie Prices, Nord Pool, ENTSO-e, Frank Energie, Octopus Energy, EPEX Spot en PVPC worden automatisch herkend.",
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
    modes: { purchase: "Inkoopprijs", feed_in: "Terugleverprijs" },
    units: { auto: "Automatisch", kwh: "Per kWh (bijvoorbeeld €/kWh)", cent: "Centen per kWh (ct, p, öre)", mwh: "Per MWh" },
    sources: { attribute: "Sensor (de meeste integraties)", energyzero: "EnergyZero", easyenergy: "easyEnergy", nordpool: "Nord Pool (ingebouwd)", tibber: "Tibber" },
  },
  de: {
    labels: {
      entity: "Preissensor",
      source_custom: "Datenformat selbst festlegen",
      attribute: "Attribut mit der Preisliste",
      time_key: "Feld mit der Startzeit",
      price_key: "Feld mit dem Preis",
      price_factor: "Preise multiplizieren mit",
      advanced: "Erweiterte Einstellungen",
      mode: "Angezeigte Preise",
      sec_text: "Text",
      sec_chart: "Diagramm",
      sec_colours: "Farben",
      sec_block: "Günstigster Block",
      compact: "Kompakt (ohne Achsen)",
      show_average: "Durchschnittslinie",
      highlight_negative: "Negative Preise hervorheben",
      block_window: "Nur in festen Stunden",
      block_from: "Frühester Start (Stunde)",
      block_until: "Fertig bis (Stunde)",
      appliance_kwh: "Energie pro Durchlauf",
      appliance_hours: "Dauer (Stunden)",
      energy_entity: "Energiezähler",
      show_score: "Punktzahl anzeigen",
      source: "Woher die Preise kommen",
      config_entry: "Integrationseintrag",
      area: "Gebiet oder Zuhause",
      incl_vat: "Preise inklusive MwSt.",
      price_unit: "Einheit der Preise",
      currency: "Währung",
      follow_chart: "Farben und Einstellungen der Preiskarte übernehmen",
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
      mode: "Einspeisung: hohe Preise sind gut, die Farben drehen sich um und die Karte sucht die höchsten Preise.",
      compact: "Nur die Balken, ohne Preis- und Stundenbeschriftung. Für kleine Karten.",
      show_average: "Eine gestrichelte Linie beim Durchschnittspreis jedes Tages.",
      highlight_negative: "Balken unter null bekommen eine eigene Farbe (lila).",
      block_window: "Zum Beispiel von 22 bis 7: Der Block muss zwischen 22:00 und 07:00 beginnen und fertig sein.",
      appliance_kwh: "Wie viel Energie ein Durchlauf braucht, zum Beispiel 1 kWh für eine Waschmaschine bei 40 °C.",
      appliance_hours: "Wie lange ein Durchlauf dauert. Das Badge zeigt die Kosten jetzt und beim günstigsten Start.",
      energy_entity: "Ein Sensor, der deinen Stromverbrauch in kWh zählt, zum Beispiel der aus dem Energie-Dashboard. Wähle mehrere, um sie zu addieren, zum Beispiel Hoch- und Niedertarif (Tarif 1 und 2). Füge dann nicht zusätzlich eine Summe davon hinzu, sonst zählt der Verbrauch doppelt.",
      show_score: "100 = der ganze Verbrauch in der günstigsten Stunde des Tages, 0 = alles in der teuersten.",
      source: "Die meisten Integrationen halten die Preise im Sensor. EnergyZero, easyEnergy, das eingebaute Nord Pool und Tibber bieten sie nur über eine Aktion an; hier auswählen.",
      config_entry: "Die eingerichtete Integration, die nach den Preisen gefragt wird.",
      area: "Nord Pool: das Preisgebiet, zum Beispiel DE-LU oder AT (leer: das erste). Tibber: der Name des Zuhauses (leer: das erste).",
      incl_vat: "Die Integration nach Preisen inklusive MwSt. fragen.",
      price_unit: "Automatisch liest die Einheit des Sensors. Cent wählen, wenn die Preise 100-mal zu hoch sind, pro MWh, wenn sie 1000-mal zu hoch sind.",
      currency: "Automatisch liest die Währung aus der Einheit des Sensors und nimmt sonst Euro.",
      follow_chart: "Übernimmt Farben, Währung, Einheiten und Datenquelle von einer Preiskarte auf diesem Dashboard (für denselben Sensor, oder die zuletzt geladene Karte, wenn kein Sensor gewählt ist). Aus: hier festlegen.",
      source_custom: "Nur nötig, wenn die Karte keine Preise zeigt. Die Formate von Pure Energie Prices, Nord Pool, ENTSO-e, Frank Energie, Octopus Energy, EPEX Spot und PVPC werden automatisch erkannt.",
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
    modes: { purchase: "Bezugspreis", feed_in: "Einspeisepreis" },
    units: { auto: "Automatisch", kwh: "Pro kWh (zum Beispiel €/kWh)", cent: "Cent pro kWh (ct, p, öre)", mwh: "Pro MWh" },
    sources: { attribute: "Sensor (die meisten Integrationen)", energyzero: "EnergyZero", easyenergy: "easyEnergy", nordpool: "Nord Pool (eingebaut)", tibber: "Tibber" },
  },
  fr: {
    labels: {
      entity: "Capteur de prix",
      source_custom: "Définir moi-même le format des données",
      attribute: "Attribut contenant la liste des prix",
      time_key: "Champ de l’heure de début",
      price_key: "Champ du prix",
      price_factor: "Multiplier les prix par",
      advanced: "Paramètres avancés",
      mode: "Prix affichés",
      sec_text: "Texte",
      sec_chart: "Graphique",
      sec_colours: "Couleurs",
      sec_block: "Bloc le moins cher",
      compact: "Compact (sans axes)",
      show_average: "Ligne de moyenne",
      highlight_negative: "Mettre en évidence les prix négatifs",
      block_window: "Seulement entre des heures fixes",
      block_from: "Début au plus tôt (heure)",
      block_until: "Terminé à (heure)",
      appliance_kwh: "Énergie par cycle",
      appliance_hours: "Durée (heures)",
      energy_entity: "Compteurs d’énergie",
      show_score: "Afficher le score",
      source: "Provenance des prix",
      config_entry: "Entrée de l’intégration",
      area: "Zone ou logement",
      incl_vat: "Prix TVA comprise",
      price_unit: "Unité des prix",
      currency: "Devise",
      follow_chart: "Reprendre les couleurs et réglages de la carte de prix",
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
      mode: "Réinjection : les prix élevés sont favorables ; les couleurs s’inversent et la carte cherche les prix les plus élevés.",
      compact: "Seulement les barres, sans libellés de prix ni d’heures. Pour les petites cartes.",
      show_average: "Une ligne pointillée au prix moyen de chaque jour.",
      highlight_negative: "Les barres sous zéro ont leur propre couleur (violet).",
      block_window: "Par exemple de 22 à 7 : le bloc doit commencer et finir entre 22:00 et 07:00.",
      appliance_kwh: "L’énergie consommée par cycle, par exemple 1 kWh pour un lave-linge à 40 °C.",
      appliance_hours: "La durée d’un cycle. Le badge affiche le coût maintenant et au départ le moins cher.",
      energy_entity: "Un capteur qui compte votre consommation en kWh, par exemple celui du tableau de bord Énergie. Choisissez-en plusieurs pour les additionner, par exemple heures pleines et creuses (tarif 1 et 2). N’ajoutez pas aussi leur total, sinon la consommation compte double.",
      show_score: "100 = toute la consommation à l’heure la moins chère du jour, 0 = tout à la plus chère.",
      source: "La plupart des intégrations gardent les prix dans le capteur. EnergyZero, easyEnergy, Nord Pool intégré et Tibber ne les proposent que via une action ; choisissez-les ici.",
      config_entry: "L’intégration configurée à laquelle les prix sont demandés.",
      area: "Nord Pool : la zone de prix, par exemple FR ou SE3 (vide : la première). Tibber : le nom du logement (vide : le premier).",
      incl_vat: "Demander à l’intégration les prix TVA comprise.",
      price_unit: "Automatique lit l’unité du capteur. Choisissez centimes si les prix sont 100 fois trop élevés, par MWh s’ils sont 1000 fois trop élevés.",
      currency: "Automatique lit la devise dans l’unité du capteur, sinon l’euro.",
      follow_chart: "Reprend couleurs, devise, unités et source des données d’une carte de prix de ce tableau de bord (même capteur, ou la dernière carte chargée si aucun capteur n’est choisi). Désactivé : réglez-les ici.",
      source_custom: "Nécessaire seulement si la carte n’affiche aucun prix. Les formats de Pure Energie Prices, Nord Pool, ENTSO-e, Frank Energie, Octopus Energy, EPEX Spot et PVPC sont reconnus automatiquement.",
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
    modes: { purchase: "Prix d’achat", feed_in: "Prix de réinjection" },
    units: { auto: "Automatique", kwh: "Par kWh (par exemple €/kWh)", cent: "Centimes par kWh (ct, p, öre)", mwh: "Par MWh" },
    sources: { attribute: "Capteur (la plupart des intégrations)", energyzero: "EnergyZero", easyenergy: "easyEnergy", nordpool: "Nord Pool (intégré)", tibber: "Tibber" },
  },
  es: {
    labels: {
      entity: "Sensor de precio",
      source_custom: "Definir yo el formato de los datos",
      attribute: "Atributo con la lista de precios",
      time_key: "Campo con la hora de inicio",
      price_key: "Campo con el precio",
      price_factor: "Multiplicar los precios por",
      advanced: "Ajustes avanzados",
      mode: "Precios mostrados",
      sec_text: "Texto",
      sec_chart: "Gráfico",
      sec_colours: "Colores",
      sec_block: "Bloque más barato",
      compact: "Compacto (sin ejes)",
      show_average: "Línea de media",
      highlight_negative: "Resaltar precios negativos",
      block_window: "Solo entre horas fijas",
      block_from: "Inicio más temprano (hora)",
      block_until: "Terminado a las (hora)",
      appliance_kwh: "Energía por uso",
      appliance_hours: "Duración (horas)",
      energy_entity: "Contadores de energía",
      show_score: "Mostrar puntuación",
      source: "De dónde vienen los precios",
      config_entry: "Entrada de la integración",
      area: "Zona o vivienda",
      incl_vat: "Precios con IVA",
      price_unit: "Unidad de los precios",
      currency: "Moneda",
      follow_chart: "Usar los colores y ajustes de la tarjeta de precios",
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
      mode: "Vertido: los precios altos son buenos, así que los colores se invierten y la tarjeta busca los precios más altos.",
      compact: "Solo las barras, sin etiquetas de precio ni de hora. Para tarjetas pequeñas.",
      show_average: "Una línea discontinua en el precio medio de cada día.",
      highlight_negative: "Las barras bajo cero tienen su propio color (morado).",
      block_window: "Por ejemplo de 22 a 7: el bloque debe empezar y terminar entre las 22:00 y las 07:00.",
      appliance_kwh: "La energía de un uso, por ejemplo 1 kWh para una lavadora a 40 °C.",
      appliance_hours: "Lo que dura un uso. La insignia muestra el coste ahora y en el inicio más barato.",
      energy_entity: "Un sensor que cuenta tu consumo de electricidad en kWh, por ejemplo el del panel de Energía. Elige varios para sumarlos, por ejemplo tarifa alta y baja (tarifa 1 y 2). No añadas también su total, o el consumo se cuenta dos veces.",
      show_score: "100 = todo el consumo en la hora más barata del día, 0 = todo en la más cara.",
      source: "La mayoría de las integraciones guardan los precios en el sensor. EnergyZero, easyEnergy, Nord Pool integrado y Tibber solo los ofrecen mediante una acción; elígelos aquí.",
      config_entry: "La integración configurada a la que se piden los precios.",
      area: "Nord Pool: la zona de precios, por ejemplo ES o SE3 (vacío: la primera). Tibber: el nombre de la vivienda (vacío: la primera).",
      incl_vat: "Pedir a la integración los precios con IVA.",
      price_unit: "Automático lee la unidad del sensor. Elige céntimos si los precios salen 100 veces altos, por MWh si salen 1000 veces altos.",
      currency: "Automático lee la moneda de la unidad del sensor; si no, usa el euro.",
      follow_chart: "Toma colores, moneda, unidades y fuente de datos de una tarjeta de precios de este panel (del mismo sensor, o la última tarjeta cargada si no eliges sensor). Desactivado: ajústalos aquí.",
      source_custom: "Solo hace falta si la tarjeta no muestra precios. Los formatos de Pure Energie Prices, Nord Pool, ENTSO-e, Frank Energie, Octopus Energy, EPEX Spot y PVPC se reconocen automáticamente.",
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
    modes: { purchase: "Precio de compra", feed_in: "Precio de vertido" },
    units: { auto: "Automático", kwh: "Por kWh (por ejemplo €/kWh)", cent: "Céntimos por kWh (ct, p, öre)", mwh: "Por MWh" },
    sources: { attribute: "Sensor (la mayoría de integraciones)", energyzero: "EnergyZero", easyenergy: "easyEnergy", nordpool: "Nord Pool (integrado)", tibber: "Tibber" },
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
// (A factor for unusual units, price_factor, can be set in YAML.)
function sourceFields(c) {
  const fields = [{ name: "source_custom", selector: { boolean: {} } }];
  if (c.source_custom) {
    fields.push(
      { name: "attribute", selector: { text: {} } },
      { name: "time_key", selector: { text: {} } },
      { name: "price_key", selector: { text: {} } }
    );
  }
  return fields;
}

function currencyOptions(lang, tx) {
  const names = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames([lang], { type: "currency" }) : null;
  return [
    { value: "auto", label: tx.units.auto },
    ...CURRENCIES.map((code) => ({ value: code, label: `${names ? names.of(code) : code} (${code})` })),
  ];
}

// "Advanced settings": folded away at the bottom of the form. Where the
// prices come from, their unit and currency, plus `extra` fields.
function advancedSection(tx, c, lang, extra = []) {
  const fields = [{ name: "source", selector: choice(tx.sources) }];
  if (ACTION_SOURCES[c.source]) {
    if (c.source !== "tibber") fields.push({ name: "config_entry", selector: { config_entry: { integration: c.source } } });
    if (c.source === "nordpool" || c.source === "tibber") fields.push({ name: "area", selector: { text: {} } });
    if (ACTION_SOURCES[c.source].vat) fields.push({ name: "incl_vat", selector: { boolean: {} } });
  } else {
    fields.push(...sourceFields(c));
  }
  fields.push(
    { name: "price_unit", selector: choice(tx.units) },
    { name: "currency", selector: { select: { mode: "dropdown", options: currencyOptions(lang, tx) } } },
    ...extra
  );
  return { type: "expandable", name: "advanced", title: tx.labels.advanced, flatten: true, schema: fields };
}

// A folding section of the form.
const section = (name, tx, schema) => ({ type: "expandable", name, title: tx.labels[name], flatten: true, schema });

// The card form: the essentials on top, the rest in folding sections, so the
// form stays short. Fields that depend on another setting only appear when
// that setting needs them.
function editorSchema(tx, c, lang) {
  const top = [];
  if (!ACTION_SOURCES[c.source]) top.push({ name: "entity", required: true, selector: { entity: { domain: "sensor" } } });
  top.push({ name: "mode", selector: choice(tx.modes) }, { name: "show_title", selector: { boolean: {} } });
  if (c.show_title !== false) top.push({ name: "title", selector: { text: {} } });

  const text = [{ name: "show_summary", selector: { boolean: {} } }];
  if (c.show_summary !== false) {
    text.push({ name: "summary_now", selector: { boolean: {} } }, { name: "summary_cheapest", selector: { boolean: {} } });
  }
  text.push({ name: "show_info", selector: { boolean: {} } });

  const chart = [
    { name: "height", selector: num_(80, 600, 10, "px") },
    { name: "compact", selector: { boolean: {} } },
    { name: "fixed_scale", selector: { boolean: {} } },
  ];
  if (c.fixed_scale) chart.push({ name: "y_max", selector: num_(0.05, 100, 0.01, "/kWh") });
  chart.push(
    { name: "show_average", selector: { boolean: {} } },
    { name: "highlight_negative", selector: { boolean: {} } },
    { name: "night_shading", selector: { boolean: {} } }
  );
  if (c.night_shading !== false) {
    chart.push(pair({ name: "night_start", selector: num_(0, 23, 1) }, { name: "night_end", selector: num_(0, 23, 1) }));
  }

  const colours = [{ name: "palette", selector: choice(tx.palettes) }];
  if (c.palette === "custom") colours.push(colourPair());
  colours.push({ name: "color_steps", selector: num_(2, 6, 1) });

  const block = [{ name: "block_hours", selector: num_(0, 12, 1) }];
  if (Number(c.block_hours) > 0) {
    if (c.show_summary !== false) block.push({ name: "summary_block", selector: { boolean: {} } });
    block.push({ name: "block_window", selector: { boolean: {} } });
    if (c.block_window) block.push(pair({ name: "block_from", selector: num_(0, 23, 1) }, { name: "block_until", selector: num_(0, 23, 1) }));
    block.push({ name: "block_color_custom", selector: { boolean: {} } });
    if (c.block_color_custom) block.push({ name: "block_color", selector: { color_rgb: {} } });
  }

  return [
    ...top,
    section("sec_text", tx, text),
    section("sec_chart", tx, chart),
    section("sec_colours", tx, colours),
    section("sec_block", tx, block),
    advancedSection(tx, c, lang, [
      { name: "decimals", selector: num_(0, 4, 1) },
      { name: "font_size", selector: num_(10, 24, 1, "px") },
    ]),
  ];
}

// Drop settings that belong to another data source, so switching source
// leaves no stale values behind.
function cleanSource(c) {
  if (!c.source_custom) for (const k of ["attribute", "time_key", "price_key"]) delete c[k];
  if (!ACTION_SOURCES[c.source]) for (const k of ["config_entry", "area", "incl_vat"]) delete c[k];
  else for (const k of ["source_custom", "attribute", "time_key", "price_key"]) delete c[k];
  if (!ACTION_SOURCES[c.source] || !ACTION_SOURCES[c.source].vat) delete c.incl_vat;
  if (c.source === "attribute") delete c.source;
  if (c.price_unit === "auto") delete c.price_unit;
  if (c.currency === "auto") delete c.currency;
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
    this._form.schema = this.schema(tx, data, language(this._hass));
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
      mode: "purchase",
      compact: false,
      show_average: false,
      highlight_negative: true,
      block_window: false,
      block_from: 22,
      block_until: 7,
      source: "attribute",
      price_unit: "auto",
      currency: "auto",
      incl_vat: true,
      ...c,
      source_custom: c.source_custom ?? !!(c.attribute || c.time_key || c.price_key),
      fixed_scale: c.fixed_scale ?? c.y_max != null,
      block_color_custom: c.block_color_custom ?? c.block_color != null,
    };
  }

  schema(tx, c, lang) {
    return editorSchema(tx, c, lang);
  }

  // Fill in a sensible start value when a field appears, and forget the
  // bracket colour when it is switched off, so switching it on again starts
  // from the current palette.
  normalize(c) {
    cleanSource(c);
    if (!c.block_window) { delete c.block_from; delete c.block_until; }
    if (c.mode === "purchase") delete c.mode;
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
  trend: "mdi:trending-neutral",
  at: "mdi:clock-outline",
  cheapest: "mdi:arrow-down-bold-circle-outline",
  highest: "mdi:arrow-up-bold-circle-outline",
  average: "mdi:approximately-equal",
  block: "mdi:timer-sand",
  negative: "mdi:minus-circle-outline",
  appliance: "mdi:washing-machine",
};

class PriceBadge extends HTMLElement {
  static getStubConfig(hass) {
    return { ...PriceChartCard.getStubConfig(hass), show: "now" };
  }

  static getConfigElement() {
    return document.createElement("electricity-price-planner-badge-editor");
  }

  setConfig(config) {
    this._config = { show: "now", range: "upcoming", decimals: 2, block_hours: 3, hour: 6, ...config };
    this._key = null;
    this._onPrices = this._onPrices || (() => { this._key = null; if (this._hass) this.hass = this._hass; });
    if (this._hass) this.hass = this._hass;
  }

  connectedCallback() {
    // Redraw when a price card shares new settings.
    window.addEventListener("energy-price-settings", this._onPrices);
  }

  disconnectedCallback() {
    window.removeEventListener("energy-price-settings", this._onPrices);
  }

  set hass(hass) {
    this._hass = hass;
    const state = hass.states[followedSettings(this._config).entity];
    const key = (state ? state.last_updated : "missing") + "|" + Math.floor(Date.now() / 900000) + "|" + language(hass);
    if (key === this._key) return;
    this._key = key;
    this._render(state);
  }

  _render(state) {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const c = followedSettings(this._config);
    const t = TEXTS[language(this._hass)];
    const d = c.decimals;
    const isAction = !!ACTION_SOURCES[c.source];
    const { list, status } = readPrices(this._hass, state, c, this._onPrices);
    this._cur = currencyOf(c, state);
    const { nowSlot, split, bars, slotMin } = priceDays(list);
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

    const lang = language(this._hass);
    const money = (v) => euro(v, d, lang, this._cur);
    const when = (time) => `${day(time)} ${hh(time)}`;
    const total = (list) => list.reduce((sum, b) => sum + b.price, 0);
    let trendIcon = null;

    if (c.show === "cheapest" || c.show === "highest") {
      const high = c.show === "highest";
      label = (high ? t.bHighest : t.bCheapest) + rangeLabel;
      if (inRange.length) {
        const best = inRange.reduce((a, b) => ((high ? b.price > a.price : b.price < a.price) ? b : a));
        label += ` · ${when(best.t)}`;
        price = best.price;
        value = money(price);
      }
    } else if (c.show === "block") {
      const feed = c.mode === "feed_in";
      const blk = cheapestBlock(inRange, range === "upcoming" ? nowSlot : -1, c.block_hours || 3, slotMin, blockOpts(c));
      label = (feed ? t.bBestBlock : t.bBlock)(blk ? blk.hours : Math.round(Number(c.block_hours) || 3)) + rangeLabel;
      if (blk) {
        price = blk.avg;
        value = `${when(blk.start)}–${hh(blk.end)} · ${money(price)}`;
      }
    } else if (c.show === "average") {
      label = `${t.bAvg} ${t.ranges[range] || t.rest}`;
      if (inRange.length) {
        price = total(inRange) / inRange.length;
        value = money(price);
      }
    } else if (c.show === "negative") {
      // How many hours have a price below zero, and the first such stretch.
      label = t.bNegative + rangeLabel;
      if (inRange.length) {
        const neg = inRange.filter((b) => b.price < 0);
        if (!neg.length) value = t.none;
        else {
          let last = neg[0];
          for (const b of neg.slice(1)) {
            if (b.i !== last.i + 1) break;
            last = b;
          }
          const hours = (neg.length * slotMin) / 60;
          price = Math.min(...neg.map((b) => b.price));
          value = `${num(hours, hours % 1 ? 1 : 0, lang)} h · ${when(neg[0].t)}–${hh(new Date(last.t.getTime() + slotMin * 60000))}`;
        }
      }
    } else if (c.show === "trend") {
      // The next price period compared with the current one.
      label = t.bTrend;
      const now = bars.find((b) => b.i === nowSlot), next = bars.find((b) => b.i === nowSlot + 1);
      if (now && next) {
        const diff = next.price - now.price;
        const arrow = Math.abs(diff) < 0.005 ? "→" : diff > 0 ? "↑" : "↓";
        trendIcon = { "↑": "mdi:trending-up", "↓": "mdi:trending-down", "→": "mdi:trending-neutral" }[arrow];
        label += ` · ${hh(next.t)}`;
        price = next.price;
        value = `${arrow} ${money(price)}`;
      }
    } else if (c.show === "appliance") {
      // What one run costs if started now, and at the cheapest start.
      const kwh = Number(c.appliance_kwh) > 0 ? Number(c.appliance_kwh) : 1;
      const hours = Math.min(Math.max(Math.round(Number(c.appliance_hours) || 2), 1), 12);
      const n = Math.round((hours * 60) / slotMin);
      label = t.applianceDefault;
      const nowRun = bars.filter((b) => b.i >= nowSlot && b.i < nowSlot + n);
      const blk = cheapestBlock(bars, nowSlot, hours, slotMin, { ...blockOpts(c), highest: false });
      const parts = [];
      if (nowRun.length === n) parts.push(`${t.now} ${money((kwh * total(nowRun)) / n)}`);
      if (blk) {
        parts.push(`${t.best} ${when(blk.start)} ${money(kwh * blk.avg)}`);
        price = blk.avg;
      }
      if (parts.length) value = parts.join(" · ");
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
        value = euro(price, d, language(this._hass), this._cur);
      }
    } else {
      label = t.bNow;
      const now = bars.find((b) => b.i === nowSlot);
      if (now) {
        price = now.price;
        value = euro(price, d, language(this._hass), this._cur);
      }
    }
    if (typeof c.name === "string" && c.name.trim()) label = c.name.trim();
    let note = price == null ? t.unknown : value;
    if (!isAction && !c.entity) note = t.choose;
    else if (!isAction && !state) value = note = t.missing(c.entity);
    else if (status && status.error) note = t.failed(status.error);

    // The icon takes the colour of the price, compared with all prices known.
    let colour = "var(--secondary-text-color)";
    if (price != null && bars.length) {
      const values = bars.map((b) => b.price);
      const min = Math.min(...values), max = Math.max(...values);
      colour = bandColour(c, max > min ? Math.min(Math.max((price - min) / (max - min), 0), 1) : 0.5);
    }
    const icon = typeof c.icon === "string" && c.icon ? c.icon : trendIcon || BADGE_ICONS[c.show] || BADGE_ICONS.now;

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
      <div class="badge" title="${esc(label)}: ${esc(note)}">
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
      show: "The fields below change with this choice. For the day's minimum or maximum, choose the cheapest hour or the highest price with “Today (whole day)”.",
      range: "Only the hours still to come, all of today, all of tomorrow, or both days. Tomorrow's prices usually arrive in the afternoon; until then the badge shows a dash.",
      block_hours: "1 to 12 consecutive hours, for example 3 for a washing machine programme. The badge shows when the block starts and ends, and its average price.",
      hour: "0 to 23. The badge shows the price for the next time the clock reaches this hour: today if it has not passed yet, otherwise tomorrow once that price is known. Example: 6 shows the price from 06:00 to 07:00.",
      entity: "Leave empty to use the sensor of the price card on this dashboard.",
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
      trend: "Next price (trend)",
      at: "Price at a set hour",
      cheapest: "Cheapest hour",
      highest: "Highest price",
      average: "Average price",
      block: "Cheapest block of hours",
      negative: "Negative prices",
      appliance: "Cost of an appliance",
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
      show: "De velden hieronder passen zich aan deze keuze aan. Voor het minimum of maximum van de dag: kies het goedkoopste uur of de hoogste prijs met „Vandaag (hele dag)”.",
      range: "Alleen de uren die nog komen, heel vandaag, heel morgen of beide dagen. De prijzen van morgen komen meestal in de middag; tot dan toont de badge een streepje.",
      block_hours: "1 tot 12 aaneengesloten uren, bijvoorbeeld 3 voor een wasprogramma. De badge toont begin en einde van het blok en de gemiddelde prijs.",
      hour: "0 tot 23. De badge toont de prijs voor de eerstvolgende keer dat de klok dit uur bereikt: vandaag als het nog niet voorbij is, anders morgen zodra die prijs bekend is. Voorbeeld: 6 toont de prijs van 06:00 tot 07:00.",
      entity: "Laat leeg om de sensor van de prijskaart op dit dashboard te gebruiken.",
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
      trend: "Volgende prijs (trend)",
      at: "Prijs op een vast uur",
      cheapest: "Goedkoopste uur",
      highest: "Hoogste prijs",
      average: "Gemiddelde prijs",
      block: "Goedkoopste blok uren",
      negative: "Negatieve prijzen",
      appliance: "Kosten van een apparaat",
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
      show: "Die Felder darunter passen sich dieser Auswahl an. Für Minimum oder Maximum des Tages: günstigste Stunde oder höchsten Preis mit „Heute (ganzer Tag)“ wählen.",
      range: "Nur die kommenden Stunden, den ganzen heutigen Tag, den ganzen morgigen Tag oder beide Tage. Die Preise für morgen kommen meist am Nachmittag; bis dahin zeigt das Badge einen Strich.",
      block_hours: "1 bis 12 aufeinanderfolgende Stunden, zum Beispiel 3 für ein Waschprogramm. Das Badge zeigt Beginn und Ende des Blocks und den Durchschnittspreis.",
      hour: "0 bis 23. Das Badge zeigt den Preis für das nächste Mal, wenn die Uhr diese Stunde erreicht: heute, wenn sie noch nicht vorbei ist, sonst morgen, sobald der Preis bekannt ist. Beispiel: 6 zeigt den Preis von 06:00 bis 07:00.",
      entity: "Leer lassen, um den Sensor der Preiskarte auf diesem Dashboard zu verwenden.",
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
      trend: "Nächster Preis (Trend)",
      at: "Preis zu einer festen Stunde",
      cheapest: "Günstigste Stunde",
      highest: "Höchster Preis",
      average: "Durchschnittspreis",
      block: "Günstigster Stundenblock",
      negative: "Negative Preise",
      appliance: "Kosten eines Geräts",
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
      show: "Les champs ci-dessous s’adaptent à ce choix. Pour le minimum ou le maximum du jour : choisissez l’heure la moins chère ou le prix le plus élevé avec « Aujourd’hui (toute la journée) ».",
      range: "Seulement les heures à venir, toute la journée d’aujourd’hui, toute celle de demain, ou les deux. Les prix de demain arrivent en général l’après-midi ; d’ici là, le badge affiche un tiret.",
      block_hours: "1 à 12 heures consécutives, par exemple 3 pour un programme de lave-linge. Le badge affiche le début et la fin du bloc et son prix moyen.",
      hour: "0 à 23. Le badge affiche le prix pour la prochaine fois que l’horloge atteint cette heure : aujourd’hui si elle n’est pas encore passée, sinon demain dès que ce prix est connu. Exemple : 6 affiche le prix de 06:00 à 07:00.",
      entity: "Laissez vide pour utiliser le capteur de la carte de prix de ce tableau de bord.",
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
      trend: "Prix suivant (tendance)",
      at: "Prix à une heure fixe",
      cheapest: "Heure la moins chère",
      highest: "Prix le plus élevé",
      average: "Prix moyen",
      block: "Bloc d’heures le moins cher",
      negative: "Prix négatifs",
      appliance: "Coût d’un appareil",
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
      show: "Los campos de abajo cambian según esta elección. Para el mínimo o el máximo del día: elige la hora más barata o el precio más alto con «Hoy (todo el día)».",
      range: "Solo las horas que quedan, todo el día de hoy, todo el de mañana o ambos días. Los precios de mañana suelen llegar por la tarde; hasta entonces la insignia muestra un guion.",
      block_hours: "De 1 a 12 horas seguidas, por ejemplo 3 para un programa de lavadora. La insignia muestra el inicio y el fin del bloque y su precio medio.",
      hour: "De 0 a 23. La insignia muestra el precio de la próxima vez que el reloj llegue a esta hora: hoy si aún no ha pasado, si no mañana en cuanto se conozca ese precio. Ejemplo: 6 muestra el precio de 06:00 a 07:00.",
      entity: "Déjalo vacío para usar el sensor de la tarjeta de precios de este panel.",
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
      trend: "Precio siguiente (tendencia)",
      at: "Precio a una hora fija",
      cheapest: "Hora más barata",
      highest: "Precio más alto",
      average: "Precio medio",
      block: "Bloque de horas más barato",
      negative: "Precios negativos",
      appliance: "Coste de un aparato",
    },
    range: { upcoming: "Horas por venir", today: "Hoy (todo el día)", tomorrow: "Mañana (todo el día)", both: "Hoy y mañana" },
  },
};

class PriceBadgeEditor extends FormEditor {
  texts(lang) {
    const card = EDITOR_TEXTS[lang], badge = BADGE_EDITOR_TEXTS[lang];
    return {
      ...card,
      ...badge,
      labels: { ...card.labels, ...badge.labels },
      helpers: { ...card.helpers, ...badge.helpers },
    };
  }

  withDefaults(c) {
    return {
      show: "now",
      range: "upcoming",
      block_hours: 3,
      hour: 6,
      appliance_kwh: 1,
      appliance_hours: 2,
      block_window: false,
      block_from: 22,
      block_until: 7,
      mode: "purchase",
      follow_chart: true,
      decimals: 2,
      palette: "traffic",
      color_steps: 3,
      source: "attribute",
      price_unit: "auto",
      currency: "auto",
      incl_vat: true,
      ...c,
      source_custom: c.source_custom ?? !!(c.attribute || c.time_key || c.price_key),
    };
  }

  // First the choice of what to show, then only the fields that choice uses,
  // then the general fields. Each field on its own row, so its help text sits
  // right below it. Colours and data settings come from the price card unless
  // "Same settings as the price card" is off.
  schema(tx, c, lang) {
    const schema = [{ name: "show", selector: choice(tx.show) }];
    if (c.show === "block") schema.push({ name: "block_hours", selector: num_(1, 12, 1) });
    if (c.show === "appliance") {
      schema.push({ name: "appliance_kwh", selector: num_(0.1, 50, 0.1, "kWh") }, { name: "appliance_hours", selector: num_(1, 12, 1) });
    }
    if (["cheapest", "highest", "average", "block", "negative"].includes(c.show)) schema.push({ name: "range", selector: choice(tx.range) });
    if (c.show === "block" || c.show === "appliance") {
      schema.push({ name: "block_window", selector: { boolean: {} } });
      if (c.block_window) schema.push(pair({ name: "block_from", selector: num_(0, 23, 1) }, { name: "block_until", selector: num_(0, 23, 1) }));
    }
    if (c.show === "at") schema.push({ name: "hour", selector: num_(0, 23, 1) });
    if (!ACTION_SOURCES[c.source]) schema.push({ name: "entity", selector: { entity: { domain: "sensor" } } });
    schema.push(
      { name: "name", selector: { text: {} } },
      { name: "icon", selector: { icon: {} } },
      { name: "follow_chart", selector: { boolean: {} } }
    );
    if (c.follow_chart === false) {
      schema.push({ name: "mode", selector: choice(tx.modes) }, { name: "palette", selector: choice(tx.palettes) });
      if (c.palette === "custom") {
        schema.push({ name: "color_low", selector: { color_rgb: {} } }, { name: "color_high", selector: { color_rgb: {} } });
      }
      schema.push(
        { name: "color_steps", selector: num_(2, 6, 1) },
        advancedSection(tx, c, lang, [{ name: "decimals", selector: num_(0, 4, 1) }])
      );
    }
    return schema;
  }

  normalize(c) {
    cleanSource(c);
    if (!c.block_window) { delete c.block_from; delete c.block_until; }
    if (c.mode === "purchase") delete c.mode;
    if (c.show !== "appliance") { delete c.appliance_kwh; delete c.appliance_hours; }
    if (c.palette === "custom") {
      if (c.color_low == null) c.color_low = CUSTOM_LOW_RGB;
      if (c.color_high == null) c.color_high = CUSTOM_HIGH_RGB;
    }
    return c;
  }
}


// Usage card: bars of your electricity use per hour, coloured by the price of
// that hour, with an optional score for how well the use was timed. Prices
// come from a price card on the dashboard (or its own settings); use comes
// from the recorder's hourly statistics of an energy meter.
class UsageCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("electricity-price-planner-usage-card-editor");
  }

  static getStubConfig(hass) {
    const meter = Object.keys(hass.states).find(
      (id) => id.startsWith("sensor.") && hass.states[id].attributes.device_class === "energy"
    );
    return { energy_entity: meter ? [meter] : [] };
  }

  setConfig(config) {
    this._config = { show_score: true, height: 160, decimals: 2, ...config };
    // Days back from today; the arrows on the card change it. The old "day"
    // option only sets where the card starts.
    this._offset = this._config.day === "yesterday" ? 1 : 0;
    // Text size in px, as on the price card; the chart's labels scale with it.
    this._fs = Math.min(Math.max(Number(this._config.font_size) || 14, 10), 24);
    this._k = this._fs / 14;
    this._key = null;
    this._statsKey = null;
    this._onPrices = this._onPrices || (() => { this._key = null; if (this._hass) this.hass = this._hass; });
    if (this._hass) this.hass = this._hass;
  }

  connectedCallback() {
    window.addEventListener("energy-price-settings", this._onPrices);
    const box = this.shadowRoot && this.shadowRoot.querySelector(".chart");
    if (box && this._observer) this._observer.observe(box);
  }

  disconnectedCallback() {
    window.removeEventListener("energy-price-settings", this._onPrices);
    if (this._observer) this._observer.disconnect();
  }

  getCardSize() {
    return Math.ceil((Number(this._config.height) + 110) / 50);
  }

  getGridOptions() {
    return { columns: "full", min_columns: 6, rows: "auto", min_rows: 4 };
  }

  set hass(hass) {
    this._hass = hass;
    const c = followedSettings(this._config);
    const state = hass.states[c.entity];
    const key = [state && state.last_updated, Math.floor(Date.now() / 900000), language(hass), this._statsVersion || 0, this._offset].join("|");
    if (key === this._key) return;
    this._key = key;
    this._render(c, state);
  }

  // Hourly statistics from the recorder: each energy meter's change per hour
  // and, for past days, the price sensor's mean per hour. Today is fetched
  // again after 15 minutes; past days do not change, so they are kept (the
  // last 14 days looked at).
  _stats(c, meters, dayStart, dayEnd, today) {
    const ids = [...meters];
    if (!today && c.entity && !ACTION_SOURCES[c.source]) ids.push(c.entity);
    const want = JSON.stringify([ids, dayStart.getTime()]);
    this._statsCache = this._statsCache || new Map();
    const hit = this._statsCache.get(want);
    const fresh = hit && (!today || Date.now() - hit.time < 15 * 60000);
    if (!fresh && !this._statsLoading && this._hass.callWS) {
      this._statsLoading = true;
      this._hass
        .callWS({
          type: "recorder/statistics_during_period",
          start_time: dayStart.toISOString(),
          end_time: dayEnd.toISOString(),
          statistic_ids: ids,
          period: "hour",
          types: ["change", "mean"],
        })
        .then((r) => {
          this._statsCache.delete(want);
          this._statsCache.set(want, { time: Date.now(), data: r || {} });
          if (this._statsCache.size > 14) this._statsCache.delete(this._statsCache.keys().next().value);
          this._statsError = null;
        })
        .catch((e) => { this._statsError = (e && e.message) || String(e); })
        .finally(() => { this._statsLoading = false; this._statsVersion = (this._statsVersion || 0) + 1; this._onPrices(); });
    }
    return hit ? hit.data : {};
  }

  _step(delta) {
    this._offset = Math.max((this._offset || 0) + delta, 0);
    if (this._hass) this.hass = this._hass;
  }

  _render(c, state) {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const lang = language(this._hass);
    const t = TEXTS[lang];
    this._cur = currencyOf(c, state);
    const money = (v) => euro(v, c.decimals, lang, this._cur);
    // One meter or several (for example high and low tariff), added up.
    const meters = [].concat(c.energy_entity || []).filter((id) => typeof id === "string" && id);
    const offset = this._offset || 0;
    const today = offset === 0;
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - offset);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const hours = Math.round((dayEnd - dayStart) / HOUR);
    const stats = meters.length ? this._stats(c, meters, dayStart, dayEnd, today) : {};
    const slot = (time) => Math.round((time - dayStart) / HOUR);

    // The price of each hour: from the price list where it still covers the
    // day (quarter hours are averaged), otherwise from the price sensor's
    // hourly statistics.
    const hourPrice = new Map();
    const sums = new Map();
    for (const p of readPrices(this._hass, state, c, this._onPrices).list) {
      if (p.t < dayStart || p.t >= dayEnd) continue;
      const i = Math.floor((p.t - dayStart) / HOUR);
      const sum = sums.get(i) || [0, 0];
      sums.set(i, [sum[0] + p.price, sum[1] + 1]);
    }
    for (const [i, [sum, n]] of sums) hourPrice.set(i, sum / n);
    if (!today && c.entity) {
      const factor = unitFactor(c, state);
      for (const r of stats[c.entity] || []) {
        const i = slot(new Date(r.start));
        if (r.mean != null && !hourPrice.has(i)) hourPrice.set(i, r.mean * factor);
      }
    }
    const usage = new Map();
    for (const id of meters) {
      for (const r of stats[id] || []) {
        const i = slot(new Date(r.start));
        usage.set(i, (usage.get(i) || 0) + Math.max(Number(r.change) || 0, 0));
      }
    }

    // Score: where the average price paid lies between the day's most
    // expensive (0) and cheapest (100) hour. Today only counts hours so far.
    const lastHour = today ? Math.floor((Date.now() - dayStart) / HOUR) + 1 : hours;
    const known = [...hourPrice.entries()].filter(([i]) => i < lastHour);
    let kwh = 0, cost = 0;
    for (const [i, u] of usage) if (hourPrice.has(i) && i < lastHour) { kwh += u; cost += u * hourPrice.get(i); }
    const prices = known.map(([, v]) => v);
    const min = prices.length ? Math.min(...prices) : 0, max = prices.length ? Math.max(...prices) : 0;
    const paid = kwh > 0 ? cost / kwh : null;
    const dayAvg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
    const score = paid != null && max > min ? Math.round((100 * (max - paid)) / (max - min)) : null;

    const dayName =
      offset === 0 ? t.todaySoFar
      : offset === 1 ? t.yesterday
      : dayStart.toLocaleDateString(lang, { weekday: "short", day: "numeric", month: "short", year: dayStart.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
    const nav = `<div class="nav"><button class="step" data-step="1" title="${esc(t.prevDay)}" aria-label="${esc(t.prevDay)}">‹</button><span class="day">${esc(dayName)}</span><button class="step" data-step="-1" title="${esc(t.nextDay)}" aria-label="${esc(t.nextDay)}"${today ? " disabled" : ""}>›</button></div>`;

    let body;
    if (!meters.length) body = `<p class="msg">${t.chooseEnergy}</p>`;
    else if (this._statsError) body = nav + `<p class="msg">${esc(t.failed(this._statsError))}</p>`;
    else if (!usage.size) body = nav + `<p class="msg">${this._statsLoading ? t.loading : t.noUsage}</p>`;
    else {
      let text = nav + `<div class="summary">`;
      if (paid != null) text += `<span>${t.paid} <b>${money(paid)}</b></span>`;
      if (dayAvg != null) text += `<span>${t.dayAvg} ${money(dayAvg)}</span><span>${t.bestPossible} ${money(min)}</span>`;
      text += `</div>`;
      if (score != null && c.show_score !== false) {
        const grade = score >= 75 ? t.great : score >= 50 ? t.good : t.ok;
        text += `<div class="score"><b>${t.score} ${score}/100</b> · ${grade}<div class="meter"><span style="width:${score}%; background:${esc(bandColour(c, 1 - score / 100))}"></span></div></div>`;
      }
      this._chartArgs = [c, hours, hourPrice, usage, lang];
      body = text + `<div class="chart"></div>`;
    }

    const title = c.show_title === false ? "" : (typeof c.title === "string" && c.title.trim()) || t.usageTitle;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .wrap { padding: 0 16px 12px; }
        ha-card:not([header]) .wrap { padding-top: 12px; }
        .msg { color: var(--secondary-text-color); margin: 0; }
        .nav { display: flex; align-items: center; gap: 4px; margin: 0 0 6px -8px; }
        .day { font-size: ${this._fs}px; font-weight: 500; min-width: 7em; text-align: center; }
        .step { background: none; border: none; color: var(--primary-text-color); font: inherit; font-size: ${Math.round(22 * this._k)}px; line-height: 1; width: ${Math.round(36 * this._k)}px; height: ${Math.round(32 * this._k)}px; border-radius: ${Math.round(16 * this._k)}px; cursor: pointer; }
        .step:hover:not(:disabled) { background: var(--secondary-background-color, rgba(127,127,127,.15)); }
        .step:disabled { color: var(--disabled-text-color, #bdbdbd); cursor: default; }
        .summary { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: ${this._fs}px; color: var(--secondary-text-color); margin-bottom: 6px; }
        .summary b, .score b { color: var(--primary-text-color); font-weight: 500; }
        .score { font-size: ${this._fs}px; color: var(--secondary-text-color); margin-bottom: 8px; }
        .meter { height: 6px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); margin-top: 4px; overflow: hidden; }
        .meter span { display: block; height: 100%; border-radius: 3px; }
        .chart { position: relative; height: ${Math.max(Number(c.height) || 160, 80)}px; }
        .chart svg { position: absolute; inset: 0; display: block; }
        text { fill: var(--secondary-text-color); font-size: ${Math.round(11 * this._k * 10) / 10}px; font-family: inherit; }
        .grid { stroke: var(--divider-color, rgba(127,127,127,.3)); }
        .nodata { fill: var(--disabled-text-color, #bdbdbd); }
      </style>
      <ha-card${title ? ` header="${esc(title)}"` : ""}><div class="wrap">${body}</div></ha-card>`;
    if (!this._clicks) {
      this._clicks = true;
      this.shadowRoot.addEventListener("click", (e) => {
        const b = e.target.closest && e.target.closest("button[data-step]");
        if (b && !b.disabled) this._step(Number(b.dataset.step));
      });
    }
    // The chart is drawn at its real size in pixels, so its labels keep the
    // same text size however wide the card is; redrawn when the box resizes.
    const box = this.shadowRoot.querySelector(".chart");
    if (!this._observer) this._observer = new ResizeObserver(() => this._draw());
    this._observer.disconnect();
    if (box) {
      this._observer.observe(box);
      this._draw();
    }
  }

  _draw() {
    const box = this.shadowRoot && this.shadowRoot.querySelector(".chart");
    if (!box || !this._chartArgs || box.clientWidth < 20) return;
    box.innerHTML = this._chart(...this._chartArgs, box.clientWidth, box.clientHeight);
  }

  _chart(c, hours, hourPrice, usage, lang, W, H) {
    const k = this._k, L = 34 * k, R = 4, T = 8 * k, B = 18 * k;
    const pw = W - L - R, ph = H - T - B, bw = pw / hours;
    const top = Math.max(...usage.values(), 0.1);
    // kWh lines in steps of 0.1, 0.2, 0.5, 1, 2, 5 … at least 22 px apart.
    const steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
    const step = steps.find((s) => (ph * s) / (Math.ceil(top / s) * s) >= 22 * k) || 100;
    const hi = Math.ceil(top / step) * step;
    const y = (v) => T + ((hi - v) / hi) * ph;
    const prices = [...hourPrice.values()];
    const min = Math.min(...prices), max = Math.max(...prices);
    let svg = "";
    for (let v = 0; v <= hi + 1e-9; v += step) {
      svg += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>`;
      svg += `<text x="${L - 4}" y="${y(v) + 4 * k}" text-anchor="end">${num(v, step < 1 ? 1 : 0, lang)}</text>`;
    }
    // Hour labels every 1, 2, 3 or 6 hours, at least about 30 px apart.
    const every = [1, 2, 3, 6].find((n) => n * bw >= 30 * k) || 6;
    for (let i = 0; i < hours; i += every) svg += `<text x="${L + i * bw}" y="${H - 4 * k}" text-anchor="middle">${i}</text>`;
    for (const [i, u] of usage) {
      if (i < 0 || i >= hours) continue;
      const p = hourPrice.get(i);
      let f = p != null && max > min ? (p - min) / (max - min) : 0.5;
      if (c.mode === "feed_in") f = 1 - f;
      const fill = p == null ? null : p < 0 ? NEGATIVE_COLOUR : bandColour(c, f);
      const tip = `${String(i).padStart(2, "0")}:00: ${num(u, 2, lang)} kWh${p != null ? ` · ${euro(p, c.decimals, lang, this._cur)}` : ""}`;
      svg += `<rect ${fill ? `style="fill: ${esc(fill)}"` : `class="nodata"`} x="${L + i * bw + 1}" y="${y(u)}" width="${Math.max(bw - 2, 1)}" height="${Math.max(y(0) - y(u), 0.5)}"><title>${esc(tip)}</title></rect>`;
    }
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">${svg}</svg>`;
  }
}

class UsageCardEditor extends FormEditor {
  texts(lang) {
    return EDITOR_TEXTS[lang];
  }

  withDefaults(c) {
    return {
      show_title: true,
      show_score: true,
      height: 160,
      font_size: 14,
      follow_chart: true,
      palette: "traffic",
      color_steps: 3,
      source: "attribute",
      price_unit: "auto",
      currency: "auto",
      ...c,
      // Older set-ups have one meter as text; the form wants a list.
      energy_entity: [].concat(c.energy_entity || []),
    };
  }

  schema(tx, c, lang) {
    const schema = [
      { name: "energy_entity", required: true, selector: { entity: { domain: "sensor", device_class: "energy", multiple: true } } },
      { name: "show_title", selector: { boolean: {} } },
    ];
    if (c.show_title !== false) schema.push({ name: "title", selector: { text: {} } });
    schema.push(
      { name: "show_score", selector: { boolean: {} } },
      { name: "height", selector: num_(80, 600, 10, "px") },
      { name: "font_size", selector: num_(10, 24, 1, "px") },
      { name: "follow_chart", selector: { boolean: {} } },
    );
    if (c.follow_chart === false) {
      if (!ACTION_SOURCES[c.source]) schema.push({ name: "entity", selector: { entity: { domain: "sensor" } } });
      schema.push({ name: "palette", selector: choice(tx.palettes) });
      if (c.palette === "custom") schema.push(colourPair());
      schema.push({ name: "color_steps", selector: num_(2, 6, 1) }, advancedSection(tx, c, lang, [{ name: "decimals", selector: num_(0, 4, 1) }]));
    }
    return schema;
  }

  normalize(c) {
    cleanSource(c);
    if (c.palette === "custom") {
      if (c.color_low == null) c.color_low = CUSTOM_LOW_RGB;
      if (c.color_high == null) c.color_high = CUSTOM_HIGH_RGB;
    }
    delete c.day;
    return c;
  }
}

// Each element is guarded, so loading the file twice (for example manually
// and via HACS) does not break the dashboard.
for (const [name, cls] of [
  ["electricity-price-planner-card", PriceChartCard],
  ["electricity-price-planner-card-editor", PriceChartCardEditor],
  ["electricity-price-planner-badge", PriceBadge],
  ["electricity-price-planner-badge-editor", PriceBadgeEditor],
  ["electricity-price-planner-usage-card", UsageCard],
  ["electricity-price-planner-usage-card-editor", UsageCardEditor],
]) {
  if (!customElements.get(name)) customElements.define(name, cls);
}
console.info(`electricity-price-planner ${VERSION}`);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "electricity-price-planner-card",
  name: "Electricity Price Planner card",
  description: "Hourly electricity prices for today and tomorrow",
  preview: true,
});
window.customCards.push({
  type: "electricity-price-planner-usage-card",
  name: "Electricity Price Planner usage",
  description: "Your electricity use per hour, coloured by price, with a score",
  preview: false,
});
window.customBadges = window.customBadges || [];
window.customBadges.push({
  type: "electricity-price-planner-badge",
  name: "Electricity Price Planner badge",
  description: "Price now, cheapest hour or block still to come, or the price at a set hour",
  preview: true,
});
