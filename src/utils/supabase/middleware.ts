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

  // middleware 只负责刷新 session，路由保护由各 Page 的服务器端 redirect 负责。
  // workspace 路径（/app、/settings、/favorites）标记为公开，避免 / ↔ /app 重定向循环：
  // —— /（landing page）直接 redirect 到 /app
  // —— /app（AppPage）在 !user 时 redirect 到 /
  // 若 middleware 也拦截 /app，三段重定向会形成死循环。
  const isPublicPath =
    pathname === '/' ||
    pathname === '/app'      || pathname.startsWith('/app/') ||
    pathname === '/settings' || pathname.startsWith('/settings/') ||
    pathname === '/favorites'|| pathname.startsWith('/favorites/') ||
    pathname === '/home'     || pathname.startsWith('/home/') ||
    pathname === '/faq'      || pathname.startsWith('/faq/') ||
    pathname === '/auth'     || pathname.startsWith('/auth/') ||
    pathname === '/share'    || pathname.startsWith('/share/') ||
    pathname === '/api/share'|| pathname.startsWith('/api/share/')

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
