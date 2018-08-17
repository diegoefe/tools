"use strict";


const mapCopy = (obj) => { return JSON.parse(JSON.stringify(obj)) }

var expect = require('expect.js');
var Tools = require('..');
var Promises = require('best-promise');
var fs = require('fs-promise');
var expectCalled = require('expect-called');
var Path = require('path');

describe('find gitdir tests', function(){
    var configOriginal;
    var envOriginal;
    var controlFsStat;
    beforeEach(function(){
        configOriginal = mapCopy(Tools.config);
        envOriginal = process.env;
        controlFsStat = expectCalled.control(fs,'stat',{returns:[
            Promises.Promise.resolve({isDirectory: function(){ return true;}})
        ]});
    });
    afterEach(function(){
        Tools.config = configOriginal;
        process.env = envOriginal;
        controlFsStat.stopControl();
    });
    it('find git in Tools.config', function(done){
        var controlFsExists = expectCalled.control(fs,'exists',{returns:[
            Promises.Promise.resolve(false)
        ]});
        var fakeDirInConfig = "/usr/bin";
        Tools.config = {gitDir: fakeDirInConfig};
        Tools.findGitDir().then(function(git){
            expect(git).to.eql(fakeDirInConfig);
            expect(controlFsStat.calls).to.eql([
                [fakeDirInConfig]
            ]);
            controlFsExists.stopControl();
            done();
        }).catch(function(done) {
            controlFsExists.stopControl();
        });
    });
    it('find git in local-config.yaml', function(done){
        var here=process.cwd();
        process.chdir(Path.normalize(__dirname+'/dir-with-yaml-conf'));
        Tools.findGitDir().then(function(git){
            expect(git).to.eql('/some/directory/containing/the/git/binary');
            process.chdir(here);
            done();
        }).catch(done);
    });
    it('find git in environment variable', function(done){
        var fakeEnvDir='c:\\directory\\containing\\git\\binary';
        process.env['GITDIR'] = fakeEnvDir;
        Tools.findGitDir().then(function(git){
            expect(git).to.eql(fakeEnvDir);
            expect(controlFsStat.calls).to.eql([ [fakeEnvDir] ]);
            done();
        }).catch(done);
    });
});
