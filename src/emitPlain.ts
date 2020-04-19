import {PluginContext} from 'rollup';

/** @internal */
export function emitPlain(ctx: PluginContext, source: string | Buffer): void {
  ctx.emitFile({
    fileName: 'package.json',
    source,
    type: 'asset'
  });
}
