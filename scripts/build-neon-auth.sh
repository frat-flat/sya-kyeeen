#!/bin/sh
# Neon Auth のブラウザ用 SDK を1ファイルにまとめる（CDN に頼らず版を固定するため）。
# 使い方：sh scripts/build-neon-auth.sh 0.5.0-beta
set -e
V="${1:-0.5.0-beta}"; T=$(mktemp -d)
cp scripts/neon-auth-entry.js "$T/entry.js"
(cd "$T" && npm init -y >/dev/null && npm i "@neondatabase/auth@$V" esbuild >/dev/null && npx esbuild entry.js --bundle --format=esm --minify --platform=browser --target=es2020 --outfile=out.js)
cp "$T/out.js" "auth/vendor/neon-auth-$V.js"; echo "auth/vendor/neon-auth-$V.js"
