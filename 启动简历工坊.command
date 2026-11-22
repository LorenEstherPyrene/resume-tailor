#!/bin/zsh
cd "${0:A:h}"
open "http://127.0.0.1:4173"
exec /usr/bin/env node server.mjs
