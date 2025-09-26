# ReadLater Code Guidelines

## 1. Project Overview

The ReadLater project is a mobile application built with React Native, Nest.js, Supabase, and Clerk. The frontend is developed using React Native for cross-platform compatibility. The backend API is built using Nest.js for its robust architecture and TypeScript support. Supabase provides the database and basic authentication. Clerk is used for enhanced authentication and user management.

Key architectural decisions:

-   **Cross-platform Development**: React Native for iOS and Android.
-   **Backend API**: Nest.js for scalability and maintainability.
-   **Database**: Supabase for PostgreSQL, authentication, and real-time updates.
-   **Authentication**: Clerk for enhanced user authentication and management.

## 2. Core Principles

-   **Maintainability**: Write code that is easy to understand, modify, and extend.
-   **Readability**: Code should be clear and self-documenting through meaningful names and comments.
-   **Testability**: Design code to be easily testable, ensuring reliability.
-   **Performance**: Optimize code for speed and efficiency, focusing on responsiveness.
-   **Security**: Implement secure coding practices to protect user data and prevent vulnerabilities.

## 3. Language-Specific Guidelines

### React Native (Frontend)

#### File Organization and Directory Structure

-   **Feature-based structure:** Group files by feature rather than type (e.g., components, screens, services).
-   Follow the recommended structure in the TRD:

```
/frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ArticleCard/
│   │   │   ├── ArticleCard.tsx
│   │   │   └── ArticleCard.styles.ts
│   │   ├── ...
│   ├── screens/          # Application screens
│   │   ├── HomeScreen.tsx
│   │   ├── ...
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API client and data fetching logic
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   └── index.js          # Entry point
├── app.json            # Application configuration
└── ...
```

#### Import/Dependency Management

-   **Explicit imports:** Always use explicit imports to specify what you are importing.
-   **Group imports:** Group imports by origin (e.g., React, libraries, local files).
-   **Avoid wildcard imports:** `import * as X from 'module'` should be avoided for clarity.

```typescript
// MUST: Example of good import style
import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Article } from '../../types';
import { formatDate } from '../../utils/date-utils';
```

#### Error Handling Patterns

-   **Try-catch blocks:** Use `try-catch` blocks for handling potential errors in asynchronous operations.
-   **Error boundaries:** Implement error boundaries to catch errors in React components.
-   **Centralized error handling:** Consider a centralized error handling service for logging and reporting errors.

```typescript
// MUST: Example of try-catch in React Native
async function fetchArticle(id: string) {
  try {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching article:", error.message);
    // Optionally, display an error message to the user
    return null;
  }
}
```

### Nest.js (Backend)

#### File Organization and Directory Structure

-   **Module-based structure:** Organize code into modules based on features or domains (e.g., user, content, reading-list).
-   Follow the recommended structure in the TRD:

```
/backend/
├── src/
│   ├── app.module.ts     # Main application module
│   ├── user/             # User management module
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.module.ts
│   │   └── user.entity.ts
│   ├── content/          # Content management module
│   │   ├── content.controller.ts
│   │   ├── content.service.ts
│   │   ├── content.module.ts
│   │   └── content.entity.ts
│   ├── reading-list/     # Reading list management module
│   │   ├── reading-list.controller.ts
│   │   ├── reading-list.service.ts
│   │   ├── reading-list.module.ts
│   │   └── reading-list.entity.ts
│   ├── auth/             # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── auth.guard.ts
│   ├── database/         # Database configuration and entities
│   ├── main.ts           # Entry point
│   └── ...
├── nest-cli.json       # Nest CLI configuration
└── ...
```

#### Import/Dependency Management

-   **Nest.js modules:** Utilize Nest.js modules to manage dependencies and organize code.
-   **Dependency injection:** Use dependency injection to provide services and repositories to controllers and other services.
-   **Explicit imports:** Use explicit imports for clarity.

```typescript
// MUST: Example of Nest.js module import
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Export UserService if needed in other modules
})
export class UserModule {}
```

#### Error Handling Patterns

-   **Exceptions:** Use Nest.js exceptions (`HttpException`) for handling API errors.
-   **Global exception filter:** Implement a global exception filter for centralized error handling.
-   **Logging:** Use a logging service for logging errors and debugging information.

```typescript
// MUST: Example of Nest.js exception handling
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
```

## 4. Code Style Rules

### MUST Follow:

-   **Naming Conventions:**
    -   **Variables:** Use camelCase (e.g., `articleTitle`, `readingListId`).
    -   **Functions:** Use camelCase (e.g., `getArticle`, `saveContent`).
    -   **Components:** Use PascalCase (e.g., `ArticleCard`, `HomeScreen`).
    -   **Constants:** Use UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_ARTICLES`).
    -   **Classes:** Use PascalCase (e.g., `UserService`, `ContentController`).
    -   Rationale: Consistent naming improves readability and maintainability.
-   **Indentation:**
    -   Use 2 spaces for indentation.
    -   Rationale: Consistent indentation improves code readability.
-   **Line Length:**
    -   Limit lines to a maximum of 120 characters.
    -   Rationale: Improves readability, especially on smaller screens.
-   **Comments:**
    -   Write clear and concise comments to explain complex logic or non-obvious code.
    -   Rationale: Comments help other developers understand the code's purpose and functionality.
-   **Typescript:**
    -   Use Typescript for both React Native (frontend) and NestJS (backend).
    -   Rationale: Typescript will improve code quality, prevent runtime errors, and improve refactoring.
-   **Code Formatting:**
    -   Use Prettier to automatically format code.
    -   Rationale: Consistent code formatting reduces visual noise and improves readability.
-   **Error Handling:**
    -   Implement proper error handling using try-catch blocks and error boundaries.
    -   Rationale: Prevents application crashes and provides a better user experience.

```typescript
// MUST: Clear example of the correct naming convention
const articleTitle = 'Example Article';

function getArticle(id: string) {
  // ...
}

const API_BASE_URL = 'https://example.com/api';
```

### MUST NOT Do:

-   **Global Variables:**
    -   MUST NOT use global variables.
    -   Rationale: Global variables can lead to naming conflicts and unpredictable behavior.
-   **Magic Numbers/Strings:**
    -   MUST NOT use magic numbers or strings directly in the code.
    -   Rationale: Makes the code harder to understand and maintain. Use constants instead.
-   **Nested Callbacks:**
    -   MUST NOT use deeply nested callbacks (callback hell).
    -   Rationale: Makes the code hard to read and debug. Use async/await or Promises instead.
-   **Ignoring Errors:**
    -   MUST NOT ignore errors without handling them.
    -   Rationale: Can lead to unexpected behavior and data corruption.
-   **Console.log in Production Code:**
    -   MUST NOT leave `console.log` statements in production code.
    -   Rationale: Can expose sensitive information and impact performance.
-   **Complex Conditional Statements:**
    -   MUST NOT write overly complex conditional statements.
    -   Rationale: Makes the code hard to read and understand. Simplify using helper functions or switch statements.
-   **Over-commenting:**
    -   MUST NOT over-comment code. Comments should explain the *why*, not the *what*.
    -   Rationale: Too many comments can clutter the code and make it harder to read.
-   **Large Components/Functions:**
    -   MUST NOT create components or functions that are too large or have too many responsibilities.
    -   Rationale: Makes the code hard to understand and maintain. Break down into smaller, more manageable pieces.

```typescript
// MUST NOT: Example of what to avoid (magic number)
function calculateDiscount(price: number) {
  if (price > 100) { // Magic number
    return price * 0.1;
  }
  return 0;
}

// MUST: Corrected example using a constant
const DISCOUNT_THRESHOLD = 100;

function calculateDiscount(price: number) {
  if (price > DISCOUNT_THRESHOLD) {
    return price * 0.1;
  }
  return 0;
}
```

## 5. Architecture Patterns

-   **Component/Module Structure Guidelines:**
    -   **React Native Components:** Organize components into reusable units with clear inputs (props) and outputs (events).
    -   **Nest.js Modules:** Group related controllers, services, and entities into modules.
-   **Data Flow Patterns:**
    -   **Unidirectional Data Flow (React Native):** Data flows from parent components to child components via props.
    -   **API Requests (React Native/Nest.js):** Use services to encapsulate API requests and data fetching logic.
    -   **Dependency Injection (Nest.js):** Use dependency injection to provide services and repositories to controllers and other services.
-   **State Management Conventions:**
    -   **React Context API:** Use React Context API for simple state management.
    -   **Redux (if needed):** Integrate Redux for more complex state management needs.
-   **API Design Standards:**
    -   **RESTful APIs:** Design APIs following RESTful principles.
    -   **JSON Data Format:** Use JSON for request and response bodies.
    -   **HTTP Status Codes:** Use appropriate HTTP status codes to indicate the success or failure of API requests.
    -   **Versioning:** Consider API versioning for future compatibility.

```typescript
// MUST: Example of a React Native component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ArticleCardProps {
  title: string;
  description: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ title, description }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
  },
});

export default ArticleCard;
```

```typescript
// MUST: Example of a Nest.js controller
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
}
```
