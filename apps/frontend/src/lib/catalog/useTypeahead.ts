import { useMemo } from 'react'
import { fuzzyFilter } from './catalogIndex'

export function useTypeahead(options: string[], query: string): string[] {
  return useMemo(() => fuzzyFilter(options, query), [options, query])
}

