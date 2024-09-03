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
import { Badge } from '#app/components/ui/badge.js'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import {
	capitaliseFirstLetter,
	formatDate,
	useIsPending,
} from '#app/utils/misc.tsx'
import { requireUserWithPermission } from '#app/utils/permissions.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import { userHasPermission, useOptionalUser } from '#app/utils/user.ts'
import { Spacer } from '#app/components/spacer.js'

export async function loader({ params }: LoaderFunctionArgs) {
	const booking = await prisma.booking.findUnique({
		where: { id: params.bookingId },
		select: {
			id: true,
			updatedAt: true,
			message: true,
			status: true,
			supplierId: true,
			supplier: { select: { name: true } },
			event: {
				select: {
					title: true,
					owner: { select: { username: true, name: true } },
					date: true,
				},
			},
		},
	})

	invariantResponse(booking, 'Not found', { status: 404 })

	const date = new Date(booking.updatedAt)
	const timeAgo = formatDistanceToNow(date)

	return json({
		booking,
		timeAgo,
	})
}

const BookingResponseFormSchema = z.object({
	intent: z.enum(['decline-booking', 'confirm-booking']),
	bookingId: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: BookingResponseFormSchema,
	})
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { bookingId, intent } = submission.value

	const booking = await prisma.booking.findFirst({
		select: {
			id: true,
			supplierId: true,
			supplier: { select: { username: true } },
		},
		where: { id: bookingId },
	})
	invariantResponse(booking, 'Not found', { status: 404 })

	const isOwner = booking.supplierId === userId
	await requireUserWithPermission(
		request,
		isOwner ? `delete:booking:own` : `delete:booking:any`,
	)

	let toastDescription = ''

	if (intent === 'confirm-booking') {
		await prisma.booking.update({
			where: { id: booking.id },
			data: { status: 'confirmed' },
		})

		toastDescription = 'Your booking has been confirmed.'
	}

	if (intent === 'decline-booking') {
		await prisma.booking.update({
			where: { id: booking.id },
			data: { status: 'declined' },
		})

		toastDescription = 'Your booking has been declined.'
	}

	return redirectWithToast(
		`/users/${booking.supplier.username}/bookings/${booking.id}`,
		{
			type: 'success',
			title: 'Success',
			description: toastDescription,
		},
	)
}

export default function EventRoute() {
	const data = useLoaderData<typeof loader>()
	const user = useOptionalUser()
	const isOwner = user?.id === data.booking.supplierId
	const canUpdate = userHasPermission(
		user,
		isOwner ? `update:booking:own` : `update:booking:any`,
	)
	const displayBar = canUpdate || isOwner

	return (
		<div className="absolute inset-0 flex flex-col px-10">
			<h2 className="mb-2 pt-12 text-h2 lg:mb-6">{data.booking.event.title}</h2>
			<Spacer size="2xs" />

			<div className={`${displayBar ? 'pb-24' : 'pb-12'} overflow-y-auto`}>
				<div className="flex flex-col gap-8">
					<div className="flex flex-col gap-2">
						<p className="text-h6">Organiser</p>
						<Link
							to={`/users/${data.booking.event.owner.username}`}
							prefetch="intent"
						>
							{data.booking.event.owner.name}
						</Link>
					</div>
					<div className="flex flex-col gap-2">
						<p className="text-h6">Date</p>
						<p className="whitespace-break-spaces text-sm md:text-lg">
							{formatDate(data.booking.event.date ?? '')}
						</p>
					</div>
					<div className="flex flex-col gap-2">
						<p className="text-h6">Message</p>
						<p className="whitespace-break-spaces text-sm md:text-lg">
							{data.booking.message}
						</p>
					</div>
					<div className="flex flex-col items-start gap-2">
						<p className="text-h6">Status</p>
						<Badge>{capitaliseFirstLetter(data.booking.status ?? '')}</Badge>
					</div>
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
						{canUpdate ? (
							<BookingResponse
								id={data.booking.id}
								status={data.booking.status}
							/>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	)
}

export function BookingResponse({
	id,
	status,
}: {
	id: string
	status: string | null
}) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [form] = useForm({
		id: 'update-booking',
		lastResult: actionData?.result,
		constraint: getZodConstraint(BookingResponseFormSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: BookingResponseFormSchema })
		},
	})

	return (
		<Form method="POST" className="flex gap-2" {...getFormProps(form)}>
			<input type="hidden" name="bookingId" value={id} />
			{status !== 'confirmed' && status !== 'invoiced' ? (
				<StatusButton
					type="submit"
					name="intent"
					value="confirm-booking"
					status={isPending ? 'pending' : (form.status ?? 'idle')}
					disabled={isPending}
					className="w-full max-md:aspect-square max-md:px-0"
				>
					<Icon name="check" className="scale-125 max-md:scale-150">
						<span className="max-md:hidden">Confirm</span>
					</Icon>
				</StatusButton>
			) : null}
			{status === 'confirmed' ? (
				<Button asChild>
					<Link to={`/invoice/new/${id}`}>
						<Icon name="envelope-closed" className="scale-125 max-md:scale-150">
							<span className="max-md:hidden">Invoice</span>
						</Icon>
					</Link>
				</Button>
			) : null}
			{status !== 'invoiced' ? (
				<StatusButton
					type="submit"
					name="intent"
					value="decline-booking"
					variant="destructive"
					status={isPending ? 'pending' : (form.status ?? 'idle')}
					disabled={isPending}
					className="w-full max-md:aspect-square max-md:px-0"
				>
					<Icon name="cross-1" className="scale-125 max-md:scale-150">
						<span className="max-md:hidden">Decline</span>
					</Icon>
				</StatusButton>
			) : null}
			<ErrorList errors={form.errors} id={form.errorId} />
		</Form>
	)
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
	const displayName = data?.booking.supplier.name ?? params.username
	const bookingOwner = data?.booking.event.owner.name ?? 'Booking'

	return [{ title: `${bookingOwner} | ${displayName}'s Bookings | Get Franki` }]
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				403: () => <p>You are not allowed to do that</p>,
				404: ({ params }) => (
					<p>No booking with the id "{params.bookingId}" exists</p>
				),
			}}
		/>
	)
}
