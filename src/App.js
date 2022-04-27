import React from 'react';
import {
  Vitessce,
  CoordinationType,
  registerPluginViewType,
  registerPluginFileType,
  TitleInfo,
  useCoordination,
} from 'vitessce';
import registerCoordinationTypes from './coordination-types/index';
import { myViewConfig } from './my-view-config';
import 'vitessce/dist/es/production/static/css/index.css';
import './index.css';

registerCoordinationTypes();

function MyPluginView(props) {
  const {
    spatialZoom,
    setSpatialZoom,
  } = props;

  function handleClick() {
    setSpatialZoom(-10 + Math.random()*10);
  }
  return (
    <div>
      <p>Zoom level: <b>{spatialZoom}</b></p>
      <p>
        <button onClick={handleClick}>Try a random zoom level</button>
      </p>
    </div>
  );
}

function MyPluginViewSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'My plugin view',
  } = props;

  // Get "props" from the coordination space.
  const [{
    spatialZoom
  }, {
    setSpatialZoom,
  }] = useCoordination(
    [
      CoordinationType.DATASET,
      CoordinationType.SPATIAL_ZOOM,
    ],
    coordinationScopes,
  );

  return (
    <TitleInfo
      title={title}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady={true}
    >
      <MyPluginView
        spatialZoom={spatialZoom}
        setSpatialZoom={setSpatialZoom}
      />
    </TitleInfo>
  );
}

// Register the plugin view type.
registerPluginViewType(
  'myCustomZoomController',
  MyPluginViewSubscriber,
  [
    CoordinationType.DATASET,
    CoordinationType.SPATIAL_ZOOM,
  ]
);

export default function App() {
  return (
    <Vitessce
      config={myViewConfig}
      theme="light"
    />
  );
}
