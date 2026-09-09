import { createContext, useContext, useEffect, useState } from 'react'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

// 主色调类型
export type Accent =
    | 'zinc'
    | 'blue'
    | 'green'
    | 'violet'
    | 'orange'
    | 'rose'
    | 'cyan'

export const ACCENT_OPTIONS: {
    value: Accent
    label: string
    color: string
}[] = [
        { value: 'zinc', label: '石墨', color: '#71717a' },
        { value: 'blue', label: '海蓝', color: '#3b82f6' },
        { value: 'green', label: '翠绿', color: '#22c55e' },
        { value: 'violet', label: '紫罗兰', color: '#8b5cf6' },
        { value: 'orange', label: '橙黄', color: '#f97316' },
        { value: 'rose', label: '玫瑰', color: '#f43f5e' },
        { value: 'cyan', label: '青碧', color: '#06b6d4' },
    ]

const DEFAULT_ACCENT: Accent = 'zinc'
const ACCENT_COOKIE_NAME = 'vite-ui-accent'
const ACCENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type AccentProviderProps = {
    children: React.ReactNode
    defaultAccent?: Accent
    storageKey?: string
}

type AccentProviderState = {
    defaultAccent: Accent
    accent: Accent
    setAccent: (accent: Accent) => void
    resetAccent: () => void
}

const initialState: AccentProviderState = {
    defaultAccent: DEFAULT_ACCENT,
    accent: DEFAULT_ACCENT,
    setAccent: () => null,
    resetAccent: () => null,
}

const AccentContext = createContext<AccentProviderState>(initialState)

export function AccentProvider({
    children,
    defaultAccent = DEFAULT_ACCENT,
    storageKey = ACCENT_COOKIE_NAME,
    ...props
}: AccentProviderProps) {
    const [accent, _setAccent] = useState<Accent>(
        () => (getCookie(storageKey) as Accent) || defaultAccent
    )

    useEffect(() => {
        const root = window.document.documentElement

        // 移除所有主色类
        ACCENT_OPTIONS.forEach((opt) => {
            root.classList.remove(`accent-${opt.value}`)
        })

        // 添加当前主色类
        if (accent !== 'zinc') {
            root.classList.add(`accent-${accent}`)
        }
    }, [accent])

    const setAccent = (accent: Accent) => {
        setCookie(storageKey, accent, ACCENT_COOKIE_MAX_AGE)
        _setAccent(accent)
    }

    const resetAccent = () => {
        removeCookie(storageKey)
        _setAccent(DEFAULT_ACCENT)
    }

    const contextValue = {
        defaultAccent,
        accent,
        setAccent,
        resetAccent,
    }

    return (
        <AccentContext value={contextValue} {...props}>
            {children}
        </AccentContext>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAccent = () => {
    const context = useContext(AccentContext)

    if (!context)
        throw new Error('useAccent must be used within an AccentProvider')

    return context
}

