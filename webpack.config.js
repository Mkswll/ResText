const path = require("path");

module.exports = {
    entry: "./src/resume.js", // Entry point of your application
    output: {
        path: path.resolve(__dirname, "dist"), // Output directory
        filename: "bundle.js", // Output bundle file name
    },
    mode: "development", // Development mode
};
