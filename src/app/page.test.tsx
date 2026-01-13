import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './page'

vi.mock('@/views/user-page-view', () => ({
  UserPageView: () => <div data-testid="user-page-view">UserPageView</div>,
}))

describe('Home Page', () => {
  it('renders the page title', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { level: 1, name: /vibe template/i })).toBeInTheDocument()
  })

  it('renders the user page view', () => {
    render(<Home />)
    expect(screen.getByTestId('user-page-view')).toBeInTheDocument()
  })
})
