import React, {
  useEffect,
  useMemo,
} from 'react';
import {
  useMultiDatasetCoordination,
  useLoaders,
  useSetWarning,
  useDatasetUids,
} from 'vitessce';

import {
  PluginViewType,
  PLUGIN_COMPONENT_COORDINATION_TYPES,
} from '../../constants';
import {
  useAnnDataStatic, useAnnDataDynamic, useAnnDataIndices,
  useDiffGeneNames, useCellSetsTree,
  useAnchors,
  useProcessedAnchorSets,
  useCompressedAnchors,
  useSeperatedGenes,
  useGeneSelection,
} from '../data-hooks';
import { useReady } from '../hooks';
import TitleInfo from '../TitleInfo';
import QRScores from './QRScores';


const setItemIsReady = () => {}; // no op
const setItemIsNotReady = () => {}; // no op
const resetReadyItems = () => {}; // no op

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
export default function QRScoresSubscriber(props) {
  const {
    coordinationScopes,
    coordinationScopesBy,
    removeGridComponent,
    theme,
    title = 'Marker View',
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
    PLUGIN_COMPONENT_COORDINATION_TYPES[PluginViewType.QR_SCORES],
    coordinationScopes,
    coordinationScopesBy,
  );
  const [qryValues, qrySetters] = [cValues[qryScope], cSetters[qryScope]];
  const [refValues, refSetters] = [cValues[refScope], cSetters[refScope]];

  const anchorApiState = qryValues.anchorApiState;
  const anchorIteration = anchorApiState.iteration;
  const anchorStatus = anchorApiState.status;
  const modelIteration = qryValues.modelApiState.iteration;
  const modelStatus = qryValues.modelApiState.status;

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
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

  // Differential expression
  const [refDiffGeneNameIndices, refDiffGeneNamesStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.names?.path, 'columnNumeric', modelIteration, setItemIsReady, false);
  const [refDiffGeneScores, refDiffGeneScoresStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.scores?.path, 'columnNumeric', modelIteration, setItemIsReady, false);
  const [refDiffClusters, refDiffClustersStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.clusters?.path, 'columnString', modelIteration, setItemIsReady, false);

  const [qryExpressionData, qryLoadedGene, qryExpressionDataStatus] = useGeneSelection(
    loaders, qryDataset, setItemIsReady, false, qryValues.geneSelection, setItemIsNotReady,
  );
  
  const [refExpressionData, refLoadedGene, refExpressionDataStatus] = useGeneSelection(
    loaders, refDataset, setItemIsReady, false, refValues.geneSelection, setItemIsNotReady,
  );

  const [isReady] = useReady([
    anchorStatus, modelStatus,
    anchorsStatus,
    qryIndicesStatus, refIndicesStatus,
    refCellTypeStatus, qryPredictionStatus,
    refDiffGeneNamesStatus, refDiffGeneScoresStatus, refDiffClustersStatus,
    qryExpressionDataStatus, refExpressionDataStatus,
  ]);

  const refDiffGeneNames = useDiffGeneNames(refGenesIndex, refDiffGeneNameIndices);

  const qryTopGenesLists = useProcessedAnchorSets(
    anchors, refDiffGeneNames, refDiffGeneScores, refDiffClusters, qryPrediction, qryCellsIndex, qryCellSets, qryValues.cellSetColor, "Prediction"
  );

  const CompressAnchors = useCompressedAnchors(qryTopGenesLists);
  const anchorFocused = qryValues.anchorSetFocus && CompressAnchors && CompressAnchors[qryValues.anchorSetFocus];
  const topGenes = useSeperatedGenes(anchorFocused);

  function setGeneSelectionAndColorEncoding(newSelection) {
    console.log(newSelection);
    qrySetters.setGeneSelection(newSelection);
    qrySetters.setCellColorEncodingPlugin('geneSelection');

    refSetters.setGeneSelection(newSelection);
    refSetters.setCellColorEncodingPlugin('geneSelection');
  }

  const manager = useMemo(() => {
    return (
      <QRScores
        anchorId={anchorFocused && anchorFocused.id}
        topGenes={topGenes}
        setGeneSelection={setGeneSelectionAndColorEncoding}
      />
    );
  }, [anchorFocused]);

  const titleWithFocusedSet = `${title} ${(anchorFocused ? '(' + anchorFocused.id + ')' : '')}`;

  return (
    <TitleInfo
      title={titleWithFocusedSet}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
      isScroll
    >
      {manager}
    </TitleInfo>
  );
}
