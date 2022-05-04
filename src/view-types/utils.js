import uuidv4 from 'uuid/v4';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import range from 'lodash/range';
import { featureCollection as turfFeatureCollection, point as turfPoint } from '@turf/helpers';
import centroid from '@turf/centroid';
import concaveman from 'concaveman';
import { OrthographicView } from 'deck.gl';
import clamp from 'lodash/clamp';

export const VITESSCE_CONTAINER = 'vitessce-container';

export const TOOLTIP_ANCESTOR = 'tooltip-ancestor';
const CARD = `card card-body my-2 ${TOOLTIP_ANCESTOR}`;
export const PRIMARY_CARD = `${CARD} bg-primary`;
export const SECONDARY_CARD = `${CARD} bg-secondary`;
export const BLACK_CARD = `${CARD} bg-black`;
export const TITLE_CARD = 'title';
export const SCROLL_CARD = `${PRIMARY_CARD} scroll`;


// List of the GLSL colormaps available,
// to validate against before string replacing.
export const GLSL_COLORMAPS = [
  'plasma',
  'viridis',
  'jet',
  'cool',
  'winter',
  'copper',
  'bluered',
  'rdbu',
  'picnic',
  'portland',
];
export const GLSL_COLORMAP_DEFAULT = 'winter';
export const COLORMAP_SHADER_PLACEHOLDER = 'COLORMAP_FUNC';

/**
 * Select between a singular and plural version of a word,
 * based on an item count.
 * @param {string} singular The singular version of the word.
 * @param {string} plural The plural version of the word.
 * @param {number} count The number of items.
 * @returns {string} Singular if count is one, else plural.
 */
export function pluralize(singular, plural, count) {
  return (count === 1 ? singular : plural);
}

/**
 * Capitalize a the first letter of a string.
 * @param {string} word A string to capitalize.
 * @returns {string} The word parameter with the first letter capitalized.
 */
export function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export const DEFAULT_GL_OPTIONS = { webgl2: true };

export function getNextNumberedNodeName(nodes, prefix) {
  let i = 1;
  if (nodes) {
    // eslint-disable-next-line no-loop-func
    while (nodes.find(n => n.name === `${prefix}${i}`)) {
      // eslint-disable-next-line no-plusplus
      i++;
    }
  }
  return `${prefix}${i}`;
}

export const DEFAULT_DARK_COLOR = [50, 50, 50];
export const DEFAULT_LIGHT_COLOR = [200, 200, 200];

export function getDefaultColor(theme) {
  return theme === 'dark' ? DEFAULT_DARK_COLOR : DEFAULT_LIGHT_COLOR;
}


// From https://public.tableau.com/views/TableauColors/ColorPaletteswithRGBValues
export const PALETTE = [
  [31, 119, 180],
  [255, 127, 14],
  [174, 199, 232],
  [255, 187, 120],
  [44, 160, 44],
  [152, 223, 138],
  // [214, 39, 40],
  // [255, 152, 150],
  [148, 103, 189],
  [197, 176, 213],
  [140, 86, 75],
  [196, 156, 148],
  [227, 119, 194],
  [247, 182, 210],
  [255, 152, 150],
  // [127, 127, 127],
  // [199, 199, 199],
  [188, 189, 34],
  [219, 219, 141],
  [23, 190, 207],
  [158, 218, 229],
];

/**
 * Create a new selected cell set based on a cell selection.
 * @param {string[]} cellSelection An array of cell IDs.
 * @param {object[]} additionalCellSets The previous array of user-defined cell sets.
 * @param {function} setCellSetSelection The setter function for cell set selections.
 * @param {function} setAdditionalCellSets The setter function for user-defined cell sets.
 */
export function setCellSelection(cellSelection, additionalCellSets, cellSetColor, setCellSetSelection, setAdditionalCellSets, setCellSetColor, setCellColorEncodingPlugin, prefix = 'Selection ') {
  const CELL_SELECTIONS_LEVEL_ZERO_NAME = 'My Selections';

  const selectionsLevelZeroNode = additionalCellSets?.tree.find(
    n => n.name === CELL_SELECTIONS_LEVEL_ZERO_NAME,
  );
  const nextAdditionalCellSets = {
    version: '0.1.3',
    datatype: 'cell',
    tree: [...(additionalCellSets ? additionalCellSets.tree : [])],
  };

  const nextName = getNextNumberedNodeName(selectionsLevelZeroNode?.children, prefix);
  let colorIndex = 0;
  if (selectionsLevelZeroNode) {
    colorIndex = selectionsLevelZeroNode.children.length;
    selectionsLevelZeroNode.children.push({
      name: nextName,
      set: cellSelection.map(d => [d, null]),
    });
  } else {
    nextAdditionalCellSets.tree.push({
      name: CELL_SELECTIONS_LEVEL_ZERO_NAME,
      children: [
        {
          name: nextName,
          set: cellSelection.map(d => [d, null]),
        },
      ],
    });
  }
  setAdditionalCellSets(nextAdditionalCellSets);
  const nextPath = ['My Selections', nextName];
  setCellSetColor([
    ...(cellSetColor || []),
    {
      path: nextPath,
      color: PALETTE[colorIndex % PALETTE.length],
    },
  ]);
  setCellSetSelection([nextPath]);
  setCellColorEncodingPlugin('cellSetSelection');
}

export function mergeCellSets(cellSets, additionalCellSets) {
  return {
    version: '0.1.3',
    datatype: 'cell',
    tree: [
      ...(cellSets ? cellSets.tree : []),
      ...(additionalCellSets ? additionalCellSets.tree : []),
    ],
  };
}


/**
 * Append a child to a parent node.
 * @param {object} currNode A node object.
 * @param {object} newChild The child node object.
 * @returns {object} The updated node.
 */
export function nodeAppendChild(currNode, newChild) {
  return {
    ...currNode,
    children: [...currNode.children, newChild],
  };
}

/**
 * Get an empty tree, with a default tree state.
 * @param {string} datatype The type of sets that this tree contains.
 * @returns {object} Empty tree.
 */
export function treeInitialize(datatype) {
  return {
    version: '0.1.3',
    datatype,
    tree: [],
  };
}

/**
 * Find a node with a matching name path, relative to a particular node.
 * @param {object} node A node object.
 * @param {string[]} path The name path for the node of interest.
 * @param {number} currLevelIndex The index of the current hierarchy level.
 * @returns {object|null} A matching node object, or null if none is found.
 */
function nodeFindNodeByNamePath(node, path, currLevelIndex) {
  const currNodeName = path[currLevelIndex];
  if (node.name === currNodeName) {
    if (currLevelIndex === path.length - 1) {
      return node;
    }
    if (node.children) {
      const foundNodes = node.children
        .map(child => nodeFindNodeByNamePath(child, path, currLevelIndex + 1))
        .filter(Boolean);
      if (foundNodes.length === 1) {
        return foundNodes[0];
      }
    }
  }
  return null;
}

/**
 * Get the height of a node (the number of levels to reach a leaf).
 * @param {object} currNode A node object.
 * @param {number} level The level that the height will be computed relative to. By default, 0.
 * @returns {number} The height. If the node has a .children property,
 * then the minimum value returned is 1.
 */
export function nodeToHeight(currNode, level = 0) {
  if (!currNode.children) {
    return level;
  }
  const newLevel = level + 1;
  const childrenHeights = currNode.children.map(c => nodeToHeight(c, newLevel));
  return Math.max(...childrenHeights, newLevel);
}

/**
 * Get the set associated with a particular node.
 * Recursive.
 * @param {object} currNode A node object.
 * @returns {array} The array representing the set associated with the node.
 */
export function nodeToSet(currNode) {
  if (!currNode) {
    return [];
  }
  if (!currNode.children) {
    return (currNode.set || []);
  }
  return currNode.children.flatMap(c => nodeToSet(c));
}

export function initializeCellSetColor(cellSets, cellSetColor) {
  const nextCellSetColor = [...(cellSetColor || [])];
  const nodeCountPerTreePerLevel = cellSets.tree.map(tree => Array
    .from({
      length: nodeToHeight(tree) + 1, // Need to add one because its an array.
    }).fill(0));

  function processNode(node, prevPath, hierarchyLevel, treeIndex) {
    const index = nodeCountPerTreePerLevel[treeIndex][hierarchyLevel];
    const nodePath = [...prevPath, node.name];

    const nodeColor = nextCellSetColor.find(d => isEqual(d.path, nodePath));
    if (!nodeColor) {
      // If there is a color for the node specified via the cell set tree,
      // then use it. Otherwise, use a color from the default color palette.
      const nodeColorArray = (node.color ? node.color : PALETTE[index % PALETTE.length]);
      nextCellSetColor.push({
        path: nodePath,
        color: nodeColorArray,
      });
    }
    nodeCountPerTreePerLevel[treeIndex][hierarchyLevel] += 1;
    if (node.children) {
      node.children.forEach(c => processNode(c, nodePath, hierarchyLevel + 1, treeIndex));
    }
  }

  cellSets.tree.forEach((lzn, treeIndex) => processNode(lzn, [], 0, treeIndex));
  return nextCellSetColor;
}

/**
 * Find a node with a matching name path, relative to the whole tree.
 * @param {object} currTree A tree object.
 * @param {string[]} targetNamePath The name path for the node of interest.
 * @returns {object|null} A matching node object, or null if none is found.
 */
export function treeFindNodeByNamePath(currTree, targetNamePath) {
  const foundNodes = currTree.tree
    .map(levelZeroNode => nodeFindNodeByNamePath(levelZeroNode, targetNamePath, 0))
    .filter(Boolean);
  if (foundNodes.length === 1) {
    return foundNodes[0];
  }
  return null;
}

export function treeToCellPolygonsBySetNames(
  currTree, cells, embedding, selectedNamePaths, cellSetColor, theme,
) {
  const cellSetPolygons = [];
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      const nodeColor = (
        cellSetColor?.find(d => isEqual(d.path, setNamePath))?.color
        || getDefaultColor(theme)
      );
      const cellPositions = nodeSet
        .map(([cellId]) => ([
          embedding.data[0][cells.indexOf(cellId)],
          -embedding.data[1][cells.indexOf(cellId)],
        ]))
        .filter(cell => cell.every(i => typeof i === 'number'));

      if (cellPositions.length > 2) {
        const points = turfFeatureCollection(
          cellPositions.map(turfPoint),
        );
        const concavity = Infinity;
        const hullCoords = concaveman(cellPositions, concavity);
        if (hullCoords) {
          const centroidCoords = centroid(points).geometry.coordinates;
          cellSetPolygons.push({
            path: setNamePath,
            name: setNamePath[setNamePath.length - 1],
            hull: hullCoords,
            color: nodeColor,
            centroid: centroidCoords,
          });
        }
      }
    }
  });
  return cellSetPolygons;
}

export function getCellSetPolygons(params) {
  const {
    cells,
    embedding,
    cellSets,
    cellSetSelection,
    cellSetColor,
    theme,
  } = params;
  if (cellSetSelection && cellSetSelection.length > 0 && cellSets && cells) {
    return treeToCellPolygonsBySetNames(
      cellSets, cells, embedding, cellSetSelection, cellSetColor, theme,
    );
  }
  return [];
}

// The functions defined here have been adapted from d3-interpolate,
// d3-color, and d3-scale-chromatic.
// Color string "rgb(r,g,b)" representations are replaced by color array [r, g, b]
// representations, to allow them to work nicely with deck.gl,
// without the need to converting back and forth between string and array formats.

// Reference: https://github.com/d3/d3-scale-chromatic/blob/431d21da776f97c632f53a855bd822edfbbcd56e/src/diverging/RdBu.js
// eslint-disable-next-line max-len
const schemeRdBu = [[103, 0, 31], [178, 24, 43], [214, 96, 77], [244, 165, 130], [253, 219, 199], [247, 247, 247], [209, 229, 240], [146, 197, 222], [67, 147, 195], [33, 102, 172], [5, 48, 97]];
// eslint-disable-next-line max-len
const schemePlasma = [[13, 8, 135], [16, 7, 136], [19, 7, 137], [22, 7, 138], [25, 6, 140], [27, 6, 141], [29, 6, 142], [32, 6, 143], [34, 6, 144], [36, 6, 145], [38, 5, 145], [40, 5, 146], [42, 5, 147], [44, 5, 148], [46, 5, 149], [47, 5, 150], [49, 5, 151], [51, 5, 151], [53, 4, 152], [55, 4, 153], [56, 4, 154], [58, 4, 154], [60, 4, 155], [62, 4, 156], [63, 4, 156], [65, 4, 157], [67, 3, 158], [68, 3, 158], [70, 3, 159], [72, 3, 159], [73, 3, 160], [75, 3, 161], [76, 2, 161], [78, 2, 162], [80, 2, 162], [81, 2, 163], [83, 2, 163], [85, 2, 164], [86, 1, 164], [88, 1, 164], [89, 1, 165], [91, 1, 165], [92, 1, 166], [94, 1, 166], [96, 1, 166], [97, 0, 167], [99, 0, 167], [100, 0, 167], [102, 0, 167], [103, 0, 168], [105, 0, 168], [106, 0, 168], [108, 0, 168], [110, 0, 168], [111, 0, 168], [113, 0, 168], [114, 1, 168], [116, 1, 168], [117, 1, 168], [119, 1, 168], [120, 1, 168], [122, 2, 168], [123, 2, 168], [125, 3, 168], [126, 3, 168], [128, 4, 168], [129, 4, 167], [131, 5, 167], [132, 5, 167], [134, 6, 166], [135, 7, 166], [136, 8, 166], [138, 9, 165], [139, 10, 165], [141, 11, 165], [142, 12, 164], [143, 13, 164], [145, 14, 163], [146, 15, 163], [148, 16, 162], [149, 17, 161], [150, 19, 161], [152, 20, 160], [153, 21, 159], [154, 22, 159], [156, 23, 158], [157, 24, 157], [158, 25, 157], [160, 26, 156], [161, 27, 155], [162, 29, 154], [163, 30, 154], [165, 31, 153], [166, 32, 152], [167, 33, 151], [168, 34, 150], [170, 35, 149], [171, 36, 148], [172, 38, 148], [173, 39, 147], [174, 40, 146], [176, 41, 145], [177, 42, 144], [178, 43, 143], [179, 44, 142], [180, 46, 141], [181, 47, 140], [182, 48, 139], [183, 49, 138], [184, 50, 137], [186, 51, 136], [187, 52, 136], [188, 53, 135], [189, 55, 134], [190, 56, 133], [191, 57, 132], [192, 58, 131], [193, 59, 130], [194, 60, 129], [195, 61, 128], [196, 62, 127], [197, 64, 126], [198, 65, 125], [199, 66, 124], [200, 67, 123], [201, 68, 122], [202, 69, 122], [203, 70, 121], [204, 71, 120], [204, 73, 119], [205, 74, 118], [206, 75, 117], [207, 76, 116], [208, 77, 115], [209, 78, 114], [210, 79, 113], [211, 81, 113], [212, 82, 112], [213, 83, 111], [213, 84, 110], [214, 85, 109], [215, 86, 108], [216, 87, 107], [217, 88, 106], [218, 90, 106], [218, 91, 105], [219, 92, 104], [220, 93, 103], [221, 94, 102], [222, 95, 101], [222, 97, 100], [223, 98, 99], [224, 99, 99], [225, 100, 98], [226, 101, 97], [226, 102, 96], [227, 104, 95], [228, 105, 94], [229, 106, 93], [229, 107, 93], [230, 108, 92], [231, 110, 91], [231, 111, 90], [232, 112, 89], [233, 113, 88], [233, 114, 87], [234, 116, 87], [235, 117, 86], [235, 118, 85], [236, 119, 84], [237, 121, 83], [237, 122, 82], [238, 123, 81], [239, 124, 81], [239, 126, 80], [240, 127, 79], [240, 128, 78], [241, 129, 77], [241, 131, 76], [242, 132, 75], [243, 133, 75], [243, 135, 74], [244, 136, 73], [244, 137, 72], [245, 139, 71], [245, 140, 70], [246, 141, 69], [246, 143, 68], [247, 144, 68], [247, 145, 67], [247, 147, 66], [248, 148, 65], [248, 149, 64], [249, 151, 63], [249, 152, 62], [249, 154, 62], [250, 155, 61], [250, 156, 60], [250, 158, 59], [251, 159, 58], [251, 161, 57], [251, 162, 56], [252, 163, 56], [252, 165, 55], [252, 166, 54], [252, 168, 53], [252, 169, 52], [253, 171, 51], [253, 172, 51], [253, 174, 50], [253, 175, 49], [253, 177, 48], [253, 178, 47], [253, 180, 47], [253, 181, 46], [254, 183, 45], [254, 184, 44], [254, 186, 44], [254, 187, 43], [254, 189, 42], [254, 190, 42], [254, 192, 41], [253, 194, 41], [253, 195, 40], [253, 197, 39], [253, 198, 39], [253, 200, 39], [253, 202, 38], [253, 203, 38], [252, 205, 37], [252, 206, 37], [252, 208, 37], [252, 210, 37], [251, 211, 36], [251, 213, 36], [251, 215, 36], [250, 216, 36], [250, 218, 36], [249, 220, 36], [249, 221, 37], [248, 223, 37], [248, 225, 37], [247, 226, 37], [247, 228, 37], [246, 230, 38], [246, 232, 38], [245, 233, 38], [245, 235, 39], [244, 237, 39], [243, 238, 39], [243, 240, 39], [242, 242, 39], [241, 244, 38], [241, 245, 37], [240, 247, 36], [240, 249, 33]];

// Reference: https://github.com/d3/d3-interpolate/blob/96d54051d1c2fec55f240edd0ec5401715b10390/src/rgb.js
function rgbSpline(spline) {
  return (colors) => {
    const n = colors.length;
    let r = new Array(n);
    let g = new Array(n);
    let b = new Array(n);
    let i; let
      color;
    // eslint-disable-next-line no-plusplus
    for (i = 0; i < n; ++i) {
      color = [colors[i][0], colors[i][1], colors[i][2]];
      r[i] = color[0] || 0;
      g[i] = color[1] || 0;
      b[i] = color[2] || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    return t => [r(t), g(t), b(t)];
  };
}

// Reference: https://github.com/d3/d3-interpolate/blob/594a32af1fe1118812b439012c2cb742e907c0c0/src/basis.js
function basis(values) {
  function innerBasis(t1, v0, v1, v2, v3) {
    const t2 = t1 * t1; const
      t3 = t2 * t1;
    return ((1 - 3 * t1 + 3 * t2 - t3) * v0
          + (4 - 6 * t2 + 3 * t3) * v1
          + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
          + t3 * v3) / 6;
  }

  const n = values.length - 1;
  return (t) => {
    const i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n);
    const v1 = values[i];
    const v2 = values[i + 1];
    const v0 = i > 0 ? values[i - 1] : 2 * v1 - v2;
    const v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return innerBasis((t - i / n) * n, v0, v1, v2, v3);
  };
}


// Reference: https://github.com/d3/d3-scale-chromatic/blob/ade54c13e8dfdb9807801a794eaec1a37f926b8a/src/ramp.js
const interpolateRgbBasis = rgbSpline(basis);

function interpolateSequentialMulti(range) {
  const n = range.length;
  return t => range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
}

export const interpolateRdBu = interpolateRgbBasis(schemeRdBu);
export const interpolatePlasma = interpolateSequentialMulti(schemePlasma);

/**
 * Using a color and a probability, mix the color with an "uncertainty" color,
 * for example, gray.
 * Reference: https://github.com/bgrins/TinyColor/blob/80f7225029c428c0de0757f7d98ac15f497bee57/tinycolor.js#L701
 * @param {number[]} originalColor The color assignment for the class.
 * @param {number} p The mixing amount, or level certainty in the originalColor classification,
 * between 0 and 1.
 * @param {number[]} mixingColor The color with which to mix. By default, [128, 128, 128] gray.
 * @returns {number[]} Returns the color after mixing.
 */
function colorMixWithUncertainty(originalColor, p, mixingColor = [128, 128, 128]) {
  return [
    ((originalColor[0] - mixingColor[0]) * p) + mixingColor[0],
    ((originalColor[1] - mixingColor[1]) * p) + mixingColor[1],
    ((originalColor[2] - mixingColor[2]) * p) + mixingColor[2],
  ];
}

/**
 * Given a tree with state, get the cellIds and cellColors,
 * based on the nodes currently marked as "visible".
 * @param {object} currTree A tree object.
 *  @param {array} selectedNamePaths Array of arrays of strings,
 * representing set "paths".
 * @param {object[]} cellSetColor Array of objects with the
 * properties `path` and `color`.
 * @param {string} theme "light" or "dark" for the vitessce theme
 * @returns {array} Tuple of [cellIds, cellColors]
 * where cellIds is an array of strings,
 * and cellColors is an object mapping cellIds to color [r,g,b] arrays.
 */
export function treeToCellColorsBySetNames(currTree, selectedNamePaths, cellSetColor, theme) {
  let cellColorsArray = [];
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      const nodeColor = (
        cellSetColor?.find(d => isEqual(d.path, setNamePath))?.color
        || getDefaultColor(theme)
      );
      cellColorsArray = [
        ...cellColorsArray,
        ...nodeSet.map(([cellId, prob]) => [
          cellId,
          (isNil(prob) ? nodeColor : colorMixWithUncertainty(nodeColor, prob)),
        ]),
      ];
    }
  });
  return new Map(cellColorsArray);
}

/**
 * Get a mapping of cell IDs to cell colors based on
 * gene / cell set selection coordination state.
 * @param {object} params
 * @param {object} params.expressionMatrix { rows, cols, matrix }
 * @param {array} params.geneSelection Array of selected gene IDs.
 * @param {object} params.cellSets The cell sets tree.
 * @param {object} params.cellSetSelection Selected cell sets.
 * @param {string} params.cellColorEncodingPlugin Which to use for
 * coloring: gene expression or cell sets?
 * @returns {Map} Mapping from cell IDs to [r, g, b] color arrays.
 */
export function getCellColors(params) {
  const {
    cellColorEncodingPlugin,
    expressionData,
    cellSets, cellSetSelection,
    cellSetColor,
    expressionDataAttrs,
    theme,
  } = params;
  if (cellColorEncodingPlugin === 'geneSelection' && expressionData && expressionDataAttrs) {
    // TODO: allow other color maps.
    const geneExpColormap = interpolatePlasma;
    const colors = new Map();
    for (let i = 0; i < expressionData.length; i += 1) {
      const value = expressionData[i];
      const cellColor = geneExpColormap(value / 255);
      colors.set(expressionDataAttrs.rows[i], cellColor);
    }
    return colors;
  } if (cellColorEncodingPlugin === 'cellSetSelection' && cellSetSelection && cellSets) {
    // Cell sets can potentially lack set colors since the color property
    // is not a required part of the schema.
    // The `initializeSets` function fills in any empty colors
    // with defaults and returns the processed tree object.
    return treeToCellColorsBySetNames(cellSets, cellSetSelection, cellSetColor, theme);
  }
  return new Map();
}


// Reference: https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds
// Reference: https://observablehq.com/@bmschmidt/dot-density-election-maps-with-webgl
export function getPointSizeDevicePixels(devicePixelRatio, zoom, xRange, yRange, width, height) {
  // Size of a point, in units of the diagonal axis.
  const pointSize = 0.001;
  // Point size maximum, in screen pixels.
  const pointScreenSizeMax = 10;

  // Point size minimum, in screen pixels.
  const pointScreenSizeMin = 1 / devicePixelRatio;

  const scaleFactor = 2 ** zoom;
  const xAxisRange = 2.0 / ((xRange * scaleFactor) / width);
  const yAxisRange = 2.0 / ((yRange * scaleFactor) / height);

  // The diagonal screen size as a fraction of the current diagonal axis range,
  // then converted to device pixels.
  const diagonalScreenSize = Math.sqrt((width ** 2) + (height ** 2));
  const diagonalAxisRange = Math.sqrt((xAxisRange ** 2) + (yAxisRange ** 2));
  const diagonalFraction = pointSize / diagonalAxisRange;
  const deviceSize = diagonalFraction * diagonalScreenSize;

  const pointSizeDevicePixels = clamp(
    deviceSize,
    pointScreenSizeMin,
    pointScreenSizeMax,
  );
  return pointSizeDevicePixels;
}

// Reference: https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds
export function getPointOpacity(zoom, xRange, yRange, width, height, numCells, avgFillDensity) {
  const N = numCells;
  const [minX, minY, maxX, maxY] = new OrthographicView({ zoom }).makeViewport({
    height,
    width,
    viewState: { zoom, target: [0, 0, 0] },
  }).getBounds();
  const X = maxY - minY;
  const Y = maxX - minX;
  const X0 = xRange;
  const Y0 = yRange;
  const W = width;
  const H = height;

  let rho = avgFillDensity;
  if (!rho) {
    rho = Math.min(1, 1 / (10 ** (Math.log10(N) - 3)));
  }
  // p in the calculation is the pixel length/width of a given point, which for us is 1
  // so it does not factor into our calculation here.
  const alpha = ((rho * W * H) / N) * (Y0 / Y) * (X0 / X);
  const pointOpacity = clamp(alpha, 1.01 / 255, 1.0);
  return pointOpacity;
}
