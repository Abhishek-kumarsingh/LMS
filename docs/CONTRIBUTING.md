# 🤝 Contributing to Modern LMS

Thank you for your interest in contributing to the Modern LMS project! This guide will help you get started with contributing to our open-source learning management system.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@modernlms.com](mailto:conduct@modernlms.com).

## 🚀 Getting Started

### Ways to Contribute

- 🐛 **Bug Reports**: Help us identify and fix issues
- 💡 **Feature Requests**: Suggest new features or improvements
- 📝 **Documentation**: Improve our docs and guides
- 🔧 **Code Contributions**: Fix bugs or implement new features
- 🎨 **UI/UX Improvements**: Enhance user experience
- 🧪 **Testing**: Write tests and improve test coverage
- 🌐 **Translations**: Help make LMS accessible globally

### Before You Start

1. **Check existing issues** to avoid duplicate work
2. **Join our Discord** for real-time discussions
3. **Read the documentation** to understand the project structure
4. **Set up your development environment**

## 🛠️ Development Setup

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8.0+
- RabbitMQ 3.12+
- Redis 7+
- Git

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/modern-lms.git
cd modern-lms

# Add upstream remote
git remote add upstream https://github.com/original-org/modern-lms.git
```

### Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Install dependencies
npm install
cd backend && mvn install

# Start development environment
docker-compose up -d mysql rabbitmq redis

# Start backend
cd backend && mvn spring-boot:run

# Start frontend (in new terminal)
npm run dev
```

### Verify Setup

```bash
# Check backend
curl http://localhost:8080/api/health

# Check frontend
curl http://localhost:5173

# Run tests
npm test
cd backend && mvn test
```

## 📋 Contributing Guidelines

### Issue Guidelines

#### Bug Reports

Use the bug report template and include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment details** (OS, browser, versions)
- **Screenshots or logs** if applicable

```markdown
**Bug Description**
A clear description of what the bug is.

**To Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]
```

#### Feature Requests

Use the feature request template:

```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Problem Statement**
What problem does this feature solve?

**Proposed Solution**
How would you like this feature to work?

**Alternatives Considered**
Any alternative solutions you've considered.

**Additional Context**
Any other context or screenshots.
```

### Development Workflow

1. **Create a branch** from `develop`
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Write tests** for new functionality

4. **Update documentation** if needed

5. **Commit your changes** using conventional commits
   ```bash
   git commit -m "feat: add user profile management"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows our style guidelines
- [ ] Self-review of your code
- [ ] Tests added for new functionality
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No merge conflicts with develop branch

### PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have made corresponding changes to documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective
- [ ] New and existing unit tests pass locally
```

### Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **Code review** by at least one maintainer
3. **Testing** in staging environment
4. **Approval** and merge by maintainer

## 📝 Coding Standards

### Java (Backend)

Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html):

```java
// Good
public class UserService {
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public User findById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
    }
}
```

**Key Points:**
- Use meaningful variable and method names
- Keep methods small and focused
- Add JavaDoc for public APIs
- Use dependency injection
- Handle exceptions appropriately

### TypeScript/React (Frontend)

Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript):

```typescript
// Good
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const UserProfile: React.FC<{ user: User }> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = useCallback(async (data: Partial<User>) => {
    try {
      await updateUser(user.id, data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }, [user.id]);
  
  return (
    <div className="user-profile">
      {/* Component JSX */}
    </div>
  );
};
```

**Key Points:**
- Use TypeScript for type safety
- Prefer functional components with hooks
- Use meaningful component and prop names
- Implement proper error handling
- Follow accessibility guidelines

### Git Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add two-factor authentication
fix(courses): resolve video playback issue
docs(api): update authentication endpoints
test(user): add unit tests for user service
```

## 🧪 Testing Guidelines

### Backend Testing

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private UserService userService;
    
    @Test
    @DisplayName("Should find user by ID successfully")
    void shouldFindUserByIdSuccessfully() {
        // Given
        String userId = "user-123";
        User expectedUser = createTestUser(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(expectedUser));
        
        // When
        User actualUser = userService.findById(userId);
        
        // Then
        assertThat(actualUser).isEqualTo(expectedUser);
        verify(userRepository).findById(userId);
    }
}
```

### Frontend Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe'
  };

  it('should display user information', () => {
    render(<UserProfile user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should enable editing when edit button is clicked', () => {
    render(<UserProfile user={mockUser} />);
    
    fireEvent.click(screen.getByText('Edit'));
    
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
  });
});
```

### Test Coverage

Maintain minimum test coverage:
- **Backend**: 80% line coverage
- **Frontend**: 70% line coverage
- **Critical paths**: 95% coverage

## 📚 Documentation

### Code Documentation

- **JavaDoc** for all public Java APIs
- **TSDoc** for TypeScript functions and components
- **README** files for each module
- **Inline comments** for complex logic

### API Documentation

- Update OpenAPI specifications
- Include request/response examples
- Document error codes and responses
- Update Postman collections

### User Documentation

- Update user guides for new features
- Include screenshots and examples
- Maintain FAQ and troubleshooting guides
- Update deployment documentation

## 🌟 Recognition

Contributors are recognized in:

- **Contributors page** on our website
- **Release notes** for significant contributions
- **Annual contributor awards**
- **Conference speaking opportunities**

## 💬 Community

### Communication Channels

- **Discord**: [Join our server](https://discord.gg/modernlms)
- **GitHub Discussions**: For feature discussions
- **GitHub Issues**: For bug reports and feature requests
- **Email**: [developers@modernlms.com](mailto:developers@modernlms.com)

### Regular Events

- **Weekly office hours**: Thursdays 2-3 PM UTC
- **Monthly contributor meetup**: First Friday of each month
- **Quarterly planning sessions**: Roadmap discussions

### Getting Help

- Check existing documentation
- Search GitHub issues
- Ask in Discord #help channel
- Attend office hours
- Email the development team

## 🎯 Roadmap

See our [public roadmap](https://github.com/orgs/modern-lms/projects/1) for:

- Planned features
- Current priorities
- Community requests
- Release timeline

## 📄 License

By contributing to Modern LMS, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**Thank you for contributing to Modern LMS! Together, we're building the future of online education. 🚀**
