import esbuild from 'esbuild';
import {createReadStream, createWriteStream} from 'node:fs';
import {pipeline} from 'node:stream/promises';
import {createGzip} from 'node:zlib';


async function gzip(input: string, output: string) {
  const gzip = createGzip();
  const source = createReadStream(input);
  const destination = createWriteStream(output);

  await pipeline(source, gzip, destination);
}

await esbuild.build({
  entryPoints: ['lib/octiron.ts'],
  target: 'es6',
  bundle: true,
  outfile: 'dist/octiron.js',
  format: 'esm',
  external: [
    'mithril',
    'jsonld',
    '@longform/longform',
  ],
  metafile: true,
  treeShaking: true,
  sourcemap: true,
});

await esbuild.build({
  entryPoints: ['lib/octiron.ts'],
  target: 'es6',
  bundle: true,
  outfile: 'dist/octiron.min.js',
  format: 'esm',
  external: [
    'mithril',
    'jsonld',
    '@longform/longform',
  ],
  treeShaking: true,
  minify: true,
  sourcemap: true,
});

const command = new Deno.Command('./node_modules/.bin/tsc', {
  args: [
    './lib/octiron.ts',
    '--outFile', './dist/octiron.d.ts',
    '--emitDeclarationOnly',
    '--declaration',
  ],
  stdin: 'piped',
  stdout: 'piped',
});

const process = command.spawn();
await process.output();

await gzip('./dist/octiron.js', './dist/octiron.js.gz');
await gzip('./dist/octiron.min.js', './dist/octiron.min.js.gz');

