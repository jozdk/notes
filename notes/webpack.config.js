import path from "path";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

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
                    { from: "client/src/css", to: "./assets/stylesheets" },
                    { from: "client/src/static", to: "./assets/svg" }
                ]
            })
        ],
        output: {
            path: path.resolve("client/public"),
            filename: "main.js"
        },
        devtool: MODE === "production" ? "source-map" : "eval-source-map"
    }
}

