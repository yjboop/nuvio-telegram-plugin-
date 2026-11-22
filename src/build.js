// build.js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/vadapav.js'],
  bundle: true,
  outfile: 'providers/vadapav.js', // Output folder for Nuvio
  format: 'cjs',
  target: 'es2020', // Nuvio Hermes target
  minify: true,
}).catch(() => process.exit(1));