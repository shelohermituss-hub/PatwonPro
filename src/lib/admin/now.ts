/**
 * Fixed "today" for the admin mock dataset — every mock timestamp
 * (lastSyncAt, dueDate, etc.) was authored relative to this date. Using
 * a constant instead of `Date.now()`/`new Date()` keeps day-difference
 * calculations pure (React's render-purity rule flags impure calls like
 * `Date.now()` directly in component bodies) and keeps the mock "today"
 * consistent across every page instead of drifting with the real clock.
 */
export const ADMIN_MOCK_NOW = new Date("2026-09-05T12:00:00Z").getTime();
