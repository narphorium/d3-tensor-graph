(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-selection')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-selection'], factory) :
  (global = global || self, factory(global.d3 = global.d3 || {}, global.d3));
}(this, function (exports, d3Selection) { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function normalize(v) {
    if (v > 0.0) {
      return 1.0;
    } else if (v < 0.0) {
      return -1.0;
    }

    return 0.0;
  } //       0
  //       |
  //  3 ---+--- 1
  //       |
  //       2

  var Anchor =
  /*#__PURE__*/
  function () {
    function Anchor(node, name, x, y, d) {
      _classCallCheck(this, Anchor);

      this.node = node;
      this.name = name;
      this.x = x;
      this.y = y;
      this.d = d;
      this.dx = 0;

      if (d === 1) {
        this.dx = 1;
      } else if (d === 3) {
        this.dx = -1;
      }

      this.dy = 0;

      if (d === 0) {
        this.dy = -1;
      } else if (d === 2) {
        this.dy = 1;
      }
    }

    _createClass(Anchor, [{
      key: "copy",
      value: function copy(anchor) {
        return new Anchor(anchor.node, anchor.name, anchor.x, anchor.y, anchor.d);
      }
    }, {
      key: "moveTo",
      value: function moveTo(x, y) {
        this.x = x;
        this.y = y;
      }
    }, {
      key: "slope",
      value: function slope() {
        if (this.dy === 0) return 0;
        if (this.dx === 0) return this.dy;
        return this.dx / this.dy;
      }
    }, {
      key: "intersects",
      value: function intersects(targetAnchor) {
        var dx = normalize(this.x - targetAnchor.x);
        var dy = normalize(this.y - targetAnchor.y);
        var ddx = targetAnchor.dx - this.dx;
        var ddy = targetAnchor.dy - this.dy;
        return dx === ddx && dy === ddy;
      }
    }]);

    return Anchor;
  }();
  Anchor.CENTER = -1;
  Anchor.UP = 0;
  Anchor.DOWN = 2;
  Anchor.LEFT = 3;
  Anchor.RIGHT = 1;

  var Node =
  /*#__PURE__*/
  function () {
    function Node(x, y, w, h, op) {
      _classCallCheck(this, Node);

      this.name = null;
      this.description = null;
      this.x = x;
      if (typeof this.x === 'undefined') this.x = 0;
      this.y = y;
      if (typeof this.y === 'undefined') this.y = 0;
      this.width = w;
      if (typeof this.width === 'undefined') this.width = 20;
      this.height = h;
      if (typeof this.height === 'undefined') this.height = 8;
      this.op = op;
      var h2 = this.height / 2;
      this.anchors = {
        'label': new Anchor(this, 'label', this.x, this.y + h2, Anchor.DOWN)
        /*  "center": new Anchor(this, x, y, Anchor.CENTER),
          "north": new Anchor(this, x, y-h2, Anchor.UP),
          "east": new Anchor(this, x+w2, y, Anchor.RIGHT),
          "west": new Anchor(this, x-w2, y, Anchor.LEFT),
          "south": new Anchor(this, x, y+h2, Anchor.DOWN)}; */

      };
      this.anchorOrder = [this.anchors['north'], this.anchors['east'], this.anchors['south'], this.anchors['west']];
      this.inEdges = [];
      this.outEdges = [];
      this.inputEdgesByName = {};
    }

    _createClass(Node, [{
      key: "boundingBox",
      value: function boundingBox() {
        var h2 = this.height / 2;
        var w2 = this.width / 2;
        return [{
          'x': this.x - w2,
          'y': this.y - h2
        }, {
          'x': this.x + w2,
          'y': this.y + h2
        }];
      }
    }, {
      key: "setDescription",
      value: function setDescription(description) {
        this.description = description;
      }
    }, {
      key: "addAnchor",
      value: function addAnchor(name, config) {
        var h2 = this.height / 2;
        var w2 = this.width / 2;
        var anchor = null;
        var direction = config;

        if (config['x'] && typeof config['x'] === 'string') {
          direction = config['x'];
        } else if (config['y'] && typeof config['y'] === 'string') {
          direction = config['y'];
        }

        if (direction === 'center') {
          anchor = new Anchor(this, name, this.x, this.y, Anchor.CENTER);
        } else if (direction === 'north') {
          anchor = new Anchor(this, name, this.x, this.y - h2, Anchor.UP);
        } else if (direction === 'east') {
          anchor = new Anchor(this, name, this.x + w2, this.y, Anchor.RIGHT);
        } else if (direction === 'west') {
          anchor = new Anchor(this, name, this.x - w2, this.y, Anchor.LEFT);
        } else if (direction === 'south') {
          anchor = new Anchor(this, name, this.x, this.y + h2, Anchor.DOWN);
        }

        if (config['x'] && typeof config['x'] !== 'string') {
          anchor.x = config['x'];
        } else if (config['y'] && typeof config['y'] !== 'string') {
          anchor.y = config['y'];
        }

        if (anchor) {
          this.anchors[name] = anchor;
        }
      }
    }, {
      key: "getAnchor",
      value: function getAnchor(name) {
        return this.anchors[name];
      }
    }, {
      key: "getAnchorIndex",
      value: function getAnchorIndex(anchor) {
        return this.anchorOrder.indexOf(anchor);
      }
    }, {
      key: "previousAnchor",
      value: function previousAnchor(anchor) {
        var l = this.anchorOrder.length;
        var i = this.getAnchorIndex(anchor);
        i = (i + l - 1) % l;
        return this.anchorOrder[i];
      }
    }, {
      key: "nextAnchor",
      value: function nextAnchor(anchor) {
        var l = this.anchorOrder.length;
        var i = (this.getAnchorIndex(anchor) + 1) % l;
        return this.anchorOrder[i];
      }
    }, {
      key: "getClosestAnchor",
      value: function getClosestAnchor(targetAnchor) {
        var closestAnchor = null;

        for (var key in this.anchors) {
          var anchor = this.anchors[key];

          if (anchor.intersects(targetAnchor)) {
            closestAnchor = anchor;
          }
        }

        return closestAnchor;
      }
    }, {
      key: "getEdge",
      value: function getEdge(inputName) {
        return this.inputEdgesByName[inputName];
      }
    }, {
      key: "moveTo",
      value: function moveTo(x, y) {
        for (var key in this.anchors) {
          var anchor = this.anchors[key];
          var dx = anchor.x - this.x;
          var dy = anchor.y - this.y;
          anchor.moveTo(x + dx, y + dy);
        }

        this.x = x;
        this.y = y;
      }
    }, {
      key: "setLabel",
      value: function setLabel(text, anchor, orientation) {
        if (typeof anchor === 'undefined') anchor = 'label';
        this.labelText = text;
        this.labelAnchor = this.getAnchor(anchor);
        this.labelOrientation = orientation;
      }
    }]);

    return Node;
  }();
  var DivisorNode =
  /*#__PURE__*/
  function (_Node) {
    _inherits(DivisorNode, _Node);

    function DivisorNode(x, y) {
      var _this;

      _classCallCheck(this, DivisorNode);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(DivisorNode).call(this, x, y, 0, 0, null));

      _this.addAnchor('0', 'north');

      _this.addAnchor('1', 'east');

      _this.addAnchor('2', 'south');

      _this.addAnchor('3', 'west');

      return _this;
    }

    return DivisorNode;
  }(Node);

  function move(x, y) {
    return 'M' + x + ',' + y;
  }

  function lineto(x, y) {
    return 'L' + x + ',' + y;
  }

  function arc(mx, my, ex, ey) {
    return 'Q' + mx + ',' + my + ',' + ex + ',' + ey;
  }

  var Edge =
  /*#__PURE__*/
  function () {
    function Edge(start, end) {
      _classCallCheck(this, Edge);

      this.startAnchor = start;
      this.endAnchor = end;

      if (start instanceof Node) {
        this.startAnchor = start.getClosestAnchor(end);
      }

      if (end instanceof Node) {
        this.endAnchor = end.getClosestAnchor(start);
      }

      this.arcRadius = 8;
      this.markerSize = 6;
      this.controlPoints = [];
      this.startAnchor.node.outEdges.push(this);
      this.endAnchor.node.inEdges.push(this);
      this.endAnchor.node.inputEdgesByName[this.endAnchor.name] = this;
    }

    _createClass(Edge, [{
      key: "addControlPoint",
      value: function addControlPoint(x, y) {
        this.controlPoints.push({
          'x': x,
          'y': y
        });
      }
    }, {
      key: "getJointAnchors",
      value: function getJointAnchors(startAnchor, endAnchor, jointNode) {
        var inAnchor = jointNode.getClosestAnchor(startAnchor);
        var outAnchor = jointNode.getClosestAnchor(endAnchor);

        if (inAnchor === outAnchor) {
          inAnchor = jointNode.previousAnchor(inAnchor);
          outAnchor = jointNode.nextAnchor(outAnchor);
        }

        return [inAnchor, outAnchor];
      }
    }, {
      key: "boundingBox",
      value: function boundingBox() {
        var minX = Math.min(this.startAnchor.x, this.endAnchor.x);
        var minY = Math.min(this.startAnchor.y, this.endAnchor.y);
        var maxX = Math.max(this.startAnchor.x, this.endAnchor.x);
        var maxY = Math.max(this.startAnchor.y, this.endAnchor.y);

        for (var i = 0; i < this.controlPoints.length; i++) {
          minX = Math.min(minX, this.controlPoints[i].x);
          minY = Math.min(minY, this.controlPoints[i].y);
          maxX = Math.max(maxX, this.controlPoints[i].x);
          maxY = Math.max(maxY, this.controlPoints[i].y);
        }

        return [{
          'x': minX,
          'y': minY
        }, {
          'x': maxX,
          'y': maxY
        }];
      }
    }, {
      key: "edgePiece",
      value: function edgePiece(startAnchor, endAnchor) {
        var data = '';
        var divisorNode = null;
        var jointAnchors = null;
        var dx = endAnchor.x - startAnchor.x;
        var dy = endAnchor.y - startAnchor.y; // Draw straight edges

        if (dy === 0 || dx === 0) {
          if (dy === 0 && startAnchor.dx === endAnchor.dx || dx === 0 && startAnchor.dy === endAnchor.dy) {
            var offset = 20;
            var offsetStart = this.copy(startAnchor);
            offsetStart.x += offsetStart.dx * offset;
            offsetStart.y += offsetStart.dy * offset;
            var offsetEnd = this.copy(endAnchor);
            offsetEnd.x += offsetEnd.dx * offset;
            offsetEnd.y += offsetEnd.dy * offset;
            var offsetDX = offsetEnd.x - offsetStart.x;
            var offsetDY = offsetEnd.y - offsetStart.y;
            divisorNode = new DivisorNode(offsetStart.x + offsetDX / 2, offsetStart.y + offsetDY / 2);
            jointAnchors = this.getJointAnchors(startAnchor, endAnchor, divisorNode);
            data += this.edgePiece(startAnchor, jointAnchors[0]);
            data += this.edgePiece(jointAnchors[1], endAnchor);
          } // Draw s-shaped edges because anchor directions don't line up

        } else if (startAnchor.dy === endAnchor.dy || startAnchor.dx === endAnchor.dx) {
          divisorNode = new DivisorNode(startAnchor.x + dx / 2, startAnchor.y + dy / 2);
          jointAnchors = this.getJointAnchors(startAnchor, endAnchor, divisorNode);
          data += this.edgePiece(startAnchor, jointAnchors[0]);
          data += this.edgePiece(jointAnchors[1], endAnchor); // Draw a simple rounded corner if anchors line up
        } else {
          var dirX = normalize(dx);
          var dirY = normalize(dy);
          var arcOffsetX = this.arcRadius * dirX;
          var arcOffsetY = this.arcRadius * dirY;
          data = '';

          if (startAnchor.dx !== 0) {
            data += lineto(endAnchor.x - arcOffsetX, startAnchor.y);
            data += arc(endAnchor.x, startAnchor.y, endAnchor.x, startAnchor.y + arcOffsetY);
          } else if (startAnchor.dy !== 0) {
            data += lineto(startAnchor.x, endAnchor.y - arcOffsetY);
            data += arc(startAnchor.x, endAnchor.y, startAnchor.x + arcOffsetX, endAnchor.y);
          }
        }

        return data;
      }
    }, {
      key: "pathData",
      value: function pathData() {
        var data = '';
        data += move(this.startAnchor.x, this.startAnchor.y);

        if (this.controlPoints.length > 0) {
          var currentAnchor = this.startAnchor;

          for (var i = 0; i < this.controlPoints.length; i++) {
            var controlPoint = this.controlPoints[i];
            var controlNode = new DivisorNode(controlPoint.x, controlPoint.y); // TODO: Need to figure out how to get joint anchors for control points.
            // var jointAnchors = this.getJointAnchors(currentAnchor, this.endAnchor, controlNode);

            var jointAnchors = [controlNode.getAnchor('3'), controlNode.getAnchor('1')];
            data += this.edgePiece(currentAnchor, jointAnchors[0]);
            currentAnchor = jointAnchors[1];
          }

          data += this.edgePiece(currentAnchor, this.endAnchor);
        } else {
          data += this.edgePiece(this.startAnchor, this.endAnchor);
        } // Draw end of edge with marker


        var mdx = this.endAnchor.dx * this.markerSize * 0.5;
        var mdy = this.endAnchor.dy * this.markerSize * 0.5;
        data += lineto(this.endAnchor.x + mdx, this.endAnchor.y + mdy);
        return data;
      }
    }, {
      key: "drawControlPoints",
      value: function drawControlPoints(svg) {
        for (var i = 0; i < this.controlPoints.length; i++) {
          var controlPoint = this.controlPoints[i];
          svg.append('ellipse').attr('rx', 3).attr('ry', 3).attr('cx', controlPoint.x).attr('cy', controlPoint.y).style('fill', 'none').style('stroke', '#f00').style('stroke-width', 1);
        }
      }
    }]);

    return Edge;
  }();

  var GridLayout =
  /*#__PURE__*/
  function () {
    function GridLayout(columnWidths, rowHeights) {
      _classCallCheck(this, GridLayout);

      this.rowOffsets = [0];
      var offset = 0;

      for (var i = 0; i < rowHeights.length; i++) {
        offset += rowHeights[i];
        this.rowOffsets.push(offset);
      }

      this.height = offset;
      this.columnOffsets = [0];
      offset = 0;

      for (i = 0; i < columnWidths.length; i++) {
        offset += columnWidths[i];
        this.columnOffsets.push(offset);
      }

      this.width = offset;
      this.nodes = [];
    }

    _createClass(GridLayout, [{
      key: "placeNode",
      value: function placeNode(column, row, node) {
        var x = this.columnOffsets[column];
        var y = this.rowOffsets[row];
        node.moveTo(x, y);
        this.nodes.push(node);
        return node;
      }
    }, {
      key: "placeColumnAnchor",
      value: function placeColumnAnchor(column, direction, node, name) {
        var x = this.columnOffsets[column];
        var y = node.y - node.height / 2;

        if (direction === Anchor.DOWN) {
          y = node.y + node.height / 2;
        }

        node.anchors[name] = new Anchor(node, x, y, direction);
        return node.anchors[name];
      }
    }, {
      key: "placeRowAnchor",
      value: function placeRowAnchor(row, direction, node, name) {
        var x = node.x - node.width / 2;
        var y = this.rowOffsets[row];

        if (direction === Anchor.RIGHT) {
          x = node.x + node.width / 2;
        }

        node.anchors[name] = new Anchor(node, x, y, direction);
        return node.anchors[name];
      }
    }, {
      key: "drawGridLine",
      value: function drawGridLine(svg, x1, y1, x2, y2) {
        svg.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).style('stroke', 'rgba(0,0,0,0.2)').style('stroke-dasharray', '5, 5').style('stroke-width', 1);
      }
    }, {
      key: "drawGridLines",
      value: function drawGridLines(svg) {
        for (var i = 0; i < this.rowOffsets.length; i++) {
          this.drawGridLine(svg, 0, this.rowOffsets[i], this.width, this.rowOffsets[i]);
        }

        for (i = 0; i < this.columnOffsets.length; i++) {
          this.drawGridLine(svg, this.columnOffsets[i], 0, this.columnOffsets[i], this.height);
        }
      }
    }]);

    return GridLayout;
  }();

  var ICON_DATA = {
    'tf.concat': 'M3 10.95l.833.833L5.85 9.767l-.833-.833L3 10.95zM10.333 5.333l0 2.067-3.3 0L3.833 4.2l-.833.833 3.55 3.55L10.333 8.583 10.333 10.667 13 8 10.333 5.333z',
    'tf.sigmoid': 'M6.684 3.681a4.489 4.489 0 0 0-1.542.745A4.302 4.302 0 0 0 3.91 5.885q-.497.921-.497 2.329a4.826 4.826 0 0 0 .31 1.729 4.311 4.311 0 0 0 .88 1.428A4.212 4.212 0 0 0 5.98 12.344a4.301 4.301 0 0 0 1.78.362 4.244 4.244 0 0 0 3.043-1.273 4.457 4.457 0 0 0 .952-1.49 5.284 5.284 0 0 0 .352-1.977 4.041 4.041 0 0 0-.321-1.615 5.495 5.495 0 0 0-.735-1.263 4.256 4.256 0 0 0 1.18.186 3.383 3.383 0 0 0 1.17-.186 2.023 2.023 0 0 0 .797-.497V3.556a2.169 2.169 0 0 1-.776.207q-.445.042-.756.041-.352 0-.89-.052t-1.159-.114q-.621-.062-1.273-.114T8.112 3.474A5.847 5.847 0 0 0 6.684 3.681Zm-.072 8.012a2.204 2.204 0 0 1-.787-.805A3.512 3.512 0 0 1 5.411 9.68a9.074 9.074 0 0 1-.114-1.476q0-1.61.724-2.508a2.287 2.287 0 0 1 1.863-.898 5.4 5.4 0 0 1 .859.062q.383.062 .859.165a5.84 5.84 0 0 1 .486 1.631 11.076 11.076 0 0 1 .135 1.651 10.546 10.546 0 0 1-.072 1.177A4.041 4.041 0 0 1 9.83 10.681a2.439 2.439 0 0 1-.714.929q-.466.372-1.273.371Q7.098 11.981 6.611 11.692Z',
    'tf.split': 'M12.583 9.15l-1.317 1.317-1.65-1.65-.817.817 1.65 1.65-1.317 1.317L12.583 12.6 12.583 9.15zM12.583 6.85 12.583 3.417l-3.433 0 1.317 1.317-2.7 2.7-4.35 0 0 1.15L8.233 8.583 11.267 5.533 12.583 6.85z',
    'tf.tanh': 'M7.3.7H8.7V7.2s1.202-.232 2.2-1.5 1.5-3.6 1.5-3.6l1.1 1.2s-.665 2.128-1.6 3.3C10.657 8.158 8.7 8.6 8.7 8.6v6.7H7.3V8.9s-1.439.242-2.3 1.5-1.4 3.4-1.4 3.4L2.4 12.7s.829-2.378 2.1-3.7A5.345 5.345 0 0 1 7.3 7.5V.7Zm8 6.7V8.6H11.8s.248-.185.7-.6.5-.7.5-.7ZM.7 7.3V8.7H3a2.111 2.111 0 0 1 .4-.7c.256-.261.9-.6.9-.6Z'
  };
  function defIcon(defs, op) {
    defs.append('path').attr('id', op.replace(/\./g, '_') + '_icon').attr('d', ICON_DATA[op]).style('fill', '#a6a6a6').style('stroke-width', 0);
  }
  function hasIcon(op) {
    return op in ICON_DATA;
  }

  var Graph =
  /*#__PURE__*/
  function () {
    function Graph(element, data, config) {
      _classCallCheck(this, Graph);

      this.element = element;
      this.config = config;
      this.draw(data);
    }

    _createClass(Graph, [{
      key: "draw",
      value: function draw(data) {
        this.nodes = [];
        this.nodesByName = {};

        for (var i = 0; i < data['nodes'].length; i++) {
          var nodeData = data['nodes'][i];
          var node = this.buildNode(nodeData);
          node.dataIndex = i;
          this.nodesByName[node.name] = node;
          this.nodes.push(node);
        }

        this.edges = [];

        for (i = 0; i < data['nodes'].length; i++) {
          nodeData = data['nodes'][i];
          this.buildNodeEdges(nodeData);
        }

        if ('control points' in data) {
          for (i = 0; i < data['control points'].length; i++) {
            var pointData = data['control points'][i];
            var p = pointData['edge'].split(':');
            this.getNode(p[0]).getEdge(p[1]).addControlPoint(pointData['x'], pointData['y']);
          }
        }

        var graphBB = this.boundingBox();
        var svg = this.element.append('svg').attr('class', 'd3-tensor-graph').attr('width', graphBB[1].x + 40).attr('height', graphBB[1].y + 40);
        var defs = svg.append('svg:defs');
        this.arrowGlyph(defs);
        defIcon(defs, 'tf.split');
        defIcon(defs, 'tf.concat');
        defIcon(defs, 'tf.tanh');
        defIcon(defs, 'tf.sigmoid');
        this.nodeElements = svg.selectAll('g.d3-tensor-graph-node').data(this.nodes).enter().append('g').attr('class', function (d) {
          if (d.op === 'tf.name_scope') {
            if (d.inEdges.length + d.outEdges.length === 0) {
              return 'd3-tensor-graph-node d3-tensor-graph-name-scope';
            } else {
              return 'd3-tensor-graph-node d3-tensor-graph-module';
            }
          } else {
            return 'd3-tensor-graph-node';
          }
        });
        this.nodeElements.data(this.nodes).append('rect').attr('rx', 8).attr('ry', 8).attr('x', function (d) {
          return d.x - d.width / 2;
        }).attr('y', function (d) {
          return d.y - d.height / 2;
        }).attr('width', function (d) {
          return d.width;
        }).attr('height', function (d) {
          return d.height;
        }).style('stroke-dasharray', function (d) {
          if (d.op === 'tf.placeholder') return '2,2';
        });
        this.nodeElements.filter(function (d) {
          return hasIcon(d.op);
        }).append('use').attr('xlink:href', function (d) {
          return '#' + d.icon;
        }).attr('transform', function (d) {
          return 'translate(' + (d.x - d.width / 2) + ', ' + (d.y - d.height / 2) + ')';
        }); // Draw text labels for nodes.

        this.nodeElements.filter(function (d, i) {
          return d.labelText;
        }).append('text').attr('class', 'd3-tensor-graph-node-label').attr('transform', function (d) {
          var x = d.labelAnchor.x;
          var y = d.labelAnchor.y;
          var rotation = 0;

          if (d.labelOrientation === 'vertical') {
            rotation = -90;

            if (d.labelAnchor.dy > 0) {
              x += 16;
            } else if (d.labelAnchor.dy < 0) {
              x -= 8;
            } else {
              x += 3;
            }
          } else {
            if (d.labelAnchor.dy > 0) {
              y += 16;
            } else if (d.labelAnchor.dy < 0) {
              y -= 8;
            } else {
              y += 3;
            }
          }

          var transformation = 'translate(' + x + ', ' + y + ') ';

          if (rotation !== 0) {
            transformation += 'rotate(' + rotation + ')';
          }

          return transformation;
        }).attr('text-anchor', function (d) {
          if (d.labelAnchor.dx === 0) return 'middle';else if (d.labelAnchor.dx < 0) return 'end';
          return 'start';
        }).text(function (d) {
          return d.labelText;
        });
        this.edgeElements = svg.selectAll('g.d3-tensor-graph-edge').data(this.edges).enter().append('path').attr('class', 'd3-tensor-graph-edge').attr('d', function (d) {
          return d.pathData();
        }).attr('fill', 'none').attr('stroke-width', 1).attr('stroke', '#a6a6a6').attr('marker-end', 'url(#arrow)');
      }
    }, {
      key: "buildNode",
      value: function buildNode(data) {
        var node = new Node();

        if ('name' in data) {
          node.name = data['name'];
        }

        if ('caption' in data) {
          node.setDescription(data['caption']);
        }

        if ('x' in data) {
          node.x = data['x'];
        }

        if ('y' in data) {
          node.y = data['y'];
        }

        if ('width' in data) {
          node.width = data['width'];
        }

        if ('height' in data) {
          node.height = data['height'];
        }

        if ('label' in data) {
          node.addAnchor('label', data['label']['anchor']);
          node.setLabel(data['label']['name'], 'label', data['label']['orientation']);
        }

        if ('op' in data) {
          node.op = data['op'];

          if (hasIcon(node.op)) {
            node.icon = node.op.replace('.', '_') + '_icon';
            node.width = 16;
            node.height = 16;
          }
        }

        for (var i = 0; i < data['anchors'].length; i++) {
          node.addAnchor(i.toString(), data['anchors'][i]);
        }

        return node;
      }
    }, {
      key: "buildNodeEdges",
      value: function buildNodeEdges(nodeData) {
        var node = this.nodesByName[nodeData['name']];

        for (var inputName in nodeData['inputs']) {
          var source = nodeData['inputs'][inputName];
          var startNodeName = source.split(':')[0];
          var startAnchorName = source.split(':')[1];
          var startNode = this.nodesByName[startNodeName];

          if (startNode == null) {
            console.error('Unable to find start node: ' + startNodeName);
          }

          var startAnchor = startNode.getAnchor(startAnchorName);

          if (startAnchor == null) {
            console.error('Unable to find start anchor: ' + startAnchorName);
          }

          var endAnchor = node.getAnchor(inputName);

          if (endAnchor == null) {
            console.error('Unable to find end anchor: ' + inputName);
          }

          var edge = new Edge(startAnchor, endAnchor);
          this.edges.push(edge);
        }
      }
    }, {
      key: "update",
      value: function update(data, duration, path) {
        var selectedNodeIndex = path[path.length - 1];
        this.element.selectAll('.d3-tensor-graph-node').classed('selected', function (d) {
          return d.dataIndex === selectedNodeIndex && d.description;
        });
        this.element.selectAll('.d3-tensor-graph-edge').classed('selected', function (d) {
          return d.startAnchor.node.dataIndex === selectedNodeIndex && d.startAnchor.node.description || d.endAnchor.node.dataIndex === selectedNodeIndex && d.endAnchor.node.description;
        });
      }
    }, {
      key: "boundingBox",
      value: function boundingBox() {
        var minX = Number.MAX_VALUE;
        var minY = Number.MAX_VALUE;
        var maxX = Number.MIN_VALUE;
        var maxY = Number.MIN_VALUE;

        for (var i = 0; i < this.nodes.length; i++) {
          var nodeBB = this.nodes[i].boundingBox();
          minX = Math.min(minX, nodeBB[0].x);
          minY = Math.min(minY, nodeBB[0].y);
          maxX = Math.max(maxX, nodeBB[1].x);
          maxY = Math.max(maxY, nodeBB[1].y);
        }

        for (i = 0; i < this.edges.length; i++) {
          var edgeBB = this.edges[i].boundingBox();
          minX = Math.min(minX, edgeBB[0].x);
          minY = Math.min(minY, edgeBB[0].y);
          maxX = Math.max(maxX, edgeBB[1].x);
          maxY = Math.max(maxY, edgeBB[1].y);
        } // TODO: Add label bounding boxes to overall bounding box.


        return [{
          'x': minX,
          'y': minY
        }, {
          'x': maxX,
          'y': maxY
        }];
      }
    }, {
      key: "getNode",
      value: function getNode(name) {
        return this.nodesByName[name];
      }
    }, {
      key: "eachNodeElement",
      value: function eachNodeElement(callback) {
        this.nodeElements.each(function (d, i) {
          callback(d3Selection.select(this), [i]);
        });
      }
    }, {
      key: "asJSON",
      value: function asJSON() {
        var nodes = [];

        for (var i = 0; i < this.nodes.length; i++) {
          var node = this.nodes[i];
          var jsonNode = {
            'name': node.name,
            'op': node.op,
            'x': node.x,
            'y': node.y,
            'caption': node.caption,
            'label': {},
            'anchors': {},
            'inputs': {}
          };
          nodes.push(jsonNode);
        }

        return {
          'nodes': nodes
        };
      }
    }, {
      key: "arrowGlyph",
      value: function arrowGlyph(defs) {
        defs.append('svg:marker').attr('id', 'arrow').attr('viewBox', '0 -5 10 10').attr('refX', 5).attr('refY', 0).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto').append('path').attr('d', 'M0,-5L10,0L0,5').attr('class', 'arrowHead'); // .style("fill", "#a6a6a6");

        defs.append('svg:marker').attr('id', 'arrow-hover').attr('viewBox', '0 -5 10 10').attr('refX', 5).attr('refY', 0).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto').append('path').attr('d', 'M0,-5L10,0L0,5').attr('class', 'arrowHead'); // .style("fill", "#a6a6a6");
      }
    }]);

    return Graph;
  }();
  function graph (elementID, controller, config) {
    return new Graph(elementID, controller, config);
  }

  exports.Anchor = Anchor;
  exports.DivisorNode = DivisorNode;
  exports.Edge = Edge;
  exports.GridLayout = GridLayout;
  exports.Node = Node;
  exports.tensorGraph = graph;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
