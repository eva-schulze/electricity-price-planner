# Pure Energie Price Card

A Home Assistant dashboard card and badges that show the hourly electricity
prices of a Pure Energie dynamic contract for **today and tomorrow**: a bar
chart, plus badges for the top of a dashboard.

It reads the price list from the
[Pure Energie Prices](https://github.com/venraij/hacs-pure-energy-prices)
custom integration. Home Assistant's built-in charts only show history, so they
cannot show the prices still to come.

![Pure Energie Price Card with sample prices](images/screenshot.png)

*Screenshot with made-up sample prices.*

> This is a community project. It is not made by, endorsed by or affiliated with
> Pure Energie or the author of the Pure Energie Prices integration.

## Features

- Hourly bars from midnight today to midnight tomorrow. Tomorrow fills in as
  soon as Pure Energie publishes the prices (usually in the afternoon).
- Hover over, tap or drag across the bars to see the exact price of an hour
  below the chart. Works on touchscreens.
- Colours relative to the prices shown: by default green for the cheapest
  third of the price range, orange for the middle, red for the most expensive
  third. Choose 2 to 6 colour steps for a coarser or more gradual scale.
- Colour palettes: green – orange – red, **blue – orange for red-green colour
  blindness**, a simple modern grey scale, or your own two colours (the steps
  in between are blended automatically).
- Past hours faded, the current hour outlined.
- Optional: night hours shaded.
- Optional: text above the chart, each line on or off: the price now, the
  cheapest hour still to come (price, day and hour) and the cheapest block.
- Optional: cheapest block of N hours, for example the best 3 hours for the
  washing machine, marked with a bracket in the chart.
- Optional: badges for the top of a dashboard: price now, cheapest hour,
  cheapest block (still to come, today, tomorrow or both) and the price at a
  set hour.
- English, Dutch, German, French and Spanish, following the language of your
  Home Assistant user (other languages fall back to English). Prices use that
  language's format, for example `€0.28`, `€ 0,28` or `0,28 €`.
- Price lines every 5 cents, or a multiple of 5 cents when the chart is low.
- Optional: fixed top of the scale, so you can compare days at a glance.
- Settings form in the dashboard editor, like Home Assistant's own cards.
- Width via the Layout tab in sections dashboards; adjustable chart height.
- Follows your Home Assistant theme, light and dark.
- One small JavaScript file, no external libraries, no network requests.

## Requirements

- Home Assistant 2024.11 or newer.
- The [Pure Energie Prices](https://github.com/venraij/hacs-pure-energy-prices)
  integration, version 0.2.4 or newer, with electricity enabled.

The card only understands the price list of that integration. It does not work
with other price integrations such as EnergyZero, easyEnergy or Nord Pool.

## Installation

### HACS (recommended)

1. In HACS, open the three-dot menu → **Custom repositories**.
2. Repository: `https://github.com/eva-schulze/pure-energie-price-card`,
   type: **Dashboard**. Click **Add**.
3. Search for **Pure Energie Price Card** and download it.
4. Reload the browser (Ctrl+F5 / Cmd+Shift+R).

### Manual

1. Copy `pure-energie-price-card.js` to the `www` folder of your Home Assistant
   configuration (create the folder if needed, then restart Home Assistant
   once).
2. Turn on **Advanced mode** in your user profile.
3. Go to **Settings → Dashboards → three-dot menu → Resources → Add resource**:
   - URL: `/local/pure-energie-price-card.js?v=1`
   - Resource type: **JavaScript module**
4. Reload the browser. After replacing the file with a newer version, raise
   `?v=1` to `?v=2` and so on, or the browser keeps the old one.

## Adding the card

**Edit dashboard → Add card**, search for **Pure Energie price card**. The
settings form opens. Or use **Manual** with YAML:

```yaml
type: custom:pure-energie-price-card
entity: sensor.pure_energie_electricity_import
```

Use the integration's plain price sensor (not the "raw" or "percentile"
sensors). Your entity ID may differ; check it under **Settings → Devices &
services → Entities**.

## Options

| Option | Default | Description |
|---|---|---|
| `entity` | *(required)* | The Pure Energie Prices price sensor. |
| `show_title` | `true` | Set to `false` to hide the title. |
| `title` | `Electricity price` / `Stroomprijs` | Card title. Empty uses the default in the dashboard's language. |
| `show_summary` | `true` | Set to `false` to hide all text above the chart. |
| `summary_now`, `summary_cheapest`, `summary_block` | `true` | Hide single lines of that text: the price now, the cheapest hour still to come, the cheapest block. |
| `show_info` | `true` | Set to `false` to hide the price line below the chart (hovering or tapping still highlights the bar). |
| `height` | `180` | Chart height in pixels. In a sections dashboard with a fixed height on the Layout tab, the chart fills that height instead. |
| `fixed_scale` | on if `y_max` is set | Use `y_max` as the top of the scale. |
| `y_max` | – | Top of the scale in €/kWh, for example `0.40`. A higher price still stretches the scale, so no bar is cut off. |
| `decimals` | `2` | Decimals for prices in the text above and below the chart. |
| `palette` | `traffic` | `traffic` (green – orange – red), `colorblind` (blue – orange), `grey` (simple modern grey scale), or `custom`. |
| `color_low` | `#0072b2` | Colour for the cheapest prices with `palette: custom`. A CSS colour or `[r, g, b]`. |
| `color_high` | `#e69f00` | Colour for the most expensive prices with `palette: custom`. |
| `color_steps` | `3` | Number of colour bands, 2 to 6. |
| `block_hours` | `0` | Show the cheapest run of this many consecutive hours still to come. `0` = off, maximum 12. |
| `block_color` | colour of the cheapest prices | Colour of the bracket over the cheapest block. A CSS colour or `[r, g, b]`. |
| `font_size` | `14` | Text size in pixels, 10 to 24. The chart's labels scale along; the title follows your theme. |
| `night_shading` | `true` | Set to `false` to turn the night shading off. |
| `night_start` | `22` | First hour with night shading. |
| `night_end` | `6` | Last hour with night shading (included). |

Example:

```yaml
type: custom:pure-energie-price-card
entity: sensor.pure_energie_electricity_import
title: Stroomprijs
height: 240
y_max: 0.40
decimals: 3
palette: colorblind
color_steps: 5
block_hours: 3
night_start: 23
night_end: 6
```

## Badges

The same file also provides a badge for the top of a dashboard view. In the
dashboard editor, add a badge and choose **Pure Energie price badge**, or add
it in YAML under the view's `badges:`:

```yaml
badges:
  - type: custom:pure-energie-price-badge
    entity: sensor.pure_energie_electricity_import
    show: block
    block_hours: 3
    name: Washing machine
    icon: mdi:washing-machine
```

| Option | Default | Description |
|---|---|---|
| `entity` | *(required)* | The Pure Energie Prices price sensor. |
| `show` | `now` | `now` (price now), `cheapest` (cheapest hour), `block` (cheapest run of hours) or `at` (price at a set hour). |
| `range` | `upcoming` | For `cheapest` and `block`: `upcoming` (hours still to come), `today` (whole day), `tomorrow` (whole day) or `both`. |
| `block_hours` | `3` | Hours in the block, 1 to 12. |
| `hour` | `6` | For `at`: the hour to show. The badge shows the next time the clock reaches it: today if it has not passed yet, otherwise tomorrow once that price is known. |
| `name` | automatic | Replaces the label. |
| `icon` | per type | Any `mdi:` icon. |
| `decimals`, `palette`, `color_low`, `color_high`, `color_steps` | as for the card | The icon takes the colour of the price, compared with all known prices. |

While a price is not known yet (for example tomorrow's prices in the morning),
a badge shows a dash; hover over it to read "not known yet".

## How the prices are shown

- The card shows exactly the prices the integration provides, including any
  added costs you configured there. It does not calculate anything itself.
- Colours split the price range shown (today and, once known, tomorrow) into
  equal bands (three by default, see `color_steps`). They say how an hour
  compares with the other hours shown, not whether a day is cheap; use `y_max`
  for that.
- The cheapest block starts after the current hour and only uses hours whose
  prices are known, so it can move once tomorrow's prices arrive.
- Times are shown in the time zone of the device viewing the dashboard.
- The card's version is printed in the browser console when it loads, which
  helps when reporting a problem.

## Privacy

The card makes no network requests. It only reads the price sensor from your
own Home Assistant. Fetching the prices from Pure Energie is done by the
integration, not by this card.

## Support and suggestions

I maintain this card in my free time. I'll try to help, but answers can take a
while, and there is no guaranteed support. The card is provided as is, without
warranty. You're welcome to:

- report a problem or suggest an improvement by opening an issue;
- send a change as a pull request;
- use the code as the basis for your own version (MIT licence).

Suggestions that help others too, I'll try to add to the project.

## Licence

[MIT](LICENSE)
