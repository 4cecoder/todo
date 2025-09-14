import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2')
  })

  it('handles array of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2')
  })

  it('handles object with conditional classes', () => {
    expect(cn({ class1: true, class2: false, class3: true })).toBe('class1 class3')
  })

  it('merges Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('handles undefined and null values', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
  })

  it('handles empty strings', () => {
    expect(cn('class1', '', 'class2')).toBe('class1 class2')
  })

  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('')
  })

  it('handles single class name', () => {
    expect(cn('single-class')).toBe('single-class')
  })

  it('handles complex combinations', () => {
    expect(
      cn(
        'base-class',
        ['array-class1', 'array-class2'],
        { conditional1: true, conditional2: false },
        'final-class'
      )
    ).toBe('base-class array-class1 array-class2 conditional1 final-class')
  })
})
