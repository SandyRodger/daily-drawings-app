import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadCard from '../components/UploadCard'

describe('UploadCard', () => {
  it('renders the heading and instructions', () => {
    render(<UploadCard onFileSelect={vi.fn()} />)
    expect(screen.getByText('Add a new drawing')).toBeInTheDocument()
    expect(screen.getByText(/drag and drop an image here/i)).toBeInTheDocument()
  })

  it('renders the file picker button', () => {
    render(<UploadCard onFileSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: /choose from files/i })).toBeInTheDocument()
  })

  it('renders a hidden file input', () => {
    const { container } = render(<UploadCard onFileSelect={vi.fn()} />)
    const input = container.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
  })

  it('calls onFileSelect with the dropped file', async () => {
    const onFileSelect = vi.fn()
    const { container } = render(<UploadCard onFileSelect={onFileSelect} />)

    const file = new File(['drawing'], 'sketch.png', { type: 'image/png' })
    const input = container.querySelector('input[type="file"]')

    await userEvent.upload(input, file)
    expect(onFileSelect).toHaveBeenCalledWith(file)
  })

  it('only passes the first file when multiple are provided', async () => {
    const onFileSelect = vi.fn()
    const { container } = render(<UploadCard onFileSelect={onFileSelect} />)

    const files = [
      new File(['a'], 'a.png', { type: 'image/png' }),
      new File(['b'], 'b.png', { type: 'image/png' }),
    ]
    const input = container.querySelector('input[type="file"]')

    await userEvent.upload(input, files)
    // onFileSelect is called once with the first accepted file
    expect(onFileSelect).toHaveBeenCalledTimes(1)
    expect(onFileSelect).toHaveBeenCalledWith(files[0])
  })
})
