# Contributing to Not a Label

Thank you for your interest in contributing to Not a Label! We welcome contributions from the community to help make this platform better for independent musicians everywhere.

## 🤝 How to Contribute

### Reporting Bugs
- Check if the bug has already been reported in [Issues](https://github.com/yourusername/not-a-label/issues)
- If not, create a new issue with:
  - Clear title and description
  - Steps to reproduce
  - Expected behavior
  - Screenshots if applicable
  - Environment details (OS, browser, Node version)

### Suggesting Features
- Check existing feature requests in [Issues](https://github.com/yourusername/not-a-label/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
- Create a new issue with the `enhancement` label
- Describe the feature and its benefits
- Include mockups or examples if possible

### Code Contributions

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/not-a-label.git
   cd not-a-label
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   ```

5. **Commit Your Changes**
   ```bash
   git commit -m "Add feature: description of your changes"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template

## 📋 Development Guidelines

### Code Style
- Use TypeScript for new backend code
- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic

### Commit Messages
- Use present tense ("Add feature" not "Added feature")
- Keep the first line under 50 characters
- Reference issues and pull requests when relevant

### Testing
- Write unit tests for new functions
- Ensure all tests pass before submitting PR
- Aim for good code coverage

### Documentation
- Update README.md if adding new features
- Document new API endpoints
- Add JSDoc comments to functions

## 🏗️ Project Structure

```
not-a-label/
├── not-a-label-backend/    # Backend API
│   ├── src/               # Source code
│   ├── tests/             # Test files
│   └── docs/              # API documentation
├── not-a-label-frontend/   # Frontend application
├── public/                 # Static assets
└── docs/                   # Project documentation
```

## 🔧 Setting Up Development Environment

1. **Install Dependencies**
   ```bash
   cd not-a-label-backend
   npm install
   ```

2. **Set Up Environment**
   ```bash
   cp env.example .env
   # Edit .env with your development credentials
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📝 Pull Request Process

1. Ensure your code follows the style guidelines
2. Update the README.md with details of changes if needed
3. Increase version numbers if applicable
4. Your PR will be reviewed by maintainers
5. Once approved, it will be merged

## 🎯 Areas We Need Help

- **Frontend Development**: React/Vue components
- **AI Features**: Improving AI prompts and responses
- **Social Media Integration**: Adding new platforms
- **Documentation**: Tutorials and guides
- **Testing**: Increasing test coverage
- **Localization**: Translating to other languages

## 📜 Code of Conduct

### Our Standards
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what is best for the community

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Any conduct which could reasonably be considered inappropriate

## 🙏 Recognition

Contributors will be recognized in:
- The project README
- Release notes
- Our website's contributors page

## 📞 Questions?

- Join our [Discord community](https://discord.gg/notalabel)
- Email us at contribute@not-a-label.art
- Open a [Discussion](https://github.com/yourusername/not-a-label/discussions)

Thank you for helping make Not a Label better! 🎵