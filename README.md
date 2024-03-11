# de-bouncer

TypeScript and JavaScript De-Bouncer implementation.
Primarily is written for UIs, e.g. Single Page web applications.

More details and motivation on the implemented DeBouncer can be found in [the De Bounce post](https://programhappy.net/2023/04/29/de-bouncer/).

## How to use DeBouncer

The example uses DeBouncer to debounce a `handleFooButtonClick` event handler, that makes an expensive api call to weather api.

```js
import DeBouncer from '@pavelhudau/de-bouncer';
import { ExponentialDebounceStrategy } from '@pavelhudau/de-bouncer/debounce-strategies';

const fooButtonDeBouncer = new DeBouncer(new ExponentialDebounceStrategy());

const handleFooButtonClick = async () => {
    // Await for DeBouncer delay.
    // Keep the latest clicked token for further use.
    const currentToken = await fooButtonDeBouncer.debounce()

    // Has currentToken been cancelled while waiting for DeBouncer delay to expire?
    // The token is cancelled when FooButton is clicked again.
    if (currentToken.isCancelled) return;

    // Logic that you'd like to de-bounce, for example a service call.
    const weather = await fetch('http://api.weatherapi.com/v1/current.json')

    // Has currentToken been cancelled while awaiting for the service call,
    // e.g. FooButton was clicked again.
    if (currentToken.isCancelled) return;

    // Logic to display the service response.
    showWeather(weather);
}
```

## Example App

Example application can be found in [examples/my-react-app](./examples/my-react-app/).
The application implements a simple click counter.
To see DeBouncer in action:
- Try to click the button rapidly multiple times. The counter will be incremented immediately after the fist click and after the last click only.
- Now try to click slowly and see how every click increments the counter.

### Start example app

To initialize and start the example app:
1. Run `cd examples/my-react-app`.
1. Run `initialize.sh` which will build and install local version of de-bouncer package into the example app.
1. Run `npm run start` and the example application will start.