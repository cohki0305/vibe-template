'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createUserService, type CreateUserInput, type User } from '@/services/user'
import type { UserFormState } from '@/components/user-form'

const userService = createUserService(prisma)

const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('メールアドレスの形式が正しくありません'),
  name: z.string().max(100, '名前は100文字以内で入力してください'),
})

export async function createUserAction(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const rawData = {
    email: formData.get('email')?.toString() ?? '',
    name: formData.get('name')?.toString() ?? '',
  }

  const result = createUserSchema.safeParse(rawData)

  if (!result.success) {
    const fieldErrors: UserFormState['fieldErrors'] = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof typeof fieldErrors
      fieldErrors[field] = issue.message
    }
    return { success: false, fieldErrors }
  }

  try {
    await userService.create({
      email: result.data.email.trim(),
      name: result.data.name.trim(),
    })
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '予期しないエラーが発生しました',
    }
  }
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return userService.create(input)
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return userService.getByEmail(email)
}

export async function getUsers(): Promise<User[]> {
  return userService.getAll()
}

export async function deleteUser(id: string): Promise<void> {
  await userService.delete(id)
}
