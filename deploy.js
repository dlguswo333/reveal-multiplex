import fs from 'node:fs';

// Write nested package.json for dual module packages.
fs.writeFileSync('./dist/esm/package.json', JSON.stringify({type: 'module'}));
fs.writeFileSync('./dist/cjs/package.json', JSON.stringify({type: 'commonjs'}));

// Write d.ts files to the root.
// I have no idea why conditional exports + dual package does not provide
// proper types. To workaround the problem, Copy d.ts files to the root.
// It will trick LSP to think there are '/server' and '/browser' scripts.
// ... But also '/common'.
fs.copyFileSync('./dist/esm/common.d.ts', './common.d.ts');
fs.copyFileSync('./dist/esm/browser.d.ts', './browser.d.ts');
fs.copyFileSync('./dist/esm/server.d.ts', './server.d.ts');
