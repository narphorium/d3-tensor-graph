import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';

let pluginOptions = [
  resolve({
    browser: true
  }),
  eslint(),
  babel({
    presets: [
      [
        "@babel/preset-env", {
          forceAllTransforms: true,
          modules: false,
              targets: {
                browsers: [
                  'Firefox 57',
                  'Edge 15',
                  'Chrome 60',
                  'iOS 10',
                  'Safari 10'
                ]
              }
        }
      ]
    ],
    babelrc: false,
    exclude: 'node_modules/**'
  })
];

const d3External = [
  'd3-selection'
]

const globals = {}
d3External.forEach(k => {
  globals[k] = 'd3'
})

export default {
  input: 'index.js',
  output: {
    name: 'd3',
    format: 'umd',
    file: 'build/d3-tensor-graph.js',
    extend: true,
    globals: globals,
  },
  external: d3External,
  plugins: pluginOptions
}
