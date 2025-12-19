#!/bin/bash

# Pre-deployment TypeScript and Quality Checks for Cozy Condo
# This script ensures all TypeScript compilation errors are caught before deployment

set -e  # Exit on any error

echo "🚀 Starting pre-deployment checks for Cozy Condo..."
echo "=================================================="

# Function to print colored output
print_status() {
    if [ "$2" = "success" ]; then
        echo -e "\033[32m✅ $1\033[0m"
    elif [ "$2" = "error" ]; then
        echo -e "\033[31m❌ $1\033[0m"
    else
        echo -e "\033[34mℹ️  $1\033[0m"
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "tsconfig.json" ]; then
    print_status "Error: Not in a valid Next.js TypeScript project directory" "error"
    exit 1
fi

print_status "Project directory: $(pwd)" "info"

# Step 1: Install dependencies if needed
print_status "Checking dependencies..." "info"
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..." "info"
    npm install
fi

# Step 2: TypeScript compilation check
print_status "Running TypeScript compilation check..." "info"
if npx tsc --noEmit; then
    print_status "TypeScript compilation successful" "success"
else
    print_status "TypeScript compilation failed - fix errors before deploying" "error"
    echo ""
    echo "💡 Common fixes:"
    echo "   • Check for missing imports or exports"
    echo "   • Verify interface compatibility"
    echo "   • Ensure all required properties are defined"
    echo ""
    exit 1
fi

# Step 3: Next.js build check (includes TypeScript validation)
print_status "Running Next.js build check..." "info"
if npm run build; then
    print_status "Next.js build successful" "success"
else
    print_status "Next.js build failed - fix build errors before deploying" "error"
    echo ""
    echo "💡 Common Next.js build issues:"
    echo "   • Server/Client component mismatches"
    echo "   • Missing dependencies"
    echo "   • Runtime TypeScript errors"
    echo ""
    exit 1
fi

# Step 4: ESLint check
print_status "Running ESLint check..." "info"
if npm run lint; then
    print_status "ESLint check successful" "success"
else
    print_status "ESLint found issues - review and fix before deploying" "error"
    echo ""
    echo "💡 You can auto-fix some ESLint issues with: npm run lint -- --fix"
    echo ""
    exit 1
fi

# Success message
echo ""
echo "=================================================="
print_status "All pre-deployment checks passed! 🎉" "success"
echo "Your application is ready for deployment."
echo ""
echo "Next steps:"
echo "  1. Commit your changes: git add . && git commit -m 'Your commit message'"
echo "  2. Push to your repository: git push"
echo "  3. Deploy using your deployment platform (Vercel, Netlify, etc.)"
echo ""