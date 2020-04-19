import {isEmpty as tIsEmpty, unset as tUnset} from 'lodash'; //tslint:disable-line:import-blacklist
import {CopyPkgJsonPathType} from './index';

//tslint:disable:no-var-requires
const isEmpty: typeof tIsEmpty = require('lodash/isEmpty');
const unset: typeof tUnset = require('lodash/unset');

//tslint:enable:no-var-requires

/** @internal */
export function processUnsetPath(path: CopyPkgJsonPathType, pkgJson: { [k: string]: any }): void {
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
