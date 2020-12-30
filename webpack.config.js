const SizePlugin = require('size-plugin')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const keysTransformer = require('ts-transformer-keys/transformer').default;

module.exports = {
	//devtool: 'source-map',
    stats: 'errors-only',
	entry: {
        index: './src/index.ts',
        background: './src/background.ts',
        //webpage: './src/webpage.ts'
    },
    module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
            options: {
                getCustomTransformers: program => ({
                    before: [
                        keysTransformer(program)
                    ]
                })
              }
          },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
	output: {
		path: path.join(__dirname, './dist'),
        filename: '[name].js'
    },
    mode: 'production',
	plugins: [
		new SizePlugin(),
		new CopyWebpackPlugin({
            patterns: [
                {
                    from: '**/*',
                    context: 'assets',
                }
            ]
        })
	],
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					mangle: false,
                    compress: false,
                    /*
					output: {
						beautify: true,
						indent_level: 2 // eslint-disable-line camelcase
                    }
                    */
				}
			})
		]
	}
};