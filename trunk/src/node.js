Node = function(node) {
  Observable.call(this);
  this._node = node;
};
Node.prototype = {
  __proto__: Observable.prototype,
  _call: function(f, args) {
    var ary = [this._node];
    ary.push.apply(ary, args);
    return f.apply(null, ary);
  },
  _set: function(f, k, v) {
    if (this._node[k] != v) f(this._node, (this._node[k] = v)); return v;
  },
  _get: function(f, k) {
    return k in this._node ? this._node[k] : (this._node[k] = f(this._node));
  },
  setStr: function(v) {
    delete this._node.lines;
    this._set(setStr, 'str', v.toString());
  },
  setVisible: function(v) {
    this._set(setVisible, 'visible', v ? 1 : 0);
  },
  loadImage: function() {
    delete this._node.w;
    delete this._node.h;
    this._call(loadImage, arguments);
  },
  child: function(name, klass) {
    var n = new (klass || Node)(getChildNode(this._node, name));
    n.parentNode = this;
    return n;
  },
  set str(v) {
    return this.setStr(v);
  },
  set visible(v) {
    return this.setVisible(v);
  },
  set image(v) {
    return this.loadImage(v);
  },
  show: function() {
    this.setVisible(1);
  },
  hide: function() {
    this.setVisible(0);
  },
  notify: function(type, args) {
    if (this[type])
      this[type].apply(this, args);
    else if (this.parentNode)
      this.parentNode.notify(type, args);
  },
  focus: function() {
    Node.focusNode.onInputBlur();
    Node.focusNode = this;
    this.onInputFocus();
  },
  onInputFocus: function() {},
  onInputBlur: function() {}
};

Hash.forEach({ x:getPosX, y:getPosY, w:getW, h:getH, str:getStr, visible:isVisible, rgb:getRGB, alpha:getAlpha, scaleX:getScaleX, scaleY:getScaleY, name:getName, lines:getLines }, function(k, f) {
  Node.prototype[f.name] = function() { return this._get(f, k); };
  Node.prototype.__defineGetter__(k, function() { return this[f.name](); });
});

Hash.forEach({ x:setPosX, y:setPosY, w:setW, h:setH, /* str:setStr, visible:setVisible, */ rgb:setRGB, alpha:setAlpha, scaleX:setScaleX, scaleY:setScaleY }, function(k, f) {
  Node.prototype[f.name] = function(v) { return this._set(f, k, v); };
  Node.prototype.__defineSetter__(k, function(v) { return this[f.name](v); });
});

[isImageLoaded, destroyImage, pageDown, pageUp, lineDown, lineUp].forEach(function(f) {
  Node.prototype[f.name] = function() { return this._call(f, arguments); };
});

Node.focusNode = new Node(getRootNode());

System.input.observe(function(type, args) {
  Node.focusNode.notify(type, args);
});
