# Final Setup Steps for Not-a-Label

Follow these instructions to complete the setup of your Not-a-Label project.

## 1. Create GitHub Repository

1. Visit [GitHub's new repository page](https://github.com/new)
2. Enter the following details:
   - Repository name: `Not-a-Label`
   - Description: "Platform for independent musicians with analytics and AI assistance"
   - Visibility: Public (or Private if preferred)
   - Do not initialize with README, .gitignore, or license (we'll push our existing files)
3. Click "Create repository"

## 2. Connect Your Local Repository to GitHub

Run these commands in your terminal after creating the GitHub repository:

```bash
# Add the new remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/Not-a-Label.git

# Rename your main branch to 'main' if needed (modern GitHub standard)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## 3. Connect to Vercel

1. Log into [Vercel](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: `not-a-label/frontend` (if using monorepo structure)
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `.next`
5. Set environment variables from your `.env` files (but don't include sensitive values in git)
6. Click "Deploy"

## 4. Configure Custom Domain in Vercel

1. Once deployed, go to Project → Settings → Domains
2. Click "Add" to add your domain: `not-a-label.art`
3. Follow Vercel's instructions to verify domain
4. Repeat for `www.not-a-label.art` and `api.not-a-label.art`

## 5. Verify Everything Works

1. Check that your site is accessible at `https://not-a-label.art`
2. Verify SSL is working (look for the padlock in your browser)
3. Test the functionality of your site

## 6. Next Development Steps

1. Create feature branches for new work:
   ```bash
   git checkout -b feature/new-feature
   ```

2. Make changes, commit, and push:
   ```bash
   git add .
   git commit -m "Describe your changes"
   git push -u origin feature/new-feature
   ```

3. Create a Pull Request on GitHub to merge into main
4. After review and merging, Vercel will automatically deploy changes

## 7. Handling Submodules (if applicable)

If you're using Git submodules:

```bash
# When cloning
git clone --recurse-submodules https://github.com/USERNAME/Not-a-Label.git

# Updating submodules
git submodule update --init --recursive

# When making changes to submodules
cd not-a-label
git add .
git commit -m "Changes in submodule"
cd ..
git add not-a-label
git commit -m "Update submodule reference"
```

## 8. Regular Maintenance

1. Keep your dependencies updated
2. Renew your domain annually
3. Monitor your Vercel usage and performance
4. Make regular backups of your database

Congratulations! Your Not-a-Label platform is now fully set up and ready for development. 