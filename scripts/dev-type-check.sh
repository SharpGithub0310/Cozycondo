#!/bin/bash

# Development TypeScript Checker for Cozy Condo
# Quick type checking without full build for development workflow

echo "🔍 Running quick TypeScript check..."

# Check if we're in the right directory
if [ ! -f "tsconfig.json" ]; then
    echo "❌ No tsconfig.json found. Are you in the project root?"
    exit 1
fi

# Run TypeScript check
if npx tsc --noEmit; then
    echo "✅ TypeScript check passed!"

    # Check for common issues in specific files
    echo ""
    echo "🔍 Checking for common issues..."

    # Check for duplicate PropertyData interfaces
    if grep -r "interface PropertyData" src/ 2>/dev/null | wc -l | grep -q "^0$"; then
        echo "✅ No duplicate PropertyData interfaces found"
    else
        echo "⚠️  Warning: Found PropertyData interface definitions:"
        grep -r "interface PropertyData" src/ 2>/dev/null || true
        echo "   Consider using the shared type from '@/lib/types'"
    fi

    # Check for missing type imports
    if grep -r "PropertyData" src/ 2>/dev/null | grep -v "import.*PropertyData" | grep -v "interface PropertyData" | wc -l | grep -q "^0$"; then
        echo "✅ All PropertyData usages have proper imports"
    else
        echo "⚠️  Warning: Found PropertyData usage without imports:"
        grep -r "PropertyData" src/ 2>/dev/null | grep -v "import.*PropertyData" | grep -v "interface PropertyData" || true
    fi

else
    echo "❌ TypeScript check failed!"
    echo ""
    echo "💡 Quick fixes to try:"
    echo "   • Run: npm install (if missing dependencies)"
    echo "   • Check for missing imports in the failed files"
    echo "   • Verify all interfaces are properly exported/imported"
    echo ""
    exit 1
fi

echo ""
echo "🎉 Development type check complete!"
echo "   💡 For full pre-deployment check, run: ./scripts/pre-deploy-check.sh"
echo "   🔄 For watch mode, run: npm run type-check:watch"