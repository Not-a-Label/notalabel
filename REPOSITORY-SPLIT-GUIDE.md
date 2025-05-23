# Not a Label: Repository Split Guide

This guide provides steps to complete the split of the "Not a Label" monorepo into separate repositories while preserving Git history.

## Background

We've split the monorepo into three separate repositories:
- `not-a-label-shared`: Shared TypeScript models and utilities
- `not-a-label-frontend`: Next.js frontend application
- `not-a-label-backend`: Node.js/Express backend services

## Step 1: Create GitHub Repositories

1. Go to GitHub and create three new repositories:
   - `not-a-label-shared`
   - `not-a-label-frontend` 
   - `not-a-label-backend`

2. Don't initialize the repositories with a README, .gitignore, or license to avoid merge conflicts.

## Step 2: Push Local Repositories to GitHub

For each repository, update the remote URL and push to GitHub:

### Shared Library
```bash
cd not-a-label-shared
git remote set-url origin git@github.com:YOUR_GITHUB_USERNAME/not-a-label-shared.git
git push -u origin main
```

### Frontend Application
```bash
cd not-a-label-frontend  
git remote set-url origin git@github.com:YOUR_GITHUB_USERNAME/not-a-label-frontend.git
git push -u origin main
```

### Backend API
```bash
cd not-a-label-backend
git remote set-url origin git@github.com:YOUR_GITHUB_USERNAME/not-a-label-backend.git
git push -u origin main
```

## Step 3: Set Up CI/CD for Each Repository

### Vercel Deployment Setup

For the frontend and backend repositories:

1. Log in to the Vercel dashboard
2. Import each repository from GitHub
3. Configure the following settings:

#### Frontend Settings
- Framework Preset: Next.js
- Root Directory: ./
- Build Command: npm run build
- Output Directory: .next
- Environment Variables:
  - `NEXT_PUBLIC_API_URL`: URL of your backend API

#### Backend Settings
- Framework Preset: Other
- Root Directory: ./
- Build Command: npm run build
- Output Directory: dist
- Environment Variables:
  - `DATABASE_URL`: PostgreSQL connection string
  - `REDIS_URL`: Redis connection string (optional)
  - `JWT_SECRET`: Secret for JWT tokens
  - `OPENAI_API_KEY`: OpenAI API key

## Step 4: Update Package Dependencies

Update the package.json files to use the published shared package rather than local file references:

1. Publish the shared package to a registry (npm or GitHub packages)
2. Update frontend and backend package.json files to use the published version

```diff
- "@not-a-label/shared": "file:../not-a-label-shared"
+ "@not-a-label/shared": "^0.1.0"
```

## Step 5: Local Development Setup

### Setting Up Development Environment

1. Clone all three repositories:
```bash
git clone git@github.com:YOUR_GITHUB_USERNAME/not-a-label-shared.git
git clone git@github.com:YOUR_GITHUB_USERNAME/not-a-label-frontend.git
git clone git@github.com:YOUR_GITHUB_USERNAME/not-a-label-backend.git
```

2. Set up the shared package:
```bash
cd not-a-label-shared
npm install
npm run build
npm link
```

3. Link the shared package to frontend and backend:
```bash
cd ../not-a-label-frontend
npm link @not-a-label/shared
npm install

cd ../not-a-label-backend
npm link @not-a-label/shared
npm install
```

4. Start the services (in separate terminal windows):
```bash
# Start the backend
cd not-a-label-backend
npm run dev

# Start the frontend
cd not-a-label-frontend
npm run dev
```

## Step 6: Best Practices for Ongoing Development

1. **Shared Package Version Management**:
   - Use semantic versioning for the shared package
   - Update both frontend and backend when shared types change

2. **API Contract**:
   - Use shared types to maintain consistent API contracts
   - Document breaking changes in the shared package

3. **Development Workflow**:
   - Consider using a monorepo tool like Turborepo or Nx for local development
   - Set up GitHub Actions to automate testing and deployment

## References

- [Splitting Your Git Repo While Maintaining Commit History](https://amandawalkerbrubaker.medium.com/splitting-your-git-repo-while-maintaining-commit-history-35b9f4597514)
- [Keeping Git History When Converting Multiple Repos into a Monorepo](https://medium.com/@chris_72272/keeping-git-history-when-converting-multiple-repos-into-a-monorepo-97641744d928)
- [How to Break Up a Monorepo](https://gist.github.com/prestwich/afb540efce1d3995a5875a27579f5831) 