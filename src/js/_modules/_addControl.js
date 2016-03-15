"use strict";

var log = require('../../../_lib/_log');

//TODO: fieldsets and addition of multiple grouped controls
//TODO: add option to enable/disable controls

var ejs = require("ejs");
var eventlistener = require("eventlistener");
var templates = require("./_control-templates");
var counter = 0;

var checkOptions = function(type, inputOptions) {
    //Clone the object
    //this approach is quick; but limited in its application: USE WITH CAUTION
    //see: http://heyjavascript.com/4-creative-ways-to-clone-objects/
    var outputOptions = (JSON.parse(JSON.stringify(templates[type].defaults)));
    var typeProps = templates[type];

    // set a default unique id
    // easier to catch this here than in the template
    outputOptions.id = type + counter++;

    if(inputOptions) {
        var typeLimits = typeProps.limits;

        for(var opt in inputOptions) {
            if(typeProps.limits && typeProps.limits[opt]) {
                outputOptions[opt] = typeProps.limits[opt].indexOf(inputOptions[opt]) > -1 ? inputOptions[opt] : typeProps.defaults[opt];
            }
            else {
                outputOptions[opt] = inputOptions[opt];
            }
        }
    }

    return outputOptions;
}

var addControl = function(type, target, controlOptions, callback) {
    if(!type) {
        throw "specify the type of control required";
    }
    if(!templates[type]){
        throw "control type not recognised";
    }

    controlOptions = checkOptions(type, controlOptions);

    var typeProps = templates[type];
    var output = ejs.render(typeProps.tmplt, controlOptions);
    var outputWrapper = document.createElement('div');
    outputWrapper.innerHTML = output;
    //Since we're adding output to innerHTML dynamically
    //we can probably get awat with not checking for nodes with #text here :)
    output = outputWrapper.firstChild;

    for(var event in typeProps.events) {
        //TODO: check hasOwnProperty?
        var thisEvent = Object.keys(typeProps.events[event])[0];
        var onEvent = typeProps.events[event][thisEvent];

        eventlistener.add(output, thisEvent, function(evt) {
            //TODO: check this isn't breaking object scope
            var returnValue = onEvent(evt);
            callback(onEvent(evt));
        });
    }

    target.appendChild(output);

    return {id: controlOptions.id, props: {el : output, type : type, opts: controlOptions}};
}

module.exports = addControl;
