import { registerPluginViewType } from 'vitessce';
import { PluginViewType, PLUGIN_COMPONENT_COORDINATION_TYPES } from '../constants';

import QRComparisonScatterplotSubscriber from './comparison/QRComparisonScatterplotSubscriber';
import QRCellSetsManagerSubscriber from './anchor-set/QRCellSetsManagerSubscriber';
import QRScoresSubscriber from './marker/QRScoresSubscriber';
import QRStatusSubscriber from './status/QRStatusSubscriber';

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
  registerPluginViewType(
    PluginViewType.QR_SCORES,
    QRScoresSubscriber,
    PLUGIN_COMPONENT_COORDINATION_TYPES[PluginViewType.QR_SCORES],
  );
  registerPluginViewType(
    PluginViewType.QR_STATUS,
    QRStatusSubscriber,
    PLUGIN_COMPONENT_COORDINATION_TYPES[PluginViewType.QR_STATUS],
  );
}
