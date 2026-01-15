import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserCard, type User } from './user-card'

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date('2024-01-15'),
}

describe('UserCard', () => {
  describe('rendering', () => {
    it('should render user name and email', () => {
      render(<UserCard user={mockUser} />)

      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('should render "名前未設定" when name is null', () => {
      const userWithoutName: User = { ...mockUser, name: null }
      render(<UserCard user={userWithoutName} />)

      expect(screen.getByText('名前未設定')).toBeInTheDocument()
    })

    it('should render avatar with initials from name', () => {
      render(<UserCard user={mockUser} />)

      expect(screen.getByText('TU')).toBeInTheDocument() // Test User -> TU
    })

    it('should render avatar with first letter of email when name is null', () => {
      const userWithoutName: User = { ...mockUser, name: null }
      render(<UserCard user={userWithoutName} />)

      expect(screen.getByText('T')).toBeInTheDocument() // test@example.com -> T
    })

    it('should render formatted creation date', () => {
      render(<UserCard user={mockUser} />)

      // 日本語フォーマット: 2024年1月15日
      expect(screen.getByText(/2024/)).toBeInTheDocument()
    })

    it('should not render delete button when onDelete is not provided', () => {
      render(<UserCard user={mockUser} />)

      expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument()
    })

    it('should render delete button when onDelete is provided', () => {
      render(<UserCard user={mockUser} onDelete={vi.fn()} />)

      expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
    })
  })

  describe('delete functionality', () => {
    const mockOnDelete = vi.fn()

    beforeEach(() => {
      mockOnDelete.mockReset()
    })

    it('should open confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<UserCard user={mockUser} onDelete={mockOnDelete} />)

      await user.click(screen.getByRole('button', { name: '削除' }))

      expect(screen.getByText('ユーザーを削除しますか？')).toBeInTheDocument()
      expect(screen.getByText(/Test User を削除します/)).toBeInTheDocument()
    })

    it('should show email in dialog when name is null', async () => {
      const user = userEvent.setup()
      const userWithoutName: User = { ...mockUser, name: null }
      render(<UserCard user={userWithoutName} onDelete={mockOnDelete} />)

      await user.click(screen.getByRole('button', { name: '削除' }))

      expect(screen.getByText(/test@example.com を削除します/)).toBeInTheDocument()
    })

    it('should close dialog when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<UserCard user={mockUser} onDelete={mockOnDelete} />)

      await user.click(screen.getByRole('button', { name: '削除' }))
      await user.click(screen.getByRole('button', { name: 'キャンセル' }))

      await waitFor(() => {
        expect(screen.queryByText('ユーザーを削除しますか？')).not.toBeInTheDocument()
      })
      expect(mockOnDelete).not.toHaveBeenCalled()
    })

    it('should call onDelete when confirm button is clicked', async () => {
      const user = userEvent.setup()
      mockOnDelete.mockResolvedValue(undefined)
      render(<UserCard user={mockUser} onDelete={mockOnDelete} />)

      await user.click(screen.getByRole('button', { name: '削除' }))
      await user.click(screen.getByRole('button', { name: '削除する' }))

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith('1')
      })
    })

    it('should show loading state during deletion', async () => {
      const user = userEvent.setup()
      mockOnDelete.mockImplementation(() => new Promise(() => {})) // Never resolves
      render(<UserCard user={mockUser} onDelete={mockOnDelete} />)

      await user.click(screen.getByRole('button', { name: '削除' }))
      await user.click(screen.getByRole('button', { name: '削除する' }))

      expect(screen.getByRole('button', { name: '削除中...' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeDisabled()
    })

    it('should close dialog after successful deletion', async () => {
      const user = userEvent.setup()
      mockOnDelete.mockResolvedValue(undefined)
      render(<UserCard user={mockUser} onDelete={mockOnDelete} />)

      await user.click(screen.getByRole('button', { name: '削除' }))
      await user.click(screen.getByRole('button', { name: '削除する' }))

      await waitFor(() => {
        expect(screen.queryByText('ユーザーを削除しますか？')).not.toBeInTheDocument()
      })
    })

    it('should show error message when deletion fails', async () => {
      const user = userEvent.setup()
      mockOnDelete.mockRejectedValue(new Error('削除権限がありません'))
      render(<UserCard user={mockUser} onDelete={mockOnDelete} />)

      await user.click(screen.getByRole('button', { name: '削除' }))
      await user.click(screen.getByRole('button', { name: '削除する' }))

      await waitFor(() => {
        expect(screen.getByText('削除権限がありません')).toBeInTheDocument()
      })
      // Dialog should remain open
      expect(screen.getByText('ユーザーを削除しますか？')).toBeInTheDocument()
    })

    it('should show generic error message for unknown errors', async () => {
      const user = userEvent.setup()
      mockOnDelete.mockRejectedValue('Unknown error')
      render(<UserCard user={mockUser} onDelete={mockOnDelete} />)

      await user.click(screen.getByRole('button', { name: '削除' }))
      await user.click(screen.getByRole('button', { name: '削除する' }))

      await waitFor(() => {
        expect(screen.getByText('削除に失敗しました')).toBeInTheDocument()
      })
    })
  })
})
