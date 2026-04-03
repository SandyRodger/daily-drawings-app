import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'

// Stub URL.createObjectURL used in handleFileSelect
global.URL.createObjectURL = vi.fn(() => 'blob:mock-preview')

const mockDrawings = [
  {
    id: 1,
    title: 'Morning Sketch',
    date: '2026-03-17',
    caption: 'A quick sketch',
    notes: '',
    image_url: 'https://example.com/one.jpg',
  },
  {
    id: 2,
    title: 'Afternoon Doodle',
    date: '2026-03-16',
    caption: 'Doodled during a meeting',
    notes: '',
    image_url: null,
  },
]

beforeEach(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => mockDrawings,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('App', () => {
  it('shows a loading state initially', () => {
    render(<App />)
    expect(screen.getByText(/loading drawings/i)).toBeInTheDocument()
  })

  it('renders drawings after fetch resolves', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Morning Sketch')).toBeInTheDocument()
      expect(screen.getByText('Afternoon Doodle')).toBeInTheDocument()
    })
  })

  it('renders drawing captions', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('A quick sketch')).toBeInTheDocument()
    })
  })

  it('renders drawing images when image_url is present', async () => {
    render(<App />)
    await waitFor(() => {
      const img = screen.getByAltText('Morning Sketch')
      expect(img).toHaveAttribute('src', 'https://example.com/one.jpg')
    })
  })

  it('shows "No drawings yet" when the API returns an empty array', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/no drawings yet/i)).toBeInTheDocument()
    })
  })

  it('shows an error message when fetch fails', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  it('shows an error message when fetch throws', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  it('renders the UploadCard', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Add a new drawing')).toBeInTheDocument()
    })
  })

  it('fetches from the drawings API endpoint', async () => {
    render(<App />)
    await waitFor(() => screen.getByText('Morning Sketch'))
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/drawings')
  })
})
