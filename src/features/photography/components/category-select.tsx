import * as React from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { NameCount } from '../data/types'

interface CategorySelectProps {
  value: string
  onChange: (category: string) => void
  categories: NameCount[]
  placeholder?: string
  className?: string
}

/**
 * 分类选择组件：可从已有分类中选择，也可直接输入创建新分类，
 * 选择"未分类"则清空分类。
 */
export function CategorySelect({
  value,
  onChange,
  categories,
  placeholder = '选择或输入新分类',
  className,
}: CategorySelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const select = (category: string) => {
    onChange(category)
    setSearch('')
    setOpen(false)
  }

  const trimmedSearch = search.trim()
  const canCreate =
    trimmedSearch.length > 0 &&
    !categories.some(
      (c) => c.name.toLowerCase() === trimmedSearch.toLowerCase()
    )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-full justify-between font-normal', className)}
        >
          <span className={cn(!value && 'text-muted-foreground')}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className='text-muted-foreground size-4 shrink-0' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-(--radix-popover-trigger-width) p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder='搜索或输入新分类…'
          />
          <CommandList>
            <CommandEmpty className='py-2 text-center text-sm'>
              {canCreate ? null : '无匹配分类'}
            </CommandEmpty>
            <CommandGroup>
              {categories
                .filter((c) =>
                  trimmedSearch
                    ? c.name.toLowerCase().includes(trimmedSearch.toLowerCase())
                    : true
                )
                .map((c) => (
                  <CommandItem
                    key={c.name}
                    value={c.name}
                    onSelect={() => select(c.name)}
                  >
                    <Check
                      className={cn(
                        'size-4',
                        value === c.name ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className='flex-1 truncate'>{c.name}</span>
                    <span className='text-muted-foreground text-xs'>
                      {c.count}
                    </span>
                  </CommandItem>
                ))}
              <CommandItem
                value='__uncategorized__'
                onSelect={() => select('')}
                className={trimmedSearch ? 'hidden' : undefined}
              >
                <Check
                  className={cn('size-4', !value ? 'opacity-100' : 'opacity-0')}
                />
                <span className='text-muted-foreground flex-1'>未分类</span>
              </CommandItem>
              {canCreate && (
                <CommandItem
                  value='__create__'
                  onSelect={() => select(trimmedSearch)}
                >
                  <Plus className='size-4' />
                  <span>
                    新建分类「<span className='font-medium'>{trimmedSearch}</span>」
                  </span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
