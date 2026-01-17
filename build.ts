import typescript from "@rollup/plugin-typescript";
import {createReadStream, createWriteStream} from "node:fs";
import {mkdir, readFile, writeFile, rm, cp} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {pipeline} from "node:stream/promises";
import {fileURLToPath} from "node:url";
import {createBrotliCompress, createGzip} from "node:zlib";
import {rollup} from "rollup";
import {transform} from 'lightningcss';

const dir = dirname(fileURLToPath(import.meta.url));
const dist = resolve(dir, "dist");

async function gzip(input: string, output: string) {
  const gzip = createGzip();
  const source = createReadStream(input);
  const destination = createWriteStream(output);

  await pipeline(source, gzip, destination);
}

async function brotli(input: string, output: string) {
  const brotli = createBrotliCompress();
  const source = createReadStream(input);
  const destination = createWriteStream(output);

  await pipeline(source, brotli, destination);
}

try {
  await rm(dist, { recursive: true });
} catch {}
await mkdir(dist);

{
  const res = await rollup({
    input: "lib/octiron.ts",
    external: [
      "mithril",
      "@longform/longform",
      "@occultist/mini-jsonld",
      "json-ptr",
      "uri-templates",
    ],
    plugins: [typescript()],
  });
  await res.write({
    file: "dist/octiron.js",
    format: "es",
    sourcemap: true,
  });
  await res.write({
    file: "dist/octiron.cjs",
    format: "cjs",
    sourcemap: true,
  });
}

{
  const res = await rollup({
    input: "lib/octiron.ts",
    external: [
      "mithril",
      "@longform/longform",
      "@occultist/mini-jsonld",
      "json-ptr",
      "uri-templates",
    ],
    plugins: [
      typescript({
        //tsconfig: "tsconfig.json",
        declaration: true,
        declarationDir: "dist",
      }),
    ],
  });
  
  await res.write({
    file: "dist/octiron.min.js",
    format: "es",
    sourcemap: true,
  });
}

await cp(resolve(dir, 'lib/octiron.css'), resolve(dist, 'octiron.css'));
const { code, map } = transform({
  filename: 'octiron.css',
  code: await readFile('./lib/octiron.css'),
  minify: true,
  sourceMap: true,
});


await gzip("./dist/octiron.js", "./dist/longform.js.gz");
await gzip("./dist/octiron.min.js", "./dist/longform.min.js.gz");

await brotli("./dist/octiron.js", "./dist/longform.js.br");
await brotli("./dist/octiron.min.js", "./dist/longform.min.js.br");

await cp('./lib/octiron.css', './dist/octiron.css');
await writeFile('./dist/octiron.min.css', code);
if (map != null) await writeFile('./dist/octiron.css.map', map);

await gzip('./dist/octiron.min.css', './dist/octiron.min.css.gz');
await brotli('./dist/octiron.min.css', './dist/octiron.min.css.br');

