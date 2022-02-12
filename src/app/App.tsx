import './App.css';
import 'vitessce/dist/es/production/static/css/index.css';

import { Vitessce } from 'vitessce';

const exampleConfig = require('../configs/example_vitessce_config.json')

function App() {
  return (
    <div className="App">
      <header className='App-header'>
        <span className="App-title">Polyphony</span>
      </header>
      <Vitessce
        config={exampleConfig}
        height={800}
        theme="light"
      />
    </div>
  );
}

export default App;
