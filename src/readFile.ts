import * as fs from 'fs';
import {promisify} from 'util';

/** @internal */
export const readFile = promisify(fs.readFile);
