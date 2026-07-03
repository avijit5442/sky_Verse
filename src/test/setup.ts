import '@testing-library/jest-dom'
import { vi } from 'vitest'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')

  class MockWebGLRenderer {
    domElement = document.createElement('canvas')

    setPixelRatio() {}

    setSize() {}

    render() {}

    dispose() {}
  }

  return {
    ...actual,
    WebGLRenderer: MockWebGLRenderer,
  }
})
