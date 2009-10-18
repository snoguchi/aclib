ListBox = function() {
  Node.apply(this, arguments);
  this.frameNode = this;
  this.itemNodes = [];
  this.itemData = [];
};
ListBox.prototype = {
  __proto__: Node.prototype,
  base: 0,
  offset: 0,
  get selectedIndex() {
    return this.base + this.offset;
  },
  get selectedData() {
    return this.itemData[this.selectedIndex];
  },
  get selectedNode() {
    return this.itemNodes[this.selectedIndex % this.itemNodes.length];
  },
  get hasNext() {
    return this.selectedIndex < this.itemData.length - 1;
  },
  get hasPrev() {
    return this.selectedIndex > 0;
  },
  update: function(param) {
    this.extend(param || {});
    var top = 0;
    this.frameNode.hide();
    this.itemNodes.forEach(function(node, i) {
      var data = this.itemData[this.base + i];
      if (data) {
	this.onDrawItem(node, data);
	node.y = top + node.h / 2;
	top += node.h;
	node.show();
      } else {
	node.hide();
      }
    }, this);
    this.frameNode.y = - this.frameNode.h / 2;
    this._adjust();
    this.frameNode.show();
    this.onSelectItem(this.selectedNode, this.selectedData);
  },
  _adjust: function() {
    var fn = this.frameNode, sn = this.selectedNode;
    if (fn.y + sn.y - sn.h / 2 < - fn.h / 2) // top
      fn.y = - sn.y - (fn.h - sn.h) / 2;
    else if (fn.y + sn.y + sn.h / 2 > fn.h / 2) // bottom
      fn.y = - sn.y + (fn.h - sn.h) / 2;
  },
  next: function() {
    if (this.hasNext) {
      if (this.offset < this.itemNodes.length - 1) {
	this.offset++;
      } else {
	var node = this.selectedNode;
	this.base++;
	this.onDrawItem(this.selectedNode, this.selectedData);
	this.selectedNode.y = node.y + (node.h + this.selectedNode.h) / 2;
      }
      this._adjust();
      this.onSelectItem(this.selectedNode, this.selectedData);
    }
  },
  prev: function() {
    if (this.hasPrev) {
      if (this.offset > 0) {
	this.offset--;
      } else {
	var node = this.selectedNode;
	this.base--;
	this.onDrawItem(this.selectedNode, this.selectedData);
	this.selectedNode.y = node.y - (node.h + this.selectedNode.h) / 2;
      }
      this._adjust();
      this.onSelectItem(this.selectedNode, this.selectedData);
    }
  },
  onDrawItem: function() {},
  onSelectItem: function() {}
};
