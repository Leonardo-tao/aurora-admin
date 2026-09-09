import * as React from 'react'

/** 延迟返回最新值（用于搜索输入防抖） */
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = React.useState(value)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
