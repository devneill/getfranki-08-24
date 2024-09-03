import {
	FormProvider,
	getFormProps,
	getTextareaProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type Booking } from '@prisma/client'
import { type SerializeFrom } from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import {
	ErrorList,
	SelectField,
	TextareaField,
} from '#app/components/forms.tsx'
import { Spacer } from '#app/components/spacer.js'
import { Button } from '#app/components/ui/button.tsx'
import { StatusButton } from '#app/components/ui/status-button.js'
import { cn, getUserImgSrc, useIsPending } from '#app/utils/misc.tsx'
import { userHasRole, useUser } from '#app/utils/user.js'
import { type loader, type action } from './__booking-editor.server'

const messageMinLength = 1
const messageMaxLength = 10000

export const BookingEditorSchema = z.object({
	id: z.string().optional(),
	eventId: z.string(),
	supplierId: z.string(),
	message: z.string().min(messageMinLength).max(messageMaxLength).optional(),
	status: z.enum(['pending', 'confirmed', 'declined']),
})

export function BookingEditor({
	booking,
}: {
	booking?: SerializeFrom<
		Pick<Booking, 'id' | 'eventId' | 'supplierId' | 'message' | 'status'>
	>
}) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const { user, events } = useLoaderData<typeof loader>()
	const userDisplayName = user.name ?? user.username

	const eventOptions = events.map((event) => ({
		value: event.id,
		name: event.title,
	}))
	const loggedInUser = useUser()
	const isSupplier = userHasRole(user, 'supplier')
	const isLoggedInOrganiser = userHasRole(loggedInUser, 'organiser')

	const [form, fields] = useForm({
		id: 'booking-editor',
		constraint: getZodConstraint(BookingEditorSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: BookingEditorSchema })
		},
		defaultValue: {
			...booking,
			eventId: booking?.eventId,
			supplierId: booking?.supplierId,
			message: booking?.message,
			status: booking?.status,
		},
		shouldRevalidate: 'onBlur',
	})

	if (!isSupplier) {
		return (
			<div className="container mb-20 mt-36 flex flex-col items-center justify-center">
				<p>This user is not a supplier and can't be booked.</p>
			</div>
		)
	}

	if (!isLoggedInOrganiser) {
		return (
			<div className="container mb-48 mt-36 flex flex-col items-center justify-center">
				<p>Log in as an organiser to book this supplier</p>
			</div>
		)
	}

	return (
		<div className="container mb-20 flex flex-col px-5 pt-20">
			<Spacer size="4xs" />

			<div className="container relative flex flex-col rounded-3xl bg-accent px-4 py-12 sm:p-12">
				<div className="relative w-52 self-center">
					<div className="absolute -top-40">
						<div className="relative">
							<img
								src={getUserImgSrc(user.image?.id)}
								alt={userDisplayName}
								className="h-52 w-52 rounded-full object-cover"
							/>
						</div>
					</div>
				</div>

				<Spacer size="sm" />
				<div className="flex flex-col items-center gap-4 sm:w-96">
					<div className="flex flex-col items-center justify-center gap-4">
						<h1 className="text-center text-h2">Request a booking</h1>
						<h2 className="text-center text-h4">{userDisplayName}</h2>
					</div>
				</div>
				<FormProvider context={form.context}>
					<Form
						method="POST"
						className="flex h-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden px-10 pb-28 pt-12"
						{...getFormProps(form)}
						encType="multipart/form-data"
					>
						{/*
						This hidden submit button is here to ensure that when the user hits
						"enter" on an input field, the primary form function is submitted
						rather than the first button in the form (which is delete/add image).
					*/}
						<button type="submit" className="hidden" />
						{booking ? (
							<input type="hidden" name="id" value={booking.id} />
						) : null}
						<div className="flex flex-col gap-1">
							<SelectField
								labelProps={{ children: 'Event' }}
								placeholder="Select an event"
								meta={fields.eventId}
								items={eventOptions}
								errors={fields.eventId.errors}
							/>
							<TextareaField
								labelProps={{ children: 'Message for supplier' }}
								textareaProps={{
									...getTextareaProps(fields.message, { ariaAttributes: true }),
								}}
								errors={fields.message.errors}
							/>
							<input hidden name="supplierId" readOnly value={user.id} />
							<input hidden name="status" readOnly value="pending" />
						</div>
						<ErrorList id={form.errorId} errors={form.errors} />
					</Form>
					<div className={cn(floatingToolbarClassName, 'bottom-3 rounded-2xl')}>
						<Button variant="destructive" {...form.reset.getButtonProps()}>
							Reset
						</Button>
						<StatusButton
							form={form.id}
							type="submit"
							disabled={isPending}
							status={isPending ? 'pending' : 'idle'}
						>
							Submit
						</StatusButton>
					</div>
				</FormProvider>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No booking with the id "{params.bookingId}" exists</p>
				),
			}}
		/>
	)
}
