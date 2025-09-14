// Mock for next/image
export const Image = jest.fn(({ src, alt }) => {
  // Return a simple img element for testing
  return `Mock Image: ${src} ${alt}`
})

export default Image
