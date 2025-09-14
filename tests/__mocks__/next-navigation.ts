const $jest = (globalThis as any).jest ?? (globalThis as any).vi ?? { fn: (impl: any) => impl }

export const useRouter = $jest.fn(() => ({
  push: $jest.fn(),
  replace: $jest.fn(),
  back: $jest.fn(),
  forward: $jest.fn(),
  refresh: $jest.fn(),
}))

export const useSearchParams = $jest.fn(() => new URLSearchParams())
export const usePathname = $jest.fn(() => '/test-path')
export const useParams = $jest.fn(() => ({}))
export const useSelectedLayoutSegment = $jest.fn(() => null)
export const useSelectedLayoutSegments = $jest.fn(() => [])

export default {
  useRouter,
  useSearchParams,
  usePathname,
  useParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
}
