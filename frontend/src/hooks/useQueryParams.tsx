import { useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'

export default function useQueryParams(): Readonly<Record<string, string>> {
  const [searchParams] = useSearchParams()
  return useMemo(() => Object.fromEntries([...searchParams]), [searchParams])
}
