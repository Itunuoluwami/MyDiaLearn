#!/usr/bin/env bash
# Trim an assembled API site before it is committed to deploy-api.
#
#   backend/deploy/prune-site.sh <site-directory>
#
# bun installs @prisma/client's optional peer `prisma` — the CLI, with Studio,
# a bundled Postgres and TypeScript — even with --production. The running API
# never loads any of it; it only needs the generated client and the PostgreSQL
# query compiler. The deploy workflow boots the pruned site before publishing,
# so a removal that breaks startup fails the build instead of the live site.
set -euo pipefail
site="$1"
nm="$site/node_modules"

rm -rf \
  "$nm/prisma" \
  "$nm/@prisma/studio-core" \
  "$nm/@prisma/dev" \
  "$nm/@electric-sql" \
  "$nm/typescript" \
  "$nm/@types"

# Query compilers for databases DiaLearn does not use.
find "$nm/@prisma/client/runtime" -type f \
  \( -name '*cockroachdb*' -o -name '*mysql*' -o -name '*sqlite*' -o -name '*sqlserver*' \) -delete

# Source maps: size only, and they describe dependency internals.
find "$nm" -type f -name '*.map' -delete

du -sh "$site"
