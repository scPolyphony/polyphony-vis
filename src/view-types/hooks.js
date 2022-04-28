/* eslint-disable */
import {
  useRef, useState, useEffect, useCallback, useMemo,
} from 'react';
import debounce from 'lodash/debounce';
import create from 'zustand';
import createContext from 'zustand/context';
import shallow from 'zustand/shallow';
import every from 'lodash/every';


/**
 * The grid size store can be used to store a
 * counter which updates on each window or react-grid-layout
 * resize event.
 * @returns {function} The useStore hook.
 */
const useGridSizeStore = create(set => ({
  resizeCount: {},
  incrementResizeCount: () => set(state => ({
    resizeCount: state.resizeCount + 1,
  })),
}));

/**
 * Obtain the grid resize count value
 * from the global app state.
 * @returns {number} The grid resize increment value.
 */
export function useGridResize() {
  return useGridSizeStore(state => state.resizeCount);
}

/**
 * Obtain the grid resize count increment function
 * from the global app state.
 * @returns {function} The grid resize count increment
 * function.
 */
export function useEmitGridResize() {
  return useGridSizeStore(state => state.incrementResizeCount);
}

/**
 * Custom hook, subscribes to GRID_RESIZE and window resize events.
 * @returns {array} `[width, height, deckRef]` where width and height
 * are numbers and deckRef is a React ref to be used with
 * a <DeckGL/> element (or a forwardRef to one).
 */
export function useDeckCanvasSize() {
  const deckRef = useRef();

  const [height, setHeight] = useState();
  const [width, setWidth] = useState();

  const resizeCount = useGridResize();
  const incrementResizeCount = useEmitGridResize();

  // On window resize events, increment the grid resize count.
  useEffect(() => {
    function onWindowResize() {
      incrementResizeCount();
    }
    const onResizeDebounced = debounce(onWindowResize, 100, { trailing: true });
    window.addEventListener('resize', onResizeDebounced);
    onWindowResize();
    return () => {
      window.removeEventListener('resize', onResizeDebounced);
    };
  }, [incrementResizeCount]);

  // On new grid resize counts, re-compute the DeckGL canvas
  // width/height.
  useEffect(() => {
    if (!deckRef.current) return;
    const { canvas } = deckRef.current.deck;
    const canvasRect = canvas.getBoundingClientRect();
    setHeight(canvasRect.height);
    setWidth(canvasRect.width);
  }, [resizeCount]);

  return [width, height, deckRef];
}


/**
 * This hook handles a boolean isReady value,
 * which only returns true once every item in the
 * input list has been marked as "ready".
 * @param {string[]} items The items to wait on.
 * Should be defined as a constant
 * (outside a function component / render function),
 * otherwise strange bugs may occur.
 * @returns {array} An array
 * [isReady, setItemIsReady, setItemIsNotReady, resetReadyItems]
 * where isReady is the boolean value,
 * setItemIsReady marks one item as ready,
 * setItemIsNotReady marks one item as not ready,
 * and resetReadyItem marks all items as waiting.
 */
export function useReady(statusValues) {
  const setItemIsReady = useCallback((readyItem) => {
    console.log(`cleared ${readyItem}`);
  }, []);

  const setItemIsNotReady = useCallback((notReadyItem) => {

  }, []);

  const resetReadyItems = useCallback(() => {
   
  }, []);

  const isReady = useMemo(() => {
    return every(statusValues, val => val === 'success');
  }, statusValues);

  return [isReady, setItemIsReady, setItemIsNotReady, resetReadyItems];
}

/**
 * This hook manages a list of URLs,
 * with adding and resetting helpers.
 * @returns {array} An array
 * [urls, addUrl, resetUrls]
 * where urls is the array of URL objects,
 * addUrl is a function for adding a URL to the array,
 * resetUrls is a function that clears the array.
 */
export function useUrls() {
  const [urls, setUrls] = useState([]);

  const addUrl = useCallback((url, name) => {
    if (url) {
      setUrls(prev => ([...prev, { url, name }]));
    }
  }, [setUrls]);

  const resetUrls = useCallback(() => {
    setUrls([]);
  }, [setUrls]);

  return [urls, addUrl, resetUrls];
}

export function useExpressionValueGetter({ attrs, expressionData }) {
  // Get a mapping from cell ID to row index in the gene expression matrix.
  const cellIdMap = useMemo(() => {
    const result = {};
    if (attrs && attrs.rows) {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < attrs.rows.length; i++) {
        result[attrs.rows[i]] = i;
      }
    }
    return result;
  }, [attrs]);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  const getExpressionValue = useCallback((entry, { index }) => {
    if (cellIdMap && expressionData && expressionData[0]) {
      const cellIndex = index;
      const val = expressionData[0][cellIndex];
      return val;
    }
    return 0;
  }, [cellIdMap, expressionData]);
  return getExpressionValue;
}
