# Contributing to sample-nginx

Thank you for your interest in contributing! This is a learning-focused project, and contributions that improve the documentation, examples, or educational value are very welcome.

## How to Contribute

### Reporting Issues
If you find a bug or have a suggestion:
1. Check if it's already been reported in [Issues](../../issues)
2. Create a new issue with a clear title and description
3. For bugs, include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Your environment (Docker version, OS, etc.)

### Submitting Changes

1. **Fork** the repository
2. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and test thoroughly:
   ```bash
   # Test locally
   docker compose down -v
   docker compose up -d
   # Visit http://localhost:8080 and verify all features work
   ```
4. **Commit** with clear messages:
   ```bash
   git commit -m "Brief description of changes"
   ```
5. **Push** to your fork and **create a Pull Request**

### Code Style

- Keep it simple and educational — this is a learning project
- Add comments for non-obvious logic
- Follow existing patterns in the codebase
- Test your changes locally before submitting

### Documentation

- Update the README if you add features or change behavior
- Keep the architecture diagram current
- Include examples for new endpoints or commands
- Fix typos and improve clarity

### Areas for Contribution

Great places to help:
- **Documentation**: Expand guides, fix typos, add examples
- **Security**: Suggestions for production-hardening
- **Examples**: Additional sample pages or API usage patterns
- **Testing**: Instructions or setup for automated testing
- **Docker**: Optimizations (multi-stage builds, smaller images)

## Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/sample-nginx.git
cd sample-nginx

# Start services
docker compose up -d

# Watch logs
docker compose logs -f

# Make your changes
# Test at http://localhost:8080

# Stop when done
docker compose down
```

## Questions?

- Check the [README](README.md) for documentation
- Review existing [Issues](../../issues) for discussions
- Create a new issue to ask questions

Thank you for helping make this project better! 🎉
