#! /usr/bin/env node
require('shelljs/global');
var shell = require("shelljs");
var userArgs = process.argv.slice(2);
cd(process.cwd());
var config = {};
try {
    if(userArgs.length > 0) {
        config = require(userArgs[0]);
    } else {
        config = require("./wbconfig.json");
    }
} catch(e){
    console.log("Not correct file path!");
}
function checkAndProcessWebpack(path) {
    var lsVal = ls("-l", [path+"webpack.*.js"]);
    if( lsVal.length > 13 ){
        shell.exec("npm run build");
	return true;
    } else {
        return false;
    }
}

function checkAndReturnPath(basePath, stepString) {
    if(stepString == "node_modules"){
        console.error("Error: entered in node_modules, returning!");
        return null;
    }
    basePath += stepString + "/";
    return basePath;
}
function processWebPackPaths(path) {
    var pathArray       = path.split("/");
    var basePath        = "";
    var buildPathArray   = [];
    for(var step in pathArray){
        var stepString = pathArray[step];
        if( stepString != "*" ){
            var basePathChecked = checkAndReturnPath(basePath, stepString);
            if( !basePathChecked ) break;
            basePath = basePathChecked;
            if( checkAndProcessWebpack(basePath) ) break;
        } else {
            var lsVal = ls("-l", [basePath]);
            lsVal.forEach(function (stat) {
                if(stat.isDirectory()){
                    var basePathChecked = checkAndReturnPath(basePath, stat.name);
                    if( !basePathChecked ) return;
                    basePath = basePathChecked;
                    if( checkAndProcessWebpack(basePath) ) return;
                }
            });
        }
    }
}

if(typeof config.webpackPaths == "undefined"){
    console.error("Error: No webpackPaths defined in config.");
} else if( typeof config.webpackPaths == "string" ) {
    console.log("Found path, searching for webpack conf files");
    processWebPackPaths(config.webpackPaths);
} else if( Array.isArray(config.webpackPaths) ){
    console.log("Found paths, searching for webpack conf files");
    config.webpackPaths.forEach(function (path) {
        processWebPackPaths(path);
    })
} else {
    console.error("Error: webpackPaths not in required format, it can be a String or Array");
}
