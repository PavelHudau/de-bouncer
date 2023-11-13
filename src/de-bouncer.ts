import CancellationToken from './cancellation-token';

export interface IDebounceStrategy {
  nextDelayMs: (nowTimeMs: number, latestDebounceTimeMs: number) => number
}

export interface IBoundaries {
  /**
   * Maximin delay in milliseconds.
   * Delay will never exceed provided value.
   * If the value is a negative number, it will be treated as 0 ms or no delay.
   */
  maxDelayMs: number,
  /**
   * Minimum delay in milliseconds.
   * Delay will never be less than provided value.
   * If the provided value is a negative number, it will be treated as 0 ms.
   * If the provided value is greater than maxDelayMs,
   * DeBouncer will treat minDelayMs as === maxDelayMs.
   */
  minDelayMs: number,
  /**
   * Produced delay values less than delayNoiseMs will be ignored, hence no delay will happen.
   * If the provided value is greater than maxDelayMs,
   * DeBouncer will treat delayNoiseMs as === maxDelayMs.
   */
  delayNoiseMs: number
}

export class ExponentialDebounceStrategy implements IDebounceStrategy {
  static readonly #P0 = 2000;
  static readonly #k = -0.0025;

  public nextDelayMs(nowTimeMs: number, latestDebounceTimeMs: number): number {
    // Frequency is a difference in milliseconds between subsequent actions.
    const frequency = nowTimeMs - latestDebounceTimeMs;
    const delayMs = Math.floor(ExponentialDebounceStrategy.#P0 * Math.pow(Math.E, ExponentialDebounceStrategy.#k * frequency));
    return delayMs;
  }
}

export function defaultBoundaries(
  maxDelayMsOverride: number = 3000,
  minDelayMsOverride: number = 0,
  delayNoiseMsOverride: number = 40): IBoundaries {
  return {
    maxDelayMs: maxDelayMsOverride,
    minDelayMs: minDelayMsOverride,
    delayNoiseMs: delayNoiseMsOverride
  };
}

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

  public tryCancel(): void {
    this.#latestToken?.cancel();
  }

  get #nowTimeInMs(): number {
    return new Date().getTime();
  }

  #nextDelayMs(): number {
    const nowTimeInMs = this.#nowTimeInMs;
    const latestDebounceTimeMs = this.#latestDebounceTimeMs;
    this.#latestDebounceTimeMs = nowTimeInMs;
    let delayMs = this.#debounceStrategy.nextDelayMs(nowTimeInMs, latestDebounceTimeMs);
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
