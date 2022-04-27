/* eslint-disable */
import React, { useMemo } from 'react';
import { scaleSequential } from "d3-scale";
import { interpolateViridis, interpolatePlasma, interpolateRdBu, interpolateCool } from "d3-scale-chromatic";
import { interpolate, quantize, interpolateRgb, piecewise } from "d3-interpolate";
import { rgb } from "d3-color";
import every from 'lodash/every';
import colormaps from 'colormap/colorScale';

const QRY_COLOR = [120, 120, 120];
const REF_COLOR = [201, 201, 201];

// Reference: https://observablehq.com/@mjmdavis/color-encoding
const getInterpolateFunction = (cmap) => {
  const colormapData = colormaps[cmap].map(d => d.rgb);
  const colormapRgb = colormapData.map(x => {
    return rgb.apply(null, x);
  });
  
  // Perform piecewise interpolation between each color in the range.
  return piecewise(interpolateRgb, colormapRgb);
};

// Reference: https://observablehq.com/@d3/color-legend
function ramp(color, n = 256) {
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(i, 0, 1, 1);
    }
    return canvas;
}

export default function Legend(props) {
  const {
    visible,
    refCellColorEncoding,
    qryCellColorEncoding,

    geneSelection,
    geneExpressionColormap,
    geneExpressionColormapRange,

    anchorSetFocus,
    qryCellSets,
    refCellSets,
    qryCellSetColor,
    refCellSetColor,

    qryEmbeddingEncoding,
    refEmbeddingEncoding,
  } = props;

  const svg = useMemo(() => {
    const interpolateFunc = getInterpolateFunction(geneExpressionColormap);
    const color = scaleSequential([0, 100], interpolateFunc);
    let n = 256;
    if(color.domain && color.range) {
      n = Math.min(color.domain().length, color.range().length);
    }
    const xlinkHref = ramp(color.copy().domain(quantize(interpolate(0, 1), n))).toDataURL();
    return (
      <svg width="100" height="15">
        <image x="0" y="0" width="100" height="15" preserveAspectRatio="none" xlinkHref={xlinkHref} />
      </svg>
    );
  }, [geneExpressionColormap]);

  const geneExpressionLegend = useMemo(() => {
    if(qryCellColorEncoding === 'geneSelection' && geneSelection && Array.isArray(geneSelection) && geneSelection.length === 1) {
      return (
        <>
          <span className="continuousTitle">Gene Expression</span>
          {svg}
          <span className="continuousLabels">
            <span className="continuousStart">{geneExpressionColormapRange[0]}</span>
            <span className="continuousEnd">{geneExpressionColormapRange[1]}</span>
          </span>
        </>
      );
    }
    return null;
  }, [svg, qryCellColorEncoding, geneSelection, geneExpressionColormapRange]);

  const cellSetLegend = useMemo(() => {
    if(qryCellColorEncoding === 'cellSetSelection' && qryCellSetColor && qryCellSetColor.length > 0 && refCellSetColor && refCellSetColor.length > 0) {
      if(qryCellSetColor.length === refCellSetColor.length && every(qryCellSetColor.map((qs, i) => refCellSetColor.some(rs => rs.path[1] === qs.path[1])))) {
        return (
          <span className="categoricalLabels">
            <span className="categoricalTitle">Cell Type Prediction</span>
            {qryCellSetColor.map(({ color, path }) => (
              <span className="categoricalItem" key={path[1]}>
                <span style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`}} />
                <span>{path[1]}</span>
              </span>
            ))}
          </span>
        );
      }
    }
    return null;
  }, [qryCellColorEncoding, qryCellSetColor, refCellSetColor]);

  const datasetLegend = useMemo(() => {
    if((qryEmbeddingEncoding.includes('scatterplot') && qryCellColorEncoding === 'dataset') || (refEmbeddingEncoding.includes('scatterplot') && refCellColorEncoding === 'dataset')) {
      return (
        <span className="categoricalLabels">
          <span className="categoricalTitle">Dataset</span>
          <span className="categoricalItem">
            <span style={{ backgroundColor: `rgb(${QRY_COLOR[0]}, ${QRY_COLOR[1]}, ${QRY_COLOR[2]})`}} />
            <span>Query</span>
          </span>
          <span className="categoricalItem">
            <span style={{ backgroundColor: `rgb(${REF_COLOR[0]}, ${REF_COLOR[1]}, ${REF_COLOR[2]})`}} />
            <span>Reference</span>
          </span>
        </span>
      );
    }
    return null;
  }, [qryCellColorEncoding, qryEmbeddingEncoding, refCellColorEncoding, refEmbeddingEncoding]);

  const contourLegend = useMemo(() => {
    if(refEmbeddingEncoding.includes("contour")) {
      return (
        <span className="categoricalLabels">
          <span className="categoricalTitle">Dataset</span>
          <span className="categoricalItem">
            <span style={{ backgroundColor: `rgb(${QRY_COLOR[0]}, ${QRY_COLOR[1]}, ${QRY_COLOR[2]})`}} />
            <span>Query</span>
          </span>
          <span className="categoricalItem">
            <span style={{
              backgroundImage: 'url(https://raw.githubusercontent.com/visgl/deck.gl/master/examples/layer-browser/data/pattern.png)',
              backgroundPosition: 'bottom left',
              backgroundSize: '20px',
              backgroundRepeat: 'repeat-x',
            }} />
            <span>Reference</span>
          </span>
        </span>
      );
    }
    return null;
  }, [refEmbeddingEncoding])
 
  return (visible ? (
    <div className="qrComparisonViewLegend">
      {geneExpressionLegend}
      {cellSetLegend}
      {datasetLegend}
      {contourLegend}
    </div>
  ) : null);
}
