import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'
import Button from '../components/common/Button'
import { Card } from '../components/common/Card'

export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="max-w-lg w-full text-center p-10 shadow-xl">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6">
          <Shield className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-7xl font-extrabold text-slate-900 mb-2 tracking-tight">403</h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Access Denied</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          You do not have permission to view this page.
          If you think this is a mistake, please contact your administrator.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={() => navigate('/dashboard', { replace: true })}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )
}
