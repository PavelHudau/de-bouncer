# de-bouncer

TypeScript and JavaScript De-Bouncer implementation.

* 100% **ZERO** dependencies;
* Written for UIs, e.g., Single Page web applications;
* Verified to work with [React](https://react.dev) (See [example app](./examples/my-react-app/));

> [!TIP]
> More details and motivation on the implementation can be found in [the De-Bouncer blog post](https://programhappy.net/2023/04/29/de-bouncer/).

## Features

- **Exponential Debouncing**: Prevents rapid and repetitive user actions while maintaining a snappy user experience.
- **Customizable Strategies**: Choose from multiple built-in strategies or create your own.
- **Lightweight**: Zero dependencies for fast and efficient performance.
- **Test-Friendly**: Includes a no-delay strategy for testing purposes.

## Installation

Install the package via npm:

```sh
npm install @pavelhudau/de-bouncer
```

## How to Use DeBouncer

1. Import `DeBouncer`.
2. Import a strategy you would like to use. Supported strategies are:
   - `ExponentialDebounceStrategy`: Default strategy. Helps prevent rapid user actions while keeping the application responsive.
   - `ConstDebouncerStrategy`: Keeps the delay constant at all times.
   - `NoDelayDebounceStrategy`: Primarily for testing, removes the time component.
3. Create a `DeBouncer` instance and wrap the backend call you'd like to protect with it.
4. Done!

### Example

The example below demonstrates how to debounce a `handleFooButtonClick` event handler that makes a backend call to a weather API.

```typescript
import DeBouncer from '@pavelhudau/de-bouncer';
import { ExponentialDebounceStrategy } from '@pavelhudau/de-bouncer/debounce-strategies';

const fooButtonDeBouncer = new DeBouncer(new ExponentialDebounceStrategy());

const handleFooButtonClick = async () => {
    // Await for DeBouncer delay.
    // Keep the latest clicked token for further use.
    const currentToken = await fooButtonDeBouncer.debounce();

    // Has currentToken been cancelled while waiting for DeBouncer delay to expire?
    // The token is cancelled when FooButton is clicked again.
    if (currentToken.isCancelled) return;

    // Logic that you'd like to protect (de-bounce), for example, a service call.
    const weather = await fetch('http://api.weatherapi.com/v1/current.json');

    // Has currentToken been cancelled while awaiting the service call,
    // e.g., FooButton was clicked again before the delay expired.
    if (currentToken.isCancelled) return;

    // Logic to display the service response.
    showWeather(weather);
};
```

## Strategies

### ExponentialDebounceStrategy
- Increases debounce delay exponentially with the frequency of calls.
- Prevents backend flooding while keeping the application responsive.

### ConstDebouncerStrategy
- Maintains a constant delay regardless of call frequency.

### NoDelayDebounceStrategy
- Removes all delays, useful for testing scenarios.

## Example React App

An example application can be found in [examples/my-react-app](./examples/my-react-app/).
The application implements a simple click counter.

### See DeBouncer in Action

- Click the button rapidly multiple times. The counter will increment immediately after the first click and after the last click only.
- Click slowly to see how every click increments the counter.

### Start the Example App

To initialize and start the example app:

1. Navigate to the example app directory:
   ```sh
   cd examples/my-react-app
   ```
2. Run the initialization script to build and install the local version of the `de-bouncer` package into the example app:
   ```sh
   ./initialize.sh
   ```
3. Start the example application:
   ```sh
   npm run start
   ```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with clear and concise messages.
4. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.