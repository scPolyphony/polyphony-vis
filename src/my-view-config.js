export const myViewConfig = {
  name: 'Test plugin view types',
  version: '1.0.9',
  description: 'Demonstration of a basic plugin view implementation.',
  public: true,
  datasets: [
    {
      uid: 'plugin-test-dataset',
      name: 'Plugin test dataset',
      files: [
        {
          type: "raster",
          fileType: "raster.json",
          url: "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/spraggins/spraggins.raster.json"
        }
      ],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    spatialZoom: {
      A: -6.5,
    },
  },
  layout: [
    {
      component: 'description',
      props: {
        title: 'Description',
      },
      x: 10,
      y: 0,
      w: 2,
      h: 2,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        spatialZoom: 'A',
      },
      x: 2,
      y: 0,
      w: 8,
      h: 2,
    },
    {
      component: 'myCustomZoomController',
      coordinationScopes: {
        spatialZoom: 'A',
      },
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    },
  ],
};