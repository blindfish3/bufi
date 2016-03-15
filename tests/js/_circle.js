var circle = function(x, y, vars) {
    this.x = x || 0;
    this.y = y || 0;
    this.vars = vars;
};

circle.prototype.draw = function() {
    var p = P$; // avoid repetition
    var adjust = this.vars.animate ? Math.sin(this.vars.angle) : 0;
    var radius = Number(this.vars.radius) + adjust * 15;
    p.ellipse(this.x, this.y, radius, radius);
}

circle.prototype.setRadius = function(r) {
    this.radius = r;
}

// Tell the module what to return/export
module.exports = circle;
