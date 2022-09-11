const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");


const devServerHeaders = {
  "Access-Control-Allow-Origin": "*",
};

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "./src/index.ts"),
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.[contenthash].js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    port: 8080,
    headers: devServerHeaders,
    hot: true,
    liveReload: true,
    compress: true,
    client: {
      progress: true,
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./public/template.html"),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: false, // this will already fail in the babel step
        },
      },
    }),
    new MiniCssExtractPlugin({ filename: "styles.[contenthash].css" }),
    new CopyPlugin({
      patterns: [
        {
          from: "./public/*",
          globOptions: {
            ignore: ["**/template.html"],
          },
          to: "./[name][ext]",
        },
      ],
    }),
  ],
};
