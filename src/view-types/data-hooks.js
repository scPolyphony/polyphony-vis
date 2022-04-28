import { useState, useEffect, useMemo } from 'react';
import { useSetWarning } from 'vitessce';
import isEqual from 'lodash/isEqual';
import { extent } from 'd3-array';
import sum from 'lodash/sum';
import intersection from 'lodash/intersection';
import union from 'lodash/union';

import {
  LoaderNotFoundError,
} from '../file-types/errors/index';
import { dataToCellSetsTree } from '../file-types/data-loaders/CellSetsZarrLoader';
import { PALETTE } from './utils';


const STATUS_LOADING = 'loading';
const STATUS_SUCCESS = 'success';
const STATUS_ERROR = 'error';

/**
 * Warn via publishing to the console
 * and to the global warning store.
 * @param {AbstractLoaderError} error An error instance.
 */
function warn(error, setWarning) {
  setWarning(error.message);
  console.warn(error.message);
  if (error.warnInConsole) {
    error.warnInConsole();
  }
}

/**
 * Get data from an AnnData store.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {function} setItemIsReady A function to call
 * when done loading.
 * @param {function} addUrl A function to call to update
 * the URL list.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @param {object} coordinationSetters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialCoordinationValues Object where
 * keys are coordination type names with the prefix 'initialize',
 * values are initialization preferences as boolean values.
 * @returns {array} [staticData]
 */
export function useAnnDataStatic(
  loaders, dataset, path, dtype, setItemIsReady, isRequired,
  coordinationSetters, initialCoordinationValues,
) {
  const [staticData, setStaticData] = useState();
  const [status, setStatus] = useState(STATUS_LOADING);

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset] || !path) {
      return;
    }

    if (loaders[dataset].loaders['cells']) {
      setStatus(STATUS_LOADING);
      loaders[dataset].loaders['cells'].loadStatic(path, dtype).catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        setStaticData(payload);
        setItemIsReady(path);
        setStatus(STATUS_SUCCESS);
      });
    } else {
      setStaticData(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, 'cells', path, null), setWarning);
        setStatus(STATUS_ERROR);
      } else {
        setItemIsReady(path);
        setStatus(STATUS_SUCCESS);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset, path]);

  return [staticData, status];
}

export function useAnnDataDynamic(
  loaders, dataset, path, dtype, iteration, setItemIsReady, isRequired,
  coordinationSetters, initialCoordinationValues,
) {
  const [dynamicData, setDynamicData] = useState();
  const [status, setStatus] = useState(STATUS_LOADING);

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset] || !path) {
      return;
    }

    if (loaders[dataset].loaders['cells']) {
      setStatus(STATUS_LOADING);
      loaders[dataset].loaders['cells'].loadDynamic(path, dtype, iteration).catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        setDynamicData(payload);
        setItemIsReady(path);
        setStatus(STATUS_SUCCESS);
      });
    } else {
      setDynamicData(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, 'cells', path, null), setWarning);
        setStatus(STATUS_ERROR);
      } else {
        setItemIsReady(path);
        setStatus(STATUS_SUCCESS);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset, path, iteration]);

  return [dynamicData, status];
}

export function useAnnDataIndices(
  loaders, dataset, setItemIsReady, isRequired,
  coordinationSetters, initialCoordinationValues,
) {
  const [obsIndex, setObsIndex] = useState();
  const [varIndex, setVarIndex] = useState();
  const [status, setStatus] = useState(STATUS_LOADING);

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders['cells']) {
      setStatus(STATUS_LOADING);
      loaders[dataset].loaders['cells'].loadIndices().catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        const { data } = payload;
        setObsIndex(data[0]);
        setVarIndex(data[1]);
        setItemIsReady('cells');
        setStatus(STATUS_SUCCESS);
      });
    } else {
      setObsIndex(null);
      setVarIndex(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, 'cells', null, null), setWarning);
        setStatus(STATUS_ERROR);
      } else {
        setItemIsReady('cells');
        setStatus(STATUS_SUCCESS);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [obsIndex, varIndex, status];
}

/**
 * Convert a 2D array of gene indices to a 2D array of gene names, using an index array.
 * @param {*} qryGenesIndex 
 * @param {*} qryDiffGeneNameIndices 
 * @returns 
 */
export function useDiffGeneNames(qryGenesIndex, qryDiffGeneNameIndices) {
  const qryDiffGeneNames = useMemo(() => {
    if (qryDiffGeneNameIndices && qryGenesIndex) {
      const result = [];
      qryDiffGeneNameIndices.data.forEach(row => {
        const rowResult = [];
        row.forEach(i => rowResult.push(qryGenesIndex[i]));
        result.push(rowResult);
      });
      return result;
    }
    return null;
  }, [qryGenesIndex, qryDiffGeneNameIndices]);
  return qryDiffGeneNames;
}

export function useCellSetsTree(qryCellsIndex, qryFeatureColumns, qryFeatureColumnNames) {
  const tree = useMemo(() => {
    if (qryCellsIndex && qryFeatureColumns && qryFeatureColumnNames) {
      // TODO(scXAI): support multiple qryFeatureColumns and corresponding names.
      const result = dataToCellSetsTree([qryCellsIndex, qryFeatureColumns.filter(col => Array.isArray(col)), []], qryFeatureColumnNames.map(colname => ({ groupName: colname })).filter((col, i) => Array.isArray(qryFeatureColumns[i])));
      return result;
    }
    return null;
  }, [qryCellsIndex, ...qryFeatureColumns, ...qryFeatureColumnNames]);
  return tree;
}

export function useInitialRefCellSetSelection(mergedQryCellSets, qryValues, qrySetters, parentKey) {
  useEffect(() => {
    if (qryValues.cellSetColor !== null || qryValues.cellSetSelection !== null || qryValues.cellColorEncodingPlugin !== null) {
      return;
    }

    const node = mergedQryCellSets.tree.find(n => n.name === parentKey);
    if (node) {
      const newSelection = node.children.map(n => ([parentKey, n.name]));
      qrySetters.setCellSetSelection(newSelection);

      const sortedSelection = node.children
        .map(n => ({ path: [parentKey, n.name], size: n.set?.length || 0 }))
        .sort((a, b) => b.size - a.size);

      const newColors = sortedSelection.map(({ path }, i) => ({
        color: PALETTE[i % PALETTE.length],
        path: path,
      }));
      qrySetters.setCellSetColor(newColors);
      qrySetters.setCellColorEncodingPlugin('cellSetSelection');
    }
  }, [mergedQryCellSets, parentKey, qryValues.cellSetColor, qryValues.cellSetSelection, qryValues.cellColorEncodingPlugin]);
}

export function useInitialQryCellSetSelection(mergedQryCellSets, qryValues, qrySetters, parentKey, initialRefCellSetColor) {
  useEffect(() => {
    if (qryValues.cellSetColor !== null || qryValues.cellSetSelection !== null || qryValues.cellColorEncoding !== null || !initialRefCellSetColor) {
      return;
    }

    const node = mergedQryCellSets.tree.find(n => n.name === parentKey);
    if (node) {
      const newSelection = node.children.map(n => ([parentKey, n.name]));
      qrySetters.setCellSetSelection(newSelection);

      const newColors = newSelection.map((path, i) => {
        const matchingRefSet = initialRefCellSetColor.find(d => d.path[1] === path[1]);
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
      qrySetters.setCellColorEncodingPlugin('cellSetSelection');
    }
  }, [mergedQryCellSets, parentKey, qryValues.cellSetColor, qryValues.cellSetSelection, qryValues.cellColorEncodingPlugin, initialRefCellSetColor]);
}

export function useAnchors(
  loader, iteration, setItemIsReady, isRequired,
) {
  const [result, setResult] = useState();
  const [status, setStatus] = useState(STATUS_LOADING);

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loader) {
      return;
    }

    if (loader) {
      setStatus(STATUS_LOADING);
      loader.anchorGet(iteration).catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        setResult(payload)
        setItemIsReady('anchors');
        setStatus(STATUS_SUCCESS);
      });
    } else {
      setResult(null);
      if (isRequired) {
        setStatus(STATUS_ERROR);
      } else {
        setItemIsReady('anchors');
        setStatus(STATUS_SUCCESS);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader, iteration]);

  return [result, status];
}

export function useProcessedAnchorSets(
  anchors, refDiffGeneNames, refDiffGeneScores, refDiffClusters, qryPrediction, qryCellsIndex, qryCellSets, cellSetColor, parentKey
) {
  const qryTopGenesLists = useMemo(() => {
    if (anchors && refDiffGeneNames && refDiffGeneScores && refDiffClusters && qryPrediction && qryCellsIndex && qryCellSets && cellSetColor) {
      const predictionNode = qryCellSets.tree.find(n => n.name === parentKey);
      const predictionPaths = predictionNode.children.map(n => ([parentKey, n.name]));

      const NUM_GENES = 100;

      const result = {};
      Object.keys(anchors).forEach(anchorType => {
        result[anchorType] = {};
        anchors[anchorType].forEach((anchorObj, clusterIndex) => {

          const refAnchorId = `${anchorObj.anchor_ref_id}`; // convert to string
          const refClusterIndex = refDiffClusters.indexOf(refAnchorId);
          const refClusterTopGeneNames = refDiffGeneNames[refClusterIndex].slice(0, NUM_GENES);
          const refClusterAllGeneNames = refDiffGeneNames[refClusterIndex];
          const refClusterAllGeneScores = refDiffGeneScores.data[refClusterIndex];

          let qryClusterAllGeneNames = [];
          let qryClusterAllGeneScores = [];
          if (!Array.isArray(anchorObj.rank_genes_groups)) {
            qryClusterAllGeneNames = anchorObj.rank_genes_groups.name_indice;
            qryClusterAllGeneScores = anchorObj.rank_genes_groups.score;
          } else {
            qryClusterAllGeneNames = anchorObj.rank_genes_groups.map(v => v.name_indice);
            qryClusterAllGeneScores = anchorObj.rank_genes_groups.map(v => v.score);
          }
          const qryClusterTopGeneNames = qryClusterAllGeneNames.slice(0, NUM_GENES);

          const topGeneNames = Array.from(new Set([...qryClusterTopGeneNames, ...refClusterTopGeneNames]));

          const topGeneScore = (intersection(qryClusterTopGeneNames, refClusterTopGeneNames).length / union(qryClusterTopGeneNames, refClusterTopGeneNames).length) * 100;

          result[anchorType][anchorObj.id] = {
            id: anchorObj.id,
            names: topGeneNames,
            topGeneScore: topGeneScore,
            scores: topGeneNames.map(name => ({
              qry: qryClusterAllGeneScores[qryClusterAllGeneNames.indexOf(name)],
              ref: refClusterAllGeneScores[refClusterAllGeneNames.indexOf(name)],
            })),
            significances: topGeneNames.map(name => ({
              qry: qryClusterTopGeneNames.includes(name),
              ref: refClusterTopGeneNames.includes(name),
            })),
            rankings: topGeneNames.map(name => ({
              qry: (qryClusterAllGeneNames.indexOf(name) >= 0 ? qryClusterAllGeneNames.indexOf(name)+1 : null), // convert to 1-indexed?
              ref: (refClusterAllGeneNames.indexOf(name) >= 0 ? refClusterAllGeneNames.indexOf(name)+1 : null), // convert to 1-indexed?
            })),
            latentDist: anchorObj.anchor_dist_median,
            numCells: anchorObj.cells.length,
            predictionProportions: predictionPaths.map(path => {
              const [prefix, setName] = path;
              const color = cellSetColor.find(o => isEqual(path, o.path))?.color || [60, 60, 60];
              const numCellsInCluster = anchorObj.cells.length;
              const numCellsInClusterAndSet = anchorObj.cells.filter(cellObj => setName === qryPrediction[qryCellsIndex.indexOf(cellObj.cell_id)]).length;
              const proportion = numCellsInClusterAndSet / numCellsInCluster;
              return {
                name: setName,
                color: color,
                proportion: proportion,
              };
            }),
          };
        });
      });
      return result;
    }
    return null;
  }, [anchors, refDiffGeneNames, refDiffGeneScores, refDiffClusters, qryPrediction, qryCellsIndex, anchors, qryCellSets, cellSetColor, parentKey]);
  return qryTopGenesLists;
}

export function useAnchorSetOfInterest(
  qryAnchorId, anchors, qryCellsIndex, qryEmbedding, refAnchorCluster, width, height, returnViewState,
) {
  const [qryAnchorSetFocus, refAnchorSetFocus, qryAnchorFocusIndices, refAnchorFocusIndices, qryAnchorFocusViewState] = useMemo(() => {
    // TODO(scXAI): debounce?
    if (qryAnchorId && anchors && qryCellsIndex && qryEmbedding && refAnchorCluster) {
      const anchorGroup = Object.values(anchors).find(anchorSets => anchorSets.map(o => o.id).includes(qryAnchorId));
      const anchorObj = anchorGroup.find(o => o.id === qryAnchorId);
      const refAnchorId = `${anchorObj.anchor_ref_id}`; // convert to string

      const qryCellIds = anchorObj.cells.map(c => c.cell_id);
      const qryCellIndices = qryCellIds.map(cellId => qryCellsIndex.indexOf(cellId));

      let newViewState = null;
      if (returnViewState) {
        const qryX = qryCellIndices.map(i => qryEmbedding.data[0][i]);
        const qryY = qryCellIndices.map(i => -qryEmbedding.data[1][i]);
        const qryXE = extent(qryX);
        const qryYE = extent(qryY);
        const qryXR = qryXE[1] - qryXE[0];
        const qryYR = qryYE[1] - qryYE[0];

        const newTargetX = sum(qryX) / qryX.length;
        const newTargetY = sum(qryY) / qryY.length;
        const newZoom = Math.log2(Math.min(width / qryXR, height / qryYR)) - 2;
        newViewState = { zoom: newZoom, target: [newTargetX, newTargetY] };
      }

      const refCellIndices = []
      refAnchorCluster.forEach((clusterId, i) => {
        if (clusterId === refAnchorId) {
          refCellIndices.push(i);
        }
      });
      return [qryAnchorId, refAnchorId, qryCellIndices, refCellIndices, newViewState];
    }
    return [null, null, null, null, null];
  }, [qryAnchorId, anchors, qryCellsIndex, qryEmbedding, refAnchorCluster, width, height]);

  return [qryAnchorSetFocus, refAnchorSetFocus, qryAnchorFocusIndices, refAnchorFocusIndices, qryAnchorFocusViewState];
}

export function useAnchorContourOfInterest(
  qryAnchorSetFocus, refAnchorSetFocus, qryAnchorFocusIndices, refAnchorFocusIndices, refCol, refParentKey, refCellSets, qryCol, qryParentKey, qryCellSets, qryCellSetColor, refCellSetColor
) {
  // Based on the currently focused anchor set, get all of the necessary info to render contour layers for the focused set.
  const [qryAnchorSetFocusContour, refAnchorSetFocusContour] = useMemo(() => {
    if (refCellSets && qryCellSets) {
      const qryNode = qryCellSets.tree.find(n => n.name === qryParentKey);
      const refNode = refCellSets.tree.find(n => n.name === refParentKey);
      if (qryAnchorSetFocus && refAnchorSetFocus && qryAnchorFocusIndices && refAnchorFocusIndices && refCol && qryCol && qryCellSetColor && refCellSetColor) {
        const qryContourData = qryNode.children.map(group => {
          const nodePath = [qryParentKey, group.name];
          const color = qryCellSetColor?.find(d => isEqual(d.path, nodePath))?.color || [60, 60, 60];
          const indices = qryAnchorFocusIndices.filter(i => qryCol[i] === group.name);
          return {
            name: group.name,
            indices: indices,
            color,
            visible: indices.length > 0,
          };
        });
        const refContourData = refNode.children.map(group => {
          const nodePath = [refParentKey, group.name];
          const color = refCellSetColor?.find(d => isEqual(d.path, nodePath))?.color || [60, 60, 60];
          const indices = refAnchorFocusIndices.filter(i => refCol[i] === group.name);
          return {
            name: group.name,
            indices: indices,
            color,
            visible: indices.length > 0,
          };
        });
        return [qryContourData, refContourData];
      } else if (qryNode && refNode) {
        return [
          qryNode.children.map(group => {
            const nodePath = [qryParentKey, group.name];
            const color = qryCellSetColor?.find(d => isEqual(d.path, nodePath))?.color || [60, 60, 60];
            return {
              name: group.name,
              indices: [],
              color,
              visible: false,
            };
          }),
          refNode.children.map(group => {
            const nodePath = [refParentKey, group.name];
            const color = refCellSetColor?.find(d => isEqual(d.path, nodePath))?.color || [60, 60, 60];
            return {
              name: group.name,
              indices: [],
              color,
              visible: false,
            };
          }),
        ];
      }
    }
    return [null, null];
  }, [qryAnchorSetFocus, refAnchorSetFocus, qryAnchorFocusIndices, refAnchorFocusIndices, refCol, refCellSets, qryCol, qryCellSets, qryCellSetColor, refCellSetColor]);
  return [qryAnchorSetFocusContour, refAnchorSetFocusContour];
}

/**
 * Compress three-folded anchor lists
 */
export function useCompressedAnchors(anchors) {
  const compressedAnchors = useMemo(() => {
    const compressedAnchors = {};
    anchors && Object.keys(anchors).forEach(groupId =>
      Object.entries(anchors[groupId]).
        forEach(([anchorId, anchorInfo]) =>
          compressedAnchors[anchorId] = anchorInfo
        )
    )
    return compressedAnchors;
  }, [anchors]);

  return compressedAnchors;
}

/**
 * Seperate genes according whether it belongs to the top list in ref and qry.
 */
export function useSeperatedGenes(anchor) {
  const seperatedGenes = useMemo(() => {
    const seperatedGenes = { shared: [], ref: [], qry: [] };
    if (anchor) {
      const { names, scores, significances, rankings } = anchor;
      significances.forEach((sig, i) => {
        const geneInfo = {
          name: names[i],
          score: scores[i],
          ranking: rankings[i],
          qryTriangles: rankings[i].qry === null ? 0 : (rankings[i].qry <= 10 ? 3 : (rankings[i].qry <= 20 ? 2 : (rankings[i].qry <= 100 ? 1 : 0))),
          refTriangles: rankings[i].ref === null ? 0 : (rankings[i].ref <= 10 ? 3 : (rankings[i].ref <= 20 ? 2 : (rankings[i].ref <= 100 ? 1 : 0))),
        };
        if (sig.qry && sig.ref) {
          seperatedGenes.shared.push(geneInfo)
        }
        else if (sig.qry && !sig.ref) {
          seperatedGenes.qry.push(geneInfo)
        }
        else if (!sig.qry && sig.ref) {
          seperatedGenes.ref.push(geneInfo)
        }
      })
    }
    return seperatedGenes;
  }, [anchor]);
  return seperatedGenes;
}