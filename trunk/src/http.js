HTTP = function() {
  Observable.call(this);
  this.xhr = new XMLHttpRequest();
  this.xhr._owner = this;
  this.xhr.onreadystatechange = function() {
    if (this.readyState == 4)
      this._owner._complete();
  };
};
HTTP.prototype = {
  __proto__: Observable.prototype,
  _sentq: [],
  _waitq: [],
  _max: 3,
  _pump: function() {
    while (this._sentq.length < this._max && this._waitq.length > 0) {
      var req = this._waitq.shift();
      this._sentq.push(req);
      req._send();
    }
  },
  _remove: function() {
    this._waitq.remove(this);
    this._sentq.remove(this);
    this.xhr.onreadystatechange = function() {};
  },
  _complete: function() {
    this._remove();
    this.signal(this.success ? 'onSuccess' : 'onFailure', [this.xhr]);
    this.signal('onComplete', [this.xhr]);
    this._pump();
  },
  get success() {
    return this.xhr.status >= 200 && this.xhr.status < 300;
  },
  abort: function() {
    this.xhr.abort();
    this._remove();
    this._pump();
  },
  send: function(body) {
    var xhr = this.xhr;
    this._send = function() { xhr.send(body); };
    this._waitq.push(this);
    this._pump();
  },
  __noSuchMethod__: function(name, args) {
    return this.xhr[name].apply(this.xhr, args);
  }
};

HTTP.get = function(url) {
  var req = new HTTP;
  req.open('GET', url, true);
  req.send(null);
  return req;
};
