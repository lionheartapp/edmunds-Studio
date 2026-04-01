#!/bin/bash
# AdGenAI — Deploy to Vercel as a NEW project
# Run this from the adgenai/ directory
#
# IMPORTANT: When Vercel asks "Link to existing project?" → say NO
# When it asks for a project name → use "adgenai" (or whatever you prefer)
#
# This will NOT touch your existing lionheart-ops project.

set -e

echo "🚀 Deploying AdGenAI to Vercel..."
echo ""
echo "⚠️  IMPORTANT: When prompted:"
echo "   • Set up and deploy? → Y"
echo "   • Which scope? → Your team"
echo "   • Link to existing project? → N"
echo "   • Project name? → adgenai"
echo "   • Directory? → ./"
echo ""

npx vercel --prod

echo ""
echo "✅ Done! Your AdGenAI instance is live."
echo ""
echo "Next steps:"
echo "  1. Add API keys in Vercel dashboard → Settings → Environment Variables"
echo "  2. The app works in demo mode without any keys (Rivian, Subaru, Toyota)"
echo "  3. Add ANTHROPIC_API_KEY to enable live brand analysis"
