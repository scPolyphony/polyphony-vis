/* eslint-disable */
import React, { useCallback, useMemo } from 'react';
import {
  useMultiDatasetCoordination,
  useDatasetUids,
  useWarning,
  useLoaders,
} from 'vitessce';
import sum from 'lodash/sum';

import {
  PLUGIN_COMPONENT_COORDINATION_TYPES,
  PluginViewType,
} from '../../constants';
import {
  useAnchors,
  useAnnDataIndices,
} from '../data-hooks';
import { useReady } from '../hooks';
import TitleInfo from '../TitleInfo';
import QRStatus from './QRStatus';


const setItemIsReady = () => {}; // no op
const setItemIsNotReady = () => {}; // no op
const resetReadyItems = () => {}; // no op

/**
 * A subscriber component for the status component,
 * which renders hovered cell/gene/molecule information
 * as well as schema validation and data loading errors.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export default function QRStatusSubscriber(props) {
  const {
    coordinationScopes,
    coordinationScopesBy,
    removeGridComponent,
    theme,
    title = 'Polyphony',
  } = props;

  const warn = useWarning();
  const loaders = useLoaders();

  // Use multi-dataset coordination.
  const datasetUids = useDatasetUids(coordinationScopes);
  const refScope = "REFERENCE";
  const qryScope = "QUERY"
  const refDataset = datasetUids[refScope];
  const qryDataset = datasetUids[qryScope];

  // Get "props" from the coordination space.
  const [cValues, cSetters] = useMultiDatasetCoordination(
    PLUGIN_COMPONENT_COORDINATION_TYPES[PluginViewType.QR_STATUS],
    coordinationScopes,
    coordinationScopesBy,
  );
  const [qryValues, qrySetters] = [cValues[qryScope], cSetters[qryScope]];
  const [refValues, refSetters] = [cValues[refScope], cSetters[refScope]];
  
  
  const modelApiState = qryValues.modelApiState;
  const anchorApiState = qryValues.anchorApiState;

  const anchorIteration = anchorApiState.iteration;
  const anchorStatus = anchorApiState.status;
  const modelIteration = qryValues.modelApiState.iteration;
  const modelStatus = qryValues.modelApiState.status;

  // Get the cells data loader for the query and reference datasets.
  const qryLoader = loaders[qryDataset].loaders.cells;
  const refLoader = loaders[refDataset].loaders.cells;
  // Get the loader options (from the view config file definition).
  const qryOptions = qryLoader?.options;
  const refOptions = refLoader?.options;

  const [anchors, anchorsStatus] = useAnchors(qryLoader, anchorIteration, setItemIsReady);
  // Load the data.
  // Cell IDs
  const [qryCellsIndex, qryGenesIndex, qryIndicesStatus] = useAnnDataIndices(loaders, qryDataset, setItemIsReady, true);


  const [isReady] = useReady([
    anchorStatus, modelStatus,
    anchorsStatus, qryIndicesStatus,
  ]);

  const onUpdateModel = useCallback(() => {
    if(modelApiState.status === 'success') {
      qrySetters.setModelApiState({ ...modelApiState, status: 'loading' });
      qryLoader.modelGet(modelApiState.iteration+1).then(result => {
        qrySetters.setModelApiState({ ...modelApiState, iteration: modelApiState.iteration+1, status: 'success' });
        qrySetters.setAnchorApiState({ ...anchorApiState, iteration: anchorApiState.iteration+1, status: 'success' });
      });
    }
  }, [modelApiState, anchorApiState]);

  const [numAnchorSetsConfirmed, numAnchorSetsTotal, numQueryCellsConfirmed, numQueryCellsTotal] = useMemo(() => {
    if(anchors && qryCellsIndex) {
      const numSetsConfirmed = anchors.confirmed.length;
      const numSetsTotal = sum(Object.values(anchors).map(a => a.length));

      const numCellsConfirmed = sum(anchors.confirmed.map(o => o.cells.length));
      const numCellsTotal = qryCellsIndex.length;
      return [numSetsConfirmed, numSetsTotal, numCellsConfirmed, numCellsTotal];
    }
    return [null, null, null, null];
  }, [anchors, qryCellsIndex]);

  const clearAnchorSetFocus = useCallback(() => {
    qrySetters.setAnchorSetFocus(null);
    qrySetters.setAnchorSetHighlight(null);
    refSetters.setAnchorSetFocus(null);
    refSetters.setAnchorSetHighlight(null);
  }, [qrySetters, refSetters]);
  

  return (
    <TitleInfo
      title={title}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
    >
      <QRStatus
        warn={warn}
        numAnchorSetsConfirmed={numAnchorSetsConfirmed}
        numAnchorSetsTotal={numAnchorSetsTotal}
        numQueryCellsConfirmed={numQueryCellsConfirmed}
        numQueryCellsTotal={numQueryCellsTotal}
        onUpdateModel={onUpdateModel}
        modelStatus={modelStatus}

        anchorEditTool={qryValues.anchorEditTool}
        setAnchorEditTool={qrySetters.setAnchorEditTool}

        anchorEditMode={qryValues.anchorEditMode}
        setAnchorEditMode={qrySetters.setAnchorEditMode}
        clearAnchorSetFocus={clearAnchorSetFocus}
      />
    </TitleInfo>
  );
}
