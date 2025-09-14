// Mock for convex/react
export const useQuery = jest.fn(() => [])
export const useMutation = jest.fn(() => jest.fn())
export const useAction = jest.fn(() => jest.fn())

export default {
  useQuery,
  useMutation,
  useAction,
}
