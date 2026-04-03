import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CropModal from '../components/CropModal'

// react-image-crop uses ResizeObserver in jsdom — stub it
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('CropModal', () => {
  it('renders nothing when imageSrc is empty', () => {
    const { container } = render(
      <CropModal imageSrc="" onCancel={vi.fn()} onConfirm={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the modal when imageSrc is provided', () => {
    render(
      <CropModal
        imageSrc="data:image/png;base64,abc"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    )
    expect(screen.getByRole('img', { name: /crop source/i })).toBeInTheDocument()
  })

  it('renders Cancel and Use cropped image buttons', () => {
    render(
      <CropModal
        imageSrc="data:image/png;base64,abc"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /use cropped image/i })).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(
      <CropModal
        imageSrc="data:image/png;base64,abc"
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('does not call onConfirm when no crop has been set', async () => {
    const onConfirm = vi.fn()
    render(
      <CropModal
        imageSrc="data:image/png;base64,abc"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /use cropped image/i }))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm with pixel crop after image load', async () => {
    const onConfirm = vi.fn()
    render(
      <CropModal
        imageSrc="data:image/png;base64,abc"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />
    )

    const img = screen.getByRole('img', { name: /crop source/i })
    // Simulate image load with natural dimensions
    Object.defineProperty(img, 'naturalWidth', { value: 400, configurable: true })
    Object.defineProperty(img, 'naturalHeight', { value: 300, configurable: true })
    fireEvent.load(img)

    await userEvent.click(screen.getByRole('button', { name: /use cropped image/i }))

    expect(onConfirm).toHaveBeenCalledOnce()
    const pixelCrop = onConfirm.mock.calls[0][0]
    expect(pixelCrop).toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number),
      width: expect.any(Number),
      height: expect.any(Number),
    })
  })
})
