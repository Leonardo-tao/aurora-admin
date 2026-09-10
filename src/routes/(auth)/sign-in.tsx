import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/clerk-react'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/(auth)/sign-in')({
  component: ClerkSignInPage,
})

// GitHub Pages 无服务端 rewrite，Clerk 子步骤（/factor-one 等）使用 hash routing
function ClerkSignInPage() {
  return (
    <div className='bg-background flex min-h-svh items-center justify-center p-4'>
      <SignIn
        routing='hash'
        fallback={<Skeleton className='h-[30rem] w-[25rem]' />}
      />
    </div>
  )
}
