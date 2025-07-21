#!/usr/bin/env node
const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')

async function build() {
  try {
    // Create dist directory if it doesn't exist
    if (!fs.existsSync('./dist')) {
      fs.mkdirSync('./dist')
    }

    // Build ESM version
    await esbuild.build({
      entryPoints: ['./src/index.ts'],
      bundle: true,
      format: 'esm',
      platform: 'browser',
      outfile: './dist/index.js',
      external: ['tone', 'tonal'],
      sourcemap: false,
      minify: false,
    })

    // Build CommonJS version
    await esbuild.build({
      entryPoints: ['./src/index.ts'],
      bundle: true,
      format: 'cjs',
      platform: 'node',
      outfile: './dist/index.cjs',
      external: ['tone', 'tonal'],
      sourcemap: false,
      minify: false,
    })

    // Copy to examples/js (as per package.json build script)
    fs.copyFileSync('./dist/index.js', './examples/js/index.js')

    console.log('✅ Build completed successfully')
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

build()