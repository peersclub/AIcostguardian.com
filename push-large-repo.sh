#!/bin/bash

echo "=== Git Push Script for Large Repositories ==="
echo ""

# 1. Increase Git buffer size for large files
echo "Step 1: Configuring git for large file transfers..."
git config http.postBuffer 524288000  # 500MB buffer
git config http.lowSpeedLimit 0
git config http.lowSpeedTime 999999
git config core.compression 0  # Disable compression for faster uploads

# 2. Clean up repository to reduce size
echo ""
echo "Step 2: Cleaning up repository..."
# Remove build artifacts that shouldn't be pushed
rm -rf .next/ 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
rm -rf .npm/ 2>/dev/null

# Clean git objects
git gc --aggressive --prune=now

# 3. Check current status
echo ""
echo "Step 3: Current repository status..."
git status --short

# 4. Attempt different push methods
echo ""
echo "Step 4: Attempting to push to remote..."

# Method 1: Try standard push with increased verbosity
echo "Method 1: Standard push with verbose output..."
GIT_TRACE=1 GIT_CURL_VERBOSE=1 git push origin main 2>&1 | head -20

if [ $? -ne 0 ]; then
    echo ""
    echo "Method 1 failed. Trying alternative methods..."
    
    # Method 2: Push with SSH instead of HTTPS
    echo ""
    echo "Method 2: Attempting SSH push..."
    echo "First, let's check if SSH remote exists..."
    
    # Check current remote
    CURRENT_REMOTE=$(git remote get-url origin)
    echo "Current remote: $CURRENT_REMOTE"
    
    # If it's HTTPS, offer to switch to SSH
    if [[ $CURRENT_REMOTE == https://* ]]; then
        echo ""
        echo "Converting to SSH URL..."
        # Convert https://github.com/user/repo.git to git@github.com:user/repo.git
        SSH_REMOTE=$(echo $CURRENT_REMOTE | sed 's/https:\/\/github.com\//git@github.com:/')
        echo "SSH remote would be: $SSH_REMOTE"
        echo ""
        echo "To switch to SSH, run:"
        echo "  git remote set-url origin $SSH_REMOTE"
        echo "  git push origin main"
    fi
    
    # Method 3: Incremental push
    echo ""
    echo "Method 3: Incremental push (pushing commits one by one)..."
    echo "Getting list of unpushed commits..."
    
    # Get commits that need to be pushed
    COMMITS=$(git rev-list origin/main..HEAD 2>/dev/null | tac)
    
    if [ -z "$COMMITS" ]; then
        echo "No commits to push or unable to determine commits."
        echo ""
        echo "Try fetching first:"
        echo "  git fetch origin"
        echo "  git push origin main"
    else
        echo "Found commits to push. To push incrementally, run:"
        echo ""
        for commit in $COMMITS; do
            echo "  git push origin $commit:main"
        done
    fi
fi

echo ""
echo "=== Additional Manual Options ==="
echo ""
echo "If the above methods fail, try these commands manually:"
echo ""
echo "1. Reset SSL verification temporarily (NOT recommended for production):"
echo "   export GIT_SSL_NO_VERIFY=1"
echo "   git push origin main"
echo ""
echo "2. Use GitHub CLI (if installed):"
echo "   gh repo sync --force"
echo ""
echo "3. Push with shallow clone:"
echo "   git push --depth=1 origin main"
echo ""
echo "4. If SSL errors persist, try different TLS version:"
echo "   git config http.sslVersion tlsv1.2"
echo "   git push origin main"
echo ""
echo "5. For very large repos, consider using Git LFS:"
echo "   git lfs track '*.bin' '*.zip' '*.tar.gz'"
echo "   git add .gitattributes"
echo "   git commit -m 'Add Git LFS tracking'"
echo "   git push origin main"
echo ""
echo "6. Alternative: Direct file edit on GitHub:"
echo "   - Go to: $(git remote get-url origin | sed 's/\.git$//')/edit/main/vercel.json"
echo "   - Remove the 'EOF < /dev/null' line manually"
echo "   - Commit directly on GitHub"
echo ""
echo "=== End of Script ==="