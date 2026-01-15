import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserForm, type UserFormState } from './user-form'

describe('UserForm', () => {
  const createMockAction = (
    returnValue: UserFormState = { success: false }
  ): ((prevState: UserFormState, formData: FormData) => Promise<UserFormState>) => {
    return vi.fn().mockResolvedValue(returnValue)
  }

  describe('rendering', () => {
    it('should render email and name inputs', () => {
      render(<UserForm action={createMockAction()} />)

      expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
      expect(screen.getByLabelText(/名前/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '作成' })).toBeInTheDocument()
    })
  })

  describe('validation errors', () => {
    it('should show email error when returned from action', async () => {
      const user = userEvent.setup()
      const mockAction = createMockAction({
        success: false,
        fieldErrors: { email: 'メールアドレスは必須です' },
      })
      render(<UserForm action={mockAction} />)

      await user.click(screen.getByRole('button', { name: '作成' }))

      await waitFor(() => {
        expect(screen.getByText('メールアドレスは必須です')).toBeInTheDocument()
      })
    })

    it('should show name error when returned from action', async () => {
      const user = userEvent.setup()
      const mockAction = createMockAction({
        success: false,
        fieldErrors: { name: '名前は100文字以内で入力してください' },
      })
      render(<UserForm action={mockAction} />)

      await user.click(screen.getByRole('button', { name: '作成' }))

      await waitFor(() => {
        expect(screen.getByText('名前は100文字以内で入力してください')).toBeInTheDocument()
      })
    })

    it('should set aria-invalid on inputs with errors', async () => {
      const user = userEvent.setup()
      const mockAction = createMockAction({
        success: false,
        fieldErrors: { email: 'エラー' },
      })
      render(<UserForm action={mockAction} />)

      await user.click(screen.getByRole('button', { name: '作成' }))

      await waitFor(() => {
        expect(screen.getByLabelText(/メールアドレス/)).toHaveAttribute('aria-invalid', 'true')
      })
    })
  })

  describe('submission', () => {
    it('should call action with form data', async () => {
      const user = userEvent.setup()
      const mockAction = createMockAction({ success: true })
      render(<UserForm action={mockAction} />)

      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.type(screen.getByLabelText(/名前/), 'Test User')
      await user.click(screen.getByRole('button', { name: '作成' }))

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalled()
        const formData = (mockAction as ReturnType<typeof vi.fn>).mock.calls[0][1] as FormData
        expect(formData.get('email')).toBe('test@example.com')
        expect(formData.get('name')).toBe('Test User')
      })
    })

    it('should show success message after successful submission', async () => {
      const user = userEvent.setup()
      const mockAction = createMockAction({ success: true })
      render(<UserForm action={mockAction} />)

      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.click(screen.getByRole('button', { name: '作成' }))

      await waitFor(() => {
        expect(screen.getByText('ユーザーを作成しました')).toBeInTheDocument()
      })
    })

    it('should show general error message when submission fails', async () => {
      const user = userEvent.setup()
      const mockAction = createMockAction({
        success: false,
        error: 'このメールアドレスは既に登録されています',
      })
      render(<UserForm action={mockAction} />)

      await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com')
      await user.click(screen.getByRole('button', { name: '作成' }))

      await waitFor(() => {
        expect(screen.getByText('このメールアドレスは既に登録されています')).toBeInTheDocument()
      })
    })
  })
})
