'use strict';
import typescript from 'rollup-plugin-typescript2';
import pkg, { peerDependencies } from './package.json';

export default {
  input: pkg.source,
  output: [{
    file: pkg.main,
    format: 'cjs',
    sourcemap: true,
  },{
    file: pkg.module,
    format: 'es',
    sourcemap: true,
  }],
  external: Object.keys(peerDependencies),
  plugins: [
    typescript({
      tsconfig: './tsconfig.release.json'
    })
  ]
}
