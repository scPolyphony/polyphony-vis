/* eslint-disable */
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import isEqual from 'lodash/isEqual';
import {
  useMultiDatasetCoordination,
  useLoaders,
  useSetWarning,
  useDatasetUids,
} from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import QRCellSetsManager from './QRCellSetsManager';
import TitleInfo from '../TitleInfo';
import { useUrls, useReady } from '../hooks';
import {
  useAnnDataStatic, useAnnDataDynamic, useAnnDataIndices,
  useDiffGeneNames, useCellSetsTree,
  useAnchors,
  useInitialRefCellSetSelection,
  useInitialQryCellSetSelection,
  useProcessedAnchorSets,
} from '../data-hooks';
import { Component } from '../../app/constants';
import { setCellSelection, mergeCellSets, PALETTE } from '../utils';
import range from 'lodash/range';
import sumBy from 'lodash/sumBy';

const setItemIsReady = () => {}; // no op
const setItemIsNotReady = () => {}; // no op
const resetReadyItems = () => {}; // no op

const CELL_SETS_DATA_TYPES = ['cells', 'cell-sets', 'expression-matrix'];

const QRY_PREDICTION_KEY = 'Prediction';
const QRY_LABEL_KEY = 'Label';
const REF_CELL_TYPE_KEY = 'Cell Type';



/**
 * A subscriber wrapper around the SetsManager component
 * for the 'cell' datatype.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export default function QRCellSetsManagerSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Anchor Set View',
    refDiffGeneScoreThreshold = 15,
    qryDiffGeneScoreThreshold = 15,
  } = props;

  const loaders = useLoaders();
  const setWarning = useSetWarning();

  // Use multi-dataset coordination.
  const datasetUids = useDatasetUids(coordinationScopes);
  const refScope = "REFERENCE";
  const qryScope = "QUERY"
  const refDataset = datasetUids[refScope];
  const qryDataset = datasetUids[qryScope];

  // Get "props" from the coordination space.
  const [cValues, cSetters] = useMultiDatasetCoordination(
    COMPONENT_COORDINATION_TYPES[Component.QR_CELL_SETS],
    coordinationScopes,
  );
  const [qryValues, qrySetters] = [cValues[qryScope], cSetters[qryScope]];
  const [refValues, refSetters] = [cValues[refScope], cSetters[refScope]];
  
  const anchorApiState = qryValues.anchorApiState;
  const anchorIteration = anchorApiState.iteration;
  const anchorStatus = anchorApiState.status;
  const modelIteration = qryValues.modelApiState.iteration;
  const modelStatus = qryValues.modelApiState.status;

  const [urls, addUrl, resetUrls] = useUrls();

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, qryDataset, refDataset]);

  // Get the cells data loader for the query and reference datasets.
  const qryLoader = loaders[qryDataset].loaders.cells;
  const refLoader = loaders[refDataset].loaders.cells;
  // Get the loader options (from the view config file definition).
  const qryOptions = qryLoader?.options;
  const refOptions = refLoader?.options;

  const [anchors, anchorsStatus] = useAnchors(qryLoader, anchorIteration, setItemIsReady);
  const nextUserSetName = useMemo(() => {
    if(anchors && anchors.user_selection.length > 0) {
      let nextIndex = 0;
      let nextExists;
      let potentialNext;
      do {
        potentialNext = `user-${nextIndex}`;
        nextExists = anchors.user_selection.find(o => o.id === potentialNext) !== undefined;
        nextIndex += 1;
      } while(nextExists);
      return potentialNext;
    }
    return 'user-0';
  }, [anchors]);

  // Load the data.
  // Cell IDs
  const [qryCellsIndex, qryGenesIndex, qryIndicesStatus] = useAnnDataIndices(loaders, qryDataset, setItemIsReady, true);
  const [refCellsIndex, refGenesIndex, refIndicesStatus] = useAnnDataIndices(loaders, refDataset, setItemIsReady, true);

  const featureKey = (qryValues.debugCellTypes ? "cellType" : "prediction");

  // Cell sets
  const [refCellType, refCellTypeStatus] = useAnnDataStatic(loaders, refDataset, refOptions?.features?.cellType?.path, 'columnString', setItemIsReady, false);
  const [qryPrediction, qryPredictionStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.[featureKey]?.path, 'columnString', modelIteration, setItemIsReady, false);
  // const [qryLabel, qryLabelStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.label?.path, 'columnString', modelIteration, setItemIsReady, false);

  const qryCellSets = useCellSetsTree(qryCellsIndex, [qryPrediction], ["Prediction"]);
  const refCellSets = useCellSetsTree(refCellsIndex, [refCellType], ["Cell Type"]);

  // Anchor matrix
  //const [qryAnchorMatrix, qryAnchorMatrixStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.anchorMatrix?.path, 'columnNumeric', modelIteration, setItemIsReady, false);
  //const [refAnchorMatrix, refAnchorMatrixStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.anchorMatrix?.path, 'columnNumeric', modelIteration, setItemIsReady, false);

  // Anchor cluster
  //const [qryAnchorCluster, qryAnchorClusterStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.anchorCluster?.path, 'columnNumeric', modelIteration, setItemIsReady, false);
  //const [refAnchorCluster, refAnchorClusterStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.features?.anchorCluster?.path, 'columnString', modelIteration, setItemIsReady, false);
  //const [qryAnchorDist, qryAnchorDistStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.anchorDist?.path, 'columnNumeric', modelIteration, setItemIsReady, false);

  // Differential expression
  const [refDiffGeneNameIndices, refDiffGeneNamesStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.names?.path, 'columnNumeric', modelIteration, setItemIsReady, false);
  const [refDiffGeneScores, refDiffGeneScoresStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.scores?.path, 'columnNumeric', modelIteration, setItemIsReady, false);
  const [refDiffClusters, refDiffClustersStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.clusters?.path, 'columnString', modelIteration, setItemIsReady, false);

  const refDiffGeneNames = useDiffGeneNames(refGenesIndex, refDiffGeneNameIndices);

  const mergedQryCellSets = useMemo(() => mergeCellSets(
    qryCellSets, qryValues.additionalCellSets,
  ), [qryCellSets, qryValues.additionalCellSets]);

  const mergedRefCellSets = useMemo(() => mergeCellSets(
    refCellSets, refValues.additionalCellSets,
  ), [refCellSets, refValues.additionalCellSets]);

  // Initialize cell set colors and selections.
  useInitialRefCellSetSelection(mergedRefCellSets, refValues, refSetters, "Cell Type");
  useInitialQryCellSetSelection(mergedQryCellSets, qryValues, qrySetters, "Prediction", refValues.cellSetColor);

  const qryTopGenesLists = useProcessedAnchorSets(
    anchors, refDiffGeneNames, refDiffGeneScores, refDiffClusters, qryPrediction, qryCellsIndex, qryCellSets, qryValues.cellSetColor, "Prediction"
  );

  const [isReady] = useReady([
    anchorStatus, modelStatus,
    anchorsStatus,
    qryIndicesStatus, refIndicesStatus,
    refCellTypeStatus, qryPredictionStatus,
    refDiffGeneNamesStatus, refDiffGeneScoresStatus, refDiffClustersStatus,
  ]);


  const onHighlightAnchors = useCallback((anchorId) => {
    qrySetters.setAnchorSetHighlight(anchorId);
  }, [anchors, qrySetters, refSetters]);

  const onFocusAnchors = useCallback((anchorId) => {
    if(qryValues.anchorSetFocus === anchorId) {
      qrySetters.setAnchorSetFocus(null);
      return;
    }
    qrySetters.setAnchorSetFocus(anchorId);
  }, [anchors, qryValues.anchorSetFocus, qrySetters, refSetters]);


  const onDeleteAnchors = useCallback((anchorId) => {
    if(anchorApiState.status === 'success') {
      qrySetters.setAnchorApiState({ ...anchorApiState, status: 'loading' });
      qryLoader.anchorDelete(anchorId).then(() => {
        qrySetters.setAnchorApiState({ ...anchorApiState, iteration: anchorApiState.iteration+1, status: 'success' });
      });
    }
  }, [anchorApiState]);

  const onConfirmAnchors = useCallback((anchorId) => {
    if(anchorApiState.status === 'success') {
      qrySetters.setAnchorApiState({ ...anchorApiState, status: 'loading' });
      qryLoader.anchorConfirm(anchorId).then(result => {
        qrySetters.setAnchorApiState({ ...anchorApiState, iteration: anchorApiState.iteration+1, status: 'success' });
      });
    }
  }, [anchorApiState]);

  const onEditAnchors = useCallback((anchorId) => {
    qrySetters.setAnchorSetFocus(anchorId);
    qrySetters.setAnchorEditMode({ mode: 'lasso', anchorId: anchorId });
    qrySetters.setAnchorEditTool('lasso');
  }, [onHighlightAnchors]);

  function resetCellSets(goodSelection) {
    if(goodSelection) {
      qrySetters.setAnchorEditMode(null);
      qrySetters.setAnchorEditTool(null);
    }
    qrySetters.setAdditionalCellSets(null);

    const parentKey = "Prediction";
    const node = mergedQryCellSets.tree.find(n => n.name === parentKey);
    if(node) {
      const newSelection = node.children.map(n => ([parentKey, n.name]));
      qrySetters.setCellSetSelection(newSelection);

      // Must use same method as in useInitialQryCellSetSelection
      const newColors = newSelection.map((path, i) => {
        const matchingRefSet = refValues.cellSetColor.find(d => d.path[1] === path[1]);
        let newColor = PALETTE[i % PALETTE.length];
        if(matchingRefSet) {
          newColor = matchingRefSet.color;
        }
        return {
          color: newColor,
          path: path,
        };
      });

      qrySetters.setCellSetColor(newColors);
      qrySetters.setCellColorEncodingPlugin("cellSetSelection");
    }
  }

  useEffect(() => {
    if(anchorApiState.status !== 'success'){
      // Still in loading mode or had a previous error.
      return;
    }
    if(qryValues.additionalCellSets?.tree?.[0]?.children?.length !== 1 || qryValues.additionalCellSets.tree[0].children[0].set.length < 2) {
      // Selected set does not exist or it contains 0 or 1 cells.
      resetCellSets(false);
      return;
    }
    // Set exists, now just determine whether it is an addition or an edit.
    if(qryValues.anchorEditMode?.mode === 'lasso') {
      const anchorId = qryValues.anchorEditMode.anchorId;
      const cellIds = qryValues.additionalCellSets.tree[0].children[0].set.map(c => ({ cell_id: c[0] }));
      qrySetters.setAnchorApiState({ ...anchorApiState, status: 'loading' });
      qryLoader.anchorRefine(anchorId, cellIds).then(result => {
        qrySetters.setAnchorApiState({ ...anchorApiState, iteration: anchorApiState.iteration+1, status: 'success' });
        resetCellSets(true);

        const prevAnchorId = qryValues.anchorSetFocus;
        qrySetters.setAnchorSetFocus(null);
        setTimeout(() => {
          qrySetters.setAnchorSetFocus(prevAnchorId);
        }, 500);
      });
    } else if(qryValues.anchorEditMode === null) {
      const cellIds = qryValues.additionalCellSets.tree[0].children[0].set.map(c => ({ cell_id: c[0] }));
      const anchorId = nextUserSetName;
      qrySetters.setAnchorApiState({ ...anchorApiState, status: 'loading' });
      qryLoader.anchorAdd(anchorId, cellIds).then(result => {
        qrySetters.setAnchorApiState({ ...anchorApiState, iteration: anchorApiState.iteration+1, status: 'success' });
        resetCellSets(true);
        qrySetters.setAnchorSetFocus(null);
      });
    }
  }, [qryValues.additionalCellSets]);

  const manager = useMemo(() => {
    return (
      <QRCellSetsManager
        qryTopGenesLists={qryTopGenesLists}

        onDeleteAnchors={onDeleteAnchors}
        onConfirmAnchors={onConfirmAnchors}
        onEditAnchors={onEditAnchors}
        onFocusAnchors={onFocusAnchors}
        onHighlightAnchors={onHighlightAnchors}
      />
    );
  }, [qryTopGenesLists, onFocusAnchors, onHighlightAnchors]); 

  return (
    <TitleInfo
      title={title}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
      isScroll
    >
      {manager}
    </TitleInfo>
  );
}
