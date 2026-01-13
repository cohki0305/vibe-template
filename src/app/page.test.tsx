import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home Page', () => {
  it('renders the welcome heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders the welcome message', () => {
    render(<Home />)
    expect(screen.getByText(/welcome to vibe template/i)).toBeInTheDocument()
  })
})
