const fileName = 'Feedback';

module.exports = {
    mode: 'production',
    entry: `${__dirname}/../src/Pages/${fileName}.jsx`,
    output: { path: `${__dirname}/../pages/resources`, filename: `${fileName}.js` },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                "@babel/preset-env",
                                "@babel/react"
                            ],
                            plugins: [
                                "@babel/plugin-proposal-class-properties"
                            ]
                        }
                    }
                ]
            }
        ]
    }
};