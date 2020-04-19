import {Plugin, PluginContext} from 'rollup';
import {emitPlain} from './emitPlain';
import {processUnsetPath} from './processUnsetPath';
import {readFile} from './readFile';

//tslint:disable:no-invalid-this

type PathType = string | string[];

interface Options {
  pkgJsonPath?: string;

  /** string = delete prop, array = use _.unset */
  unsetPaths?: PathType[];
}

interface CopyPkgJsonPlugin extends Required<Pick<Plugin, 'renderStart'>> {
  name: 'copy-pkg-json';
}

function copyPkgJsonPlugin(pluginOptions: Options = {}): CopyPkgJsonPlugin {
  const {
    pkgJsonPath = 'package.json',
    unsetPaths = ['devDependencies']
  } = pluginOptions;

  const out: Partial<CopyPkgJsonPlugin> = {
    name: 'copy-pkg-json'
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
