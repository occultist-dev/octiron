import esbuild from 'esbuild';


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
