import { z } from 'zod'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUser } from '@clerk/clerk-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  useUpdateUserProfile,
  useUserProfileQuery,
} from '../data/queries'

const profileFormSchema = z.object({
  bio: z
    .string()
    .max(160, '简介不能超过160个字符')
    .min(4, '简介至少需要4个字符'),
  urls: z
    .array(
      z.object({
        value: z.url('请输入有效的网址'),
      })
    )
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { isLoaded, user } = useUser()
  const profileQuery = useUserProfileQuery()
  const updateProfile = useUpdateUserProfile()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { bio: '', urls: [] },
    mode: 'onChange',
  })

  useEffect(() => {
    if (profileQuery.data) {
      form.reset({
        bio: profileQuery.data.bio,
        urls: profileQuery.data.urls,
      })
    }
  }, [profileQuery.data, form])

  const { fields, append } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          updateProfile.mutate({
            bio: data.bio,
            urls: data.urls ?? [],
          })
        )}
        className='space-y-8'
      >
        <FormItem>
          <FormLabel>用户名</FormLabel>
          <FormControl>
            <Input
              value={isLoaded ? (user?.username ?? '') : ''}
              placeholder='未设置'
              readOnly
              disabled
            />
          </FormControl>
          <FormDescription>
            用户名来自 Clerk 账户系统，如需修改请前往 Clerk 账户设置。
          </FormDescription>
        </FormItem>
        <FormItem>
          <FormLabel>邮箱</FormLabel>
          <FormControl>
            <Input
              value={isLoaded ? (user?.primaryEmailAddress?.emailAddress ?? '') : ''}
              placeholder='未绑定'
              readOnly
              disabled
            />
          </FormControl>
          <FormDescription>
            邮箱由 Clerk 账户系统管理，登录与通知均使用该地址。
          </FormDescription>
        </FormItem>
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>个人简介</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='简单介绍一下自己'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                您可以使用 <span>@提及</span> 来链接到其他用户和组织。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && 'sr-only')}>
                    网址
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && 'sr-only')}>
                    添加您的网站、博客或社交媒体链接。
                  </FormDescription>
                  <FormControl className={cn(index !== 0 && 'mt-1.5')}>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={() => append({ value: '' })}
          >
            添加网址
          </Button>
        </div>
        <Button
          type='submit'
          disabled={profileQuery.isPending || updateProfile.isPending}
        >
          {updateProfile.isPending ? '保存中...' : '更新资料'}
        </Button>
      </form>
    </Form>
  )
}
