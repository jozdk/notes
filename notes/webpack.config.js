import path from "path";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCSSExtractPlugin from "mini-css-extract-plugin";

export default ({ MODE }) => {
    return {
        mode: MODE === "production" ? "production" : "development",
        entry: path.resolve("client/src/index.jsx"),
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: ["babel-loader"]
                },
                {
                    test: /\.css$/,
                    use: [MiniCSSExtractPlugin.loader, "css-loader", "postcss-loader"]
                }
            ]
        },
        resolve: {
            extensions: ["*", ".js", ".jsx"]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new CopyWebpackPlugin({
                patterns: [
                    { from: "client/src/index.html", to: "." },
                    { from: "client/src/static", to: "./assets/svg" }
                ]
            }),
            new MiniCSSExtractPlugin({
                filename: "assets/css/style.css"
            })
        ],
        output: {
            path: path.resolve("client/public"),
            filename: "main.js"
        },
        devtool: MODE === "production" ? "source-map" : "eval-source-map"
    }
}

