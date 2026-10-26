# Electricity Price Planner

Plan your power use around dynamic electricity prices. A Home Assistant card
and badges that show the energy prices of a dynamic tariff for **today and
tomorrow**, per hour or per quarter hour, and find the cheapest hours: for the
washing machine, the dishwasher or charging the car. Home Assistant's built-in
charts only show history, so they cannot show the prices still to come.

It works with the price integrations of many suppliers and markets, such as
Tibber, Octopus Energy, Frank Energie, Pure Energie, Nord Pool, ENTSO-e, EPEX
Spot, EnergyZero and easyEnergy. See the list at the end.

> **Feedback welcome.** I could only test version 2 on my own installation,
> with Pure Energie Prices. The other integrations are recognised from their
> code and were tested with sample data. If you use one of them, please open
> an issue and say whether the prices look right. Version 1.1.0 supports Pure
> Energie Prices only.

![Electricity Price Planner with sample prices](images/screenshot.png)

*Screenshot with made-up sample prices.*

> This is a community project. It is not made by, endorsed by or affiliated with
> any energy supplier or with the authors of the price integrations.

## Features

**Price chart**

- Bars from midnight today to midnight tomorrow, per hour, half hour or
  quarter hour. Tomorrow fills in as soon as the prices are published (usually
  in the afternoon).
- Hover over, tap or drag across the bars to see the exact price below the
  chart. Works on touchscreens.
- Colours relative to the prices shown, in 2 to 6 steps.
- Colour palettes: green – orange – red, blue – orange for red-green colour
  blindness, a simple modern grey scale, or your own two colours (the steps in
  between are blended automatically).
- Past hours faded, the current hour outlined.
- Price lines every 5 cents, or a multiple of 5 cents when the chart is low.
- Optional: negative prices in their own colour, with a line at zero.
- Optional: a dashed line at each day's average price.
- Optional: night hours shaded.
- Optional: fixed top of the scale, so you can compare days at a glance.
- Optional: compact mode, only the bars, for small cards.
- Optional: feed-in mode for solar panels, as a separate chart. High prices
  are good there, so the colours turn around and the card looks for the
  highest prices.

**Planning**

- Optional: text above the chart, each line on or off: the price now, the
  cheapest hour still to come, and the cheapest block.
- Optional: cheapest block of N hours, marked with a bracket in the chart,
  for example the best 3 hours for the washing machine.
- Optional: only within set hours, for example a block that must start after
  22:00 and be finished by 07:00.

**Badges** for the top of a dashboard:

- Price now, next price (trend), price at a set hour.
- Cheapest hour, highest price, average price: still to come, today,
  tomorrow, or both days. With "today" this gives the day's minimum and
  maximum.
- Cheapest block of hours, optionally within set hours.
- Negative prices: how many hours, and when they start.
- Cost of an appliance: what one run costs now and at the cheapest start,
  from the energy per run and its duration (for example a washing machine).

**Usage card** (optional, a separate card):

- Your electricity use per hour as bars, each coloured by the price of that
  hour, for today so far or yesterday.
- The average price you paid, compared with the day's average and the best
  possible price.
- A score from 0 to 100 for how well your use was timed.

**General**

- Settings form in the dashboard editor, grouped in folding sections.
- English, Dutch, German, French and Spanish, following the language of your
  Home Assistant user (other languages fall back to English). Prices use that
  language's format, for example `€0.28`, `€ 0,28` or `0,28 €`.
- Prices in euro, pound, Swedish, Norwegian or Danish krone, Swiss franc,
  Polish złoty and more; read from the sensor or chosen by hand.
- Width via the Layout tab in sections dashboards; adjustable chart height.
- Follows your Home Assistant theme, light and dark.
- One JavaScript file, no external libraries, no network requests of its own.

## Requirements

- Home Assistant 2024.11 or newer.
- A price integration with the prices for today and tomorrow (see
  [Supported price integrations](#supported-price-integrations)).
- For the usage card: an energy meter in kWh, for example the one in the
  Energy dashboard.

## Installation

### HACS (recommended)

1. In HACS, open the three-dot menu → **Custom repositories**.
2. Repository: `https://github.com/eva-schulze/electricity-price-planner`,
   type: **Dashboard**. Click **Add**.
3. Search for **Electricity Price Planner** and download it.
4. Reload the browser (Ctrl+F5 / Cmd+Shift+R).

### Manual

1. Copy `electricity-price-planner.js` to the `www` folder of your Home
   Assistant configuration (create the folder if needed, then restart Home
   Assistant once).
2. Turn on **Advanced mode** in your user profile.
3. Go to **Settings → Dashboards → three-dot menu → Resources → Add resource**:
   - URL: `/local/electricity-price-planner.js?v=1`
   - Resource type: **JavaScript module**
4. Reload the browser. After replacing the file with a newer version, raise
   `?v=1` to `?v=2` and so on, or the browser keeps the old one.

## Price card

**Edit dashboard → Add card**, search for **Electricity Price Planner card**.
The settings form opens. Or use **Manual** with YAML:

```yaml
type: custom:electricity-price-planner-card
entity: sensor.pure_energie_electricity_import
```

Choose the sensor of your integration that carries the price list. Your
entity ID may differ; check it under **Settings → Devices & services →
Entities**, where the sensor's attributes show the list. For EnergyZero,
easyEnergy, the built-in Nord Pool and Tibber, open **Advanced settings** and
choose the integration under **Where the prices come from**; no sensor is
needed then.

The form shows the essentials on top and the rest in folding sections. The
options, in the same groups:

| Option | Default | Description |
|---|---|---|
| `entity` | *(required for sensors)* | The price sensor. |
| `mode` | `purchase` | `purchase` or `feed_in` (high prices are good: colours turned around, highest prices searched). |
| `show_title` | `true` | Set to `false` to hide the title. |
| `title` | in the dashboard's language | Card title. Empty uses the default. |
| **Text** | | |
| `show_summary` | `true` | Text above the chart. |
| `summary_now`, `summary_cheapest`, `summary_block` | `true` | Single lines of that text. |
| `show_info` | `true` | The price line below the chart. |
| **Chart** | | |
| `height` | `180` | Chart height in pixels. With a fixed height on the Layout tab, the chart fills that height instead. |
| `compact` | `false` | Only the bars, without price and hour labels. |
| `fixed_scale`, `y_max` | off | Fixed top of the scale per kWh, for example `0.40`. A higher price still stretches the scale. |
| `show_average` | `false` | A dashed line at each day's average price. |
| `highlight_negative` | `true` | Negative prices in their own colour (purple). |
| `night_shading`, `night_start`, `night_end` | on, `22`, `6` | Shaded night hours (`night_end` included). |
| **Colours** | | |
| `palette` | `traffic` | `traffic`, `colorblind` (blue – orange), `grey` (simple modern grey scale) or `custom`. |
| `color_low`, `color_high` | blue, orange | Your own colours with `palette: custom`. A CSS colour or `[r, g, b]`. |
| `color_steps` | `3` | Number of colour bands, 2 to 6. |
| **Cheapest block** | | |
| `block_hours` | `0` | Length of the cheapest block in hours, up to 12. `0` = off. |
| `block_window`, `block_from`, `block_until` | off, `22`, `7` | Only within set hours: start from `block_from`, finished by `block_until`. |
| `block_color` | colour of the cheapest prices | Colour of the bracket. |
| **Advanced settings** | | |
| `source` | `attribute` | `attribute` (a sensor), or an action: `energyzero`, `easyenergy`, `nordpool`, `tibber`. |
| `config_entry` | – | For `energyzero`, `easyenergy`, `nordpool`: the integration entry (chosen from a list in the form). |
| `area` | first | `nordpool`: the price area, for example `NL` or `SE3`. `tibber`: the name of the home. |
| `incl_vat` | `true` | `energyzero`, `easyenergy`: prices including VAT. |
| `attribute`, `time_key`, `price_key` | found automatically | Your own data format: the attribute with the list (several separated by commas), the field with the start time (a dot for nested fields) and the field with the price. |
| `price_unit` | `auto` | `auto` (from the sensor), `kwh`, `cent` (ct, p, öre) or `mwh`. |
| `currency` | `auto` | `auto` (from the sensor, else euro) or a code such as `EUR`, `GBP`, `SEK`, `NOK`, `DKK`, `CHF`, `PLN`, `AUD`. |
| `decimals` | `2` | Decimals for prices in the text. |
| `font_size` | `14` | Text size in pixels, 10 to 24. |
| `price_factor` | `1` | YAML only: multiply all prices, for unusual units. |

If the prices are 100 or 1000 times too high, set the unit to cents or per
MWh. If the card shows "No prices available yet" although the sensor has a
price list, switch on **Set the data format myself** and fill in the
attribute and field names.

For feed-in prices, add a second price card with your integration's feed-in
sensor and set **Prices shown** to **Feed-in price**.

## Badges

In the dashboard editor, add a badge and choose **Electricity Price Planner
badge**, or add it in YAML under the view's `badges:`. A badge takes its
colours, currency, unit and data source from a price card on the same
dashboard, so the sensor can stay empty:

```yaml
badges:
  - type: custom:electricity-price-planner-badge
    show: appliance
    appliance_kwh: 1
    appliance_hours: 2
    name: Washing machine
```

| Option | Default | Description |
|---|---|---|
| `show` | `now` | `now`, `trend` (next price), `at` (price at a set hour), `cheapest`, `highest`, `average`, `block`, `negative` or `appliance`. |
| `range` | `upcoming` | For `cheapest`, `highest`, `average`, `block`, `negative`: `upcoming`, `today`, `tomorrow` or `both`. |
| `block_hours` | `3` | For `block`: hours in the block. |
| `appliance_kwh`, `appliance_hours` | `1`, `2` | For `appliance`: energy per run and its duration. |
| `block_window`, `block_from`, `block_until` | off | For `block` and `appliance`: only within set hours. |
| `hour` | `6` | For `at`: the next time the clock reaches this hour (averaged over the hour for quarter-hour prices). |
| `entity` | from the price card | The price sensor. |
| `name`, `icon` | automatic | Your own label and icon. |
| `follow_chart` | `true` | Take colours and data settings from a price card on the dashboard: the one for the same sensor, or the last one that loaded. Switch off to set `mode`, colours and the advanced settings on the badge. |

While a price is not known yet (for example tomorrow's prices in the morning),
a badge shows a dash; hover over it to read "not known yet".

## Usage card

**Add card → Electricity Price Planner usage**:

```yaml
type: custom:electricity-price-planner-usage-card
energy_entity: sensor.electricity_meter_energy
day: today
```

| Option | Default | Description |
|---|---|---|
| `energy_entity` | *(required)* | An energy meter in kWh, for example the one in the Energy dashboard. |
| `day` | `today` | `today` (so far) or `yesterday`. Yesterday uses the price sensor's history, so it works with sensors, not with actions. |
| `show_score` | `true` | The score: 100 = all use in the day's cheapest hour, 0 = all in the most expensive one. |
| `height` | `160` | Chart height in pixels. |
| `follow_chart` | `true` | Prices and colours from the price card on the dashboard; switch off to set them on this card. |

## How the prices are shown

- The card shows the prices the integration provides. Market-price
  integrations (ENTSO-e, Nord Pool, EPEX Spot, EnergyZero …) usually show the
  market price, without your supplier's surcharges and taxes, unless you
  configure those in the integration. The colours and the cheapest hours are
  the same either way.
- Colours split the price range shown (today and, once known, tomorrow) into
  equal bands. They say how an hour compares with the other hours shown, not
  whether a day is cheap; use a fixed scale for that.
- The cheapest block starts after the current hour (or quarter hour) and only
  uses prices that are known, so it can move once tomorrow's prices arrive.
- Times are shown in the time zone of the device viewing the dashboard.
- The version is printed in the browser console when the card loads, which
  helps when reporting a problem.

## Privacy

The card itself makes no network requests. It reads your own Home Assistant:
the price sensor, an integration's price action, and for the usage card the
recorder statistics of your energy meter. Fetching the prices from the
internet is done by your price integration.

## Roadmap

- **Notifications**, for example when the cheapest block starts. This needs a
  Home Assistant automation (a blueprint), not the card, and is planned.
- More integrations on request.

## Support and suggestions

I maintain this card in my free time. I'll try to help, but answers can take a
while, and there is no guaranteed support. The card is provided as is, without
warranty. You're welcome to:

- report a problem or suggest an improvement by opening an issue;
- send a change as a pull request;
- use the code as the basis for your own version (MIT licence).

Suggestions that help others too, I'll try to add to the project.

## Supported price integrations

Status: **tested** = on a real installation; **recognised** = from the
integration's code, tested with sample data; **own format** = works with
**Set the data format myself**.

| Country | Supplier or market | Home Assistant integration | Status |
|---|---|---|---|
| Netherlands | Pure Energie | [Pure Energie Prices](https://github.com/venraij/hacs-pure-energy-prices) | tested |
| Netherlands | Frank Energie | [Frank Energie](https://github.com/HiDiHo01/home-assistant-frank_energie) | recognised |
| Netherlands | market price (EnergyZero, used by ANWB Energie and others) | EnergyZero (built-in, action) | recognised |
| Netherlands | market price (easyEnergy) | easyEnergy (built-in, action) | recognised |
| Netherlands | Zonneplan | [Zonneplan ONE](https://github.com/fsaris/home-assistant-zonneplan-one) | own format |
| Germany | Octopus Energy | [Octopus Germany](https://github.com/thecem/octopus_germany) | recognised |
| Germany | Rabot Energy | [Rabot Energy](https://github.com/rabotcharge/ha-rabot-energy) | recognised |
| Germany, Austria | aWATTar, smartENERGY, market price | [EPEX Spot](https://github.com/mampfes/ha_epex_spot) | recognised |
| Germany | Ostrom | [Ostrom](https://github.com/melmager/ha_ostrom) | own format |
| UK | Octopus Energy (Agile) | [Octopus Energy](https://github.com/BottlecapDave/HomeAssistant-OctopusEnergy) | recognised |
| Nordics, Baltics | Nord Pool | Nord Pool (built-in, action) or [Nord Pool (custom)](https://github.com/custom-components/nordpool) | recognised |
| Denmark | Energi Data Service | [Energi Data Service](https://github.com/MTrab/energidataservice) | recognised |
| Spain | PVPC | PVPC (built-in), today only | recognised |
| Several countries | Tibber | Tibber (built-in, action) | recognised |
| Several countries | Tibber | [Tibber Prices](https://github.com/jpawlowski/hass.tibber_prices) | own format |
| Australia | Amber Electric | [Amber Express](https://github.com/hass-energy/amber-express) | own format |
| Europe | market price | [ENTSO-e](https://github.com/JaccoR/hass-entso-e) | recognised |

Missing your supplier? Open an issue with the name of the integration and, if
you can, what the price sensor's attributes look like.

## Licence

[MIT](LICENSE)
