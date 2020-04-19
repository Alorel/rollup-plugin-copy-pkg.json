import typescript from '@rollup/plugin-typescript';
import {join} from 'path';
import {dependencies, peerDependencies} from './package.json';
import {cleanPlugin} from '@alorel/rollup-plugin-clean';
import {dtsPlugin as dts} from '@alorel/rollup-plugin-dts';
import cpPlugin from './build/cp-plugin';

const isSecondBuild = !!process.env.RUN_PJSON_DIST;

export default {
  input: join(__dirname, 'src', 'index.ts'),
  external: Array.from(
    new Set(
      Object.keys(peerDependencies)
        .concat(Object.keys(dependencies))
        .concat('util', 'fs', 'path')
    )
  ),
  output: {
    dir: join(__dirname, 'dist'),
    assetFileNames: '[name][extname]',
    sourcemap: true,
    entryFileNames: '[name].js',
    format: 'cjs'
  },
  watch: {
    exclude: 'node_modules/*'
  },
  plugins: (() => {
    const out = [
      typescript({
        tsconfig: join(__dirname, 'tsconfig.json')
      })
    ];

    if (isSecondBuild) {
      out.push(require('./dist/index.js').copyPkgJsonPlugin({
        unsetPaths: [
          'devDependencies',
          'scripts'
        ]
      }));
    } else {
      out.push(
        cleanPlugin({
          dir: join(__dirname, 'dist')
        }),
        dts(),
        cpPlugin({
          files: [
            'LICENSE',
            'CHANGELOG.md',
            'README.md'
          ]
        })
      )
    }

    return out;
  })()
}
