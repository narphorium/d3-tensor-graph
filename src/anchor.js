
export function normalize (v) {
  if (v > 0.0) {
    return 1.0
  } else if (v < 0.0) {
    return -1.0
  }
  return 0.0
}

//       0
//       |
//  3 ---+--- 1
//       |
//       2
export class Anchor {
  constructor (node, name, x, y, d) {
    this.node = node
    this.name = name
    this.x = x
    this.y = y
    this.d = d
    this.dx = 0
    if (d === 1) {
      this.dx = 1
    } else if (d === 3) {
      this.dx = -1
    }
    this.dy = 0
    if (d === 0) {
      this.dy = -1
    } else if (d === 2) {
      this.dy = 1
    }
  }

  copy (anchor) {
    return new Anchor(anchor.node,
      anchor.name,
      anchor.x,
      anchor.y,
      anchor.d)
  }

  moveTo (x, y) {
    this.x = x
    this.y = y
  }

  slope () {
    if (this.dy === 0) return 0
    if (this.dx === 0) return this.dy
    return this.dx / this.dy
  }

  intersects (targetAnchor) {
    var dx = normalize(this.x - targetAnchor.x)
    var dy = normalize(this.y - targetAnchor.y)
    var ddx = targetAnchor.dx - this.dx
    var ddy = targetAnchor.dy - this.dy
    return (dx === ddx) && (dy === ddy)
  }
}

Anchor.CENTER = -1
Anchor.UP = 0
Anchor.DOWN = 2
Anchor.LEFT = 3
Anchor.RIGHT = 1
