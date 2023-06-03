import CancellationToken from "../cancellation-token";
import DeBouncer from "../de-bouncer";


async function delay(delayByMs: number): Promise<boolean> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, delayByMs);
    });
}

const maxDelayForTestDeBouncer = 50;

class DeBouncerTracker {
    private _passes = 0;
    private _bounces = 0;

    public get passes(): number {
        return this._passes;
    }

    public get bounces(): number {
        return this._bounces;
    }

    public trackCancellationToken(cancellationToken: CancellationToken): void {
        if (cancellationToken.isCancelled) {
            this._bounces++;
        }
        else {
            this._passes++;
        }
    }
}

class DurationTracker {
    private _start: number = 0;
    private _duration: number = 0;

    public get duration(): number {
        return this._duration;
    }

    public start(): void {
        this._start = new Date().getTime();
    }

    public stop(): void {
        this._duration = (new Date().getTime()) - this._start;
    }
}

test("DeBouncer single call completes", async () => {
    // GIVEN
    const deBouncer = new DeBouncer(maxDelayForTestDeBouncer);
    let tracker = new DeBouncerTracker();
    // WHEN
    const cancellationToken = await deBouncer.debounce();
    tracker.trackCancellationToken(cancellationToken);
    // THEN
    expect(tracker.passes).toBe(1);
    expect(tracker.bounces).toBe(0);
});


test("DeBouncer multiple calls complete", async () => {
    // GIVEN
    const deBouncer = new DeBouncer(maxDelayForTestDeBouncer);
    let tracker = new DeBouncerTracker();
    // WHEN
    let cancellationToken = await deBouncer.debounce();
    tracker.trackCancellationToken(cancellationToken);
    cancellationToken = await deBouncer.debounce();
    tracker.trackCancellationToken(cancellationToken);
    // THEN
    expect(tracker.passes).toBe(2);
    expect(tracker.bounces).toBe(0);
});

test("DeBouncer multiple calls bounced, only last one completes", async () => {
    // GIVEN
    const iterations = 5;
    const deBouncer = new DeBouncer(maxDelayForTestDeBouncer, 0);
    let trackers: Array<DeBouncerTracker> = new Array(iterations).fill(null).map(i => new DeBouncerTracker());
    let promises: Array<Promise<CancellationToken>> = [];
    // WHEN
    for (let i = 0; i < iterations; i++) {
        const iCapture = i;
        promises.push(
            deBouncer.debounce().then(cancellationToken => {
                trackers[iCapture].trackCancellationToken(cancellationToken);
                return cancellationToken;
            })
        );
    }
    await Promise.allSettled(promises);
    // THEN
    for (let i = 0; i < iterations - 1; i++) {
        // Ensure bounces
        expect(trackers[i].bounces).toBe(1);
        expect(trackers[i].passes).toBe(0);
    }
    // Last one must pass
    expect(trackers[iterations - 1].bounces).toBe(0);
    expect(trackers[iterations - 1].passes).toBe(1);
});


test("DeBouncer try cancel when multiple calls, nothing passes through", async () => {
    // GIVEN
    const iterations = 5;
    const deBouncer = new DeBouncer(maxDelayForTestDeBouncer, 0);
    let trackers: Array<DeBouncerTracker> = new Array(iterations).fill(null).map(i => new DeBouncerTracker());
    let promises: Array<Promise<CancellationToken>> = [];
    // WHEN
    for (let i = 0; i < iterations; i++) {
        const iCapture = i;
        promises.push(
            deBouncer.debounce().then(cancellationToken => {
                trackers[iCapture].trackCancellationToken(cancellationToken);
                return cancellationToken;
            })
        );
    }

    deBouncer.tryCancel();

    await Promise.allSettled(promises);
    // THEN
    for (let i = 0; i < iterations; i++) {
        // Nothing passes
        expect(trackers[i].bounces).toBe(1);
        expect(trackers[i].passes).toBe(0);
    }
});

test("DeBouncer cancel multiple calls, then start new so it passes", async () => {
    // GIVEN
    const iterations = 5;
    const deBouncer = new DeBouncer(maxDelayForTestDeBouncer, 0);
    let trackers: Array<DeBouncerTracker> = new Array(iterations).fill(null).map(i => new DeBouncerTracker());
    let promises: Array<Promise<CancellationToken>> = [];
    // WHEN
    for (let i = 0; i < iterations - 1; i++) {
        const iCapture = i;
        promises.push(
            deBouncer.debounce().then(cancellationToken => {
                trackers[iCapture].trackCancellationToken(cancellationToken);
                return cancellationToken;
            })
        );
    }
    deBouncer.tryCancel();
    promises.push(
        deBouncer.debounce().then(cancellationToken => {
            trackers[iterations - 1].trackCancellationToken(cancellationToken);
            return cancellationToken;
        })
    );
    await Promise.allSettled(promises);

    // THEN
    for (let i = 0; i < iterations - 1; i++) {
        // Ensure bounces
        expect(trackers[i].bounces).toBe(1);
        expect(trackers[i].passes).toBe(0);
    }
    // Last one must pass
    expect(trackers[iterations - 1].bounces).toBe(0);
    expect(trackers[iterations - 1].passes).toBe(1);
});

test("DeBouncer delay decreases with increasing frequency", async () => {
    // GIVEN
    const iterations = 3;
    // const deBouncer = new DeBouncer(maxDelayForTestDeBouncer, 0);
    let trackers: Array<DurationTracker> = new Array(iterations).fill(null).map(i => new DurationTracker());
    let promises: Array<Promise<CancellationToken | void>> = [];
    // WHEN
    for (let i = 0; i < iterations; i++) {
        const deBouncer = new DeBouncer(999, 0, 0);
        const iCapture = i;
        const delayMs = (i + 1) * 300;
        promises.push(
            deBouncer.debounce()
                .then(async () => {
                    // Await to simulate that we are waiting between de-bounce calls. 
                    await delay(delayMs);
                    // Capture time we waited for debounce to resolve.
                    trackers[iCapture].start();
                    await deBouncer.debounce();
                    trackers[iCapture].stop()
                })
        );
    }
    await Promise.allSettled(promises);
    // THEN
    for (let i = 0; i < iterations - 1; i++) {
        expect(trackers[i].duration).toBeGreaterThan(trackers[i + 1].duration);
    }
});

test("DeBouncer does not exceed MAX delay", async () => {
    // GIVEN
    const iterations = 3;
    let tracker: DurationTracker = new DurationTracker();
    const deBouncer = new DeBouncer(maxDelayForTestDeBouncer, 0, 0);
    // WHEN
    await deBouncer.debounce();
    // Capture time we waited for debounce to resolve.
    tracker.start();
    await deBouncer.debounce();
    tracker.stop();
    // THEN
    const acceptableDelta = 1.25;
    expect(tracker.duration).toBeLessThan(maxDelayForTestDeBouncer * acceptableDelta);
});