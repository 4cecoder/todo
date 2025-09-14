// Polyfills for testing environment

// TextEncoder/TextDecoder polyfill
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder
  global.TextDecoder = require('util').TextDecoder
}

// fetch polyfill
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

// Request/Response polyfills
if (typeof Request === 'undefined') {
  global.Request = require('node-fetch').Request
}

if (typeof Response === 'undefined') {
  global.Response = require('node-fetch').Response
}

// AbortController polyfill
if (typeof AbortController === 'undefined') {
  global.AbortController = require('abort-controller')
}

// URL/URLSearchParams polyfills
if (typeof URL === 'undefined') {
  global.URL = require('url').URL
}

if (typeof URLSearchParams === 'undefined') {
  global.URLSearchParams = require('url').URLSearchParams
}

// WebSocket polyfill
if (typeof WebSocket === 'undefined') {
  global.WebSocket = require('ws')
}

// Performance polyfill
if (typeof performance === 'undefined') {
  global.performance = require('perf_hooks').performance
}

// Crypto polyfill
if (typeof crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto
}

// Blob/File polyfills
if (typeof Blob === 'undefined') {
  global.Blob = require('buffer').Blob
}

if (typeof File === 'undefined') {
  global.File = require('buffer').File
}

// FormData polyfill
if (typeof FormData === 'undefined') {
  global.FormData = require('form-data')
}

// Headers polyfill
if (typeof Headers === 'undefined') {
  global.Headers = require('node-fetch').Headers
}
