import * as React from "react"

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value, onValueChange, defaultValue, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '')
    const currentValue = value !== undefined ? value : internalValue

    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }

    return (
      <div
        ref={ref}
        className={className}
        data-value={currentValue}
        {...props}
      >
        {React.Children.map(children, child => {
          if (!React.isValidElement(child)) return child
          
          // Pass different props based on component type
          if (child.type === TabsList || child.props.role === 'tablist') {
            return React.cloneElement(child as any, { 
              value: currentValue,
              onValueChange: handleValueChange,
              'data-value': currentValue
            })
          }
          
          // For TabsContent, just pass the current value
          if (child.type === TabsContent || child.props.role === 'tabpanel') {
            return React.cloneElement(child as any, {
              'data-value': currentValue
            })
          }
          
          return child
        })}
      </div>
    )
  }
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: string; onValueChange?: (value: string) => void; 'data-value'?: string }
>(({ className, children, value, onValueChange, ...props }, ref) => {
  // Use either the direct value prop or the data-value from parent
  const currentValue = value || props['data-value']
  
  return (
    <div
      ref={ref}
      role="tablist"
      className={`inline-flex h-10 items-center justify-center rounded-lg bg-gray-800/30 backdrop-blur-sm p-1 ${className || ''}`}
      {...props}
    >
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as any, { 'data-value': currentValue, onValueChange })
          : child
      )}
    </div>
  )
})
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; 'data-value'?: string; onValueChange?: (value: string) => void }
>(({ className, value, children, onValueChange, ...props }, ref) => {
  const isActive = props['data-value'] === value
  
  const handleClick = () => {
    onValueChange?.(value)
  }
  
  return (
    <button
      ref={ref}
      onClick={handleClick}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all capitalize ${
        isActive
          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
      } ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; 'data-value'?: string }
>(({ className, value, children, ...props }, ref) => {
  const dataValue = props['data-value']
  const isActive = dataValue === value
  
  return (
    <div
      ref={ref}
      role="tabpanel"
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isActive ? 'block' : 'hidden'
      } ${className || ''}`}
      data-state={isActive ? 'active' : 'inactive'}
      hidden={!isActive}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }