# polyphony-vis

This repository contains the frontend implementation for [Polyphony](https://github.com/ChengFR/polyphony), our interactive transfer-learning framework for reference-based single-cell data analysis.

__polyphony-vis__ is implemented using the [Vitessce](http://vitessce.io) framework and its [plugin APIs](http://vitessce.io/docs/dev-plugins).

## Run polyphony-vis (frontend)

In this repository, run:

```sh
npm run start
```

## Run [polyphony](https://github.com/ChengFR/polyphony) (backend)

In the root of the `polyphony` repository, run:

```sh
polyphony --experiment case-1 --save --load_exist --port 7778
```

## Documentation

### Plugin view types

All plugin view types assume there are two `dataset` coordination scopes (named `REFERENCE` and `QUERY`).

#### `qrStatus`

Indicates the status of the analysis (how many query cells are contained in anchor sets).
Provides controls for selecting anchor sets and updating the model.

#### `qrComparisonScatterplot`

Query and reference comparison scatterplot view.
Allows encoding query and reference cells on the same plot using different representations, such as points, density contours, and heatmap.

#### `qrCellSets`

Anchor set view.

#### `qrScores`

Marker view. Displays the differentially expressed genes in query, reference, and both datasets for a selected anchor set.


### Plugin coordination types

#### `anchorApiState`

#### `modelApiState`

#### `anchorEditTool`

#### `anchorEditMode`

#### `anchorSetFocus`

#### `anchorSetHighlight`

#### `embeddingVisible`

#### `embeddingEncoding`

#### `embeddingLinksVisible`

#### `anchorSetFilter`

#### `presetButtonsVisible`

#### `embeddingLegendsVisible`

#### `debugCellTypes`

#### `embeddingLinksSizeEncoding`

#### `cellColorEncodingPlugin`

The same idea as the built-in `cellColorEncoding`, but can take on the value `dataset`.

### Plugin file types

#### `anndata-polyphony.zarr`

## Notes

__polyphony-vis__ was originally implemented as a fork of the Vitessce repository at https://github.com/ChengFR/vitessce/tree/figure-making (see https://github.com/vitessce/vitessce/compare/master...ChengFR:figure-making) before refactoring into the plugin implementation here.