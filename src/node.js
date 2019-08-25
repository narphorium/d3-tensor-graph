import { Anchor } from './anchor'

export class Node {
  constructor (x, y, w, h, op) {
    this.name = null
    this.description = null
    this.x = x
    if (typeof (this.x) === 'undefined') this.x = 0
    this.y = y
    if (typeof (this.y) === 'undefined') this.y = 0
    this.width = w
    if (typeof (this.width) === 'undefined') this.width = 20
    this.height = h
    if (typeof (this.height) === 'undefined') this.height = 8
    this.op = op
    var h2 = this.height / 2
    this.anchors = {
      'label': new Anchor(this, 'label', this.x, this.y + h2, Anchor.DOWN)
    }
    /*  "center": new Anchor(this, x, y, Anchor.CENTER),
      "north": new Anchor(this, x, y-h2, Anchor.UP),
      "east": new Anchor(this, x+w2, y, Anchor.RIGHT),
      "west": new Anchor(this, x-w2, y, Anchor.LEFT),
      "south": new Anchor(this, x, y+h2, Anchor.DOWN)}; */
    this.anchorOrder = [
      this.anchors['north'],
      this.anchors['east'],
      this.anchors['south'],
      this.anchors['west']
    ]
    this.inEdges = []
    this.outEdges = []
    this.inputEdgesByName = {}
  }

  boundingBox () {
    var h2 = this.height / 2
    var w2 = this.width / 2
    return [{
      'x': this.x - w2,
      'y': this.y - h2
    }, {
      'x': this.x + w2,
      'y': this.y + h2
    }]
  }

  setDescription (description) {
    this.description = description
  }

  addAnchor (name, direction) {
    var h2 = this.height / 2
    var w2 = this.width / 2
    var anchor = null
    if (direction === 'center') {
      anchor = new Anchor(this, name, this.x, this.y, Anchor.CENTER)
    } else if (direction === 'north') {
      anchor = new Anchor(this, name, this.x, this.y - h2, Anchor.UP)
    } else if (direction === 'east') {
      anchor = new Anchor(this, name, this.x + w2, this.y, Anchor.RIGHT)
    } else if (direction === 'west') {
      anchor = new Anchor(this, name, this.x - w2, this.y, Anchor.LEFT)
    } else if (direction === 'south') {
      anchor = new Anchor(this, name, this.x, this.y + h2, Anchor.DOWN)
    }
    if (anchor) {
      this.anchors[name] = anchor
    }
  }

  getAnchor (name) {
    return this.anchors[name]
  }

  getAnchorIndex (anchor) {
    return this.anchorOrder.indexOf(anchor)
  }

  previousAnchor (anchor) {
    var l = this.anchorOrder.length
    var i = this.getAnchorIndex(anchor)
    // console.log('i = ' + i);
    i = (i + l - 1) % l
    // console.log('i = ' + i);
    return this.anchorOrder[i]
  }

  nextAnchor (anchor) {
    var l = this.anchorOrder.length
    var i = (this.getAnchorIndex(anchor) + 1) % l
    return this.anchorOrder[i]
  }

  getClosestAnchor (targetAnchor) {
    var closestAnchor = null
    // var closestDistance = 999999
    for (var key in this.anchors) {
      var anchor = this.anchors[key]
      // console.log('(' + anchor.dx + ',' + anchor.dy + ') intersects (' + targetAnchor.dx + ',' + targetAnchor.dy + ') = ' + anchor.intersects(targetAnchor));
      if (anchor.intersects(targetAnchor)) {
        closestAnchor = anchor
      }
    }
    return closestAnchor
  }

  getEdge (inputName) {
    return this.inputEdgesByName[inputName]
  }

  moveTo (x, y) {
    // console.log('moveTo(' + x + ', ' + y + ')');
    for (var key in this.anchors) {
      var anchor = this.anchors[key]
      var dx = anchor.x - this.x
      var dy = anchor.y - this.y
      anchor.moveTo(x + dx, y + dy)
    }
    this.x = x
    this.y = y
  }

  setLabel (text, anchor) {
    if (typeof (anchor) === 'undefined') anchor = 'label'
    this.labelText = text
    this.labelAnchor = this.getAnchor(anchor)
  }
}

export class DivisorNode extends Node {
  constructor (x, y) {
    super(x, y, 0, 0, null)
    this.addAnchor('0', 'north')
    this.addAnchor('1', 'east')
    this.addAnchor('2', 'south')
    this.addAnchor('3', 'west')
  }
}
