import { describe, it, expect, beforeAll } from 'vitest'
import { prisma } from '../setup'
import { createUserService } from '@/services/user'

describe('UserService Integration Tests', () => {
  let userService: ReturnType<typeof createUserService>

  beforeAll(() => {
    userService = createUserService(prisma)
  })

  describe('create', () => {
    it('should create a user with email and name', async () => {
      const user = await userService.create({
        email: 'test@example.com',
        name: 'Test User',
      })

      expect(user.id).toBeDefined()
      expect(user.email).toBe('test@example.com')
      expect(user.name).toBe('Test User')
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })

    it('should create a user without name', async () => {
      const user = await userService.create({
        email: 'noname@example.com',
      })

      expect(user.email).toBe('noname@example.com')
      expect(user.name).toBeNull()
    })

    it('should throw error for duplicate email', async () => {
      await userService.create({ email: 'duplicate@example.com' })

      await expect(userService.create({ email: 'duplicate@example.com' })).rejects.toThrow()
    })
  })

  describe('getByEmail', () => {
    it('should find a user by email', async () => {
      await userService.create({
        email: 'findme@example.com',
        name: 'Find Me',
      })

      const found = await userService.getByEmail('findme@example.com')

      expect(found).not.toBeNull()
      expect(found?.name).toBe('Find Me')
    })

    it('should return null for non-existent email', async () => {
      const found = await userService.getByEmail('notfound@example.com')
      expect(found).toBeNull()
    })
  })

  describe('getAll', () => {
    it('should return all users ordered by createdAt desc', async () => {
      await userService.create({ email: 'first@example.com', name: 'First' })
      await userService.create({ email: 'second@example.com', name: 'Second' })
      await userService.create({ email: 'third@example.com', name: 'Third' })

      const users = await userService.getAll()

      expect(users).toHaveLength(3)
      expect(users[0].email).toBe('third@example.com')
      expect(users[2].email).toBe('first@example.com')
    })

    it('should return empty array when no users exist', async () => {
      const users = await userService.getAll()
      expect(users).toHaveLength(0)
    })
  })

  describe('delete', () => {
    it('should delete a user by id', async () => {
      const user = await userService.create({ email: 'delete@example.com' })

      await userService.delete(user.id)

      const found = await userService.getByEmail('delete@example.com')
      expect(found).toBeNull()
    })

    it('should throw error for non-existent id', async () => {
      await expect(userService.delete('non-existent-id')).rejects.toThrow()
    })
  })

  describe('data isolation between tests', () => {
    it('test 1: creates a user', async () => {
      await userService.create({ email: 'isolation1@example.com' })
      const users = await userService.getAll()
      expect(users).toHaveLength(1)
    })

    it('test 2: should not see data from test 1', async () => {
      // This verifies that afterEach clears the database
      const users = await userService.getAll()
      expect(users).toHaveLength(0)
    })
  })
})
