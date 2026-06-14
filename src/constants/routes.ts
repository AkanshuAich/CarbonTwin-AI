/**
 * Green Routes — named constants for route filtering thresholds and cost estimates.
 *
 * Centralised here so that any business rule change (e.g. increasing the
 * walking limit) is made in one place rather than scattered throughout the
 * GreenRoutesPage component.
 */

// ── Display / UI limits ───────────────────────────────────────────────────────
/** Maximum distance (km) before the walking option is hidden from results */
export const WALKING_MAX_DISPLAY_KM = 25;

/** Maximum distance (km) before the cycling option is hidden from results */
export const CYCLING_MAX_DISPLAY_KM = 100;

// ── Recommendation limits ─────────────────────────────────────────────────────
/** Walking won't be flagged as AI-recommended above this distance */
export const WALKING_RECOMMEND_MAX_KM = 3;

/** Cycling won't be flagged as AI-recommended above this distance */
export const CYCLING_RECOMMEND_MAX_KM = 15;

/**
 * Transit options that take more than this multiple of the driving time are
 * considered "not viable for comfort" and excluded from green recommendations.
 */
export const TRANSIT_MAX_DRIVING_TIME_RATIO = 2.5;

// ── Cost estimates ────────────────────────────────────────────────────────────
/** Estimated cost per km for driving (£/km) — fuel + depreciation */
export const DRIVING_COST_PER_KM = 0.15;

/** Flat-rate transit fare estimate (£) used when no fare data is available */
export const TRANSIT_FLAT_FARE = 2.5;
