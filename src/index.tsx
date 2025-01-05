import React from 'react';
import ReactDOM from 'react-dom/client';
import Game from './components/Game';

function App() {
  return (
    <div>
      <h1>Checkers</h1>
      <p>Local 2-player checkers game</p>
      <Game />
    </div>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
