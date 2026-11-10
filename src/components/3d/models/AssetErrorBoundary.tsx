'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * Error boundary for 3D asset loading.
 *
 * `useGLTF` suspends and throws when a file is missing or malformed. This
 * boundary converts that into a normal render path so the scene can fall back
 * to procedural geometry or a static poster instead of taking down the page.
 */
export default class AssetErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode; onError?: (error: unknown) => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[DentalWeb] 3D asset failed to load', error, info.componentStack)
    this.props.onError?.(error)
  }

  render() {
    if (this.state.failed) return <>{this.props.fallback}</>
    return <>{this.props.children}</>
  }
}
