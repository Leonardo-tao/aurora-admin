import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  /** 可选的已有标签，用于快速点选添加 */
  suggestions?: string[]
  placeholder?: string
  id?: string
  className?: string
}

/**
 * 标签输入组件：badge 列表 + 内联输入框。
 * Enter / 逗号确认添加，空输入时 Backspace 删除末尾标签，支持从建议中点选。
 */
export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = '输入标签后按回车添加',
  id,
  className,
}: TagInputProps) {
  const [input, setInput] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const addTag = React.useCallback(
    (raw: string) => {
      const tag = raw.trim().replace(/[,，]/g, '')
      if (!tag || value.includes(tag)) {
        setInput('')
        return
      }
      onChange([...value, tag])
      setInput('')
    },
    [value, onChange]
  )

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      e.preventDefault()
      removeTag(value[value.length - 1])
    }
  }

  const unusedSuggestions = suggestions.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  )

  return (
    <div className={cn('space-y-1.5', className)}>
      <div
        className={cn(
          'border-input bg-background ring-offset-background flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border px-3 py-1.5',
          'focus-within:ring-ring focus-within:ring-1 focus-within:ring-offset-1'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <Badge key={tag} variant='secondary' className='gap-1 pe-1'>
            {tag}
            <button
              type='button'
              aria-label={`移除标签 ${tag}`}
              className='hover:text-destructive rounded-full p-0.5'
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
            >
              <X className='size-3' />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          id={id}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={value.length === 0 ? placeholder : ''}
          className='placeholder:text-muted-foreground min-w-24 flex-1 border-0 bg-transparent text-sm outline-none'
        />
      </div>
      {unusedSuggestions.length > 0 && (
        <div className='flex flex-wrap items-center gap-1'>
          <span className='text-muted-foreground text-xs'>常用：</span>
          {unusedSuggestions.slice(0, 8).map((s) => (
            <Badge
              key={s}
              variant='outline'
              className='cursor-pointer text-xs font-normal'
              onClick={() => addTag(s)}
            >
              + {s}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
