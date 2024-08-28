import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
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
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { getEventImgSrc, useIsPending } from '#app/utils/misc.tsx'
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
			notes: true,
			ownerId: true,
			updatedAt: true,
			images: {
				select: {
					id: true,
					altText: true,
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
	intent: z.literal('delete-event'),
	eventId: z.string(),
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

	const { eventId } = submission.value

	const event = await prisma.event.findFirst({
		select: { id: true, ownerId: true, owner: { select: { username: true } } },
		where: { id: eventId },
	})
	invariantResponse(event, 'Not found', { status: 404 })

	const isOwner = event.ownerId === userId
	await requireUserWithPermission(
		request,
		isOwner ? `delete:event:own` : `delete:event:any`,
	)

	await prisma.event.delete({ where: { id: event.id } })

	return redirectWithToast(`/users/${event.owner.username}/events`, {
		type: 'success',
		title: 'Success',
		description: 'Your event has been deleted.',
	})
}

export default function EventRoute() {
	const data = useLoaderData<typeof loader>()
	const user = useOptionalUser()
	const isOwner = user?.id === data.event.ownerId
	const canDelete = userHasPermission(
		user,
		isOwner ? `delete:event:own` : `delete:event:any`,
	)
	const displayBar = canDelete || isOwner

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
				<p className="whitespace-break-spaces text-sm md:text-lg">
					{data.event.notes}
				</p>
			</div>
			{displayBar ? (
				<div className={floatingToolbarClassName}>
					<span className="text-sm text-foreground/90 max-[524px]:hidden">
						<Icon name="clock" className="scale-125">
							{data.timeAgo} ago
						</Icon>
					</span>
					<div className="grid flex-1 grid-cols-2 justify-end gap-2 min-[525px]:flex md:gap-4">
						{canDelete ? <DeleteEvent id={data.event.id} /> : null}
						<Button
							asChild
							className="min-[525px]:max-md:aspect-square min-[525px]:max-md:px-0"
						>
							<Link to="edit">
								<Icon name="pencil-1" className="scale-125 max-md:scale-150">
									<span className="max-md:hidden">Edit</span>
								</Icon>
							</Link>
						</Button>
					</div>
				</div>
			) : null}
		</div>
	)
}

export function DeleteEvent({ id }: { id: string }) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [form] = useForm({
		id: 'delete-event',
		lastResult: actionData?.result,
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<input type="hidden" name="eventId" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value="delete-event"
				variant="destructive"
				status={isPending ? 'pending' : (form.status ?? 'idle')}
				disabled={isPending}
				className="w-full max-md:aspect-square max-md:px-0"
			>
				<Icon name="trash" className="scale-125 max-md:scale-150">
					<span className="max-md:hidden">Delete</span>
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
