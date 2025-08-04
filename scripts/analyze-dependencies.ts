#!/usr/bin/env tsx

/**
 * Dependency Analysis Tool
 * Analyzes TypeScript import patterns to detect circular dependencies
 * and validate architectural boundaries
 */

import * as fs from 'fs';
import * as path from 'path';

type ModuleInfo = {
  path: string;
  imports: string[];
  layer: string;
};

const LAYERS = {
  core: ['lib/mux/types.ts'],
  infrastructure: [
    'lib/mux/client.ts',
    'lib/api/http.ts',
    'lib/api/client.ts',
    'lib/auth/',
    'lib/db/',
  ],
  business: ['lib/mux/utils.ts', 'lib/validations/', 'lib/utils.ts'],
  application: ['hooks/', 'app/api/'],
  presentation: [
    'components/',
    'app/(dashboard)/',
    'app/(auth)/',
    'app/page.tsx',
    'app/layout.tsx',
    'app/debug/',
  ],
  testing: ['tests/', '__tests__/'],
};

function getLayer(filePath: string): string {
  for (const [layer, patterns] of Object.entries(LAYERS)) {
    if (patterns.some(pattern => filePath.includes(pattern))) {
      return layer;
    }
  }
  return 'unknown';
}

function extractImports(content: string): string[] {
  const importRegex = /import.*from ['"](@\/[^'"]+)['"];?/g;
  const imports: string[] = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    if (match[1]) {
      imports.push(match[1].replace('@/', ''));
    }
  }

  return imports;
}

function analyzeFile(filePath: string): ModuleInfo | null {
  if (
    !fs.existsSync(filePath) ||
    (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx'))
  ) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = extractImports(content);
  const relativePath = path.relative(process.cwd(), filePath);

  return {
    path: relativePath,
    imports,
    layer: getLayer(relativePath),
  };
}

function findTsFiles(dir: string): string[] {
  const files: string[] = [];

  function traverse(currentDir: string): void {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !item.startsWith('.') &&
        item !== 'node_modules'
      ) {
        traverse(fullPath);
      } else if (
        stat.isFile() &&
        (item.endsWith('.ts') || item.endsWith('.tsx'))
      ) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

function detectCycles(modules: ModuleInfo[]): string[][] {
  const cycles: string[][] = [];
  const moduleMap = new Map<string, ModuleInfo>();

  for (const mod of modules) {
    moduleMap.set(mod.path, mod);
  }

  function dfs(current: string, path: string[], visited: Set<string>): void {
    if (path.includes(current)) {
      const cycleStart = path.indexOf(current);
      cycles.push([...path.slice(cycleStart), current]);
      return;
    }

    if (visited.has(current)) return;
    visited.add(current);

    const currentModule = moduleMap.get(current);
    if (!currentModule) return;

    for (const importPath of currentModule.imports) {
      // Convert import path to file path
      const tsFile = importPath.endsWith('.ts')
        ? importPath
        : `${importPath}.ts`;
      const tsxFile = importPath.endsWith('.tsx')
        ? importPath
        : `${importPath}.tsx`;

      if (moduleMap.has(tsFile)) {
        dfs(tsFile, [...path, current], visited);
      } else if (moduleMap.has(tsxFile)) {
        dfs(tsxFile, [...path, current], visited);
      }
    }
  }

  for (const mod of modules) {
    dfs(mod.path, [], new Set());
  }

  return cycles;
}

function validateLayerBoundaries(modules: ModuleInfo[]): string[] {
  const violations: string[] = [];
  const layerOrder = [
    'core',
    'infrastructure',
    'business',
    'application',
    'presentation',
  ];

  for (const mod of modules) {
    // Skip validation for testing modules - they can import from any layer
    if (mod.layer === 'testing') continue;

    const moduleLayerIndex = layerOrder.indexOf(mod.layer);

    for (const importPath of mod.imports) {
      // Find the imported module
      const importedModule = modules.find(
        m =>
          m.path === importPath ||
          m.path === `${importPath}.ts` ||
          m.path === `${importPath}.tsx` ||
          m.path.startsWith(`${importPath}/`)
      );

      if (importedModule) {
        const importedLayerIndex = layerOrder.indexOf(importedModule.layer);

        // Lower layers should not import from higher layers
        if (moduleLayerIndex < importedLayerIndex) {
          violations.push(
            `Layer violation: ${mod.path} (${mod.layer}) imports ${importedModule.path} (${importedModule.layer})`
          );
        }
      }
    }
  }

  return violations;
}

function main(): void {
  console.log('🔍 Analyzing TypeScript dependencies...\n');

  const tsFiles = findTsFiles(process.cwd());
  const modules = tsFiles
    .map(analyzeFile)
    .filter((m): m is ModuleInfo => m !== null);

  console.log(`📊 Found ${modules.length} TypeScript modules\n`);

  // Analyze by layer
  const byLayer = modules.reduce(
    (acc, module) => {
      acc[module.layer] = (acc[module.layer] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log('📋 Modules by layer:');
  for (const [layer, count] of Object.entries(byLayer)) {
    console.log(`  ${layer}: ${count} modules`);
  }
  console.log();

  // Check for circular dependencies
  const cycles = detectCycles(modules);
  if (cycles.length > 0) {
    console.log('❌ Circular dependencies detected:');
    for (const cycle of cycles) {
      console.log(`  ${cycle.join(' -> ')}`);
    }
    console.log();
  } else {
    console.log('✅ No circular dependencies detected\n');
  }

  // Validate layer boundaries
  const violations = validateLayerBoundaries(modules);
  if (violations.length > 0) {
    console.log('❌ Layer boundary violations:');
    for (const violation of violations) {
      console.log(`  ${violation}`);
    }
    console.log();
  } else {
    console.log('✅ No layer boundary violations detected\n');
  }

  // Summary
  console.log('📈 Summary:');
  console.log(`  Total modules: ${modules.length}`);
  console.log(`  Circular dependencies: ${cycles.length}`);
  console.log(`  Layer violations: ${violations.length}`);

  if (cycles.length === 0 && violations.length === 0) {
    console.log('\n🎉 Dependency analysis passed! Architecture is clean.');
    process.exit(0);
  } else {
    console.log(
      '\n⚠️  Dependency analysis found issues that should be addressed.'
    );
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
