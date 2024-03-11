export interface IBoundaries {
  /**
   * Maximin delay in milliseconds.
   * Delay will never exceed provided value.
   * If the value is a negative number, it will be treated as 0 ms or no delay.
   */
  maxDelayMs: number;
  /**
   * Minimum delay in milliseconds.
   * Delay will never be less than provided value.
   * If the provided value is a negative number, it will be treated as 0 ms.
   * If the provided value is greater than maxDelayMs,
   * DeBouncer will treat minDelayMs as === maxDelayMs.
   */
  minDelayMs: number;
  /**
   * Produced delay values less than delayNoiseMs will be ignored, hence no delay will happen.
   * If the provided value is greater than maxDelayMs,
   * DeBouncer will treat delayNoiseMs as === maxDelayMs.
   */
  delayNoiseMs: number;
}

/**
 * Creates default debounce boundaries that work in most of the cases.
 * @param maxDelayMsOverride Maximum delay in milliseconds that the strategy will ever return.
 * @param minDelayMsOverride Minimum delay in milliseconds that the strategy will ever return.
 * @param delayNoiseMsOverride Number of milliseconds below which the delay is ignored.
 * @returns
 */
export function defaultBoundaries(
  maxDelayMsOverride: number = 3000,
  minDelayMsOverride: number = 0,
  delayNoiseMsOverride: number = 40,
): IBoundaries {
  return {
    maxDelayMs: maxDelayMsOverride,
    minDelayMs: minDelayMsOverride,
    delayNoiseMs: delayNoiseMsOverride,
  };
}
