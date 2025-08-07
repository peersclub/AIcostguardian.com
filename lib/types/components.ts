import { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from 'react'
import { ProviderId, ProviderStatus } from './providers'

export interface BaseComponentProps {
  className?: string
  children?: ReactNode
  id?: string
  testId?: string
}

export interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number
}

export interface ErrorState {
  hasError: boolean
  error?: Error | string
  retry?: () => void
}

export interface CardProps extends BaseComponentProps, HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'elevated' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
  hoverable?: boolean
}

export interface ButtonProps extends BaseComponentProps, ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEsc?: boolean
  showCloseButton?: boolean
  footer?: ReactNode
}

export interface TableColumn<T = any> {
  key: string
  header: string | ReactNode
  accessor: string | ((row: T) => any)
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T, index: number) => ReactNode
}

export interface TableProps<T = any> extends BaseComponentProps {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  error?: ErrorState
  onRowClick?: (row: T, index: number) => void
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  emptyState?: ReactNode
  pagination?: PaginationProps
  selectable?: boolean
  onSelectionChange?: (selectedRows: T[]) => void
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

export interface ChartProps extends BaseComponentProps {
  data: any[]
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut'
  height?: number | string
  width?: number | string
  loading?: boolean
  error?: ErrorState
  options?: any
}

export interface StatCardProps extends BaseComponentProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down'
    label?: string
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
  loading?: boolean
}

export interface ProviderCardProps extends BaseComponentProps {
  providerId: ProviderId
  status: ProviderStatus
  onConnect?: () => void
  onDisconnect?: () => void
  onTest?: () => void
  showUsage?: boolean
  usage?: {
    tokens: number
    cost: number
    requests: number
  }
  isAdmin?: boolean
  compact?: boolean
}

export interface AlertProps extends BaseComponentProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  dismissible?: boolean
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  icon?: ReactNode
}

export interface FormFieldProps extends BaseComponentProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
}

export interface InputProps extends FormFieldProps, Omit<HTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  value?: string | number
  onChange?: (value: string) => void
  placeholder?: string
  icon?: ReactNode
  clearable?: boolean
  onClear?: () => void
}

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  icon?: ReactNode
  description?: string
}

export interface SelectProps extends FormFieldProps {
  value?: string | number
  onChange?: (value: string | number) => void
  options: SelectOption[]
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  multiple?: boolean
  loading?: boolean
}

export interface TabItem {
  key: string
  label: string
  icon?: ReactNode
  badge?: string | number
  disabled?: boolean
}

export interface TabsProps extends BaseComponentProps {
  items: TabItem[]
  activeKey: string
  onChange: (key: string) => void
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export interface TooltipProps extends BaseComponentProps {
  content: ReactNode
  placement?: 'top' | 'right' | 'bottom' | 'left'
  trigger?: 'hover' | 'click' | 'focus'
  delay?: number
  arrow?: boolean
}

export interface EmptyStateProps extends BaseComponentProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'error' | 'search'
}