import { registerPluginViewType } from 'vitessce';
import { PluginViewType, PLUGIN_COMPONENT_COORDINATION_TYPES } from '../constants';
import QRComparisonScatterplotSubscriber from './comparison/QRComparisonScatterplotSubscriber';

function register() {
    registerPluginViewType(
      PluginViewType.QR_COMPARISON_SCATTERPLOT,
      QRComparisonScatterplotSubscriber,
      PLUGIN_COMPONENT_COORDINATION_TYPES[PluginViewType.QR_COMPARISON_SCATTERPLOT],
    );
}
