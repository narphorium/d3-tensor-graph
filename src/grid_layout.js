import { Anchor } from './anchor'

export class GridLayout {
  constructor (columnWidths, rowHeights) {
    this.rowOffsets = [0]
    var offset = 0
    for (var i = 0; i < rowHeights.length; i++) {
      offset += rowHeights[i]
      this.rowOffsets.push(offset)
    }
    this.height = offset

    this.columnOffsets = [0]
    offset = 0
    for (i = 0; i < columnWidths.length; i++) {
      offset += columnWidths[i]
      this.columnOffsets.push(offset)
    }
    this.width = offset

    this.nodes = []
  }

  placeNode (column, row, node) {
    var x = this.columnOffsets[column]
    var y = this.rowOffsets[row]
    node.moveTo(x, y)
    this.nodes.push(node)
    return node
  }

  placeColumnAnchor (column, direction, node, name) {
    var x = this.columnOffsets[column]
    var y = node.y - node.height / 2
    if (direction === Anchor.DOWN) {
      y = node.y + node.height / 2
    }
    node.anchors[name] = new Anchor(node, x, y, direction)
    return node.anchors[name]
  }

  placeRowAnchor (row, direction, node, name) {
    var x = node.x - node.width / 2
    var y = this.rowOffsets[row]
    if (direction === Anchor.RIGHT) {
      x = node.x + node.width / 2
    }
    node.anchors[name] = new Anchor(node, x, y, direction)
    return node.anchors[name]
  }

  drawGridLine (svg, x1, y1, x2, y2) {
    svg.append('line')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)
      .style('stroke', 'rgba(0,0,0,0.2)')
      .style('stroke-dasharray', '5, 5')
      .style('stroke-width', 1)
  }

  drawGridLines (svg) {
    for (var i = 0; i < this.rowOffsets.length; i++) {
      this.drawGridLine(svg, 0, this.rowOffsets[i], this.width, this.rowOffsets[i])
    }
    for (i = 0; i < this.columnOffsets.length; i++) {
      this.drawGridLine(svg, this.columnOffsets[i], 0, this.columnOffsets[i], this.height)
    }
  }
}
