
var ICON_DATA = {
  'tf.split': 'M12.583 9.15l-1.317 1.317-1.65-1.65-.817.817 1.65 1.65-1.317 1.317L12.583 12.6 12.583 9.15zM12.583 6.85 12.583 3.417l-3.433 0 1.317 1.317-2.7 2.7-4.35 0 0 1.15L8.233 8.583 11.267 5.533 12.583 6.85z',
  'tf.concat': 'M3 10.95l.833.833L5.85 9.767l-.833-.833L3 10.95zM10.333 5.333l0 2.067-3.3 0L3.833 4.2l-.833.833 3.55 3.55L10.333 8.583 10.333 10.667 13 8 10.333 5.333z'
}

export function defIcon (defs, op) {
  defs.append('path')
    .attr('id', op.replace(/\./g, '_') + '_icon')
    .attr('d', ICON_DATA[op])
    .style('fill', '#a6a6a6')
    .style('stroke-width', 0)
}

export function hasIcon (op) {
  return op in ICON_DATA
}
