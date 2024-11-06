import { HttpClientProvider } from '../contexts/HttpClientContext';
import './App.css'
import PlayerGuess from './player-guess/player-guess';

function App() {
  return (
    <HttpClientProvider baseURL="http://localhost:8080">
      <PlayerGuess />
    </HttpClientProvider>
  );
}

export default App
