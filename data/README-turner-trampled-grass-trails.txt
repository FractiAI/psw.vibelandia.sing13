Turner trampled-grass pheromone trails (real geometry only)
============================================================

File: data/turner-trampled-grass-trails.geojson

Format: GeoJSON FeatureCollection. Each feature:
  - geometry: LineString or MultiLineString in WGS84 (coordinates [lng, lat])
  - properties.pastureId: must match an id from data/turner-rangeland-geography.json (e.g. flying-d, vermejo).

The herd map draws pheromone trails ONLY along these polylines (vertices from your survey, drone ortho digitization, or other observed trampling — not RNG walks).

If features[] is empty, trails collapse to a single point at the animal position (no simulated path).

No live “wander” is applied to trails once placed.
