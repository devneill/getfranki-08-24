import * as AccordionPrimitive from '@radix-ui/react-accordion'
import * as React from 'react'

import { cn } from '#app/utils/misc.tsx'
import { Icon } from './icon'

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
	<AccordionPrimitive.Item
		ref={ref}
		className={cn('border-b border-muted-foreground/10', className)}
		{...props}
	/>
))
AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Header className="flex">
		<AccordionPrimitive.Trigger
			ref={ref}
			className={cn(
				'group flex flex-1 items-center justify-between py-5 font-semibold transition-all [&[data-state=open]>svg]:rotate-180',
				className,
			)}
			{...props}
		>
			<div className="group-data-[state=open]:text-primary">{children}</div>
			<Icon
				name="chevron-down"
				className="h-4 w-4 shrink-0 transition-transform duration-200"
			/>
		</AccordionPrimitive.Trigger>
	</AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Content
		ref={ref}
		className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm text-muted-foreground transition-all"
		{...props}
	>
		<div className={cn('pb-4 pt-0', className)}>{children}</div>
	</AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
