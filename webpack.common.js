const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HandlebarsPlugin = require('handlebars-webpack-plugin');

const mergeJSON = require('handlebars-webpack-plugin/utils/mergeJSON');
const projectData = mergeJSON(path.join(__dirname, "src/pages/json/*.json"));

var config = {
    srcPath: './src',
    distPath: './dist',
    bowerDir: './public/vendor',
    templateDir: './src/pages/templates',
    jsonDir: './src/pages/json',
    projectPath: './projects'
};

module.exports = {
    entry: {
        home: {
            import: './src/index.js',
        },
    },
    plugins: [
        new HtmlPlugin(
            {
                // title: 'branderson.io',
                page: 'home',
                template: 'src/index.html',
            },
            // {
            //     title: "Project",
            //     template: './src/templates/projectTemplate.handlebars',
            //     templateParameters:require('./src/pages/json/DearLeader.json'),
            //     filename: path.join(__dirname, "dist/projects/")
            // }
        ),
        new HandlebarsPlugin(
            entry: path.join(process.cwd(), "./src/pages/templates", "projectTemplate.handlebars"),
            output: path.join(process.cwd(), "dist", "projects", "[name].html"),
            data: projectData,
        ),
    ],
    output: { 
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: 'html-loader',
            },
            { 
                test: /\.s[ac]ss$/i,
                use: [
                    // `style` nodes from JS strings
                    'style-loader',
                    // CSS to CommonJS
                    'css-loader',
                    // SASS to CSS
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require('sass'),
                        }
                    },
                ] 
            },
            {
                test: /\.handlebars$/,
                use: {
                    loader: 'handlebars-loader',
                    // options: {
                    //     ignorePartials: true,
                    //     batch: ['src/pages/partials'],
                    //     knownHelpers: {
                    //         inc: function(value)
                    //         {
                    //             return parseInt(value) + 1;
                    //         }
                    //     }
                    // }
                },
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ],
    },
    optimization: {
        minimizer: [
            `...`,
            new CssMinimizerPlugin(),
        ],
    },
};
