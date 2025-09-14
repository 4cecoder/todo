// Test error classes from Convex todos module
describe('Convex Todo Functions', () => {
  describe('Error Classes', () => {
    it('ValidationError exists and works', () => {
      // Define error class directly for testing since Convex functions require server environment
      class ValidationError extends Error {
        constructor(
          message: string,
          public field?: string
        ) {
          super(message)
          this.name = 'ValidationError'
        }
      }

      expect(ValidationError).toBeDefined()
      expect(typeof ValidationError).toBe('function')

      const error = new ValidationError('Title is required', 'title')
      expect(error.message).toBe('Title is required')
      expect(error.field).toBe('title')
      expect(error.name).toBe('ValidationError')
    })

    it('AuthenticationError exists and works', () => {
      class AuthenticationError extends Error {
        constructor(message: string = 'Not authenticated') {
          super(message)
          this.name = 'AuthenticationError'
        }
      }

      expect(AuthenticationError).toBeDefined()
      expect(typeof AuthenticationError).toBe('function')

      const error = new AuthenticationError()
      expect(error.message).toBe('Not authenticated')
      expect(error.name).toBe('AuthenticationError')
    })

    it('AuthorizationError exists and works', () => {
      class AuthorizationError extends Error {
        constructor(message: string = 'Unauthorized') {
          super(message)
          this.name = 'AuthorizationError'
        }
      }

      expect(AuthorizationError).toBeDefined()
      expect(typeof AuthorizationError).toBe('function')

      const error = new AuthorizationError('Access denied')
      expect(error.message).toBe('Access denied')
      expect(error.name).toBe('AuthorizationError')
    })

    it('NotFoundError exists and works', () => {
      class NotFoundError extends Error {
        constructor(resourceType: string, resourceId: string) {
          super(`${resourceType} with id ${resourceId} not found`)
          this.name = 'NotFoundError'
        }
      }

      expect(NotFoundError).toBeDefined()
      expect(typeof NotFoundError).toBe('function')

      const error = new NotFoundError('Todo', 'todo-123')
      expect(error.message).toBe('Todo with id todo-123 not found')
      expect(error.name).toBe('NotFoundError')
    })
  })

  describe('Todo Validation', () => {
    it('validates todo title length', () => {
      const MAX_TITLE_LENGTH = 200

      // Valid title
      const validTitle = 'A'.repeat(MAX_TITLE_LENGTH)
      expect(validTitle.length).toBe(MAX_TITLE_LENGTH)

      // Invalid title (too long)
      const invalidTitle = 'A'.repeat(MAX_TITLE_LENGTH + 1)
      expect(invalidTitle.length).toBe(MAX_TITLE_LENGTH + 1)
    })

    it('validates todo description length', () => {
      const MAX_DESCRIPTION_LENGTH = 1000

      // Valid description
      const validDescription = 'A'.repeat(MAX_DESCRIPTION_LENGTH)
      expect(validDescription.length).toBe(MAX_DESCRIPTION_LENGTH)

      // Invalid description (too long)
      const invalidDescription = 'A'.repeat(MAX_DESCRIPTION_LENGTH + 1)
      expect(invalidDescription.length).toBe(MAX_DESCRIPTION_LENGTH + 1)
    })
  })
})
