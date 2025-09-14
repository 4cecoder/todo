const $jest = (globalThis as any).jest ?? (globalThis as any).vi ?? { fn: (impl: any) => impl }

export const useQuery = $jest.fn(() => [])
export const useMutation = $jest.fn(() => $jest.fn())
export const useAction = $jest.fn(() => $jest.fn())

export default {
  useQuery,
  useMutation,
  useAction,
}
