import { vi } from 'vitest'

// Minimal Jest compatibility layer for tests that still use jest.* APIs
// Map commonly used methods to Vitest equivalents.
const jestCompat: any = {
  fn: (...args: any[]) => vi.fn(...args),
  mock: (moduleName: string, factory?: any) => vi.mock(moduleName, factory),
  spyOn: (...args: any[]) => vi.spyOn(...(args as any)),
  clearAllMocks: () => vi.clearAllMocks(),
  resetAllMocks: () => vi.resetAllMocks(),
  restoreAllMocks: () => vi.restoreAllMocks(),
  // helpers
  isMockFunction: (fn: any) => !!fn && !!fn.mock,
}

;(globalThis as any).jest = jestCompat

// Also provide global 'require' compatibility for modules that call require at runtime
;(globalThis as any).require = (mod: string) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(mod)
}
