import { registerPluginViewType } from 'vitessce';
import { PluginViewType, PLUGIN_COMPONENT_COORDINATION_TYPES } from '../constants';

import QRComparisonScatterplotSubscriber from './comparison/QRComparisonScatterplotSubscriber';
import QRCellSetsManagerSubscriber from './anchor-set/QRCellSetsManagerSubscriber';

export default function register() {
  registerPluginViewType(
    PluginViewType.QR_COMPARISON_SCATTERPLOT,
    QRComparisonScatterplotSubscriber,
    PLUGIN_COMPONENT_COORDINATION_TYPES[PluginViewType.QR_COMPARISON_SCATTERPLOT],
  );
  registerPluginViewType(
    PluginViewType.QR_CELL_SETS,
    QRCellSetsManagerSubscriber,
    PLUGIN_COMPONENT_COORDINATION_TYPES[PluginViewType.QR_CELL_SETS],
  );
}
