#!/bin/bash

deno task build
pnpm pack --out=package.tgz
pnpm publish --access=public

