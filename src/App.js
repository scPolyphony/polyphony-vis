import React from 'react';
import { Vitessce } from 'vitessce';
import registerCoordinationTypes from './coordination-types/index';
import registerViewTypes from './view-types/index';
import registerFileTypes from './file-types/index';
import { viewConfig } from './polyphony-view-config';

registerCoordinationTypes();
registerViewTypes();
registerFileTypes();

export default function App() {
  return (
    <Vitessce
      config={viewConfig}
      theme="light"
    />
  );
}
