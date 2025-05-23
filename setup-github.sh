#!/bin/bash

# Not a Label - GitHub Setup Helper
# This script helps you push your project to GitHub

echo "🚀 Not a Label - GitHub Setup Helper"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get GitHub username
echo "Please enter your GitHub username:"
read -r GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}❌ GitHub username is required${NC}"
    exit 1
fi

# Choose protocol
echo ""
echo "Choose connection method:"
echo "1) HTTPS (recommended for beginners)"
echo "2) SSH (recommended for advanced users)"
echo -n "Enter choice (1 or 2): "
read -r PROTOCOL_CHOICE

case $PROTOCOL_CHOICE in
    1)
        REPO_URL="https://github.com/${GITHUB_USERNAME}/not-a-label.git"
        echo -e "${GREEN}✓ Using HTTPS protocol${NC}"
        ;;
    2)
        REPO_URL="git@github.com:${GITHUB_USERNAME}/not-a-label.git"
        echo -e "${GREEN}✓ Using SSH protocol${NC}"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

# Confirm repository creation
echo ""
echo -e "${YELLOW}⚠️  Before continuing, make sure you have:${NC}"
echo "1. Created a new repository on GitHub named 'not-a-label'"
echo "2. NOT initialized it with README, .gitignore, or License"
echo ""
echo "Repository URL will be: $REPO_URL"
echo ""
echo -n "Have you created the repository? (y/n): "
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo ""
    echo "Please create the repository first:"
    echo -e "${GREEN}https://github.com/new${NC}"
    echo ""
    echo "Repository settings:"
    echo "- Name: not-a-label"
    echo "- Description: AI-powered music platform for independent artists"
    echo "- Public or Private: Your choice"
    echo "- DO NOT initialize with any files"
    exit 0
fi

# Remove existing remote and add new one
echo ""
echo "Configuring git remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo -e "${GREEN}✓ Remote configured${NC}"

# Show current status
echo ""
echo "Current git status:"
git status --short

# Push to GitHub
echo ""
echo "Ready to push to GitHub!"
echo -e "${YELLOW}This will upload all your code to: $REPO_URL${NC}"
echo ""
echo -n "Push now? (y/n): "
read -r PUSH_CONFIRM

if [ "$PUSH_CONFIRM" = "y" ] || [ "$PUSH_CONFIRM" = "Y" ]; then
    echo ""
    echo "Pushing to GitHub..."
    
    if git push -u origin main; then
        echo ""
        echo -e "${GREEN}✨ Success! Your project is now on GitHub!${NC}"
        echo ""
        echo "🎉 Your repository is live at:"
        echo -e "${GREEN}https://github.com/${GITHUB_USERNAME}/not-a-label${NC}"
        echo ""
        echo "📝 Next steps:"
        echo "1. Add repository topics (music, ai, nodejs, etc.)"
        echo "2. Set up GitHub Secrets for deployment"
        echo "3. Enable security features"
        echo "4. Invite collaborators"
        echo ""
        echo "📚 Full instructions in GITHUB-INSTRUCTIONS.md"
    else
        echo ""
        echo -e "${RED}❌ Push failed${NC}"
        echo ""
        echo "Common issues:"
        echo "1. Wrong username or repository name"
        echo "2. Repository doesn't exist on GitHub"
        echo "3. Authentication issues"
        echo ""
        echo "For SSH issues, see: https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
        echo "For HTTPS issues, you may need a personal access token:"
        echo "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token"
    fi
else
    echo ""
    echo "Push cancelled. You can push manually later with:"
    echo -e "${GREEN}git push -u origin main${NC}"
fi