import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import { Wrench } from 'lucide-react'

export default function PlaceholderPage({ title }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-slate-100 text-slate-500 p-10 flex flex-col items-center justify-center text-center border border-dashed border-slate-300">
            <Wrench className="h-10 w-10 mb-3 text-slate-400" />
            <p className="text-base font-medium text-slate-600 mb-1">Module will be implemented in Phase 4.</p>
            <p className="text-sm text-slate-500">This section is currently under development.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
