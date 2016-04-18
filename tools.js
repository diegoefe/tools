"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */

var Tools = {}; 
 
var Promises = require('best-promise');
var Path = require('path');
var fs = require('fs-promise');
var readYaml = require('read-yaml-promise');
var winOS = Path.sep==='\\';

Tools.config = { gitDir:false };

/*
    This function will search for the directory containing the git executable
    in this order:
    - Tools.config.gitDir
    - config.gitDir in packaje.json
    - GITDIR environment variable
    - A set of predefinded paths
*/
Tools.findGitDir = function findGitDir() {
    var paths;
    var localyaml='./local-config.yaml';
    return Promises.start(function() {
        paths=[
            'c:\\Git\\bin',
            'c:\\Archivos de programa\\Git\\bin',
            'c:\\Program Files\\Git\\bin',
            'c:\\Program Files (x86)\\Git\\bin',
            '/usr/bin',
            '/usr/local/bin',
            '/bin'
        ];
        if(Tools.config.gitDir) {
            paths.unshift(Tools.config.gitDir);
        }
        return fs.exists(localyaml);
    }).then(function(existsYAML) {
        if(existsYAML) { return readYaml(localyaml); }
        return false;
    }).then(function(yconf){
        if(yconf && yconf.git_dir) {
            paths.unshift(yconf.git_dir);
        }
        if(process.env.GITDIR) {
            paths.unshift(process.env.GITDIR);
        }
        return paths.reduce(function(promiseChain, path){
            return promiseChain.catch(function(){
                return fs.stat(path).then(function(stat){
                    if(stat.isDirectory()){
                        return path;
                    }else{
                        return Promises.reject('not dir');
                    }
                });
            });
        },Promises.reject());
    });
};

exports = module.exports = Tools;
