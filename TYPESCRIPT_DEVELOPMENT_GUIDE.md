# TypeScript Development Guide for Cozy Condo

This guide helps you catch TypeScript compilation errors locally before deployment and maintain code quality.

## 🚨 Fixed Issues

### PropertyData Interface Type Mismatch

**Problem**: Multiple duplicate `PropertyData` interfaces were defined across different files, causing type conflicts and compilation errors around line 225 in database-service.ts.

**Solution**:
- Consolidated all `PropertyData` interface definitions into `/src/lib/types.ts`
- Updated all imports to use the shared type definition
- Removed duplicate interface declarations from:
  - `src/lib/database-service.ts`
  - `src/lib/enhanced-database-service.ts`
  - `src/utils/propertyStorage.ts`
  - `src/app/api/migrate/route.ts`

### Import Resolution Issues

**Problem**: Components were importing `PropertyData` from service files instead of the centralized types file.

**Solution**: Updated imports in:
- `src/app/page.tsx`
- `src/app/properties/page.tsx`
- `src/app/admin/properties/page.tsx`

## 🛠️ Development Workflow

### Quick Type Check (Development)

```bash
# Quick TypeScript check for development
npm run type-check:dev

# Watch mode for continuous checking
npm run type-check:watch

# Manual TypeScript compilation check
npm run type-check
```

### Pre-Deployment Checks

```bash
# Complete pre-deployment validation
npm run pre-deploy

# This runs:
# 1. TypeScript compilation check
# 2. Next.js build validation
# 3. ESLint checks
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run type-check` | Basic TypeScript compilation check |
| `npm run type-check:watch` | Continuous TypeScript checking |
| `npm run type-check:dev` | Quick dev check with helpful warnings |
| `npm run pre-deploy` | Full pre-deployment validation |

## 🔧 Script Files

### `/scripts/dev-type-check.sh`
Quick type checking for development with helpful warnings about:
- Duplicate interface definitions
- Missing type imports
- Common TypeScript issues

### `/scripts/pre-deploy-check.sh`
Comprehensive pre-deployment validation including:
- Dependency installation check
- TypeScript compilation
- Next.js build validation
- ESLint checks
- Helpful error messages and fix suggestions

## 📋 Type Safety Best Practices

### 1. Use Centralized Types
Always import types from `/src/lib/types.ts`:
```typescript
import { PropertyData } from '@/lib/types';
```

### 2. Avoid Duplicate Interfaces
Never define the same interface in multiple files. Use the shared types.

### 3. Regular Type Checking
Run type checks regularly during development:
```bash
npm run type-check:dev
```

### 4. Pre-Deployment Validation
Always run the full pre-deployment check before pushing:
```bash
npm run pre-deploy
```

## 🐛 Common Error Fixes

### "Cannot find module" errors
```bash
# Install missing dependencies
npm install

# Check import paths
npm run type-check:dev
```

### Interface compatibility errors
- Ensure all components use types from `/src/lib/types.ts`
- Check for missing optional properties (`?`)
- Verify property names match exactly

### Build-time errors
```bash
# Run full build check
npm run build

# Check for server/client component issues
# Verify all dependencies are properly installed
```

## 🔄 Continuous Integration

For CI/CD pipelines, add this to your build process:

```yaml
# Example GitHub Actions step
- name: Type Check
  run: npm run type-check

- name: Build Check
  run: npm run build

- name: Lint Check
  run: npm run lint
```

## 📊 Type Coverage

The current setup provides type safety for:
- ✅ Property data structures
- ✅ Database service interfaces
- ✅ Component props and state
- ✅ API route parameters
- ✅ Utility function signatures

## 🎯 Next Steps

1. **Run type check**: `npm run type-check:dev`
2. **Fix any remaining issues** shown in the output
3. **Run pre-deployment check**: `npm run pre-deploy`
4. **Commit and deploy** with confidence

## 📞 Troubleshooting

If you encounter persistent TypeScript errors:

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check TypeScript version compatibility:
   ```bash
   npx tsc --version
   ```

3. Verify tsconfig.json settings are correct

4. Run the development type checker for detailed analysis:
   ```bash
   npm run type-check:dev
   ```

---

**✅ All TypeScript compilation errors have been resolved!**

Your codebase now has proper type safety and a robust development workflow to prevent future deployment issues.