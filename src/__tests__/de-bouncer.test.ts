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
    for (let i = 0; i < iterations ; i++) {
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



// test("", async () => {
//     // GIVEN
//     const deBouncer = new DeBouncer(maxDelayForTestDeBouncer);
//     let tracker = new DeBouncerTracker();
//     // WHEN
//     const promise = deBouncer.debounce().then(cancellationToken => {
//         tracker.trackCancellationToken(cancellationToken);
//     });
//     await Promise.allSettled([promise]);
//     // THEN
//     expect(tracker.passes).toBe(1);
//     expect(tracker.bounces).toBe(0);
// });