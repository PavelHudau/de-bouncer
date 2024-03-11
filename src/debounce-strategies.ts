export interface IDebounceStrategy {
  nextDelayMs: (nowTimeMs: number, latestDebounceTimeMs: number) => number;
}

/**
 * DeBouncer strategy that increases debounce delay exponentially
 * with increase frequency of debounce calls.
 */
export class ExponentialDebounceStrategy implements IDebounceStrategy {
  static readonly #k = -0.0025;
  readonly #P0: number = 2000;

  constructor(maxDelayMs: number = 2000) {
    this.#P0 = maxDelayMs;
  }

  public nextDelayMs(nowTimeMs: number, latestDebounceTimeMs: number): number {
    // Frequency is a difference in milliseconds between subsequent actions.
    const frequency = nowTimeMs - Math.min(nowTimeMs, latestDebounceTimeMs);
    const delayMs = Math.floor(this.#P0 * Math.pow(Math.E, ExponentialDebounceStrategy.#k * frequency));
    return delayMs;
  }
}
