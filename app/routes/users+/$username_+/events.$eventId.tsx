import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	Link,
	useActionData,
	useLoaderData,
	type MetaFunction,
} from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { ErrorList } from '#app/components/forms.tsx'
import { Spacer } from '#app/components/spacer.js'
import { Badge } from '#app/components/ui/badge.js'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import {
	capitaliseFirstLetter,
	formatDate,
	getEventImgSrc,
	useIsPending,
} from '#app/utils/misc.tsx'
import { requireUserWithPermission } from '#app/utils/permissions.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import { userHasPermission, useOptionalUser } from '#app/utils/user.ts'
import { type loader as eventsLoader } from './events.tsx'

export async function loader({ params }: LoaderFunctionArgs) {
	const event = await prisma.event.findUnique({
		where: { id: params.eventId },
		select: {
			id: true,
			title: true,
			date: true,
			type: true,
			venue: true,
			capacity: true,
			budget: true,
			notes: true,
			ownerId: true,
			updatedAt: true,
			images: {
				select: {
					id: true,
					altText: true,
				},
			},
			bookings: {
				select: {
					id: true,
					supplier: { select: { username: true, name: true } },
					status: true,
				},
			},
		},
	})

	invariantResponse(event, 'Not found', { status: 404 })

	const date = new Date(event.updatedAt)
	const timeAgo = formatDistanceToNow(date)

	return json({
		event,
		timeAgo,
	})
}

const DeleteFormSchema = z.object({
	intent: z.enum(['delete-event', 'delete-booking']),
	id: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: DeleteFormSchema,
	})
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	let redirectUrl
	let deletedItem

	if (submission.value.intent === 'delete-booking') {
		console.log('deleting booking...')
		const { id: bookingId } = submission.value

		const booking = await prisma.booking.findFirst({
			select: {
				id: true,
				eventId: true,
				event: {
					select: { owner: { select: { id: true, username: true } } },
				},
			},
			where: { id: bookingId },
		})

		invariantResponse(booking, 'Not found', { status: 404 })

		const isOwner = booking.event.owner.id === userId
		await requireUserWithPermission(
			request,
			isOwner ? `delete:booking:own` : `delete:booking:any`,
		)

		const eventId = booking.eventId

		await prisma.booking.delete({ where: { id: booking.id } })

		deletedItem = 'booking'
		redirectUrl = `/users/${booking.event.owner.username}/events/${eventId}`
	}

	if (submission.value.intent === 'delete-event') {
		console.log('deleting event...')
		const { id: eventId } = submission.value

		const event = await prisma.event.findFirst({
			select: {
				id: true,
				ownerId: true,
				owner: { select: { username: true } },
			},
			where: { id: eventId },
		})
		invariantResponse(event, 'Not found', { status: 404 })

		const isOwner = event.ownerId === userId
		await requireUserWithPermission(
			request,
			isOwner ? `delete:event:own` : `delete:event:any`,
		)

		await prisma.event.delete({ where: { id: event.id } })

		deletedItem = 'event'
		redirectUrl = `/users/${event.owner.username}/events`
	}

	return redirectWithToast(redirectUrl ?? '', {
		type: 'success',
		title: 'Success',
		description: `Your ${deletedItem} has been deleted.`,
	})
}

export default function EventRoute() {
	const data = useLoaderData<typeof loader>()
	const user = useOptionalUser()
	const isOwner = user?.id === data.event.ownerId
	const canDeleteEvent = userHasPermission(
		user,
		isOwner ? `delete:event:own` : `delete:event:any`,
	)
	const canDeleteBooking = userHasPermission(
		user,
		isOwner ? `delete:booking:own` : `delete:booking:any`,
	)
	const displayBar = canDeleteEvent || isOwner

	return (
		<div className="absolute inset-0 flex flex-col px-10">
			<h2 className="mb-2 pt-12 text-h2 lg:mb-6">{data.event.title}</h2>
			<div className={`${displayBar ? 'pb-24' : 'pb-12'} overflow-y-auto`}>
				<ul className="flex flex-wrap gap-5 py-5">
					{data.event.images.map((image) => (
						<li key={image.id}>
							<a href={getEventImgSrc(image.id)}>
								<img
									src={getEventImgSrc(image.id)}
									alt={image.altText ?? ''}
									className="h-32 w-32 rounded-lg object-cover"
								/>
							</a>
						</li>
					))}
				</ul>
				<div className="flex flex-col gap-4">
					<div>
						<p className="text-h6">Date</p>
						<p className="whitespace-break-spaces text-sm md:text-lg">
							{formatDate(data.event.date ?? '')}
						</p>
					</div>
					<div>
						<p className="text-h6">Type</p>
						<p className="whitespace-break-spaces text-sm md:text-lg">
							{data.event.type}
						</p>
					</div>
					<div>
						<p className="text-h6">Venue</p>
						<p className="whitespace-break-spaces text-sm md:text-lg">
							{data.event.venue}
						</p>
					</div>
					<div>
						<p className="text-h6">Capacity</p>
						<p className="whitespace-break-spaces text-sm md:text-lg">
							{data.event.capacity}
						</p>
					</div>
					<div>
						<p className="text-h6">Budget</p>
						<p className="whitespace-break-spaces text-sm md:text-lg">
							{data.event.budget}
						</p>
					</div>
					<div>
						<p className="text-h6">Notes</p>
						<p className="whitespace-break-spaces text-sm md:text-lg">
							{data.event.notes}
						</p>
					</div>
				</div>
				<Spacer size="2xs" />

				<div className="mb-2 lg:mb-4">
					<div className="flex items-center justify-between border-b pb-4">
						<h2 className="text-h5">Suppliers</h2>
						<div className="flex justify-start">
							<Button asChild className="sm:min-w-36">
								<Link to={`/users`} prefetch="intent">
									<Icon name="plus" className="scale-125 max-sm:scale-150">
										<span className="max-sm:hidden">Add supplier</span>
									</Icon>
								</Link>
							</Button>
						</div>
					</div>
					<ul className="divide-y whitespace-break-spaces text-sm md:text-lg">
						{data.event.bookings.map((booking) => (
							<li
								key={booking.id}
								className="flex w-full items-center justify-between py-4"
							>
								<div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center">
									<Link
										to={`/users/${booking.supplier.username}`}
										prefetch="intent"
										className="justify-start"
									>
										{booking.supplier.name}
									</Link>
									<Badge
										variant={
											booking.status === 'paid' ? 'default' : `secondary`
										}
									>
										{capitaliseFirstLetter(booking.status ?? '')}
									</Badge>
								</div>
								<div className="flex gap-2">
									{booking.status === 'confirmed' ||
									booking.status === 'invoiced' ? (
										<Button asChild>
											<Link to={`/pay/${booking.id}`} prefetch="intent">
												Pay
											</Link>
										</Button>
									) : null}
									{canDeleteBooking && booking.status === 'pending' ? (
										<DeleteBooking id={booking.id} />
									) : null}
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
			{displayBar ? (
				<div className={floatingToolbarClassName}>
					<span className="text-sm text-foreground/90 max-[524px]:hidden">
						<Icon name="clock" className="scale-125">
							{data.timeAgo} ago
						</Icon>
					</span>
					<div className="grid flex-1 grid-cols-2 justify-end gap-2 min-[525px]:flex md:gap-4">
						{canDeleteEvent ? <DeleteEvent id={data.event.id} /> : null}
						<Button
							asChild
							className="min-[525px]:max-sm:aspect-square min-[525px]:max-sm:px-0"
						>
							<Link to="edit">
								<Icon name="pencil-1" className="scale-125 max-sm:scale-150">
									<span className="max-sm:hidden">Edit</span>
								</Icon>
							</Link>
						</Button>
					</div>
				</div>
			) : null}
		</div>
	)
}

export function DeleteBooking({ id }: { id: string }) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [form] = useForm({
		id: 'delete-booking',
		lastResult: actionData?.result,
		constraint: getZodConstraint(DeleteFormSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: DeleteFormSchema })
		},
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<input type="hidden" name="id" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value="delete-booking"
				variant="destructive"
				status={isPending ? 'pending' : (form?.status ?? 'idle')}
				disabled={isPending}
				className="sm:min-w-36"
			>
				<Icon name="trash" className="scale-125 max-sm:scale-150">
					<span className="hidden sm:block">Cancel</span>
				</Icon>
			</StatusButton>
			<ErrorList errors={form.errors} id={form.errorId} />
		</Form>
	)
}

export function DeleteEvent({ id }: { id: string }) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [form] = useForm({
		id: 'delete-event',
		lastResult: actionData?.result,
		constraint: getZodConstraint(DeleteFormSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: DeleteFormSchema })
		},
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<input type="hidden" name="id" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value="delete-event"
				variant="destructive"
				status={isPending ? 'pending' : (form.status ?? 'idle')}
				disabled={isPending}
				className="w-full max-sm:aspect-square max-sm:px-0"
			>
				<Icon name="trash" className="scale-125 max-sm:scale-150">
					<span className="hidden sm:block">Delete</span>
				</Icon>
			</StatusButton>
			<ErrorList errors={form.errors} id={form.errorId} />
		</Form>
	)
}

export const meta: MetaFunction<
	typeof loader,
	{ 'routes/users+/$username_+/events': typeof eventsLoader }
> = ({ data, params, matches }) => {
	const eventsMatch = matches.find(
		(m) => m.id === 'routes/users+/$username_+/events',
	)
	const displayName = eventsMatch?.data?.owner.name ?? params.username
	const eventTitle = data?.event.title ?? 'Event'
	const eventContentsSummary =
		data?.event.notes && data.event.notes.length > 100
			? data.event.notes.slice(0, 97) + '...'
			: 'No notes'
	return [
		{ title: `${eventTitle} | ${displayName}'s Events | GetFranki` },
		{
			name: 'description',
			notes: eventContentsSummary,
		},
	]
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				403: () => <p>You are not allowed to do that</p>,
				404: ({ params }) => (
					<p>No event with the id "{params.eventId}" exists</p>
				),
			}}
		/>
	)
}
