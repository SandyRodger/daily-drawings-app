import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCroppedImg } from '../utils/cropImage'

// Helper to create a mock Image that fires load immediately
function setupMockImage() {
  let loadCallback
  const mockImage = {
    addEventListener: vi.fn((event, cb) => {
      if (event === 'load') loadCallback = cb
    }),
    set src(_val) {
      // trigger load synchronously after src is set
      Promise.resolve().then(() => loadCallback && loadCallback())
    },
    naturalWidth: 200,
    naturalHeight: 100,
  }
  vi.spyOn(global, 'Image').mockImplementation(() => mockImage)
  return mockImage
}

function setupMockCanvas(blobResult) {
  const mockCtx = { drawImage: vi.fn() }
  const mockCanvas = {
    getContext: vi.fn(() => mockCtx),
    toBlob: vi.fn((cb, _type, _quality) => cb(blobResult)),
    width: 0,
    height: 0,
  }
  vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas)
  return { mockCanvas, mockCtx }
}

beforeEach(() => {
  vi.restoreAllMocks()
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
})

describe('getCroppedImg', () => {
  it('sets canvas dimensions to the rounded crop size', async () => {
    setupMockImage()
    const { mockCanvas } = setupMockCanvas(new Blob())

    await getCroppedImg('data:image/jpeg;base64,fake', {
      x: 10.4,
      y: 20.6,
      width: 80.3,
      height: 40.7,
    })

    expect(mockCanvas.width).toBe(80)
    expect(mockCanvas.height).toBe(41)
  })

  it('calls drawImage with rounded crop coordinates', async () => {
    const mockImage = setupMockImage()
    const { mockCtx } = setupMockCanvas(new Blob())

    await getCroppedImg('data:image/jpeg;base64,fake', {
      x: 10.4,
      y: 20.6,
      width: 80.3,
      height: 40.7,
    })

    expect(mockCtx.drawImage).toHaveBeenCalledWith(
      mockImage,
      10,  // Math.round(10.4)
      21,  // Math.round(20.6)
      80,  // Math.round(80.3)
      41,  // Math.round(40.7)
      0, 0,
      80,
      41
    )
  })

  it('returns a blob and a previewUrl', async () => {
    setupMockImage()
    const fakeBlob = new Blob(['image data'], { type: 'image/jpeg' })
    setupMockCanvas(fakeBlob)

    const result = await getCroppedImg('data:image/jpeg;base64,fake', {
      x: 0, y: 0, width: 100, height: 100,
    })

    expect(result.blob).toBe(fakeBlob)
    expect(result.previewUrl).toBe('blob:mock-url')
  })

  it('calls toBlob with JPEG format and 0.95 quality', async () => {
    setupMockImage()
    const { mockCanvas } = setupMockCanvas(new Blob())

    await getCroppedImg('data:image/jpeg;base64,fake', {
      x: 0, y: 0, width: 50, height: 50,
    })

    expect(mockCanvas.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.95
    )
  })

  it('rejects when the canvas produces no blob', async () => {
    setupMockImage()
    setupMockCanvas(null)

    await expect(
      getCroppedImg('data:image/jpeg;base64,fake', {
        x: 0, y: 0, width: 50, height: 50,
      })
    ).rejects.toThrow('Canvas is empty')
  })
})
