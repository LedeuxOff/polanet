import * as React from 'react'
import * as SkeletonPrimitive from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SkeletonPrimitive.Slot
    ref={ref}
    className={cn('animate-pulse rounded-md bg-muted', className)}
    {...props}
  />
))
Skeleton.displayName = 'Skeleton'

export { Skeleton }
