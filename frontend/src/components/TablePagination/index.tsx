import {
  Button,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui'
import { useDebounceCallback, useLocale } from '@/utils/hooks'

export function TablePagination({
  pagination,
  totalPages,
  changePagination,
  selectedCount = 0,
  totalCount,
}: {
  pagination: { current: number, pageSize: number }
  totalPages: number
  changePagination: (value: { current: number, pageSize: number }) => void
  selectedCount?: number
  totalCount: number
}) {
  const { t } = useLocale()

  const changePaginationCallback = useDebounceCallback((value: { current: number, pageSize: number }) => {
    changePagination(value)
  }, 50)

  return (
    <div className="flex justify-end py-2 max-md:flex-col gap-4">
      { selectedCount > 0 && (
        <span className="text-sm text-muted-foreground w-full">
          {t('component.pagination.selected', {
            selected: selectedCount,
            total: totalCount,
          })}
        </span>
      )}
      <div className="flex justify-end items-center gap-2 max-md:flex-wrap min-md:w-lg">
        <span className="text-sm text-muted-foreground text-center mr-2">
          {t('component.pagination.current', {
            current: pagination.current,
            total: totalPages,
          })}
        </span>
        <Select onValueChange={value => changePaginationCallback({ current: pagination.current, pageSize: Number(value) })}>
          <SelectTrigger>{pagination.pageSize}</SelectTrigger>
          <SelectContent align="center">
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <Pagination className="justify-end m-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  changePaginationCallback({
                    current: Math.max(pagination.current - 1, 1),
                    pageSize: pagination.pageSize,
                  })}
                variant="outline"
                aria-disabled={pagination.current <= 1}
                tabIndex={pagination.current <= 1 ? -1 : undefined}
                className={pagination.current <= 1 ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>

            {(() => {
              const maxVisiblePages = 5
              const startPage = Math.max(1, pagination.current - Math.floor(maxVisiblePages / 2))
              const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

              return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                const pageNumber = startPage + i
                return (
                  <PaginationItem key={pageNumber}>
                    <Button
                      variant={pagination.current === pageNumber ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => changePaginationCallback({ current: pageNumber, pageSize: pagination.pageSize })}
                    >
                      {pageNumber}
                    </Button>
                  </PaginationItem>
                )
              })
            })()}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  changePaginationCallback({
                    current: Math.max(pagination.current + 1, totalPages),
                    pageSize: pagination.pageSize,
                  })}
                variant="outline"
                aria-disabled={!(pagination.current < totalPages)}
                tabIndex={!(pagination.current < totalPages) ? -1 : undefined}
                className={
                  !(pagination.current < totalPages) ? 'pointer-events-none opacity-50' : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
