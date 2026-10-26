# Pure Energie Price Card

A Home Assistant dashboard card and badges that show dynamic electricity
prices for **today and tomorrow**, per hour or per quarter hour: a bar chart,
plus badges for the top of a dashboard. Home Assistant's built-in charts only
show history, so they cannot show the prices still to come.

> **Version 2 works with many price integrations, but I could only test it on
> my own installation with Pure Energie Prices.** The other formats are
> recognised from those integrations' code and were tested with sample data.
> Feedback is very welcome: open an issue saying which integration you use and
> whether the prices look right. Version 1.1.0 supports Pure Energie Prices
> only.

![Pure Energie Price Card with sample prices](images/screenshot.png)

*Screenshot with made-up sample prices.*

> This is a community project. It is not made by, endorsed by or affiliated with
> Pure Energie or the author of the Pure Energie Prices integration.

## Features

- Bars from midnight today to midnight tomorrow, per hour or per quarter
  hour. Tomorrow fills in as soon as the prices are published (usually in the
  afternoon).
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
  cheapest block, average price (still to come, today, tomorrow or both) and
  the price at a set hour.
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
- A price integration with the prices for today and tomorrow:

| Integration | How the card gets the prices | Status |
|---|---|---|
| [Pure Energie Prices](https://github.com/venraij/hacs-pure-energy-prices) 0.2.4+ | sensor attribute | Tested by me |
| [Nord Pool (custom)](https://github.com/custom-components/nordpool) | sensor attribute | Not tested yet |
| [ENTSO-e](https://github.com/JaccoR/hass-entso-e) | sensor attribute | Not tested yet |
| [Frank Energie](https://github.com/HiDiHo01/home-assistant-frank_energie) | sensor attribute | Not tested yet |
| [Octopus Energy](https://github.com/BottlecapDave/HomeAssistant-OctopusEnergy) | sensor attribute | Not tested yet |
| [EPEX Spot](https://github.com/mampfes/ha_epex_spot) | sensor attribute | Not tested yet |
| PVPC (built-in, Spain) | sensor attribute | Not tested yet |
| EnergyZero (built-in) | action | Not tested yet |
| easyEnergy (built-in) | action | Not tested yet |
| Nord Pool (built-in) | action | Not tested yet |
| Tibber (built-in) | action | Not tested yet |
| Other integrations with a price list in an attribute | sensor attribute, own field names | – |

Prices per hour, half hour or quarter hour all work. The unit (per kWh, cents
or per MWh) and the currency are read from the sensor where possible and can
be set by hand.

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

Choose the sensor of your integration that carries the price list. For Pure
Energie Prices that is the plain price sensor (not the "raw" or "percentile"
sensors). Your entity ID may differ; check it under **Settings → Devices &
services → Entities**, where the sensor's attributes show the list.

For EnergyZero, easyEnergy, the built-in Nord Pool and Tibber, open
**Advanced settings** at the bottom of the form and choose the integration
under **Where the prices come from**; no sensor is needed then.

## Options

| Option | Default | Description |
|---|---|---|
| `entity` | *(required)* | The price sensor. |
| `source` | `attribute` | `attribute` (a sensor), or an action: `energyzero`, `easyenergy`, `nordpool`, `tibber`. |
| `config_entry` | – | For `energyzero`, `easyenergy` and `nordpool`: the integration entry (chosen from a list in the form). |
| `area` | first | `nordpool`: the price area, for example `NL` or `SE3`. `tibber`: the name of the home. |
| `incl_vat` | `true` | `energyzero` and `easyenergy`: prices including VAT. |
| `attribute` | found automatically | Attribute with the price list. Several separated by commas, for example `raw_today, raw_tomorrow`. |
| `time_key` | found automatically | Field with the start time in each entry. A dot for nested fields, for example `date.full`. |
| `price_key` | found automatically | Field with the price, for example `price` or `value`. |
| `price_unit` | `auto` | `auto` (from the sensor), `kwh` (for example €/kWh), `cent` (ct, p, öre per kWh) or `mwh` (per MWh). |
| `currency` | `auto` | `auto` (from the sensor, else euro) or a code such as `EUR`, `GBP`, `SEK`, `NOK`, `DKK`, `CHF`, `PLN`. |
| `price_factor` | `1` | YAML only: multiply all prices, for unusual units. |
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

Where the prices come from, their unit and currency, the number of decimals
and the text size are under **Advanced settings**, folded away at the bottom
of the form. If the prices are 100 or 1000 times too high, set the unit to
cents or per MWh. If the card shows "No prices available yet" although the
sensor has a price list, switch on **Set the data format myself** and fill in
the attribute and field names.

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
| `entity` | from the price card | The price sensor. Can stay empty when a price card is on the dashboard. |
| `show` | `now` | `now` (price now), `cheapest` (cheapest hour), `block` (cheapest run of hours), `average` (average price) or `at` (price at a set hour). |
| `range` | `upcoming` | For `cheapest`, `block` and `average`: `upcoming` (hours still to come), `today` (whole day), `tomorrow` (whole day) or `both`. |
| `block_hours` | `3` | Hours in the block, 1 to 12. |
| `hour` | `6` | For `at`: the hour to show. The badge shows the next time the clock reaches it: today if it has not passed yet, otherwise tomorrow once that price is known. With quarter-hour prices, the hour's four prices are averaged. |
| `follow_chart` | `true` | Take colours, currency, unit and data source from a price card on the dashboard: the one for the same sensor, or the last one that loaded if the badge has no sensor. Switch off to set them on the badge. |
| `name` | automatic | Replaces the label. |
| `icon` | per type | Any `mdi:` icon. |
| `decimals`, `palette`, `color_low`, `color_high`, `color_steps`, `source`, `price_unit`, `currency` and the other data settings | as for the card | Used when `follow_chart` is off. The icon takes the colour of the price, compared with all known prices. |

While a price is not known yet (for example tomorrow's prices in the morning),
a badge shows a dash; hover over it to read "not known yet".

## How the prices are shown

- The card shows exactly the prices the integration provides, including any
  added costs you configured there. It does not calculate anything itself.
- Colours split the price range shown (today and, once known, tomorrow) into
  equal bands (three by default, see `color_steps`). They say how an hour
  compares with the other hours shown, not whether a day is cheap; use `y_max`
  for that.
- The cheapest block starts after the current hour (or quarter hour) and only
  uses prices that are known, so it can move once tomorrow's prices arrive.
- Times are shown in the time zone of the device viewing the dashboard.
- The card's version is printed in the browser console when it loads, which
  helps when reporting a problem.

## Privacy

The card makes no network requests. It only reads the price sensor from your
own Home Assistant. Fetching the prices is done by your price integration,
not by this card.

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
