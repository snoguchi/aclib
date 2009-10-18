Slider = function() { Node.apply(this, arguments); };
Slider.prototype = {
  __proto__: Node.prototype,
  size: 1,
  direction: 'horizontal',
  _traits: {horizontal:{pos:'x', size:'w'}, vertical:{pos:'y', size:'h'}},
  update: function(param) { // size, count, pos
    this.extend(param || {});
    this.size = Math.min(this.size, this.count);
    this.pos = Math.min(this.pos, this.count - this.size);
    var t = this._traits[this.direction];
    var sz1 = this[t.size];
    var sz2 = this.count ? sz1 * this.size / this.count : sz1;
    var step = this.count - this.size;
    var pos = step ? (sz1 - sz2) * (this.pos / step - 0.5) : 0;
    this.thumbNode[t.size] = sz2;
    this.thumbNode[t.pos] = pos;
  }
};
