import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ClerkProvider } from '@clerk/clerk-react'
import { KeyRound } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Clerk 的重定向 URL 需包含部署 basepath（GitHub Pages 为 /aurora-admin）
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '')
const SIGN_IN_URL = `${BASE}/sign-in`
const HOME_URL = `${BASE}/`

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => {
    if (!PUBLISHABLE_KEY) {
      return <MissingClerkKey />
    }
    return (
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        signInUrl={SIGN_IN_URL}
        afterSignOutUrl={SIGN_IN_URL}
        signInFallbackRedirectUrl={HOME_URL}
      >
        <AppShell />
      </ClerkProvider>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})

function AppShell() {
  return (
    <>
      <NavigationProgress />
      <Outlet />
      <Toaster duration={5000} />
      {import.meta.env.MODE === 'development' && (
        <>
          <ReactQueryDevtools buttonPosition='bottom-left' />
          <TanStackRouterDevtools position='bottom-right' />
        </>
      )}
    </>
  )
}

function MissingClerkKey() {
  return (
    <div className='bg-background text-foreground flex h-svh flex-col items-center justify-center gap-3 px-6 text-center'>
      <KeyRound className='text-muted-foreground size-8' />
      <h1 className='text-xl font-semibold'>缺少 Clerk Publishable Key</h1>
      <p className='text-muted-foreground max-w-md text-sm'>
        请在{' '}
        <code className='bg-muted rounded px-1 py-0.5'>.env</code>
        中配置{' '}
        <code className='bg-muted rounded px-1 py-0.5'>
          VITE_CLERK_PUBLISHABLE_KEY
        </code>{' '}
        （Clerk Dashboard → API Keys → Publishable Key），本地开发需重启 dev
        server。
      </p>
    </div>
  )
}
