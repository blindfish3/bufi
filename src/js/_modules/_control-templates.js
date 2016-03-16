"use strict";

var log = require('../../../_lib/_log');

//TODO: add option to start off with a control disabled
//TODO: allow value to be updated from an external script
var templates = {
    //TODO: add option for icon...
    button: {
        tmplt : '<a href="#" id="<%= id %>" class="<%= btnClass %> <%= colour %>" ><%= label %></a>',
        defaults : { btnClass : "btn", colour: "teal", label: "click me" },
        events: [{"click" : function(evt) {
                    evt.preventDefault();
                    return true
                }}],
        limits : {
            btnClass: ["btn", "btn-large", "btn-flat", "btn-floating"],
            event: ["click"]
        }
    },

    checkbox: {
        tmplt : '<p><input id="<%= id %>" type="checkbox" <% if(checked) { %> checked="checked" <% } %> class="filled-in"><label for="<%= id %>"><%= label %></label></p>',
        defaults : { checked: false, label : "label"},
        limits: {
            checked: [true]
        },
        events: [{"change" : function(evt) { return evt.target.checked }}]
    },

    switch: {
        tmplt : '<p class="switch"><label><%= off %><input type="checkbox" id="<%= id %>" <% if(checked) { %> checked="checked" <% } %>><span class="lever"></span><%= on %></label></p>',
        defaults : { checked: "", off: "Off", on : "On"},
        limits: {
            checked: [true]
        },
        events: [{"change" : function(evt) { return evt.target.checked }}]
    },

    //TODO: add group label
    radio: {
        tmplt: '<p class="radio-group" id="<%= id %>">' +
        '<% if(label) { %><label for="<%= id %>"><%= label %></label> <% } %>' +
        '<% for(var i=0, len=input.length; i<len;i++){ %>'+
        '<input id="<%= id + "_" + i %>" name="<%= id %>" value="<%= input[i].value %>" <% if(input[i].checked) { %> checked="checked" <% } %>  type="radio" class="with-gap">'+
          '<label for="<%= id + "_" + i %>" class="radio-label"><%= input[i].label %></label>'+
          '<% }; %> </p>',
        defaults: {label: ""},
        limits: {},
        events: [{"change" : function(evt) {
            var clickedValue = evt.target.getAttribute("value");
             return clickedValue;
          }}]
    },

    //TODO: learn how to produce tidy EJS code.  This feels wrong :/
    range: {
        tmplt : '<p class="range-field"><span class="range-output" id="<%= id + "_out" %>">'+
        '<% if(value >= 10000) { %>' +
            '<%= value/10000 %> <sup class="tiny">*10^4</sup>'+
        '<% } else { %>'+
            '<%= String(value).substring(0,5) %>' +
        '<% } %>'+
        '</span><input id="<%= id %>" type="range" min="<%= min %>" max="<%= max %>" value="<%= value %>" step="<%= step %>"><label for="<%= id %>"><%= label %></label></p>',
        defaults : {value: 10, min: 0, max: 100, step: 10, label: "range"},
        events: [{"input" : function(evt) {
                    //NOTE: Odd; the fact of adding an input event listener appears to
                    // trigger 'change' and thus negates the need to do anything from here
                }},
                {"change" : function(evt) {

                    var outputID = evt.target.id + "_out";
                    var outputSpan = document.getElementById(outputID);
                    var outputValue = evt.target.value;

                    if(outputValue >= 10000) {
                        outputSpan.innerHTML = outputValue/10000 + '<sup class="tiny">*10^4</sup>';
                    }
                    else {
                        outputSpan.innerHTML = outputValue.substring(0,5);
                    }

                    return outputValue;
            }}]
    }
}
module.exports = templates;
