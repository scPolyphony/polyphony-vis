import './App.css';
import 'vitessce/dist/esm/index.css';

import { Vitessce } from 'vitessce/dist/esm/index';

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
