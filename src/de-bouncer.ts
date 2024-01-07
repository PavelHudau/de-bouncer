import CancellationToken from "./cancellation-token";
import { defaultBoundaries } from "./boundaries";
import type { IBoundaries } from "./boundaries";
import type { IDebounceStrategy } from "./debounce-strategies";

/**
 * The Debounce implementation.
 */
export default class DeBouncer {
  readonly #debounceStrategy: IDebounceStrategy;
  readonly #maxDelayMs: number;
  readonly #minDelayMs: number;
  readonly #delayNoise: number;
  #latestToken: CancellationToken = new CancellationToken();
  #latestDebounceTimeMs: number = 0;

  constructor(debounceStrategy: IDebounceStrategy, boundaries: IBoundaries = defaultBoundaries()) {
    this.#debounceStrategy = debounceStrategy;
    // Make sure #maxDelayMs is greater than 0;
    this.#maxDelayMs = Math.max(boundaries.maxDelayMs, 0);
    // Make sure #minDelayMs is greater than 0 and less or equal to #maxDelayMs;
    this.#minDelayMs = Math.min(Math.max(boundaries.minDelayMs, 0), this.#maxDelayMs);
    // #delayNoise must be less or equal to #maxDelayMs,
    // otherwise all delays will be considered as noise and will be ignored.
    this.#delayNoise = Math.min(boundaries.delayNoiseMs, this.#maxDelayMs);
  }

  /**
   * Calculates debounce delay based on frequency using debounceStrategy.
   * Awaits for the calculated number if milliseconds.
   * @returns A promise that resolves when DeBouncer delay is expired.
   * The promise returns a CancellationToken that can be used to check
   * whether the call was cancelled before delay expired.
   */
  public async debounce(): Promise<CancellationToken> {
    this.#latestToken.cancel();
    const currentToken = new CancellationToken();
    this.#latestToken = currentToken;
    const delayByMs = this.#nextDelayMs();
    if (delayByMs > 0 && delayByMs >= this.#delayNoise) {
      await delay(delayByMs);
    }

    return Promise.resolve(currentToken);
  }

  /**
   * Cancels the latest debounce call.
   * The function is idempotent and can be called multiple times.
   */
  public tryCancel(): void {
    this.#latestToken?.cancel();
  }

  get #nowTimeInMs(): number {
    return new Date().getTime();
  }

  #nextDelayMs(): number {
    const nowTimeInMsLatest = this.#nowTimeInMs;
    const latestDebounceTimeMs = this.#latestDebounceTimeMs;
    this.#latestDebounceTimeMs = nowTimeInMsLatest;
    let delayMs = this.#debounceStrategy.nextDelayMs(nowTimeInMsLatest, latestDebounceTimeMs);
    delayMs = Math.min(delayMs, this.#maxDelayMs);
    return Math.max(delayMs, this.#minDelayMs);
  }
}

async function delay(delayByMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delayByMs);
  });
}