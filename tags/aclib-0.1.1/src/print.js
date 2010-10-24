print = (function(f) {
  return function(o) {
    ('' + o).match(/.{1,40}/g).forEach(function(line) {
      f(line.replace(/\%/g, '%%'));
    });
  }
})(print);
