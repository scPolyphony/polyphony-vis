/* eslint-disable */

const experiment = 'case-1';

const zarrPath = `http://localhost:7778/files/zarr/${experiment}`;
// const zarrPath = 'http://3.86.7.210:8080/files/zarr';
const apiRoot = 'http://localhost:7778/api';
// const apiRoot = 'http://3.86.7.210:8080/api';

export const refAnnDataOptions = {
  expressionMatrix: {
    path: 'X'
  },
  anchorMatrix: {
    path: 'obsm/anchor_mat'
  },
  differentialGenes: {
    names: {
      path: 'uns/rank_genes_groups/_names_indices'
    },
    scores: {
      path: 'uns/rank_genes_groups/_scores'
    },
    clusters: {
      path: 'uns/rank_genes_groups/_valid_cluster'
    }
  },
  features: {
    cellType: {
      path: 'obs/cell_type'
    },
    anchorCluster: {
      path: 'obs/anchor_cluster'
    }
  },
  embeddings: {
    UMAP: {
      path: 'obsm/X_umap',
      dims: [0, 1]
    }
  },
};

export const qryAnnDataOptions = {
  apiRoot: apiRoot,
  expressionMatrix: {
    path: 'X'
  },
  anchorMatrix: {
    path: 'obsm/anchor_mat'
  },
  differentialGenes: {
    names: {
      path: 'uns/rank_genes_groups/_names_indices'
    },
    scores: {
      path: 'uns/rank_genes_groups/_scores'
    },
    clusters: {
      path: 'uns/rank_genes_groups/_valid_cluster'
    }
  },
  features: {
    prediction: {
      path: 'obs/prediction'
    },
    label: {
      path: 'obs/label'
    },
    cellType: {
      path: 'obs/cell_type'
    },
    anchorDist: {
      path: 'obs/anchor_dist'
    },
    anchorCluster: {
      path: 'obs/anchor_cluster'
    }
  },
  embeddings: {
    UMAP: {
      path: 'obsm/X_umap',
      dims: [0, 1]
    }
  },
};

export const viewConfig = {
    name: 'Polyphony',
    version: '1.0.9',
    description: 'Fine-tune the Polyphony model by selecting or rejecting anchor cell sets.',
    public: true,
    datasets: [
      {
        uid: 'ref',
        name: 'Pancreas reference',
        files: [
          {
            type: 'cells',
            fileType: 'anndata-polyphony.zarr',
            url: `${zarrPath}/reference.zarr`,
          },
          {
            type: 'expression-matrix',
            fileType: 'anndata-expression-matrix.zarr',
            url: `${zarrPath}/reference.zarr`,
            options: {
              matrix: "X"
            }
          },
        ],
      },
      {
        uid: 'qry',
        name: 'Pancreas query',
        files: [
          {
              type: 'cells',
              fileType: 'anndata-polyphony.zarr',
              url: `${zarrPath}/query.zarr`,
          },
          {
            type: 'expression-matrix',
            fileType: 'anndata-expression-matrix.zarr',
            url: `${zarrPath}/query.zarr`,
            options: {
              matrix: "X"
            }
          },
        ],
      },
    ],
    initStrategy: 'auto',
    coordinationSpace: {
        dataset: {
            REFERENCE: 'ref',
            QUERY: 'qry',
          },
          cellSetSelection: {
            ref: null,
            qry: null,
          },
          cellSetColor: {
            ref: null,
            qry: null,
          },
          cellColorEncodingPlugin: {
            ref: null,
            qry: null,
            refSmallLeft: 'cellSetSelection',
            qrySmallLeft: 'cellSetSelection',
            refSmallRight: 'dataset',
            qrySmallRight: 'dataset',
          },
          embeddingType: {
            ref: 'UMAP',
            qry: 'UMAP',
          },
          embeddingCellRadius: {
            comparison: 2,
            supporting: 2,
          },
          embeddingCellRadiusMode: {
            comparison: 'manual',
            supporting: 'manual'
          },
          embeddingCellOpacity: {
            comparison: 1,
            supporting: 1,
          },
          embeddingCellOpacityMode: {
            comparison: 'manual',
            supporting: 'manual'
          },
          embeddingCellSetLabelsVisible: {
            comparison: false,
            qrySupporting: false,
            refSupporting: true
          },
          embeddingZoom: {
            comparison: null,
            supporting: null,
          },
          embeddingTargetX: {
            comparison: null,
            qrySupporting: null,
            refSupporting: null,
          },
          embeddingTargetY: {
            comparison: null,
            qrySupporting: null,
            refSupporting: null,
          },
          anchorEditTool: {
            qry: null,
          },
          anchorEditMode: {
            qry: null,
          },
          anchorSetFocus: {
            ref: null,
            qry: null,
          },
          anchorSetHighlight: {
            ref: null,
            qry: null,
          },
          embeddingVisible: {
            ref: true,
            qry: true,
            refSmallLeft: true,
            qrySmallLeft: true,
            refSmallRight: true,
            qrySmallRight: true,
          },
          embeddingEncoding: {
            ref: 'contour',
            qry: 'scatterplot-and-contour',
            refSmallLeft: 'scatterplot',
            qrySmallLeft: 'scatterplot',
            refSmallRight: 'scatterplot',
            qrySmallRight: 'scatterplot',
          },
          embeddingLinksVisible: {
            comparison: true,
          },
          geneSelection: {
            main: null,
            smallLeft: null,
            smallRight: null,
          },
    },
    layout: [
        {
            component: 'qrStatus',
            coordinationScopes: {
              dataset: ['REFERENCE', 'QUERY'],
              cellSetSelection: { REFERENCE: 'ref', QUERY: 'qry' },
              cellSetColor: { REFERENCE: 'ref', QUERY: 'qry' },
              cellColorEncodingPlugin: { REFERENCE: 'ref', QUERY: 'qry' },
              embeddingType: { REFERENCE: 'ref', QUERY: 'qry' },
              anchorSetFocus: { REFERENCE: 'ref', QUERY: 'qry' },
              anchorSetHighlight: { REFERENCE: 'ref', QUERY: 'qry' },
              anchorEditTool: 'qry',
              anchorEditMode: 'qry',
            },
            x: 0,
            y: 0,
            w: 12,
            h: 1,
          },
          {
            component: 'qrCellSets',
            coordinationScopes: {
              dataset: ['REFERENCE', 'QUERY'],
              cellSetSelection: { REFERENCE: 'ref', QUERY: 'qry' },
              cellSetColor: { REFERENCE: 'ref', QUERY: 'qry' },
              cellColorEncodingPlugin: { REFERENCE: 'ref', QUERY: 'qry' },
              embeddingType: { REFERENCE: 'ref', QUERY: 'qry' },
              anchorSetFocus: { REFERENCE: 'ref', QUERY: 'qry' },
              anchorSetHighlight: { REFERENCE: 'ref', QUERY: 'qry' },
              anchorEditTool: 'qry',
              anchorEditMode: 'qry',
              geneSelection: 'all',
            },
            x: 7,
            y: 1,
            w: 5,
            h: 6,
          },
          {
            component: 'qrScores',
            coordinationScopes: {
              dataset: ['REFERENCE', 'QUERY'],
              cellSetSelection: { REFERENCE: 'ref', QUERY: 'qry' },
              cellSetColor: { REFERENCE: 'ref', QUERY: 'qry' },
              cellColorEncodingPlugin: { REFERENCE: 'ref', QUERY: 'qry' },
              embeddingType: { REFERENCE: 'ref', QUERY: 'qry' },
              anchorSetFocus: { REFERENCE: 'ref', QUERY: 'qry' },
              anchorSetHighlight: { REFERENCE: 'ref', QUERY: 'qry' },
              anchorEditTool: 'qry',
              anchorEditMode: 'qry',
              geneSelection: 'all',
            },
            x: 7,
            y: 7,
            w: 5,
            h: 5,
          },
          {
            component: 'qrComparisonScatterplot',
            coordinationScopes: {
              dataset: ['REFERENCE', 'QUERY'],
              cellSetSelection: { REFERENCE: 'ref', QUERY: 'qry' },
              cellSetColor: { REFERENCE: 'ref', QUERY: 'qry' },
              cellColorEncodingPlugin: { REFERENCE: 'ref', QUERY: 'qry' },
              embeddingType: { REFERENCE: 'ref', QUERY: 'qry' },
              anchorSetFocus: { REFERENCE: 'ref', QUERY: 'qry' },
              anchorSetHighlight: { REFERENCE: 'ref', QUERY: 'qry' },
              embeddingVisible: { REFERENCE: 'ref', QUERY: 'qry' },
              embeddingEncoding: { REFERENCE: 'ref', QUERY: 'qry' },
              embeddingZoom: 'comparison',
              embeddingTargetX: 'comparison',
              embeddingTargetY: 'comparison',
              embeddingCellRadius: 'comparison',
              embeddingCellRadiusMode: 'comparison',
              embeddingCellOpacity: 'comparison',
              embeddingCellOpacityMode: 'comparison',
              embeddingCellSetLabelsVisible: 'comparison',
              embeddingLinksVisible: 'comparison',
              anchorEditTool: 'qry',
              anchorEditMode: 'qry',
              geneSelection: 'all',
            },
            props: {
              isMainComparisonView: true,
              /* qrySupportingUuid: 3, */
              /* refSupportingUuid: 4, */
            },
            x: 0,
            y: 1,
            w: 7,
            h: 11,
          },
    ],
};
