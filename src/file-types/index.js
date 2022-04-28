import { registerPluginFileType, DataType } from 'vitessce';
import { PluginFileType } from '../constants';
import CellsZarrLoader from './data-loaders/CellsZarrLoader';
import AnnDataSource from './data-sources/AnnDataSource';

export default function register() {
  registerPluginFileType(
    PluginFileType.ANNDATA_POLYPHONY_ZARR,
    DataType.CELLS,
    CellsZarrLoader,
    AnnDataSource,
  );
}
