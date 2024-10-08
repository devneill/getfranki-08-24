import { Form, useSearchParams, useSubmit } from '@remix-run/react'
import { useId, useRef, useState } from 'react'
import { useDebounce, useIsPending } from '#app/utils/misc.tsx'
import { Icon } from './ui/icon.tsx'
import { Input } from './ui/input.tsx'
import { Label } from './ui/label.tsx'
import { StatusButton } from './ui/status-button.tsx'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group.tsx'

export function SearchBar({
	status,
	autoFocus = false,
	autoSubmit = false,
	categories,
}: {
	status: 'idle' | 'pending' | 'success' | 'error'
	autoFocus?: boolean
	autoSubmit?: boolean
	categories: { name: string }[]
}) {
	const id = useId()
	const [searchParams] = useSearchParams()
	const submit = useSubmit()
	const isSubmitting = useIsPending({
		formMethod: 'GET',
		formAction: '/',
	})

	const [category, setCategory] = useState(searchParams.get('category') ?? '')
	const formRef = useRef<HTMLFormElement>(null)

	const handleFormChange = useDebounce((form: HTMLFormElement) => {
		submit(form)
	}, 400)

	return (
		<Form
			ref={formRef}
			method="GET"
			action="/"
			className="flex flex-wrap items-center justify-center gap-2"
			onChange={(e) => autoSubmit && handleFormChange(e.currentTarget)}
		>
			<div className="flex-1">
				<Label htmlFor={id} className="sr-only">
					Search
				</Label>
				<Input
					type="search"
					name="search"
					id={id}
					defaultValue={searchParams.get('search') ?? ''}
					placeholder="Search"
					className="w-full"
					autoFocus={autoFocus}
				/>
			</div>
			<div>
				<StatusButton
					type="submit"
					status={isSubmitting ? 'pending' : status}
					className="flex w-full items-center justify-center"
				>
					<Icon name="magnifying-glass" size="md" />
					<span className="sr-only">Search</span>
				</StatusButton>
			</div>
			<input type="hidden" name="category" value={category} />
			<ToggleGroup
				type="single"
				value={category}
				onValueChange={(value) => {
					setCategory(value)
					if (autoSubmit && formRef.current) {
						handleFormChange(formRef.current)
					}
				}}
				className="flex flex-wrap"
			>
				{categories.map((category) => {
					return (
						<ToggleGroupItem
							key={category.name}
							value={category.name}
							aria-label={`Toggle ${category.name}`}
						>
							{category.name}
						</ToggleGroupItem>
					)
				})}
			</ToggleGroup>
		</Form>
	)
}
