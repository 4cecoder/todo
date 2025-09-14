const $jest = (globalThis as any).jest ?? (globalThis as any).vi ?? { fn: (impl: any) => impl }

export const Image = $jest.fn(({ src, alt }: any) => {
  // Return a simple img element for testing
  return `Mock Image: ${src} ${alt}`
})

export default Image
