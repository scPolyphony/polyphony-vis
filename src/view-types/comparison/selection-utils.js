/* eslint-disable */
import { COORDINATE_SYSTEM } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import SelectionLayer from './SelectionLayer';

/**
 * Convert a DeckGL layer ID to a "base" layer ID for selection.
 * @param {string} layerId The layer ID to convert.
 * @returns {string} The base layer ID.
 */
 function getBaseLayerId(layerId) {
  return `base-${layerId}`;
}

/**
 * Construct DeckGL selection layers.
 * @param {string} tool
 * @param {number} zoom
 * @param {string} cellBaseLayerId
 * @param {function} getCellCoords
 * @param {function} updateCellsSelection
 * @returns {object[]} The array of DeckGL selection layers.
 */
 export function getSelectionLayers(
  tool,
  zoom,
  layerId,
  getCellCoords,
  qryCellsIndex,
  updateCellsSelection,
  cellsQuadTree,
  flipY = false,
) {
  if (!tool) {
    return [];
  }

  const cellBaseLayerId = getBaseLayerId(layerId);
  const editHandlePointRadius = 5 / (zoom + 16);

  return [new SelectionLayer({
    id: 'selection',
    flipY,
    cellsQuadTree,
    getCellCoords,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    selectionType: tool,
    onSelect: ({ pickingInfos }) => {
      const cellIds = pickingInfos.map(i => qryCellsIndex[i]);
      if (updateCellsSelection) {
        updateCellsSelection(cellIds);
      }
    },
    layerIds: [cellBaseLayerId],
    getTentativeFillColor: () => [255, 255, 255, 95],
    getTentativeLineColor: () => [143, 143, 143, 255],
    getTentativeLineDashArray: () => [7, 4],
    lineWidthMinPixels: 2,
    lineWidthMaxPixels: 2,
    getEditHandlePointColor: () => [0xff, 0xff, 0xff, 0xff],
    getEditHandlePointRadius: () => editHandlePointRadius,
    editHandlePointRadiusScale: 1,
    editHandlePointRadiusMinPixels: editHandlePointRadius,
    editHandlePointRadiusMaxPixels: 2 * editHandlePointRadius,
  })];
}
