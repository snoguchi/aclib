Hash = function(o) { this.extend(o) };
Hash.prototype = {
  forEach: function(f, o) {
    o = o || this;
    for (var k in this)
      if (this.hasOwnProperty(k))
	f.call(o, k, this[k], this);
  },
  map: function(f, o) {
    var r = [];
    this.forEach(function() { r.push(f.apply(o, arguments)); });
    return r;
  },
  reduce: function(r, f, o) {
    this.forEach(function() {
      Array.unshift(arguments, r); r = f.apply(o, arguments); });
    return r;
  },
  filter: function(f, o) {
    var r = {};
    for (var k in this)
      if (f.apply(o, arguments))
	r[k] = v;
    return r;
  },
  extend: function(o) {
    for (var k in o)
      this[k] = o[k];
    return this;
  }
};

Function.prototype.__proto__ = {
  bind: function(o) {
    var f = this;
    return function() { return f.apply(o, arguments); };
  },
  bless: (function(g) {
    var seq = 0;
    return function(o) {
      var self = this, name = '__bLs' + seq++;
      var f = eval('(g[name] = function ' + name
        + '() {return self.apply(o, arguments)})');
      f.curse = function() { delete g[name]; };
      return f;
    };
  })(this),
  __noSuchMethod__: function(name, args) {
    return this.prototype[name].apply(args.shift(), args);
  }
};

Array.prototype.__proto__ = {
  __proto__: Hash.prototype,
  invoke: function(name, args) {
    args = args || [];
    return this.map(function(v) { return v[name].apply(v, args); });
  },
  indexOf: function(item) {
    for (var i = 0, n = this.length; i < n; i++)
      if (this[i] === item)
        return i;
    return -1;
  },
  remove: function(item) {
    for (var i = 0, n = this.length; i < n; i++)
      if (this[i] === item)
        this.splice(i, 1);
  },
  get last() {
    return this[this.length - 1];
  }
};

String.prototype.__proto__ = {
  __proto__: Hash.prototype,
  bind: function(o) {
    var f = o[this];
    return function() { return f.apply(o, arguments); };
  },
  fill: function(o) {
    return this.replace(/\#\{(.*?)\}/g, function(_, name) { return o[name]; });
  },
  thaw: function() {
    try { return eval('(' + this + ')'); } catch(e) { print(e.message); }
  },
  get chars() {
    return this.match(/([\x00-\x7f]|[\xc2-\xfd][\x80-\xbf]+)/g);
  }
};

Number.prototype.__proto__ = {
  __proto__: Hash.prototype,
  forEach: function(f, o) {
    Array(this + 1).join().split('').forEach(function(_, i) {
      f.call(o, i, this);
    }, this);
  }
};

XMLDOM.prototype.__proto__ = {
  __proto__: Hash.prototype,
  elem: XMLDOM.prototype.getElementsByTagName,
  attr: XMLDOM.prototype.getAttribute,
  text: function(name) {
    return this.elem(name).join('');
  },
  toString: function() {
    return this.nodeName.charAt(0) == '#'
      ? this.nodeValue : this.childNodes.join('');
  }
};

Observable = function() { this._observers = []; };
Observable.prototype = {
  __proto__: Hash.prototype,
  observe: function(o, caller) {
    var caller = caller || o;
    var list = this._observers;
    var func = typeof o == 'function' ? o.bind(caller)
      : function(type, args) { if (o[type]) o[type].apply(caller, args); };
    list.push(func);
    return function() { list.remove(func); };
  },
  signal: function(type, args) {
    this._observers.forEach(function(f) { f(type, args); });
  }
};

System = {
  event: new Observable,
  input: new Observable
};
'onLoad onFocus onUnfocus onActivate'.split(' ').forEach(function(s) {
  this[s] = function() { System.event.signal(s); };
}, this);
'onConfirmKey onUpKey onDownKey onLeftKey onRightKey onBlueKey onRedKey onGreenKey onYellowKey'.split(' ').forEach(function(s) {
  this[s] = function(type) {
    System.input.signal(s + (type ? 'Released' : 'Pressed'));
    System.input.signal(s, type);
  };
}, this);
