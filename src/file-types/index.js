import { registerPluginFileType, DataType } from 'vitessce';
import { PluginFileType } from '../constants';
import LargeCellsZarrLoader from './data-loaders/LargeCellsZarrLoader';
import AnnDataSource from './data-sources/AnnDataSource';

export default function register() {
  registerPluginFileType(
    PluginFileType.ANNDATA_POLYPHONY_ZARR,
    DataType.CELLS,
    LargeCellsZarrLoader,
    AnnDataSource,
  );
}
