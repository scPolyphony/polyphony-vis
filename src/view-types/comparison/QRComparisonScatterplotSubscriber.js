/* eslint-disable */
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  TitleInfo,
  useMultiDatasetCoordination,
  useLoaders,
  useDatasetUids,
  useSetComponentHover,
  useSetComponentViewInfo,
  useComponentViewInfo,
} from 'vitessce';
import { LinearInterpolator, TRANSITION_EVENTS } from '@deck.gl/core';
import { extent } from 'd3-array';
import isEqual from 'lodash/isEqual';
import sum from 'lodash/sum';

import {
  PluginViewType,
  PLUGIN_COMPONENT_COORDINATION_TYPES,
} from '../../constants';
import {
  pluralize,
  setCellSelection,
  mergeCellSets,
  getCellSetPolygons,
  getCellColors,
  getPointSizeDevicePixels,
  getPointOpacity,
} from '../utils';
import {
  useDeckCanvasSize,
  useReady,
  useUrls,
  useExpressionValueGetter,
} from '../hooks';
import {
  useGeneSelection,
  useExpressionAttrs,
  useAnnDataStatic,
  useAnnDataDynamic,
  useAnnDataIndices,
  useCellSetsTree,
  useDiffGeneNames,
  useAnchors,
  useProcessedAnchorSets,
  useAnchorSetOfInterest,
  useAnchorContourOfInterest,
} from '../data-hooks';

import QRComparisonScatterplot from './QRComparisonScatterplot';
import ScatterplotTooltipSubscriber from './ScatterplotTooltipSubscriber';
import QRComparisonScatterplotOptions from './QRComparisonScatterplotOptions';
import FocusInfo from './FocusInfo';
import Legend from './Legend';
import PresetButtons from './PresetButtons';


const setItemIsReady = () => {}; // no op
const setItemIsNotReady = () => {}; // no op
const resetReadyItems = () => {}; // no op

/**
 * A subscriber component for the scatterplot.
 * @param {object} props
 * @param {number} props.uuid The unique identifier for this component.
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {boolean} props.disableTooltip Should the tooltip be disabled?
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title An override value for the component title.
 * @param {number} props.averageFillDensity Override the average fill density calculation
 * when using dynamic opacity mode.
 */
export default function QRComparisonScatterplotSubscriber(props) {
  const {
    uuid,
    qrySupportingUuid = null,
    refSupportingUuid = null,
    coordinationScopes,
    removeGridComponent,
    theme,
    isMainComparisonView = false,
    disableTooltip = false,
    observationsLabelOverride: observationsLabel = 'cell',
    observationsPluralLabelOverride: observationsPluralLabel = `${observationsLabel}s`,
    title: titleOverride,
    // Average fill density for dynamic opacity calculation.
    averageFillDensity,
  } = props;

  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);
  const qrySupportingViewInfo = useComponentViewInfo(qrySupportingUuid);
  const refSupportingViewInfo = useComponentViewInfo(refSupportingUuid);

  // Use multi-dataset coordination.
  const datasetUids = useDatasetUids(coordinationScopes);
  const refScope = "REFERENCE";
  const qryScope = "QUERY"
  const refDataset = datasetUids[refScope];
  const qryDataset = datasetUids[qryScope];
  // Get "props" from the coordination space.
  const [cValues, cSetters] = useMultiDatasetCoordination(
    PLUGIN_COMPONENT_COORDINATION_TYPES[PluginViewType.QR_COMPARISON_SCATTERPLOT],
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
  const [width, height, deckRef] = useDeckCanvasSize();
  

  const title = titleOverride || `Comparison View (${qryValues.embeddingType})`;

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

  // Load the data.
  // Cell IDs
  const [qryCellsIndex, qryGenesIndex, qryIndicesStatus] = useAnnDataIndices(loaders, qryDataset, setItemIsReady, true);
  const [refCellsIndex, refGenesIndex, refIndicesStatus] = useAnnDataIndices(loaders, refDataset, setItemIsReady, true);

  const [anchors, anchorsStatus] = useAnchors(qryLoader, anchorIteration, setItemIsReady);

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
  const [qryAnchorCluster, qryAnchorClusterStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.anchorCluster?.path, 'columnString', modelIteration, setItemIsReady, false);
  const [refAnchorCluster, refAnchorClusterStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.features?.anchorCluster?.path, 'columnString', modelIteration, setItemIsReady, false);
  //const [qryAnchorDist, qryAnchorDistStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.anchorDist?.path, 'columnNumeric', modelIteration, setItemIsReady, false);

  // Embeddings
  const [qryEmbedding, qryEmbeddingStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.embeddings[qryValues.embeddingType]?.path, 'embeddingNumeric', modelIteration, setItemIsReady, false);
  const [refEmbedding, refEmbeddingStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.embeddings[refValues.embeddingType]?.path, 'embeddingNumeric', modelIteration, setItemIsReady, false);

  // Differential genes
  const [refDiffGeneNameIndices, refDiffGeneNamesStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.names?.path, 'columnNumeric', modelIteration, setItemIsReady, false);
  const [refDiffGeneScores, refDiffGeneScoresStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.scores?.path, 'columnNumeric', modelIteration, setItemIsReady, false);
  const [refDiffClusters, refDiffClustersStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.clusters?.path, 'columnString', modelIteration, setItemIsReady, false);

  const refDiffGeneNames = useDiffGeneNames(refGenesIndex, refDiffGeneNameIndices);

  // Gene expression data
  const [qryExpressionData, qryLoadedSelection, qryExpressionDataStatus] = useGeneSelection(
    loaders, qryDataset, setItemIsReady, false, qryValues.geneSelection, setItemIsNotReady,
  );
  const [qryAttrs, qryAttrsStatus] = useExpressionAttrs(
    loaders, qryDataset, setItemIsReady, addUrl, false,
  );
  
  const [refExpressionData, refLoadedSelection, refExpressionDataStatus] = useGeneSelection(
    loaders, refDataset, setItemIsReady, false, refValues.geneSelection, setItemIsNotReady,
  );
  const [refAttrs, refAttrsStatus] = useExpressionAttrs(
    loaders, refDataset, setItemIsReady, addUrl, false,
  );

  const [isReady] = useReady([
    modelStatus, anchorStatus,
    qryIndicesStatus, refIndicesStatus,
    anchorsStatus,
    refCellTypeStatus, qryPredictionStatus,
    qryAnchorClusterStatus, refAnchorClusterStatus,
    qryEmbeddingStatus, refEmbeddingStatus,
    qryExpressionDataStatus, qryAttrsStatus,
    refExpressionDataStatus, refAttrsStatus,
    refDiffGeneNamesStatus, refDiffGeneScoresStatus, refDiffClustersStatus,
  ]);
  

  const qryTopGenesLists = useProcessedAnchorSets(
    anchors, refDiffGeneNames, refDiffGeneScores, refDiffClusters, qryPrediction, qryCellsIndex, qryCellSets, qryValues.cellSetColor, "Prediction"
  );
  
  const [dynamicCellRadius, setDynamicCellRadius] = useState(qryValues.embeddingCellRadius);
  const [dynamicCellOpacity, setDynamicCellOpacity] = useState(qryValues.embeddingCellOpacity);

  const [transitionInterpolator, setTransitionInterpolator] = useState(undefined);
  const [transitionDuration, setTransitionDuration] = useState(undefined);


  
  // Compute endpoints for lines ("links") between query and reference anchor sets.
  const [anchorLinks, maxQryAnchorSize, maxRefAnchorSize] = useMemo(() => {
    if(anchors && refAnchorCluster && qryEmbedding && refEmbedding && qryCellsIndex && qryTopGenesLists) {
      const result = [];
      let maxQrySize = 0;
      let maxRefSize = 0;
      Object.keys(anchors).forEach(anchorType => {
        anchors[anchorType].forEach((anchorObj, i) => {
          const refAnchorId = `${anchorObj.anchor_ref_id}`; // convert to string
          const qryAnchorId = anchorObj.id;

          const qryCellIds = anchorObj.cells.map(c => c.cell_id);
          const qryCellIndices = qryCellIds.map(cellId => qryCellsIndex.indexOf(cellId));

          const topGeneScore = qryTopGenesLists[anchorType]?.[qryAnchorId]?.topGeneScore;

          const refCellIndices = [];
          refAnchorCluster.forEach((anchorClusterId, i) => {
            if(anchorClusterId === refAnchorId) {
              refCellIndices.push(i);
            }
          });

          const qryX = qryCellIndices.map(i => qryEmbedding.data[0][i]);
          const qryY = qryCellIndices.map(i => qryEmbedding.data[1][i]);
          const refX = refCellIndices.map(i => refEmbedding.data[0][i]);
          const refY = refCellIndices.map(i => refEmbedding.data[1][i]);

          const qryCentroid = [ sum(qryX) / qryX.length, sum(qryY) / qryY.length ];
          const refCentroid = [ sum(refX) / refX.length, sum(refY) / refY.length ];
          result.push({
            qry: qryCentroid, ref: refCentroid,
            qryId: qryAnchorId, refId: refAnchorId,
            topGeneScore,
            qrySize: qryCellIndices.length, refSize: refCellIndices.length,
          });
          maxQrySize = Math.max(maxQrySize, qryCellIndices.length);
          maxRefSize = Math.max(maxRefSize, refCellIndices.length);
        });
      });
      return [result, maxQrySize, maxRefSize];
    }
    return [null, null, null];
  }, [anchors, refAnchorCluster, qryEmbedding, refEmbedding, qryCellsIndex, qryTopGenesLists]);

  // Determine which cells to emphasize when anchor set is focused or highlighted.
  const [qryAnchorSetFocus, refAnchorSetFocus, qryAnchorFocusIndices, refAnchorFocusIndices, qryAnchorFocusViewState] = useAnchorSetOfInterest(
    qryValues.anchorSetFocus,
    anchors,
    qryCellsIndex,
    qryEmbedding,
    refAnchorCluster,
    width, height,
    true,
  );
  const [qryAnchorSetHighlight, refAnchorSetHighlight, qryAnchorHighlightIndices, refAnchorHighlightIndices, qryAnchorHighlightViewState] = useAnchorSetOfInterest(
    qryValues.anchorSetHighlight,
    anchors,
    qryCellsIndex,
    qryEmbedding,
    refAnchorCluster,
    width, height,
    false,
  );

  // Based on the currently focused anchor set, get all of the necessary info to render contour layers for the focused set.
  const [qryAnchorSetFocusContour, refAnchorSetFocusContour] = useAnchorContourOfInterest(
    qryAnchorSetFocus, refAnchorSetFocus,
    qryAnchorFocusIndices, refAnchorFocusIndices,
    refCellType, "Cell Type", refCellSets,
    qryPrediction, "Prediction", qryCellSets,
    qryValues.cellSetColor, refValues.cellSetColor,
  );
  const [qryAnchorSetHighlightContour, refAnchorSetHighlightContour] = useAnchorContourOfInterest(
    qryAnchorSetHighlight, refAnchorSetHighlight,
    qryAnchorHighlightIndices, refAnchorHighlightIndices,
    refCellType, "Cell Type", refCellSets,
    qryPrediction, "Prediction", qryCellSets,
    qryValues.cellSetColor, refValues.cellSetColor,
  );

  const [qryContour, refContour] = useMemo(() => {
    const qryParentKey = "Prediction";
    const qryCol = qryPrediction;

    const refParentKey = "Cell Type";
    const refCol = refCellType;

    if(refCol && refCellSets && qryCol && qryCellSets && qryValues.cellSetColor && refValues.cellSetColor) {
      const qryNode = qryCellSets.tree.find(n => n.name === qryParentKey);
      const qryContourData = qryNode.children.map(group => {
        const nodePath = [qryParentKey, group.name];
        const color = qryValues.cellSetColor?.find(d => isEqual(d.path, nodePath))?.color;
        const indices = [];
        qryCol.forEach((val, i) => {
          if(val === group.name) {
            indices.push(i);
          }
        });
        return {
          name: group.name,
          indices,
          color,
        };
      });
      const refContourData = qryNode.children.map(group => {
        const nodePath = [refParentKey, group.name];
        const color = refValues.cellSetColor?.find(d => isEqual(d.path, nodePath))?.color;
        const indices = [];
        refCol.forEach((val, i) => {
          if(val === group.name) {
            indices.push(i);
          }
        });
        return {
          name: group.name,
          indices,
          color,
        };
      });
      return [qryContourData, refContourData];
    }
    return [null, null];
  }, [refCellType, refCellSets, qryPrediction, qryCellSets, qryValues.cellSetColor, refValues.cellSetColor]);

  useEffect(() => {
    if(!qryAnchorFocusViewState) {
      return;
    }
    if(isMainComparisonView) {
      setTransitionDuration(1000);
      setTransitionInterpolator(new LinearInterpolator({ transitionProps: ['target', 'zoom'] }));

      const { zoom: newZoom, target: [newTargetX, newTargetY] } = qryAnchorFocusViewState;
      qrySetters.setEmbeddingTargetX(newTargetX);
      qrySetters.setEmbeddingTargetY(newTargetY);
      qrySetters.setEmbeddingZoom(newZoom);
    }
    
  }, [qryAnchorFocusViewState]);

  const onTransitionEnd = useCallback((val) => {
    setTransitionDuration(undefined);
    setTransitionInterpolator(undefined);
  }, []);


  // TODO(scXAI): determine if query and reference should use same cell sets tree
  const mergedQryCellSets = useMemo(() => mergeCellSets(
    qryCellSets, qryValues.additionalCellSets,
  ), [qryCellSets, qryValues.additionalCellSets]);

  const mergedRefCellSets = useMemo(() => mergeCellSets(
    refCellSets, refValues.additionalCellSets,
  ), [refCellSets, refValues.additionalCellSets]);


  const setQryCellSelectionProp = useCallback((v) => {
    setCellSelection(
      v, qryValues.additionalCellSets, qryValues.cellSetColor,
      qrySetters.setCellSetSelection, qrySetters.setAdditionalCellSets, qrySetters.setCellSetColor,
      qrySetters.setCellColorEncodingPlugin,
    );
  }, [qryValues.additionalCellSets, qryValues.cellSetColor, qrySetters.setCellColorEncodingPlugin,
  qrySetters.setAdditionalCellSets, qrySetters.setCellSetColor, qrySetters.setCellSetSelection]);

  const setRefCellSelectionProp = useCallback((v) => {
    setCellSelection(
      v, refValues.additionalCellSets, refValues.cellSetColor,
      refSetters.setCellSetSelection, refSetters.setAdditionalCellSets, refSetters.setCellSetColor,
      refSetters.setCellColorEncodingPlugin,
    );
  }, [refValues.additionalCellSets, refValues.cellSetColor, refSetters.setCellColorEncodingPlugin,
  refSetters.setAdditionalCellSets, refSetters.setCellSetColor, refSetters.setCellSetSelection]);

  const qryCellColors = useMemo(() => getCellColors({
    cellColorEncodingPlugin: qryValues.cellColorEncodingPlugin,
    expressionData: qryExpressionData && qryExpressionData[0],
    geneSelection: qryValues.geneSelection,
    cellSets: mergedQryCellSets,
    cellSetSelection: qryValues.cellSetSelection,
    cellSetColor: qryValues.cellSetColor,
    expressionDataAttrs: qryAttrs,
    theme,
  }), [qryValues.cellColorEncodingPlugin, qryValues.geneSelection, mergedQryCellSets, theme,
  qryValues.cellSetSelection, qryValues.cellSetColor, qryExpressionData, qryAttrs]);

  const refCellColors = useMemo(() => getCellColors({
    cellColorEncodingPlugin: refValues.cellColorEncodingPlugin,
    expressionData: refExpressionData && refExpressionData[0],
    geneSelection: refValues.geneSelection,
    cellSets: mergedRefCellSets,
    cellSetSelection: refValues.cellSetSelection,
    cellSetColor: refValues.cellSetColor,
    expressionDataAttrs: refAttrs,
    theme,
  }), [refValues.cellColorEncodingPlugin, refValues.geneSelection, mergedRefCellSets, theme,
  refValues.cellSetSelection, refValues.cellSetColor, refExpressionData, refAttrs]);


  // TODO(scXAI): do we need to visualize colors for the reference cells?
  // TODO(scXAI): do we need to visualize polygons for the reference cell sets?
  
  // cellSetPolygonCache is an array of tuples like [(key0, val0), (key1, val1), ...],
  // where the keys are cellSetSelection arrays.
  const [qryCellSetPolygonCache, setQryCellSetPolygonCache] = useState([]);
  const cacheHas = (cache, key) => cache.findIndex(el => isEqual(el[0], key)) !== -1;
  const cacheGet = (cache, key) => cache.find(el => isEqual(el[0], key))?.[1];
  const qryCellSetPolygons = useMemo(() => {
    if ((qryValues.embeddingCellSetLabelsVisible || qryValues.embeddingCellSetPolygonsVisible)
      && !cacheHas(qryCellSetPolygonCache, qryValues.cellSetSelection)
      && mergedQryCellSets?.tree?.length
      && qryEmbedding
      && qryCellsIndex
      && qryValues.cellSetColor?.length) {
      const newCellSetPolygons = getCellSetPolygons({
        cells: qryCellsIndex,
        embedding: qryEmbedding,
        cellSets: mergedQryCellSets,
        cellSetSelection: qryValues.cellSetSelection,
        cellSetColor: qryValues.cellSetColor,
        theme,
      });
      setQryCellSetPolygonCache(cache => [...cache, [qryValues.cellSetSelection, newCellSetPolygons]]);
      return newCellSetPolygons;
    }
    return cacheGet(qryCellSetPolygonCache, qryValues.cellSetSelection) || [];
  }, [qryValues.embeddingCellSetLabelsVisible, qryCellSetPolygonCache, qryValues.embeddingCellSetPolygonsVisible, theme,
    qryCellsIndex, qryEmbedding, mergedQryCellSets, qryValues.cellSetSelection, qryValues.cellSetColor]);


  const qryCellSelection = useMemo(() => Array.from(qryCellColors.keys()), [qryCellColors]);

  // TODO(scXAI): do the reference dataset embedding coordinates have the same ranges as in the query dataset?
  const [xRange, yRange, xExtent, yExtent, numCells] = useMemo(() => {
    const cellValues = qryEmbedding;
    if (cellValues?.data) {
      const xVals = qryEmbedding.data.map(d => d[0]);
      const yVals = qryEmbedding.data.map(d => d[1]);
      const xE = extent(xVals);
      const yE = extent(yVals);
      const xR = xE[1] - xE[0];
      const yR = yE[1] - yE[0];
      return [xR, yR, xE, yE, cellValues.shape[1]];
    }
    return [null, null, null, null, null];
  }, [qryEmbedding, qryValues.embeddingType]);

  // After cells have loaded or changed,
  // compute the cell radius scale based on the
  // extents of the cell coordinates on the x/y axes.
  useEffect(() => {
    if (xRange && yRange && modelIteration === 1) {
      const pointSizeDevicePixels = getPointSizeDevicePixels(
        window.devicePixelRatio, qryValues.embeddingZoom, xRange, yRange, width, height,
      );
      setDynamicCellRadius(pointSizeDevicePixels/4);

      const nextCellOpacityScale = getPointOpacity(
        qryValues.embeddingZoom, xRange, yRange, width, height, numCells, averageFillDensity,
      );
      setDynamicCellOpacity(nextCellOpacityScale);

      if (typeof targetX !== 'number' || typeof targetY !== 'number') {
        const newTargetX = xExtent[0] + xRange / 2;
        const newTargetY = yExtent[0] + yRange / 2;
        const newZoom = Math.log2(Math.min(width / xRange, height / yRange));
        qrySetters.setEmbeddingTargetX(newTargetX);
        // Graphics rendering has the y-axis going south so we need to multiply by negative one.
        qrySetters.setEmbeddingTargetY(-newTargetY);
        qrySetters.setEmbeddingZoom(newZoom);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xRange, yRange, xExtent, yExtent, numCells, qryValues.embeddingType,
    width, height, averageFillDensity, modelIteration]);

  const getQryCellInfo = useCallback((cellIndex) => {
    return {
      [`Cell ID`]: qryCellsIndex[cellIndex],
    };
  }, [qryCellsIndex]);

  const setQryCellHighlight = useCallback((cellIndex) => {
    qrySetters.setCellHighlight(cellIndex);
    //console.log(cellIndex);
    //console.log(qryAnchorCluster[cellIndex]);
  }, [qryAnchorCluster]);

  const cellSelectionSet = useMemo(() => new Set(qryCellSelection), [qryCellSelection]);
  const getCellIsSelected = useCallback(cellEntry => (
    (cellSelectionSet || new Set([])).has(cellEntry[0]) ? 1.0 : 0.0), [cellSelectionSet]);

  const cellRadius = (qryValues.embeddingCellRadiusMode === 'manual' ? qryValues.embeddingCellRadius : dynamicCellRadius);
  const cellOpacity = (qryValues.embeddingCellOpacityMode === 'manual' ? qryValues.embeddingCellOpacity : dynamicCellOpacity);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  const getQryExpressionValue = useExpressionValueGetter({ attrs: qryAttrs, expressionData: qryExpressionData });
  const getRefExpressionValue = useExpressionValueGetter({ attrs: refAttrs, expressionData: refExpressionData });

  const qryCellsCount = qryCellsIndex?.length;
  const refCellsCount = refCellsIndex?.length;

  const qryCellsCountNice = qryCellsCount ? (qryCellsCount).toLocaleString("en-US") : "";
  const refCellsCountNice = refCellsCount ? (refCellsCount).toLocaleString("en-US") : "";

  return (
    <TitleInfo
      title={title}
      info={isMainComparisonView ? `${qryCellsCountNice} ${pluralize('query cell', 'query cells', qryCellsCount)}, ${refCellsCountNice} ${pluralize('reference cell', 'reference cells', refCellsCount)}` : ''}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      options={(
        <QRComparisonScatterplotOptions
          observationsLabel={observationsLabel}

          legendsVisible={qryValues.embeddingLegendsVisible}
          setLegendsVisible={qrySetters.setEmbeddingLegendsVisible}

          presetButtonsVisible={qryValues.presetButtonsVisible}
          setPresetButtonsVisible={qrySetters.setPresetButtonsVisible}

          qryCellsVisible={qryValues.embeddingVisible}
          setQryCellsVisible={qrySetters.setEmbeddingVisible}
          qryCellEncoding={qryValues.embeddingEncoding}
          setQryCellEncoding={qrySetters.setEmbeddingEncoding}
          refCellsVisible={refValues.embeddingVisible}
          setRefCellsVisible={refSetters.setEmbeddingVisible}
          refCellEncoding={refValues.embeddingEncoding}
          setRefCellEncoding={refSetters.setEmbeddingEncoding}

          linksVisible={qryValues.embeddingLinksVisible}
          setLinksVisible={qrySetters.setEmbeddingLinksVisible}
          linksSizeEncoding={qryValues.embeddingLinksSizeEncoding === 'anchorSetScores'}
          setLinksSizeEncoding={(v) => {
            if(v) {
              qrySetters.setEmbeddingLinksSizeEncoding('anchorSetScores');
            } else {
              qrySetters.setEmbeddingLinksSizeEncoding(null);
            }
          }}

          refCellColorEncoding={refValues.cellColorEncodingPlugin}
          setRefCellColorEncoding={refSetters.setCellColorEncodingPlugin}
          qryCellColorEncoding={qryValues.cellColorEncodingPlugin}
          setQryCellColorEncoding={qrySetters.setCellColorEncodingPlugin}

          cellRadius={qryValues.embeddingCellRadius}
          setCellRadius={qrySetters.setEmbeddingCellRadius}
          cellRadiusMode={qryValues.embeddingCellRadiusMode}
          setCellRadiusMode={qrySetters.setEmbeddingCellRadiusMode}
          cellOpacity={qryValues.embeddingCellOpacity}
          setCellOpacity={qrySetters.setEmbeddingCellOpacity}
          cellOpacityMode={qryValues.embeddingCellOpacityMode}
          setCellOpacityMode={qrySetters.setEmbeddingCellOpacityMode}
          cellSetLabelsVisible={qryValues.embeddingCellSetLabelsVisible}
          setCellSetLabelsVisible={qrySetters.setEmbeddingCellSetLabelsVisible}
          cellSetLabelSize={qryValues.embeddingCellSetLabelSize}
          setCellSetLabelSize={qrySetters.setEmbeddingCellSetLabelSize}
          cellSetPolygonsVisible={qryValues.embeddingCellSetPolygonsVisible}
          setCellSetPolygonsVisible={qrySetters.setEmbeddingCellSetPolygonsVisible}
          
          geneExpressionColormap={qryValues.geneExpressionColormap}
          setGeneExpressionColormap={qrySetters.setGeneExpressionColormap}
          geneExpressionColormapRange={qryValues.geneExpressionColormapRange}
          setGeneExpressionColormapRange={qrySetters.setGeneExpressionColormapRange}

          debugCellTypes={qryValues.debugCellTypes}
          setDebugCellTypes={qrySetters.setDebugCellTypes}
        />
      )}
    >
      <QRComparisonScatterplot
        ref={deckRef}
        uuid={uuid}
        theme={theme}
        viewState={{
          zoom: qryValues.embeddingZoom,
          target: [
            qryValues.embeddingTargetX,
            qryValues.embeddingTargetY,
            qryValues.embeddingTargetZ
          ],
          transitionDuration,
          transitionInterpolator,
          transitionInterruption: TRANSITION_EVENTS.IGNORE,
          onTransitionEnd,
        }}
        setViewState={({ zoom: newZoom, target }) => {
          qrySetters.setEmbeddingZoom(newZoom);
          qrySetters.setEmbeddingTargetX(target[0]);
          qrySetters.setEmbeddingTargetY(target[1]);
          qrySetters.setEmbeddingTargetZ(target[2] || 0);
        }}

        anchorEditTool={qryValues.anchorEditTool}

        qrySupportingBounds={qrySupportingViewInfo?.bounds}
        refSupportingBounds={refSupportingViewInfo?.bounds}
        // qryCells={qryCells}
        // refCells={refCells}
        qryCellsIndex={qryCellsIndex}
        refCellsIndex={refCellsIndex}
        qryEmbedding={qryEmbedding}
        refEmbedding={refEmbedding}
        qryMapping={qryValues.embeddingType}
        refMapping={refValues.embeddingType}
        qryContour={qryContour}
        refContour={refContour}
        cellFilter={qryValues.cellFilter}
        cellSelection={qryCellSelection}
        cellHighlight={qryValues.cellHighlight}
        qryCellColors={qryCellColors}
        refCellColors={refCellColors}
        cellSetPolygons={qryCellSetPolygons}
        cellSetLabelSize={qryValues.embeddingCellSetLabelSize}
        cellSetLabelsVisible={qryValues.embeddingCellSetLabelsVisible}
        cellSetPolygonsVisible={qryValues.embeddingCellSetPolygonsVisible}
        setCellFilter={qrySetters.setCellFilter}
        setCellSelection={setQryCellSelectionProp}
        setQryCellHighlight={setQryCellHighlight}
        setRefCellHighlight={refSetters.setCellHighlight}
        cellRadius={cellRadius}
        cellOpacity={cellOpacity}
        refCellColorEncoding={refValues.cellColorEncodingPlugin}
        qryCellColorEncoding={qryValues.cellColorEncodingPlugin}
        geneExpressionColormap={qryValues.geneExpressionColormap}
        geneExpressionColormapRange={qryValues.geneExpressionColormapRange}
        setComponentHover={() => {
          setComponentHover(uuid);
        }}
        updateViewInfo={setComponentViewInfo}
        getQryExpressionValue={getQryExpressionValue}
        getRefExpressionValue={getRefExpressionValue}
        getCellIsSelected={getCellIsSelected}
        
        qryCellsVisible={qryValues.embeddingVisible}
        qryCellEncoding={qryValues.embeddingEncoding}
        refCellsVisible={refValues.embeddingVisible}
        refCellEncoding={refValues.embeddingEncoding}

        anchorLinks={anchorLinks}
        anchorLinksVisible={qryValues.embeddingLinksVisible}
        maxQryAnchorSize={maxQryAnchorSize}
        maxRefAnchorSize={maxRefAnchorSize}
        linksSizeEncoding={qryValues.embeddingLinksSizeEncoding === 'anchorSetScores'}

        qryAnchorSetFocus={qryAnchorSetFocus}
        refAnchorSetFocus={refAnchorSetFocus}
        qryAnchorFocusIndices={qryAnchorFocusIndices}
        refAnchorFocusIndices={refAnchorFocusIndices}


        qryAnchorSetHighlight={qryAnchorSetHighlight}
        refAnchorSetHighlight={refAnchorSetHighlight}
        qryAnchorHighlightIndices={qryAnchorHighlightIndices}
        refAnchorHighlightIndices={refAnchorHighlightIndices}

        qryAnchorSetFocusContour={qryAnchorSetFocusContour}
        refAnchorSetFocusContour={refAnchorSetFocusContour}
        
        qryAnchorSetHighlightContour={qryAnchorSetHighlightContour}
        refAnchorSetHighlightContour={refAnchorSetHighlightContour}
      />
      {!disableTooltip && (
        <ScatterplotTooltipSubscriber
          parentUuid={uuid}
          cellHighlight={qryValues.cellHighlight}
          width={width}
          height={height}
          getCellInfo={getQryCellInfo}
        />
      )}
      <FocusInfo
        qryAnchorSetFocus={qryAnchorSetFocus}
        qryGeneSelection={qryValues.geneSelection}
        qryLoadedSelection={qryLoadedSelection}
        qryExpressionDataStatus={qryExpressionDataStatus}
      />
      <Legend
        visible={qryValues.embeddingLegendsVisible}
        qryCellColorEncoding={qryValues.cellColorEncodingPlugin}
        refCellColorEncoding={refValues.cellColorEncodingPlugin}
        
        geneSelection={qryValues.geneSelection}
        geneExpressionColormap={qryValues.geneExpressionColormap}
        geneExpressionColormapRange={qryValues.geneExpressionColormapRange}

        anchorSetFocus={qryAnchorSetFocus}
        qryCellSets={qryCellSets}
        refCellSets={refCellSets}
        qryCellSetColor={qryValues.cellSetColor}
        refCellSetColor={refValues.cellSetColor}

        qryEmbeddingEncoding={qryValues.embeddingEncoding}
        refEmbeddingEncoding={refValues.embeddingEncoding}
      />
      <PresetButtons
        visible={qryValues.presetButtonsVisible}
        qrySetters={qrySetters}
        refSetters={refSetters}
      />
    </TitleInfo>
  );
}
