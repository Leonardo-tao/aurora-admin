import { createFileRoute } from '@tanstack/react-router'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

// Clerk 会话加载完成后才放行；未登录重定向到 ClerkProvider 配置的
// signInUrl（已含部署 basepath），并携带 redirect_url 回跳参数。
export const Route = createFileRoute('/_authenticated')({
  component: () => (
    <>
      <SignedIn>
        <AuthenticatedLayout />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  ),
})
