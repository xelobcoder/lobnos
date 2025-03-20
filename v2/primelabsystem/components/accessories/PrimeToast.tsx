import { ToastContainer } from 'react-toastify'
import { cn } from '@/lib/utils'

export function PrimeToast() {
  return (
    <ToastContainer
      theme="colored"
      position="top-center"
      className={cn(
        "text-sm font-medium",
        "[&_.Toastify__toast]:rounded-md",
        "[&_.Toastify__toast-body]:items-start",
        "[&_.Toastify__toast]:p-4"
      )}
    />
  )
}
