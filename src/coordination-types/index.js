import { registerPluginCoordinationType } from 'vitessce';
import { PLUGIN_DEFAULT_COORDINATION_VALUES } from '../constants';

export default function register() {
  Object.entries(PLUGIN_DEFAULT_COORDINATION_VALUES).forEach(([key, val]) => {
    registerPluginCoordinationType(key, val);
  });  
}
