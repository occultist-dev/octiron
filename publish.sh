#!/bin/bash

pnpm pack --out=package.tgz
pnpm publish --access=public

