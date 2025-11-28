'use strict';
const typescript = require('rollup-plugin-typescript2');
const pkg = require('./package.json');

module.exports = {
  input: pkg.source,
  output: [{
    file: pkg.main,
    format: 'cjs',
    exports: 'named'
  },{
    file: pkg.module,
    format: 'es'
  }],
  external: Object.keys(pkg.peerDependencies || {}),
  plugins: [ 
    typescript({
      typescript: require('typescript'),
    }) 
  ]
}
