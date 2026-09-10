import { useClerk } from '@clerk/clerk-react'
import { ConfirmDialog } from '@/components/confirm-dialog'

// 与 __root.tsx 中 ClerkProvider 的 afterSignOutUrl 保持一致（含部署 basepath）
const SIGN_IN_URL = `${import.meta.env.BASE_URL.replace(/\/+$/, '')}/sign-in`

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const clerk = useClerk()

  const handleSignOut = () => {
    void clerk.signOut({ redirectUrl: SIGN_IN_URL })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='退出登录'
      desc='确定要退出登录吗？您需要重新登录才能访问您的账户。'
      confirmText='退出登录'
      destructive
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
