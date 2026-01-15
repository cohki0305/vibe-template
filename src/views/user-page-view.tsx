'use client'

import useSWR from 'swr'
import { UserForm, type UserFormState } from '@/components/user-form'
import { UserList } from '@/components/user-list'
import { createUserAction, deleteUser, getUsers } from '@/actions/user'
import type { User } from '@/components/user-card'

export function UserPageView() {
  const { data: users = [], error, isLoading, mutate } = useSWR<User[]>('users', getUsers)

  const handleCreateAction = async (
    prevState: UserFormState,
    formData: FormData
  ): Promise<UserFormState> => {
    const result = await createUserAction(prevState, formData)
    if (result.success) {
      mutate()
    }
    return result
  }

  const handleDelete = async (id: string) => {
    await deleteUser(id)
    mutate()
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-semibold mb-4">ユーザー登録</h2>
        <div className="max-w-md">
          <UserForm action={handleCreateAction} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">ユーザー一覧</h2>
        <UserList
          users={users}
          isLoading={isLoading}
          error={error?.message}
          onDelete={handleDelete}
        />
      </section>
    </div>
  )
}
