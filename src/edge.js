
import { normalize } from './anchor'
import { Node, DivisorNode } from './node'

function move (x, y) {
  return 'M' + x + ',' + y
}

function lineto (x, y) {
  return 'L' + x + ',' + y
}

function arc (mx, my, ex, ey) {
  return 'Q' + mx + ',' + my + ',' + ex + ',' + ey
}

export class Edge {
  constructor (start, end) {
    this.startAnchor = start
    this.endAnchor = end
    if (start instanceof Node) {
      this.startAnchor = start.getClosestAnchor(end)
    }
    if (end instanceof Node) {
      this.endAnchor = end.getClosestAnchor(start)
    }

    this.arcRadius = 8
    this.markerSize = 6
    this.controlPoints = []

    this.startAnchor.node.outEdges.push(this)
    this.endAnchor.node.inEdges.push(this)
    this.endAnchor.node.inputEdgesByName[this.endAnchor.name] = this
  }

  addControlPoint (x, y) {
    this.controlPoints.push({ 'x': x, 'y': y })
  }

  getJointAnchors (startAnchor, endAnchor, jointNode) {
    var inAnchor = jointNode.getClosestAnchor(startAnchor)
    var outAnchor = jointNode.getClosestAnchor(endAnchor)
    if (inAnchor === outAnchor) {
      inAnchor = jointNode.previousAnchor(inAnchor)
      outAnchor = jointNode.nextAnchor(outAnchor)
    }
    return [inAnchor, outAnchor]
  }

  boundingBox () {
    var minX = Math.min(this.startAnchor.x, this.endAnchor.x)
    var minY = Math.min(this.startAnchor.y, this.endAnchor.y)
    var maxX = Math.max(this.startAnchor.x, this.endAnchor.x)
    var maxY = Math.max(this.startAnchor.y, this.endAnchor.y)
    for (var i = 0; i < this.controlPoints.length; i++) {
      minX = Math.min(minX, this.controlPoints[i].x)
      minY = Math.min(minY, this.controlPoints[i].y)
      maxX = Math.max(maxX, this.controlPoints[i].x)
      maxY = Math.max(maxY, this.controlPoints[i].y)
    }
    return [{ 'x': minX, 'y': minY }, { 'x': maxX, 'y': maxY }]
  }

  edgePiece (startAnchor, endAnchor) {
    var data = ''
    var divisorNode = null
    var jointAnchors = null
    var dx = endAnchor.x - startAnchor.x
    var dy = endAnchor.y - startAnchor.y

    // Draw straight edges
    if (dy === 0 || dx === 0) {
      if ((dy === 0 && startAnchor.dx === endAnchor.dx) ||
          (dx === 0 && startAnchor.dy === endAnchor.dy)) {
        var offset = 20

        var offsetStart = this.copy(startAnchor)
        offsetStart.x += (offsetStart.dx * offset)
        offsetStart.y += (offsetStart.dy * offset)

        var offsetEnd = this.copy(endAnchor)
        offsetEnd.x += (offsetEnd.dx * offset)
        offsetEnd.y += (offsetEnd.dy * offset)

        var offsetDX = offsetEnd.x - offsetStart.x
        var offsetDY = offsetEnd.y - offsetStart.y

        divisorNode = new DivisorNode(offsetStart.x + (offsetDX / 2),
          offsetStart.y + (offsetDY / 2))

        jointAnchors = this.getJointAnchors(startAnchor, endAnchor, divisorNode)
        data += this.edgePiece(startAnchor, jointAnchors[0])
        data += this.edgePiece(jointAnchors[1], endAnchor)
      }
    // Draw s-shaped edges because anchor directions don't line up
    } else if (startAnchor.dy === endAnchor.dy ||
               startAnchor.dx === endAnchor.dx) {
      divisorNode = new DivisorNode(startAnchor.x + (dx / 2),
        startAnchor.y + (dy / 2))
      jointAnchors = this.getJointAnchors(startAnchor, endAnchor, divisorNode)

      data += this.edgePiece(startAnchor, jointAnchors[0])
      data += this.edgePiece(jointAnchors[1], endAnchor)
    // Draw a simple rounded corner if anchors line up
    } else {
      var dirX = normalize(dx)
      var dirY = normalize(dy)
      var arcOffsetX = this.arcRadius * dirX
      var arcOffsetY = this.arcRadius * dirY
      data = ''
      if (startAnchor.dx !== 0) {
        data += lineto(endAnchor.x - arcOffsetX, startAnchor.y)
        data += arc(endAnchor.x, startAnchor.y, endAnchor.x, startAnchor.y + arcOffsetY)
      } else if (startAnchor.dy !== 0) {
        data += lineto(startAnchor.x, endAnchor.y - arcOffsetY)
        data += arc(startAnchor.x, endAnchor.y, startAnchor.x + arcOffsetX, endAnchor.y)
      }
    }
    return data
  }

  pathData () {
    var data = ''
    data += move(this.startAnchor.x, this.startAnchor.y)

    if (this.controlPoints.length > 0) {
      var currentAnchor = this.startAnchor
      for (var i = 0; i < this.controlPoints.length; i++) {
        var controlPoint = this.controlPoints[i]
        var controlNode = new DivisorNode(controlPoint.x, controlPoint.y)
        // TODO: Need to figure out how to get joint anchors for control points.
        console.log(currentAnchor)
        console.log(this.endAnchor)
        // var jointAnchors = this.getJointAnchors(currentAnchor, this.endAnchor, controlNode);
        var jointAnchors = [
          controlNode.getAnchor('3'),
          controlNode.getAnchor('1')
        ]
        console.log(jointAnchors)
        data += this.edgePiece(currentAnchor, jointAnchors[0])
        currentAnchor = jointAnchors[1]
      }
      data += this.edgePiece(currentAnchor, this.endAnchor)
    } else {
      data += this.edgePiece(this.startAnchor, this.endAnchor)
    }

    // Draw end of edge with marker
    var mdx = this.endAnchor.dx * this.markerSize * 0.5
    var mdy = this.endAnchor.dy * this.markerSize * 0.5
    data += lineto(this.endAnchor.x + mdx, this.endAnchor.y + mdy)
    return data
  }

  drawControlPoints (svg) {
    for (var i = 0; i < this.controlPoints.length; i++) {
      var controlPoint = this.controlPoints[i]
      svg.append('ellipse')
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('cx', controlPoint.x)
        .attr('cy', controlPoint.y)
        .style('fill', 'none')
        .style('stroke', '#f00')
        .style('stroke-width', 1)
    }
  }
}
