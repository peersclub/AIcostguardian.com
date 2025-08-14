/**
 * Redirect to unified API keys endpoint
 * This route exists for backwards compatibility
 */
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Redirect to the unified API keys endpoint
  const url = new URL('/api/api-keys', request.url)
  url.search = request.nextUrl.search
  return Response.redirect(url, 301)
}

export async function POST(request: NextRequest) {
  // Redirect to the unified API keys endpoint
  const url = new URL('/api/api-keys', request.url)
  return Response.redirect(url, 307) // Temporary redirect for POST
}

export async function DELETE(request: NextRequest) {
  // Redirect to the unified API keys endpoint
  const url = new URL('/api/api-keys', request.url)
  url.search = request.nextUrl.search
  return Response.redirect(url, 307) // Temporary redirect for DELETE
}

export async function PATCH(request: NextRequest) {
  // Redirect to the unified API keys endpoint
  const url = new URL('/api/api-keys', request.url)
  url.search = request.nextUrl.search
  return Response.redirect(url, 307) // Temporary redirect for PATCH
}