# GitHub Setup Guide for Not-a-Label

This guide explains how to set up and connect the Not-a-Label project with GitHub.

## Creating a Repository

### Option 1: Through the GitHub Web Interface

1. Go to [GitHub](https://github.com/) and log in
2. Click the "+" icon in the top-right corner and select "New repository"
3. Enter the following details:
   - Owner: Your username or organization
   - Repository name: `Not-a-Label`
   - Description: "Platform for independent musicians with analytics and AI assistance"
   - Visibility: Public (or Private if preferred)
   - Do not initialize with README, .gitignore, or license (we'll push our existing files)
4. Click "Create repository"

### Option 2: Using GitHub CLI

1. Install GitHub CLI if you haven't already:
   ```bash
   # macOS
   brew install gh
   
   # Windows
   winget install --id GitHub.cli
   
   # Linux
   sudo apt install gh   # Debian/Ubuntu
   sudo dnf install gh   # Fedora
   ```

2. Authenticate with GitHub:
   ```bash
   gh auth login
   ```

3. Create the repository:
   ```bash
   gh repo create Not-a-Label --public --description "Platform for independent musicians with analytics and AI assistance"
   ```

## Connecting Existing Project

1. Navigate to your project directory:
   ```bash
   cd /path/to/Not-a-Label
   ```

2. Initialize Git if not already done:
   ```bash
   git init
   ```

3. Add the remote repository:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/Not-a-Label.git
   ```

4. Add your files:
   ```bash
   git add .
   git commit -m "Initial commit"
   ```

5. Push to GitHub:
   ```bash
   git push -u origin main   # or 'master' depending on your default branch
   ```

## Working with Branches

For best practices, use feature branches for development:

1. Create a new branch for each feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes and commit them:
   ```bash
   git add .
   git commit -m "Descriptive commit message"
   ```

3. Push the branch to GitHub:
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. Create a pull request through the GitHub web interface

## Connecting with Vercel

1. Log in to [Vercel](https://vercel.com/)
2. Create a new project and select "Import Git Repository"
3. Choose the GitHub repository you just created
4. Configure the project settings:
   - Framework preset: Next.js
   - Root directory: `not-a-label/frontend` (if using monorepo structure)
   - Build command: `npm run build`
   - Output directory: `.next`
5. Add environment variables as needed
6. Deploy the project

## Automating Deployments

With the GitHub and Vercel connection set up:

1. Every push to the `main` branch will automatically deploy to production
2. Every push to feature branches will create preview deployments
3. Pull request previews will be generated automatically

## Working with the Submodule Structure

If the project uses Git submodules:

1. Clone with submodules:
   ```bash
   git clone --recurse-submodules https://github.com/YOUR-USERNAME/Not-a-Label.git
   ```

2. Update submodules:
   ```bash
   git submodule update --init --recursive
   ```

3. When making changes to submodules, commit in the submodule first, then in the parent repository. 