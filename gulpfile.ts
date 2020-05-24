/// <reference path="node_modules/@types/node/index.d.ts" />
/// <reference path="node_modules/@types/es6-shim/index.d.ts" />

let gulp = require("gulp");
let plumber = require("gulp-plumber");
let postcss = require("gulp-postcss");
let autoprefixer = require("autoprefixer");
let cssnano = require("cssnano");
let ext_replace = require("gulp-ext-replace");
let fontpath = require("postcss-fontpath");
let sass = require("gulp-sass");
let del = require("del");
let jsonminify = require("gulp-jsonmin");
let gulpHtmlmin = require("gulp-htmlmin");
let htmlmin = require("html-minifier");
let runSequence = require("run-sequence");
let watch = require("gulp-watch");
let util = require("gulp-util");
let browserSync = require("browser-sync").create();
let sourcemaps = require("gulp-sourcemaps");
let environments = require("gulp-environments");
let historyApiFallback = require('connect-history-api-fallback');
let watchify = require("watchify");
let browserify = require("browserify");
let tsify = require("tsify");
let source = require("vinyl-source-stream");
let buffer = require("vinyl-buffer");
let uglify = require("gulp-uglify");
let envify = require("envify/custom");
let dir = require("node-dir");
let fs = require("fs");
let fsPath = require("fs-path");
let rollup = require('rollup-stream');

let ruResolve = require('rollup-plugin-node-resolve');
let ruBabel = require("rollup-plugin-babel");
let ruCommonJs = require("rollup-plugin-commonjs");
let typescript = require("rollup-plugin-typescript");
let alias = require('rollup-plugin-alias');
let assign = require('object-assign');

import 'reflect-metadata';
import * as ts from 'typescript';
import * as tsc from '@angular/tsc-wrapped';
import { CodeGenerator } from '@angular/compiler-cli';

let isProductionPipe: any = environments.production;
let isDevelopmentPipe: any = environments.development;

function isProduction(v, e) {
    if(environments.production()) {
        return v;
    } else {
        return e;
    }
}

function isDevelopment(v, e) {
    return isProduction(e, v);
}

function makeArray(elements) {
    let ret = [];
    [...Array.from(arguments)].forEach(v => {
        if(v) ret.push(v);
    });
    return ret;
}

let buildArr = [];
let watchArr = [];
let buildExclusiveArr = [];

let outputPath = isProduction("www-release", "www");

let tasks = {
    json: ['json/**/*', (path) => {
        return gulp.src(path)
            .pipe(plumber(plError))
            .pipe(jsonminify())
            .pipe(gulp.dest(outputPath + '/json'));
    }, "reload"],
    img: ['img/**/*', (path) => {
        return gulp.src(path)
            .pipe(plumber(plError))
            .pipe(gulp.dest(outputPath + '/img'));
    }, "reload"],
    index: ['index.html', (path) => {
        return gulp.src(path)
            .pipe(plumber(plError))
            .pipe(gulpHtmlmin(htmlMinOptions))
            .pipe(gulp.dest(outputPath));
    }, "none"],
    webAnimationsPolyfill: ['node_modules/web-animations-js/web-animations-next.min.js', (path) => {
        return gulp.src(path)
            .pipe(plumber(plError))
            .pipe(gulp.dest(outputPath));
    }, "none"],
    fonts: ['fonts/**/*', (path) => {
        return gulp.src(path)
            .pipe(plumber(plError))
            .pipe(gulp.dest(outputPath + '/fonts'));
    }, "reload"],
    css: ['scss/*.scss', (path) => {
        return gulp.src('scss/stylesheet.scss')
            .pipe(plumber(plError))
            .pipe(isDevelopmentPipe(sourcemaps.init()))
            .pipe(sass({
                includePaths: ["node_modules/bootstrap-sass/assets/stylesheets", ""]
            }))
            .pipe(postcss(postCssPlugins))
            .pipe(isDevelopmentPipe(sourcemaps.write()))
            .pipe(ext_replace("css"))
            .pipe(gulp.dest(outputPath + '/css'));
    }, "stream"]
};

gulp.task('browser-sync', () => {
    browserSync.init({
        open: false,
        files: ["./www/script.js", "./www/index.html"],
        reloadOnRestart: true,
        port: "3000",
        server: {
            baseDir: "./www",
            middleware: [
                historyApiFallback()
            ]
        }
    });
});
watchArr.push("browser-sync");

let bfy = browserify({
    packageCache: {},
    cache: {},
    entries: ["./script/main.ts"],
}).plugin(tsify).transform(envify({
    global: true,
    NODE_ENV: isDevelopment("development", "production"),
}));

gulp.task("javascript-build", () => {
    if(environments.production()) {
        return manuallyImproveFiles().then(angularAoTCompile).then(bundleWithRollup).then(applyTranslations);
    } else {
        return bundle(bfy);
    }
});
gulp.task("javascript", () => {
    let b = watchify(bfy);
    b.on("update", () => {
        bundle(b);
    });
    b.on("log", util.log);
    return bundle(b);
});

function bundle(b) {
    return b.bundle()
        .on("error", function(err) {
            util.log(new util.PluginError("Browserify", err).toString());
            this.emit("end");
        })
        .pipe(source("script.js"))
        .pipe(buffer())
        .pipe(isDevelopmentPipe(sourcemaps.init({ loadMaps: true })))
        .pipe(isProductionPipe(uglify()))
        .pipe(isDevelopmentPipe(sourcemaps.write()))
        .pipe(gulp.dest(outputPath));
}

buildExclusiveArr.push("javascript-build");
watchArr.push("javascript");

function manuallyImproveFiles() {
    return new Promise((resolve) => {
        let promises = [];
        dir.readFiles("script", {
            match: /\.ts$/
        }, (err, content, filename, next) => {
            const regex = /^script/;
            let fn = filename.replace(regex, "tmp");
            const r = new RegExp("template:\\s*`([^`]+)`", "g");
            let newContent = content.replace(/template:\s*`([^`]+)`/g, (match, p1) => {
                return "template: `" + htmlmin.minify(p1, htmlMinOptions) + "`";
            });
            promises.push(new Promise((resolve) => {
                fsPath.writeFile(fn, newContent, () => {
                    resolve();
                });
            }));
            next();
        }, () => {
            Promise.all(promises).then(() => resolve());
        });
    })
}

function angularAoTCompile() {
    function codegen(ngOptions: any, cliOptions: tsc.NgcCliOptions, program: ts.Program,
                     host: ts.CompilerHost) {
        return CodeGenerator.create(ngOptions, cliOptions, program, host).codegen();
    }

    const cliOptions = new tsc.NgcCliOptions({});
    return tsc.main("tsconfig-aot.json", cliOptions, codegen).catch(e => {
        console.error(e.stack);
        console.error('Compilation failed');
        process.exit(1);
    })
}

function bundleWithRollup() {
    return new Promise(resolve => {
        rollup({
            entry: './tmp/main-prod.ts',
            moduleName: "someModule",
            format: "iife",
            plugins: [
                typescript(assign({
                    typescript: ts
                }, require('./tsconfig-aot.json').compilerOptions)),
                ruCommonJs([
                    'node_modules/moment/**'
                ]),
                ruResolve({
                    jsnext: true, main: true, browser: true, modules: true
                }),
                ruBabel({
                    "presets": [
                        ["es2015", { "modules": false }]
                    ],
                    "plugins": [
                        "external-helpers"
                    ]
                })
            ]
        }).on("error", function(err) {
            util.log(new util.PluginError("Rollup", err).toString());
            this.emit("end");
        })
            .pipe(source("script.js"))
            .pipe(buffer())
            // .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(isProductionPipe(uglify()))
            // .pipe(sourcemaps.write())
            .pipe(gulp.dest(outputPath))
            .on("end", resolve);
    });
}

function applyTranslations() {
    return new Promise(resolve => {
        let bundleContent = fs.readFileSync(outputPath + "/script.js").toString();
        let indexContent = fs.readFileSync(outputPath + "/index.html").toString();
        let promises = [];

        dir.readFiles("json/lang", (err, content, filename, next) => {
            let langJson = JSON.stringify(JSON.parse(content));
            let [,lang] = filename.match(/([^\\\/]+)\.json$/);
            let newBundleFileName = "script-" + lang + ".js";
            let newIndexFileName = "index-" + lang + ".html";
            let newBundleContent = bundleContent.replace(/process\.env\.translation/g, langJson);
            let newIndexContent = indexContent.replace(/script\.js/g, newBundleFileName)

            promises.push(new Promise((resolve) => {
                fsPath.writeFile(outputPath + "/" + newBundleFileName, newBundleContent, () => {
                    resolve();
                });
            }));

            promises.push(new Promise((resolve) => {
                fsPath.writeFile(outputPath + "/" + newIndexFileName, newIndexContent, () => {
                    resolve();
                });
            }));

            next();
        }, () => {
            Promise.all(promises).then(resolve);
        });

    })
}

gulp.task("ts", () => {
    return manuallyImproveFiles().then(angularAoTCompile).then(bundleWithRollup).then(applyTranslations);
});

let plError = {
    errorHandler: function(error) {
        console.log(error);
        this.emit('end');
    }
};

let postCssPlugins = [
    autoprefixer({
        browsers: ['> 1%']
    }),
    fontpath({}),
    ...isProduction([cssnano({})], [])
];

let htmlMinOptions = {
    collapseWhitespace: true,
    customAttrSurround: [[/#/, /(?:)/], [/\*/, /(?:)/], [/\[?\(?/, /(?:)/]], // angular2
    customAttrAssign: [/\)?\]?=/],
    caseSensitive: true
};

function makeTask(name, t) {

    let [files, cb, mode] = t;

    gulp.task(name, function() {
        return watch(files, {
            read: false, awaitWriteFinish: {
                stabilityThreshold: 300,
                pollInterval: 100
            }
        }, (file) => {
            util.log("Rebuilding " + file.basename);
            let stream = cb(file.path);
            switch(mode) {
                case "reload":
                    browserSync.reload();
                    break;
                case "stream":
                    stream.pipe(browserSync.stream());
                    break;
                case "none":
                    break;
                default:
                    util.log(util.colors.red("ERROR: ") + "Task-Element[2] is " + t[2]);
            }
            return stream;
        });
    });

    let n = name + "-build";

    gulp.task(n, () => {
        return t[1](t[0]);
    });

    buildArr.push(n);
    watchArr.push(name);
}

for(let t in tasks) {
    makeTask(t, tasks[t]);
}

gulp.task('clean', () => {
    return del.sync(isDevelopment(["www/**/*"], ["www-release/**/*"]));
});

gulp.task('buildAll', [...buildArr, ...buildExclusiveArr]);
gulp.task('build', ['buildAll']); // alias

gulp.task('cleanBuildAll', ["clean", "build"]);
gulp.task('rebuild', ['cleanBuildAll']);

gulp.task('watch', function() {
    runSequence('rebuild', watchArr);
});
gulp.task('serve', ['watch']); // alias