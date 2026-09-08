/**
 * Wraps navigator.vibrate() with tiered presets so every touch point in
 * the app uses the same vocabulary of feedback instead of ad-hoc
 * millisecond arrays. Android Chrome only — iOS Safari has never
 * implemented the Vibration API (a permanent Apple platform limitation,
 * not something fixable from application code), so every call is a
 * silent no-op there.
 */
function fire(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers throw when called outside a user gesture — ignore.
  }
}

export const haptics = {
  /** Lightest tap — product tile, button press, toggle, tab switch. */
  tap: () => fire(10),
  /** Selecting an option among several — radio/select/segmented control. */
  select: () => fire(15),
  /** A value changed — quantity +/-, stepper. */
  adjust: () => fire(8),
  /** Destructive/removal action — remove cart line, delete. */
  remove: () => fire(20),
  /** Positive outcome — sale completed, form saved, action confirmed. */
  success: () => fire([15, 60, 15]),
  /** Needs attention but not fatal — validation warning, limit reached. */
  warning: () => fire([20, 40, 20]),
  /** Failure — form error, failed action, destructive confirm. */
  error: () => fire([25, 50, 25, 50, 25]),
};
