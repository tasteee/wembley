const esbuild = require('esbuild')

async function build() {
  try {
    // Build ES module version with all dependencies bundled
    await esbuild.build({
      entryPoints: ['./src/index.ts'],
      bundle: true,
      outfile: './dist/index.js',
      format: 'esm',
      platform: 'browser'
      // No external dependencies - bundle everything
    })
    
    // Build CommonJS version
    await esbuild.build({
      entryPoints: ['./src/index.ts'],
      bundle: true,
      outfile: './dist/index.cjs',
      format: 'cjs',
      platform: 'node',
      external: ['tone', 'tonal'] // Keep externals for Node.js
    })
    
    console.log('✅ Build complete!')
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

build()