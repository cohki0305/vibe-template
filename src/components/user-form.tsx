'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export type UserFormData = {
  email: string
  name: string
}

export type UserFormState = {
  success: boolean
  error?: string
  fieldErrors?: {
    email?: string
    name?: string
  }
}

export type UserFormProps = {
  action: (prevState: UserFormState, formData: FormData) => Promise<UserFormState>
}

export function UserForm({ action }: UserFormProps) {
  const [state, formAction, isPending] = useActionState(action, { success: false })

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.success && (
        <Alert>
          <AlertDescription>ユーザーを作成しました</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="user@example.com"
          aria-invalid={!!state.fieldErrors?.email}
          aria-describedby={state.fieldErrors?.email ? 'email-error' : undefined}
          disabled={isPending}
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="text-sm text-destructive">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">名前</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="山田 太郎"
          aria-invalid={!!state.fieldErrors?.name}
          aria-describedby={state.fieldErrors?.name ? 'name-error' : undefined}
          disabled={isPending}
        />
        {state.fieldErrors?.name && (
          <p id="name-error" className="text-sm text-destructive">
            {state.fieldErrors.name}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? '送信中...' : '作成'}
      </Button>
    </form>
  )
}
