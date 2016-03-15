var controlConfig = function(controls, vars, xOffset, yOffset) {

    // WARNING: only use to clone 'simple' objects!
    // having a copy of vars makes it easy to reset to defaults later
    var defaults =  (JSON.parse(JSON.stringify(vars)));

    return {
        circleControls : [{
                type: 'range',
                options: {
                    id: "radius",
                    label: "radius",
                    min: 4,
                    max: Math.ceil(xOffset + yOffset),
                    step: 1,
                    value: vars.radius
                },
                //NOTE: callback scope issues apply when object 'methods' are used as a callback...
                // simple enough to workaround if you don't make object props private:
                callback: function(val) {
                        vars.radius = val;
                    }
                    // Alternatively you can do the extra work required to maintain scope:
                    // callback: c.setRadius.bind(c) //preferred
                    // callback: function(val) { c.setRadius(val) } //kludge
            },
            {
                type: 'range',
                options: {
                    id: "colourRed",
                    label: "R",
                    min: 0, max: 255, step: 1,
                    value: vars.circleColour.r
                },
                callback: function(val) {
                    vars.circleColour.r = val;
                }
            }, {
                type: 'range',
                options: {
                    id: "colourGreen",
                    label: "G",
                    min: 0, max: 255, step: 1,
                    value: vars.circleColour.g
                },
                callback: function(val) {
                    vars.circleColour.g = val;
                }
            }, {
                type: 'range',
                options: {
                    id: "colourBlue",
                    label: "B",
                    min: 0, max: 255, step: 1,
                    value: vars.circleColour.b
                },
                callback: function(val) {
                    vars.circleColour.b = val;
                }
            }, {
                type: 'range',
                options: {
                    id: "colourAlpha",
                    label: "alpha",
                    min: 0.1, max: 1, step: 0.01,
                    value: vars.circleColour.a
                },
                callback: function(val) {
                    vars.circleColour.a = val;
                }
            },
            {
                type: 'checkbox',
                options: {
                    id: "strokeEnabled",
                    label: "stroke enabled",
                    checked: vars.stroke
                },
                callback: function(val) {
                    vars.stroke = val;
                }
            }],

        sketchControls : [{
                type: 'radio',
                options: {
                    id : "bgColour",
                    label : "background",
                    input: [{
                        label: "red",
                        value: "red"
                    }, {
                        label: "green",
                        value: "green"
                    }, {
                        label: "blue",
                        value: "blue"
                    }]
                },
                callback: function(val) {
                    vars.background = val;
                }
            },
            {
                type: 'switch',
                options: {
                    id: "animEnabled",
                    on: "move!",
                    off: "static",
                    checked: vars.animate
                },
                callback: function(val) {
                    vars.animate = val;
                }
            },
            {
                type: 'button',
                options: {
                    label: "reset"
                },
                callback: function() {
                    controls.setValue('radius', defaults.radius);
                    controls.setValue('colourRed', defaults.circleColour.r);
                    controls.setValue('colourGreen', defaults.circleColour.g);
                    controls.setValue('colourBlue', defaults.circleColour.b);
                    controls.setValue('colourAlpha', defaults.circleColour.a);
                    controls.setValue('strokeEnabled', defaults.stroke);
                    controls.setValue('animEnabled', defaults.animate);
                    controls.setValue('bgColour', defaults.background);
                }
            }]
        }

};

module.exports = controlConfig;
