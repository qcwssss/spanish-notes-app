import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseConfig } from './config'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const code = request.nextUrl.searchParams.get('code')

  if (pathname === '/' && code) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Refactored per Gemini suggestion: Create response first, then update both
          // request and response cookies in a single loop for clarity.
          const response = NextResponse.next({ request })
          
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
          
          supabaseResponse = response
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isRoot = pathname === '/'
  const isWorkspacePath =
    pathname === '/app' ||
    pathname.startsWith('/app/') ||
    pathname === '/settings' ||
    pathname.startsWith('/settings/') ||
    pathname === '/favorites' ||
    pathname.startsWith('/favorites/')
  const isPublicPath =
    isRoot ||
    pathname.startsWith('/home') ||
    pathname.startsWith('/faq') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/share') ||
    pathname.startsWith('/api/share')

  if (!user && (isWorkspacePath || !isPublicPath)) {
    const url = request.nextUrl.clone()
    const next = `${pathname}${request.nextUrl.search}`
    url.pathname = '/auth/sign-in'
    url.search = ''
    url.searchParams.set('next', next)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
