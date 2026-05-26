turner-perimeter-steel.geojson (optional override)
==================================================

Default fence geometry is fetched automatically from OpenStreetMap:

  Overpass API · ways tagged barrier=fence (and barbed_wire, chain_link, etc.)
  near each pasture centroid in data/turner-rangeland-geography.json

  Module: lib/turner-osm-fence-lines.mjs
  License: © OpenStreetMap contributors · ODbL

OSM is often incomplete on large private ranches. When a pasture has features in
this GeoJSON file (pastureId property), those lines REPLACE OSM for that pasture only.

How fences are used (honest):
  1. Public OSM lines (or local override) define gate positions along real mapped fence.
  2. OpenWebRX SDR spectrum chunks map onto those gates (1420 MHz passband shape).
  3. Fence pulse = wirePhaseUs (PLL from SDR RMS + NOAA Kp).
  4. NASA POWER skin temp + Open-Meteo soil moisture + Digital Pru lock-in score.

Not animal GPS. Not guaranteed complete Turner Enterprise perimeter coverage.

On-the-ground collaboration with Turner teams can significantly improve accuracy
(boundary tweaks, fence corrections, receiver placement) without a full re-walk when
OSM or prior surveys already exist.

Env:
  TURNER_PERIMETER_STEEL=0   — disable fence overlay
  TURNER_FENCE_OSM=0         — skip Overpass (local file only)
  TURNER_OVERPASS_URL=       — alternate Overpass endpoint if needed
