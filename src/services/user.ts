import type { PrismaClient } from '@/generated/prisma/client'

export type CreateUserInput = {
  email: string
  name?: string
}

export type User = {
  id: string
  email: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export function createUserService(prisma: PrismaClient) {
  return {
    async create(input: CreateUserInput): Promise<User> {
      return prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
        },
      })
    },

    async getByEmail(email: string): Promise<User | null> {
      return prisma.user.findUnique({
        where: { email },
      })
    },

    async getAll(): Promise<User[]> {
      return prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      })
    },

    async delete(id: string): Promise<void> {
      await prisma.user.delete({
        where: { id },
      })
    },
  }
}
