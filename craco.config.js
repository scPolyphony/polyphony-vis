module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            webpackConfig.module.rules = [
                {
                    test: /\.m?js/,
                    resolve: {
                        fullySpecified: false
                    }
                }, ...webpackConfig.module.rules
            ];
            return webpackConfig;
        },
    }
};