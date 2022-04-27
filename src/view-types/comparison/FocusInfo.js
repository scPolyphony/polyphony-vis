/* eslint-disable */
import React from 'react';

export default function FocusInfo(props) {
  const {
    qryAnchorSetFocus,
    qryGeneSelection,
    qryLoadedSelection,
    qryExpressionDataStatus,
  } = props;


  let geneInfo;
  if(qryExpressionDataStatus === 'success') {
    if(qryGeneSelection && Array.isArray(qryGeneSelection) && qryGeneSelection.length === 1
      && qryLoadedSelection && Array.isArray(qryLoadedSelection) && qryLoadedSelection.length === 1
      && qryLoadedSelection[0] === qryGeneSelection[0]
      && qryExpressionDataStatus === 'success') {
        geneInfo = qryGeneSelection[0];
      } else {
        geneInfo = 'mismatch';
      }
  } else if(qryExpressionDataStatus === 'loading') {
    geneInfo = 'loading...';
  } else if(qryExpressionDataStatus === 'error') {
    geneInfo = 'error';
  }

 
  return (
    <div className="qrComparisonViewFocusInfo">
      {qryAnchorSetFocus ? (
        <span className="focusItem">
          <span>Focused set: </span>
          <span className="focusValue">{qryAnchorSetFocus}</span>
        </span>
      ) : null}
      {qryGeneSelection ? (
        <span className="focusItem">
          <span>Selected gene: </span>
          <span className="focusValue">{geneInfo}</span>
        </span>
      ) : null}
    </div>
  );
}
