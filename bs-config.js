module.exports = {
    files: ["./www-release/**/*"],
    server: {
        "baseDir": "./www-release",
        middleware: {
            // overrides the second middleware default with new settings
            1: require('connect-history-api-fallback')({index: './www-release/index.html'})
        }
    }
};