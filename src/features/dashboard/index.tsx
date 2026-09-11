import { Link } from '@tanstack/react-router'
import { Camera, Images, Star, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useStatsQuery } from '@/features/photography/data/queries'
import { Overview } from './components/overview'
import { RecentPhotos } from './components/recent-photos'

export function Dashboard() {
  const { data: stats, isLoading } = useStatsQuery()

  const recent30 =
    stats?.uploadsByDay.slice(-30).reduce((acc, d) => acc + d.count, 0) ?? 0

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main fluid className='py-0'>
        <div className='py-6'>
          <div className='mx-auto w-full max-w-7xl'>
            <div className='mb-2 flex items-center justify-between space-y-2'>
              <h1 className='text-2xl font-bold tracking-tight'>摄影概览</h1>
              <div className='flex items-center space-x-2'>
                <Button asChild>
                  <Link to='/photos'>管理作品</Link>
                </Button>
              </div>
            </div>

            {/* 统计卡片 */}
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    作品总数
                  </CardTitle>
                  <Images className='text-muted-foreground size-4' />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className='h-8 w-16' />
                  ) : (
                    <div className='text-2xl font-bold'>
                      {stats?.total ?? 0}
                    </div>
                  )}
                  <p className='text-muted-foreground text-xs'>
                    R2 原图 + 元数据
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    精选作品
                  </CardTitle>
                  <Star className='size-4 fill-amber-400 text-amber-400' />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className='h-8 w-16' />
                  ) : (
                    <div className='text-2xl font-bold'>
                      {stats?.featured ?? 0}
                    </div>
                  )}
                  <p className='text-muted-foreground text-xs'>
                    展示在首页精选区
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    分类数量
                  </CardTitle>
                  <Camera className='text-muted-foreground size-4' />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className='h-8 w-16' />
                  ) : (
                    <div className='text-2xl font-bold'>
                      {stats?.categories.length ?? 0}
                    </div>
                  )}
                  <div className='mt-1 flex flex-wrap gap-1'>
                    {stats?.categories.slice(0, 4).map((c) => (
                      <Badge
                        key={c.name}
                        variant='secondary'
                        className='font-normal'
                      >
                        {c.name} {c.count}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    近 30 天上传
                  </CardTitle>
                  <TrendingUp className='text-muted-foreground size-4' />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className='h-8 w-16' />
                  ) : (
                    <div className='text-2xl font-bold'>{recent30}</div>
                  )}
                  <p className='text-muted-foreground text-xs'>
                    按入库时间统计
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 上传趋势 */}
            <Card className='mt-4'>
              <CardHeader>
                <CardTitle>上传趋势</CardTitle>
                <CardDescription>最近 30 天作品入库数量</CardDescription>
              </CardHeader>
              <CardContent className='ps-2'>
                <Overview data={stats} />
              </CardContent>
            </Card>

            {/* 最新作品 */}
            <Card className='mt-4'>
              <CardHeader>
                <CardTitle>最新上传</CardTitle>
                <CardDescription>
                  缩略图经 Cloudflare Transformations 转为 webp（无
                  EXIF）；下载原图保留完整 EXIF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentPhotos />
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
