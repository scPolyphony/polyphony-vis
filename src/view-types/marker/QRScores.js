/* eslint-disable */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import range from 'lodash/range';
import flatten from 'lodash/flatten';
import max from 'lodash/max';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';


const barWidth = 130;

function QRGeneList(props) {
  const {
    header,
    geneList,
    xScale,
    setGeneSelection
  } = props;
  return (
    <>
      <div className='qrTopGeneHeader'>{header}</div>
      {geneList.map(gene => (
        <SignificanceIcon
          key={gene.name}
          geneName={gene.name}
          score={gene.score}
          ranking={gene.ranking}
          qryTriangles={gene.qryTriangles}
          refTriangles={gene.refTriangles}
          header={header}
          xScale={xScale}
          onClick={() => setGeneSelection([gene.name])}
        />
      ))}
    </>
  )
}

function SignificanceIcon(props) {
  const {
    score, ranking, header, geneName, xScale, onClick,
    qryTriangles, refTriangles,
  } = props;

  let rankingText = '';
  if(header === 'Shared') {
    rankingText = `(${ranking.qry} | ${ranking.ref})`;
  } else if(header === 'Query') {
    rankingText = `(${ranking.qry})`;
  } else if(header === 'Reference') {
    rankingText = `(${ranking.ref})`;
  }

  return (<div className="iconContainer" onClick={onClick}>

    <div className={`geneIcon withGeneName`}>
      <div className={`geneIconOuter`} style={{
        height: 30, width: barWidth
      }} />
      <div className={`geneIconQry`} style={{
        width: xScale(score.qry) || 0
      }} />
      <div className={`geneIconRef`} style={{
        width: xScale(score.ref) || 0
      }} />
      <div className="geneName">
        <div className="geneTrisLeft">
          {range(qryTriangles).map(i => (
            <span className="geneTriangle" key={`${geneName}-left-${i}`}><ArrowDropUpIcon key={i} /></span>
          ))}
        </div>
        <div className="geneNameMiddle">
          {geneName}
        </div>
        <div className="geneTrisRight">
          {range(refTriangles).map(i => (
            <span className="geneTriangle" key={`${geneName}-right-${i}`}><ArrowDropUpIcon/></span>
          ))}
        </div>
      </div>
    </div>
  </div>);
}


/**
 * A query+reference component.
 */
export default function QRScores(props) {
  const {
    anchorId,
    topGenes,
    setGeneSelection
  } = props;

  const geneList = flatten(['shared', 'qry', 'ref'].map(group => topGenes[group]));
  const maxScore = max(geneList.map(gene => Math.max(gene.score.qry, gene.score.ref)));
  const xScale = (score) => Math.max(score, 0) / maxScore * barWidth / 2;

  return (
    <div className="qrTopGene">
      <div className="qrTopGeneContainer">
        <div className="qrTopGeneColumn shared">
          {QRGeneList({ geneList: topGenes.shared, header: "Shared", xScale, setGeneSelection })}
        </div>
        <div className="qrTopGeneColumn queryTop">
          {QRGeneList({ geneList: topGenes.qry, header: "Query", xScale, setGeneSelection })}
        </div>
        <div className="qrTopGeneColumn refTop">
          {QRGeneList({ geneList: topGenes.ref, header: "Reference", xScale, setGeneSelection })}
        </div>
      </div>
      <div className="qrTopGeneDistContainer">
      </div>
    </div>
  );
}
