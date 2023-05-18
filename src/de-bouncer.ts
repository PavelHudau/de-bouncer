import CancellationToken from './cancellation-token';

export default class DeBouncer {
  readonly #maxDelayMs: number;
  readonly #minDelayMs: number;
  readonly #delayNoise: number;
  #latestToken: CancellationToken = new CancellationToken();
  #latestDebounceTimeMs: number = 0;

  constructor(maxDelayMs: number = 3000, minDelayMs: number = 0, delayNoise: number = 40) {
    // Make sure #maxDelayMs is greater than 0;
    this.#maxDelayMs = Math.max(maxDelayMs, 0);
    // Make sure #minDelayMs is greater than 0 and less or equal to #maxDelayMs;
    this.#minDelayMs = Math.min(Math.max(minDelayMs, 0), this.#maxDelayMs);
    // #delayNoise must be less or equal to #maxDelayMs,
    // otherwise all delays will be considered as noise and will be ignored.
    this.#delayNoise = Math.min(delayNoise, this.#maxDelayMs);
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
    // Frequency is a difference in milliseconds between subsequent actions.
    const frequency = nowTimeInMs - this.#latestDebounceTimeMs;
    this.#latestDebounceTimeMs = nowTimeInMs;
    const P0 = 2000;
    const k = -0.0025;
    let delayMs = Math.floor(P0 * Math.pow(Math.E, k * frequency));
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
