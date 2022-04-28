/* eslint-disable */
import React, { useCallback } from 'react';
import debounce from 'lodash/debounce';
import Checkbox from '@material-ui/core/Checkbox';
import Slider from '@material-ui/core/Slider';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { capitalize, GLSL_COLORMAPS } from '../utils';
import { useStyles } from '../options/styles';
import OptionsContainer from '../options/OptionsContainer';
import OptionSelect from '../options/OptionSelect';
import CellColorEncodingOption from '../options/CellColorEncodingOption';

export default function QRComparisonScatterplotOptions(props) {
  const {
    observationsLabel,

    legendsVisible,
    setLegendsVisible,
    presetButtonsVisible,
    setPresetButtonsVisible,

    qryCellsVisible,
    setQryCellsVisible,
    qryCellEncoding,
    setQryCellEncoding,
    refCellsVisible,
    setRefCellsVisible,
    refCellEncoding,
    setRefCellEncoding,

    linksVisible,
    setLinksVisible,
    linksSizeEncoding,
    setLinksSizeEncoding,

    refCellColorEncoding,
    setRefCellColorEncoding,
    qryCellColorEncoding,
    setQryCellColorEncoding,

    cellRadius,
    setCellRadius,
    cellRadiusMode,
    setCellRadiusMode,
    cellOpacity,
    setCellOpacity,
    cellOpacityMode,
    setCellOpacityMode,
    cellSetLabelsVisible,
    setCellSetLabelsVisible,
    cellSetLabelSize,
    setCellSetLabelSize,
    cellSetPolygonsVisible,
    setCellSetPolygonsVisible,
    
    geneExpressionColormap,
    setGeneExpressionColormap,
    geneExpressionColormapRange,
    setGeneExpressionColormapRange,

    debugCellTypes,
    setDebugCellTypes,
  } = props;

  const observationsLabelNice = capitalize(observationsLabel);

  const classes = useStyles();

  function handleLinksSizeEncodingChange(event) {
    setLinksSizeEncoding(event.target.checked);
  }

  function handleDebugCellTypesChange(event) {
    setDebugCellTypes(event.target.checked);
  }

  function handleLegendsVisibilityChange(event) {
    setLegendsVisible(event.target.checked);
  }
  function handlePresetButtonsVisibilityChange(event) {
    setPresetButtonsVisible(event.target.checked);
  }

  function handleQryCellsVisibilityChange(event) {
    setQryCellsVisible(event.target.checked);
  }
  function handleQryCellEncodingChange(event) {
    setQryCellEncoding(event.target.value);
  }
  function handleRefCellsVisibilityChange(event) {
    setRefCellsVisible(event.target.checked);
  }
  function handleRefCellEncodingChange(event) {
    setRefCellEncoding(event.target.value);
  }

  function handleLinksVisibilityChange(event) {
    setLinksVisible(event.target.checked);
  }


  function handleCellRadiusModeChange(event) {
    setCellRadiusMode(event.target.value);
  }

  function handleCellOpacityModeChange(event) {
    setCellOpacityMode(event.target.value);
  }

  function handleRadiusChange(event, value) {
    setCellRadius(value);
  }

  function handleOpacityChange(event, value) {
    setCellOpacity(value);
  }

  function handleLabelVisibilityChange(event) {
    setCellSetLabelsVisible(event.target.checked);
  }

  function handleLabelSizeChange(event, value) {
    setCellSetLabelSize(value);
  }

  function handlePolygonVisibilityChange(event) {
    setCellSetPolygonsVisible(event.target.checked);
  }

  function handleGeneExpressionColormapChange(event) {
    setGeneExpressionColormap(event.target.value);
  }

  function handleColormapRangeChange(event, value) {
    setGeneExpressionColormapRange(value);
  }
  const handleColormapRangeChangeDebounced = useCallback(
    debounce(handleColormapRangeChange, 5, { trailing: true }),
    [handleColormapRangeChange],
  );

  return (
    <OptionsContainer>
      <TableRow>
        <TableCell className={classes.labelCell}>
          Query Cells Visible
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            checked={qryCellsVisible}
            onChange={handleQryCellsVisibilityChange}
            name="scatterplot-option-query-cells-visible"
            color="default"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} htmlFor="query-cell-encoding-select">
          Query Cell Encoding
        </TableCell>
        <TableCell className={classes.inputCell}>
          <OptionSelect
            className={classes.select}
            value={qryCellEncoding}
            onChange={handleQryCellEncodingChange}
            inputProps={{
              id: 'query-cell-encoding-select',
            }}
          >
            <option value="scatterplot">Scatterplot</option>
            <option value="contour">Contour</option>
            <option value="heatmap">Heatmap</option>
            <option value="scatterplot-and-contour">Scatterplot and Contour</option>
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          Reference Cells Visible
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            checked={refCellsVisible}
            onChange={handleRefCellsVisibilityChange}
            name="scatterplot-option-reference-cells-visible"
            color="default"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} htmlFor="reference-cell-encoding-select">
          Reference Cell Encoding
        </TableCell>
        <TableCell className={classes.inputCell}>
          <OptionSelect
            className={classes.select}
            value={refCellEncoding}
            onChange={handleRefCellEncodingChange}
            inputProps={{
              id: 'reference-cell-encoding-select',
            }}
          >
            <option value="scatterplot">Scatterplot</option>
            <option value="contour">Contour</option>
            <option value="heatmap">Heatmap</option>
            <option value="scatterplot-and-contour">Scatterplot and Contour</option>
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          Query-Reference Links Visible
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            checked={linksVisible}
            onChange={handleLinksVisibilityChange}
            name="scatterplot-option-links-visible"
            color="default"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          Query-Reference Links Size and Color Encoding
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            checked={linksSizeEncoding}
            onChange={handleLinksSizeEncodingChange}
            name="scatterplot-option-links-size-encoding"
            color="default"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          Legends Visible
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            checked={legendsVisible}
            onChange={handleLegendsVisibilityChange}
            name="scatterplot-option-legends-visible"
            color="default"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          Preset Buttons Visible
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            checked={presetButtonsVisible}
            onChange={handlePresetButtonsVisibilityChange}
            name="scatterplot-option-preset-buttons-visible"
            color="default"
          />
        </TableCell>
      </TableRow>
      <CellColorEncodingOption
        observationsLabel="Reference Cell"
        cellColorEncoding={refCellColorEncoding}
        setCellColorEncoding={setRefCellColorEncoding}
      />
      <CellColorEncodingOption
        observationsLabel="Query Cell"
        cellColorEncoding={qryCellColorEncoding}
        setCellColorEncoding={setQryCellColorEncoding}
      />
      <TableRow>
        <TableCell className={classes.labelCell}>
          {observationsLabelNice} Set Labels Visible
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            checked={cellSetLabelsVisible}
            onChange={handleLabelVisibilityChange}
            name="scatterplot-option-cell-set-labels"
            color="default"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          {observationsLabelNice} Set Label Size
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Slider
            disabled={!cellSetLabelsVisible}
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
            value={cellSetLabelSize}
            onChange={handleLabelSizeChange}
            aria-labelledby="cell-set-label-size-slider"
            valueLabelDisplay="auto"
            step={1}
            min={8}
            max={36}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          {observationsLabelNice} Set Polygons Visible
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            checked={cellSetPolygonsVisible}
            onChange={handlePolygonVisibilityChange}
            name="scatterplot-option-cell-set-polygons"
            color="default"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} htmlFor="cell-radius-mode-select">
          {observationsLabelNice} Radius Mode
        </TableCell>
        <TableCell className={classes.inputCell}>
          <OptionSelect
            className={classes.select}
            value={cellRadiusMode}
            onChange={handleCellRadiusModeChange}
            inputProps={{
              id: 'cell-radius-mode-select',
            }}
          >
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          {observationsLabelNice} Radius
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Slider
            disabled={cellRadiusMode !== 'manual'}
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
            value={cellRadius}
            onChange={handleRadiusChange}
            aria-labelledby="cell-radius-slider"
            valueLabelDisplay="auto"
            step={0.01}
            min={0.01}
            max={10}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} htmlFor="cell-opacity-mode-select">
          {observationsLabelNice} Opacity Mode
        </TableCell>
        <TableCell className={classes.inputCell}>
          <OptionSelect
            className={classes.select}
            value={cellOpacityMode}
            onChange={handleCellOpacityModeChange}
            inputProps={{
              id: 'cell-opacity-mode-select',
            }}
          >
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          {observationsLabelNice} Opacity
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Slider
            disabled={cellOpacityMode !== 'manual'}
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
            value={cellOpacity}
            onChange={handleOpacityChange}
            aria-labelledby="cell-opacity-slider"
            valueLabelDisplay="auto"
            step={0.05}
            min={0.0}
            max={1.0}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} htmlFor="gene-expression-colormap-select">
          Gene Expression Colormap
        </TableCell>
        <TableCell className={classes.inputCell}>
          <OptionSelect
            className={classes.select}
            value={geneExpressionColormap}
            onChange={handleGeneExpressionColormapChange}
            inputProps={{
              id: 'gene-expression-colormap-select',
            }}
          >
            {GLSL_COLORMAPS.map(cmap => (
              <option key={cmap} value={cmap}>{cmap}</option>
            ))}
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          Gene Expression Colormap Range
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Slider
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
            value={geneExpressionColormapRange}
            onChange={handleColormapRangeChangeDebounced}
            aria-labelledby="gene-expression-colormap-range-slider"
            valueLabelDisplay="auto"
            step={0.005}
            min={0.0}
            max={1.0}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          Debug Cell Types
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            checked={debugCellTypes}
            onChange={handleDebugCellTypesChange}
            name="scatterplot-option-debug-cell-types"
            color="default"
          />
        </TableCell>
      </TableRow>
    </OptionsContainer>
  );
}
