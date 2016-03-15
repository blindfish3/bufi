//TODO: NPM install currently broken - install via NPM once fixed
var trigger = require('./_tinyTrigger');


var setValue = {
    "range" : function(targetControl, value) {
        var max = targetControl.opts.max;
        var min = targetControl.opts.min;
        var el = targetControl.el;
        var input = el.querySelector('#' + targetControl.opts.id);
        // constrain
        value = value < min ? min : value;
        value = value > max ? max : value;

        el.querySelector('.range-output').innerHTML = value;

        input.value = value;
        trigger(input, 'change');
    },

    "checkbox" : function(targetControl, value) {
        var el = targetControl.el;
        var input = el.querySelector('#' + targetControl.opts.id);

        el.querySelector('#' + targetControl.opts.id).checked = value;
        trigger(input, 'change');

    },
    "switch" : function(targetControl, value) {
        var el = targetControl.el;

        var input = el.querySelector('#' + targetControl.opts.id);

        el.querySelector('#' + targetControl.opts.id).checked = value;
        trigger(input, 'change');

    },
    "radio" : function(targetControl, value) {
        var el = targetControl.el;
        var inputs = el.querySelectorAll('input');

        for(var index in inputs) {
            if(inputs.hasOwnProperty(index)){
                var input = inputs[index];
                if(input.value == value) {
                    input.checked = true;
                    break;
                }
            }
        }
        trigger(input, 'change');
    }

}

module.exports = setValue;
