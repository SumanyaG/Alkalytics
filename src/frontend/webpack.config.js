const path = require("path");

module.exports = {
  entry: "./src/index.js", // Your entry point
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Handling .ts and .tsx files
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/, // Handling CSS files
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"], // Add .tsx to the extensions list
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"), // Directory to serve static files
    },
    compress: true,
    port: 9000,
    hot: true, // Enables hot module replacement
  },
};
