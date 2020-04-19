import {isEmpty as tIsEmpty, unset as tUnset} from 'lodash'; //tslint:disable-line:import-blacklist
import {Plugin, PluginContext} from 'rollup';
import {emitPlain} from './emitPlain';
import {readFile} from './readFile';

//tslint:disable:no-invalid-this no-var-requires
const isEmpty: typeof tIsEmpty = require('lodash/isEmpty');
const unset: typeof tUnset = require('lodash/unset');
//tslint:enable:no-var-requires

type PathType = string | string[];

interface Options {
  pkgJsonPath?: string;

  /** string = delete prop, array = use _.unset */
  unsetPaths?: PathType[];
}

interface CopyPkgJsonPlugin extends Required<Pick<Plugin, 'buildStart' | 'renderStart'>> {
  name: 'copy-pkg-json';
}

function processUnsetPath(path: PathType, pkgJson: { [k: string]: any }): void {
  if (Array.isArray(path)) {
    switch (path.length) {
      case 1:
        delete pkgJson[path[0]];
        break;
      case 0:
        break;
      default:
        unset(pkgJson, path);
        if (isEmpty(pkgJson[path[0]])) {
          delete pkgJson[path[0]];
        }
    }
  } else {
    delete pkgJson[path];
  }
}

function copyPkgJsonPlugin(pluginOptions: Options = {}): CopyPkgJsonPlugin {
  const {
    pkgJsonPath = 'package.json',
    unsetPaths = ['devDependencies']
  } = pluginOptions;

  const out: Partial<CopyPkgJsonPlugin> = {
    name: 'copy-pkg-json',
    buildStart(this: PluginContext) {
      this.addWatchFile(pkgJsonPath);
    }
  };

  if (!unsetPaths || !unsetPaths.length) {
    out.renderStart = function (this: PluginContext): Promise<void> {
      return readFile(pkgJsonPath)
        .then(source => {
          emitPlain(this, source);
        });
    };
  } else {
    function onFileRead(ctx: PluginContext, stringContents: string): void {
      const pkgJson: { [k: string]: any } = JSON.parse(stringContents);
      for (const path of unsetPaths) {
        processUnsetPath(path, pkgJson);
      }
      emitPlain(ctx, JSON.stringify(pkgJson, null, 2) + '\n'); //tslint:disable-line:no-magic-numbers
    }

    out.renderStart = function (this: PluginContext): Promise<void> {
      return readFile(pkgJsonPath, 'utf8')
        .then(stringContents => {
          onFileRead(this, stringContents);
        });
    };
  }

  return out as CopyPkgJsonPlugin;
}

export {
  CopyPkgJsonPlugin,
  copyPkgJsonPlugin,
  Options as CopyPkgJsonPluginOptions,
  PathType as CopyPkgJsonPathType
};
