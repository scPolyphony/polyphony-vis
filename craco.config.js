// const path = require('path');

module.exports = {
    babel: {
        plugins: [
            "glsl",
        ],
    },
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            webpackConfig.resolve = {
                ...webpackConfig.resolve,
                alias: {
                    'txml/txml': 'txml/dist/txml',
                    ...webpackConfig.resolve.alias,
                },
            };
            /*
            webpackConfig.module.rules[2].oneOf[1].options.plugins = [
                [
                    path.join(paths.appNodeModules, 'babel-plugin-named-asset-import'),
                    {
                        loaderMap: {
                            svg: {
                                ReactComponent: '@svgr/webpack?-svgo,+titleProp,+ref![path]',
                            },
                        },
                    },
                ],
            ];
            */
            return webpackConfig;
        },
    },
};