import CancellationToken from "../cancellation-token";

test("CancellationToken is not cancelled when constructed", () => {
    // GIVEN
    // WHEN
    const token = new CancellationToken();
    //THEN
    expect(token.isCancelled).toBe(false);
});


test("CancellationToken is cancelled", () => {
    // GIVEN
    const token = new CancellationToken();
    // WHEN
    token.cancel();
    //THEN
    expect(token.isCancelled).toBe(true);
});


test("CancellationToken can be cancelled many times", () => {
    // GIVEN
    const token = new CancellationToken();
    // WHEN
    for(let i = 0; i < 10; i++) {
        token.cancel();
    }
    //THEN
    expect(token.isCancelled).toBe(true);
});