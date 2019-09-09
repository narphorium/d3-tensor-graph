import { select } from 'd3-selection'

import { Edge } from './edge'
import { Node } from './node'
import { defIcon, hasIcon } from './icons'

export class Graph {
  constructor (element, data, config) {
    this.element = element
    this.config = config
    this.draw(data)
  }

  draw (data) {
    this.nodes = []
    this.nodesByName = {}
    for (var i = 0; i < data['nodes'].length; i++) {
      var nodeData = data['nodes'][i]
      var node = this.buildNode(nodeData)
      node.dataIndex = i
      this.nodesByName[node.name] = node
      this.nodes.push(node)
    }

    this.edges = []
    for (i = 0; i < data['nodes'].length; i++) {
      nodeData = data['nodes'][i]
      this.buildNodeEdges(nodeData)
    }

    if ('control points' in data) {
      for (i = 0; i < data['control points'].length; i++) {
        var pointData = data['control points'][i]
        var p = pointData['edge'].split(':')
        this.getNode(p[0]).getEdge(p[1]).addControlPoint(pointData['x'], pointData['y'])
      }
    }

    var graphBB = this.boundingBox()
    var svg = this.element.append('svg')
      .attr('class', 'd3-tensor-graph')
      .attr('width', graphBB[1].x + 40)
      .attr('height', graphBB[1].y + 40)

    var defs = svg.append('svg:defs')
    this.arrowGlyph(defs)
    defIcon(defs, 'tf.split')
    defIcon(defs, 'tf.concat')

    this.nodeElements = svg.selectAll('g.d3-tensor-graph-node')
      .data(this.nodes)
      .enter()
      .append('g')
      .attr('class', function (d) {
        if (d.op === 'tf.name_scope') {
          if (d.inEdges.length + d.outEdges.length === 0) {
            return 'd3-tensor-graph-node d3-tensor-graph-name-scope'
          } else {
            return 'd3-tensor-graph-node d3-tensor-graph-module'
          }
        } else {
          return 'd3-tensor-graph-node'
        }
      })

    this.nodeElements
      .data(this.nodes)
      .append('rect')
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('x', function (d) { return d.x - (d.width / 2) })
      .attr('y', function (d) { return d.y - (d.height / 2) })
      .attr('width', function (d) { return d.width })
      .attr('height', function (d) { return d.height })
      .style('stroke-dasharray', function (d) { if (d.op === 'tf.placeholder') return '2,2' })

    this.nodeElements.filter(function (d) { return hasIcon(d.op) })
      .append('use')
      .attr('xlink:href', function (d) { return '#' + d.icon })
      .attr('transform', function (d) { return 'translate(' + (d.x - (d.width / 2)) + ', ' + (d.y - (d.height / 2)) + ')' })

    // Draw text labels for nodes.
    this.nodeElements.filter(function (d, i) { return d.labelText })
      .append('text')
      .attr('class', 'd3-tensor-graph-node-label')
      .attr('transform', function (d) {
        var x = d.labelAnchor.x
        var y = d.labelAnchor.y
        var rotation = 0
        if (d.labelOrientation === 'vertical') {
          rotation = -90
          if (d.labelAnchor.dy > 0) {
            x += 16
          } else if (d.labelAnchor.dy < 0) {
            x -= 8
          } else {
            x += 3
          }
        } else {
          if (d.labelAnchor.dy > 0) {
            y += 16
          } else if (d.labelAnchor.dy < 0) {
            y -= 8
          } else {
            y += 3
          }
        }
        var transformation =  'translate(' + x + ', ' + y + ') '
        if (rotation !== 0) {
          transformation += 'rotate(' + rotation + ')'
        }
        return transformation
      })
      .attr('text-anchor', function (d) {
        if (d.labelAnchor.dx === 0) return 'middle'
        else if (d.labelAnchor.dx < 0) return 'end'
        return 'start'
      })
      .text(function (d) { return d.labelText })

    this.edgeElements = svg.selectAll('g.d3-tensor-graph-edge')
      .data(this.edges)
      .enter()
      .append('path')
      .attr('class', 'd3-tensor-graph-edge')
      .attr('d', function (d) { return d.pathData() })
      .attr('fill', 'none')
      .attr('stroke-width', 1)
      .attr('stroke', '#a6a6a6')
      .attr('marker-end', 'url(#arrow)')
  }

  buildNode (data) {
    var node = new Node()
    if ('name' in data) {
      node.name = data['name']
    }
    if ('caption' in data) {
      node.setDescription(data['caption'])
    }
    if ('x' in data) {
      node.x = data['x']
    }
    if ('y' in data) {
      node.y = data['y']
    }
    if ('width' in data) {
      node.width = data['width']
    }
    if ('height' in data) {
      node.height = data['height']
    }
    if ('label' in data) {
      node.addAnchor('label', data['label']['anchor'])
      node.setLabel(data['label']['name'], 'label', data['label']['orientation'])
    }
    if ('op' in data) {
      node.op = data['op']
      if (hasIcon(node.op)) {
        node.icon = node.op.replace('.', '_') + '_icon'
        node.width = 16
        node.height = 16
      }
    }
    for (var i = 0; i < data['anchors'].length; i++) {
      node.addAnchor(i.toString(), data['anchors'][i])
    }
    return node
  }

  buildNodeEdges (nodeData) {
    var node = this.nodesByName[nodeData['name']]
    for (var inputName in nodeData['inputs']) {
      var source = nodeData['inputs'][inputName]
      var startNodeName = source.split(':')[0]
      var startAnchorName = source.split(':')[1]
      var startNode = this.nodesByName[startNodeName]
      if (startNode == null) {
        console.log('Unable to find start node: ' + startNodeName)
      }
      var startAnchor = startNode.getAnchor(startAnchorName)
      if (startAnchor == null) {
        console.log('Unable to find start anchor: ' + startAnchorName)
      }
      var endAnchor = node.getAnchor(inputName)
      if (endAnchor == null) {
        console.log('Unable to find end anchor: ' + inputName)
      }
      var edge = new Edge(startAnchor, endAnchor)
      this.edges.push(edge)
    }
  }

  update (data, duration, path) {
    var selectedNodeIndex = path[path.length - 1]
    this.element.selectAll('.d3-tensor-graph-node').classed('selected', function (d) {
      return d.dataIndex === selectedNodeIndex && d.description
    })
    this.element.selectAll('.d3-tensor-graph-edge').classed('selected', function (d) {
      return (d.startAnchor.node.dataIndex === selectedNodeIndex && d.startAnchor.node.description) ||
             (d.endAnchor.node.dataIndex === selectedNodeIndex && d.endAnchor.node.description)
    })
  }

  boundingBox () {
    var minX = Number.MAX_VALUE
    var minY = Number.MAX_VALUE
    var maxX = Number.MIN_VALUE
    var maxY = Number.MIN_VALUE
    for (var i = 0; i < this.nodes.length; i++) {
      var nodeBB = this.nodes[i].boundingBox()
      minX = Math.min(minX, nodeBB[0].x)
      minY = Math.min(minY, nodeBB[0].y)
      maxX = Math.max(maxX, nodeBB[1].x)
      maxY = Math.max(maxY, nodeBB[1].y)
    }
    for (i = 0; i < this.edges.length; i++) {
      var edgeBB = this.edges[i].boundingBox()
      minX = Math.min(minX, edgeBB[0].x)
      minY = Math.min(minY, edgeBB[0].y)
      maxX = Math.max(maxX, edgeBB[1].x)
      maxY = Math.max(maxY, edgeBB[1].y)
    }
    // TODO: Add label bounding boxes to overall bounding box.
    return [{ 'x': minX, 'y': minY }, { 'x': maxX, 'y': maxY }]
  }

  getNode (name) {
    return this.nodesByName[name]
  }

  eachNodeElement (callback) {
    this.nodeElements.each(function (d, i) { callback(select(this), [i]) })
  }

  asJSON () {
    var nodes = []
    for (var i = 0; i < this.nodes.length; i++) {
      var node = this.nodes[i]
      var jsonNode = {
        'name': node.name,
        'op': node.op,
        'x': node.x,
        'y': node.y,
        'caption': node.caption,
        'label': {},
        'anchors': {},
        'inputs': {}
      }
      nodes.push(jsonNode)
    }
    return { 'nodes': nodes }
  }

  arrowGlyph (defs) {
    defs.append('svg:marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('class', 'arrowHead')
    // .style("fill", "#a6a6a6");
    defs.append('svg:marker')
      .attr('id', 'arrow-hover')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('class', 'arrowHead')
    // .style("fill", "#a6a6a6");
  }
}

export default function (elementID, controller, config) {
  return new Graph(elementID, controller, config)
}
