/*@license
 * BUFI - lightweight GUI
 * Copyright 2014-2015 blindfish
 * MIT License
 */

//TODO: ensure useful utilities (e.g. ejs) are available globally
// - e.g. expose as children of bufi

"use strict";

var log = require('../../_lib/_log');
var addControl = require('./_modules/_addControl');
var setValueByType = require('./_modules/_setValue');
var storedControls = {};

var bufi = function(target) {
    if(target) {
        this.target = target && document.querySelector(target);
    }
    else {
        console.warn("for precise layout it's recommended you create a controls container and pass its id to bfControls");
        this.target = document.createElement('div');
        var bodyTag = document.getElementsByTagName('body');
        if(bodyTag.length > 0) {
            bodyTag[0].appendChild(this.target);
        }
        else {
            console.error("No body tag found.  Try placing the script at the bottom of you body.")
        }
    }
};


bufi.prototype.add = function(type, options, callback) {

    if(typeof options === "function") {
        callback = options;
        options = {};
    }
    addControl(type, this.target, options, callback);
}


bufi.prototype.addControlGroup = function(controls, legend, id) {
    var container = document.createElement('fieldset');
    container.className = 'control-group-fieldset';

    if(legend) {
        var legendElement = document.createElement('legend');
        legendElement.innerHTML = legend;
        container.appendChild(legendElement);
    }

    for(var i=0, len=controls.length; i<len; i++) {
        var params = controls[i];
        var callback;
        var options;

        if(typeof params.options === "function") {
            callback = params.options;
            options = {};
        }
        else {
            callback = params.callback;
            options = params.options;
        }

        var thisControl = addControl(params.type, container, options, callback);
        storedControls[thisControl.id] = thisControl.props;

    }

    this.target.appendChild(container);

}


bufi.prototype.setValue = function(controlID, value) {
    var targetControl = storedControls[controlID];

    if(!targetControl) {throw "- supplied ID [" + controlID + "] doesn't match any recorded control"};

    var type = targetControl.type;

    //TODO: check whether call() is the best approach here.
    setValueByType[type].call(this, targetControl, value);

}

module.exports = bufi;
