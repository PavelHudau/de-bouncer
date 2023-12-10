export default class CancellationToken {
    #isCancelled: boolean = false;
  
    /**
     * Checks whether the cancellation token was cancelled.
     */
    public get isCancelled(): boolean {
      return this.#isCancelled;
    }
  
    /**
     * Moves the cancellation token into cancelled state.
     * The function is idempotent and can be invoked multiple times.
     */
    public cancel(): void {
      this.#isCancelled = true;
    }
  }