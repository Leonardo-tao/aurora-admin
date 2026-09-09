import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { type StatsResponse } from '@/features/photography/data/types'

export function Overview({ data }: { data?: StatsResponse }) {
  const chartData =
    data?.uploadsByDay.map((d) => ({
      name: d.date.slice(5), // MM-DD
      total: d.count,
    })) ?? []

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          direction='ltr'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
