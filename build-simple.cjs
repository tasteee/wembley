#!/usr/bin/env node
const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const createDistDirectoryIfNotExists = () => {
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist')
  }
}

const createExamplesJsDirectoryIfNotExists = () => {
  if (!fs.existsSync('./examples/js')) {
    fs.mkdirSync('./examples/js', { recursive: true })
  }
}

const generateTypeScriptDeclarations = () => {
  try {
    console.log('📝 Generating TypeScript declarations...')
    const tscCommand = process.platform === 'win32' ? 'node_modules\\.bin\\tsc.exe' : './node_modules/.bin/tsc'
    execSync(`${tscCommand} --declaration --emitDeclarationOnly --outDir ./dist`, { stdio: 'inherit' })
  } catch (error) {
    console.warn('⚠️  TypeScript declaration generation failed, continuing without .d.ts files')
  }
}

const buildEsmVersion = async () => {
  console.log('🔨 Building ESM version...')
  await esbuild.build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outfile: './dist/index.js',
    sourcemap: false,
    minify: false,
    target: 'es2020',
  })
}

const buildCommonJsVersion = async () => {
  console.log('🔨 Building CommonJS version...')
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
}

const copyToExamples = () => {
  console.log('📂 Copying files to examples...')
  createExamplesJsDirectoryIfNotExists()
  fs.copyFileSync('./dist/index.js', './examples/js/index.js')
  
  if (fs.existsSync('./dist/index.d.ts')) {
    fs.copyFileSync('./dist/index.d.ts', './examples/js/index.d.ts')
  }
}

async function build() {
  const startTime = Date.now()
  
  try {
    createDistDirectoryIfNotExists()
    
    await Promise.all([
      buildEsmVersion(),
      buildCommonJsVersion(),
    ])
    
    generateTypeScriptDeclarations()
    copyToExamples()
    
    const duration = Date.now() - startTime
    console.log(`✅ Build completed successfully in ${duration}ms`)
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

build()