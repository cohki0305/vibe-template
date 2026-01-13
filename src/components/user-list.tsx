'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { UserCard, type User } from './user-card'

export type UserListProps = {
  users: User[]
  isLoading?: boolean
  error?: string | null
  onDelete?: (id: string) => Promise<void>
}

function UserCardSkeleton() {
  return (
    <div className="w-full max-w-sm rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

export function UserList({ users, isLoading, error, onDelete }: UserListProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="status"
        aria-label="読み込み中"
      >
        {[...Array(3)].map((_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">ユーザーがいません</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} onDelete={onDelete} />
      ))}
    </div>
  )
}
