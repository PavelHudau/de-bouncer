import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import DeBouncer from '@pavelhudau/de-bouncer';
import { ExponentialDebounceStrategy } from '@pavelhudau/de-bouncer/debounce-strategies';

const debouncer = new DeBouncer(new ExponentialDebounceStrategy());
debouncer.debounce();

function App() {
  const [count, setCount] = useState(0);

  const handleButtonClick = async () => {
    const token = await debouncer.debounce();
    if(token.isCancelled) {
      return;
    }
    setCount(count + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <h1>Button Click Counter</h1>
        <button onClick={handleButtonClick}>Click me</button>
        <p>Count: {count}</p>
      </header>
    </div>
  );
}

export default App;
