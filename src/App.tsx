import { AthleteAppProvider } from './context/AthleteAppContext';
import FigmaApp from './app/FigmaApp';

export function App() {
  return (
    <AthleteAppProvider>
      <FigmaApp />
    </AthleteAppProvider>
  );
}

export default App;
