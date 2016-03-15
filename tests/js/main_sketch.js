"use strict";

var b = {};
var Circle = require('./_circle');
var controlConfig = require('./_control-config');

//TODO: find out how to reference root/_lib without relative paths
b.log = require('../../_lib/_log');

// Stop p5js polluting the global namespace by using instance mode
global.P$ = new p5(function(p) {

    var circles = [];
    var numCircles = 10;
    var vars = {
        stroke: true,
        radius: 10,
        circleColour: {
            r: 255,
            g: 255,
            b: 255,
            a: 0.25
        },
        sketchColours: {
            red: '#cc0000',
            green: '#33cc33',
            blue: '#0099dd'
        },
        background: 'red',
        animate: true,
        angle: 0
    };
    var controls;
    var testCallback = function(val) {
        console.info("value in callback: " + val)
    };

    p.setup = function() {
        p.createCanvas(400, 300);

        var xOffset = p.width / (numCircles + 1);
        var yOffset = p.height / (numCircles + 1);

        for (var i = 0; i < numCircles; i++) {
            for (var j = 0; j < numCircles; j++) {
                circles[i * numCircles + j] = new Circle(xOffset + xOffset * i, yOffset + yOffset * j, vars);
            }
        }

        controls = new bufi('#control01');
        // adding grouped controls
        //NOTE: this feels a bit heavy going in order to externalise config
        var config = controlConfig(controls, vars, xOffset, yOffset);
        controls.addControlGroup(config.circleControls, "circle options");
        controls.addControlGroup(config.sketchControls, "sketch options");
        controls.setValue('bgColour', vars.background)
    };

    p.draw = function() {
        p.background(vars.sketchColours[vars.background]);
        var cc = vars.circleColour;
        var colour = 'rgba(' + [cc.r, cc.g, cc.b, cc.a].join(',') + ')';

        p.fill(colour);

        if(vars.stroke) {
            p.strokeWeight(2);
            p.stroke('#000');
        }
        else {
            p.noStroke();
        }

        for (var i = 0, len = numCircles * numCircles; i < len; i++) {
            circles[i].draw();
        }

        vars.angle += 0.05;
    };

    // p.mousePressed = function () {
    //
    // };

    // p.mouseReleased = function () {
    //
    // };

}, "sketch01");
