# d3-tensor-graph

This plugin allows you to visualize computation graphs that deal with tensors. At this point, the layout of teh graphs is all specified manually in a JSON file.

This is not an officially supported Google product.

## Installing

If you use NPM, `npm install d3-tensor-graph`. Otherwise, download the [latest release](https://github.com/narphorium/d3-d3-tensor/releases/latest).

## API Reference

A simple example of rendering a graph:

```js
  d3.json('your-graph-data.json', function (data) {
  	var graph = d3.tensorGraph(d3.select('#graph1'), data['nodes'])
  }
```

This will render the graph as an SVG in the `id="graph1"` HTML element.

See examples/data for the layout of the JSON graph files.
