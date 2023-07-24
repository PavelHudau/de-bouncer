# de-bouncer

TypeScript and JavaScript De-Bouncer implementation.

## How to use

The example uses DeBouncer to debounce a `onFooButtonClick()` button click event handler.
```js
const fooButtonDeBouncer = new DeBouncer();

async function onFooButtonClick() {
    const currentToken = await fooButtonDeBouncer.debounce()
    if (currentToken.isCancelled) {
        return;
    }

    // ... Logic that you'd like to de-bounce
}
```

More details and motivation on the implemented DeBouncer can be found in [the De Bounce post](https://programhappy.net/2023/04/29/de-bouncer/).