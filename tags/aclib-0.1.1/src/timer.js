Timer = function(reso) {
  this._proxy = this._fire.bless(this);
  this._list = [];
  this._reso = reso || 1000;
};
Timer.prototype = {
  _fire: function() {
    var now = Date.now();
    this._list.sort(function(a, b) { return a.expire - b.expire; });
    while (this._list.length && this._list[0].expire <= now) {
      var id = this._list.shift();
      id.callback();
      if (id.interval) {
        id.expire = now + id.interval;
        this._list.push(id);
      }
    }
    delete this._tid;
    if (this._list.length) {
      this._list.sort(function(a, b) { return a.expire - b.expire; });
      this._schedule(this._list[0].expire);
    }
  },
  _schedule: function(expire) {
    if (this._tid) {
      if (expire >= this._expire)
        return;
      clearTimeout(this._tid);
    }
    var now = Date.now();
    var period = Math.max(1, expire - now);
    period = Math.ceil(period / this._reso) * this._reso;
    this._tid = setTimeout(this._proxy, period);
    this._expire = now + period;
  },
  _add: function(timeout, interval, f, o) {
    var now = Date.now(), exp = now + timeout, self = this;
    var id = {callback:f.bind(o), expire:exp, interval:interval};
    this._list.push(id);
    this._schedule(exp);
    return function() {
      self._list.remove(id);
      delete id.interval; // avoid pendding
    };
  },
  timeout: function(t, f, o) { return this._add(t, 0, f, o); },
  interval: function(t, f, o) { return this._add(t, t, f, o); }
};

System.timer = new Timer;
