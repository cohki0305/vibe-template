import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserList } from './user-list'
import type { User } from './user-card'

const mockUsers: User[] = [
  {
    id: '1',
    email: 'user1@example.com',
    name: 'User One',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    email: 'user2@example.com',
    name: 'User Two',
    createdAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    email: 'user3@example.com',
    name: null,
    createdAt: new Date('2024-01-17'),
  },
]

describe('UserList', () => {
  describe('rendering users', () => {
    it('should render all users', () => {
      render(<UserList users={mockUsers} />)

      expect(screen.getByText('User One')).toBeInTheDocument()
      expect(screen.getByText('User Two')).toBeInTheDocument()
      expect(screen.getByText('user3@example.com')).toBeInTheDocument()
    })

    it('should render users in a grid', () => {
      const { container } = render(<UserList users={mockUsers} />)

      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid?.children).toHaveLength(3)
    })

    it('should pass onDelete to each UserCard', () => {
      const mockOnDelete = vi.fn()
      render(<UserList users={mockUsers} onDelete={mockOnDelete} />)

      // All cards should have delete buttons
      const deleteButtons = screen.getAllByRole('button', { name: '削除' })
      expect(deleteButtons).toHaveLength(3)
    })
  })

  describe('empty state', () => {
    it('should show empty message when users array is empty', () => {
      render(<UserList users={[]} />)

      expect(screen.getByText('ユーザーがいません')).toBeInTheDocument()
    })

    it('should not show empty message when users exist', () => {
      render(<UserList users={mockUsers} />)

      expect(screen.queryByText('ユーザーがいません')).not.toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should show skeleton cards when loading', () => {
      render(<UserList users={[]} isLoading />)

      expect(screen.getByRole('status', { name: '読み込み中' })).toBeInTheDocument()
    })

    it('should show 3 skeleton cards', () => {
      const { container } = render(<UserList users={[]} isLoading />)

      const skeletons = container.querySelectorAll('.rounded-lg.border')
      expect(skeletons).toHaveLength(3)
    })

    it('should not show empty message when loading', () => {
      render(<UserList users={[]} isLoading />)

      expect(screen.queryByText('ユーザーがいません')).not.toBeInTheDocument()
    })

    it('should not show users when loading', () => {
      render(<UserList users={mockUsers} isLoading />)

      expect(screen.queryByText('User One')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('should show error alert when error is provided', () => {
      render(<UserList users={[]} error="ユーザーの取得に失敗しました" />)

      expect(screen.getByText('エラー')).toBeInTheDocument()
      expect(screen.getByText('ユーザーの取得に失敗しました')).toBeInTheDocument()
    })

    it('should not show users when error is present', () => {
      render(<UserList users={mockUsers} error="エラーが発生しました" />)

      expect(screen.queryByText('User One')).not.toBeInTheDocument()
    })

    it('should not show empty message when error is present', () => {
      render(<UserList users={[]} error="エラーが発生しました" />)

      expect(screen.queryByText('ユーザーがいません')).not.toBeInTheDocument()
    })

    it('should not show loading state when error is present', () => {
      render(<UserList users={[]} isLoading error="エラーが発生しました" />)

      expect(screen.queryByRole('status', { name: '読み込み中' })).not.toBeInTheDocument()
    })
  })

  describe('state priority', () => {
    it('error should take priority over loading', () => {
      render(<UserList users={[]} isLoading error="データ取得失敗" />)

      expect(screen.getByText('データ取得失敗')).toBeInTheDocument()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('loading should take priority over empty state', () => {
      render(<UserList users={[]} isLoading />)

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.queryByText('ユーザーがいません')).not.toBeInTheDocument()
    })

    it('loading should take priority over users', () => {
      render(<UserList users={mockUsers} isLoading />)

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.queryByText('User One')).not.toBeInTheDocument()
    })
  })
})
