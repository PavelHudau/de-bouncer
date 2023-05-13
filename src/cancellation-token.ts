export default class CancellationToken {
  #isCancelled: boolean = false;

  public get isCancelled(): boolean {
    return this.#isCancelled;
  }

  public cancel(): void {
    this.#isCancelled = true;
  }
}
