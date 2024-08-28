import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { EventEditor } from './__event-editor.tsx'

export { action } from './__event-editor.server.tsx'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const event = await prisma.event.findFirst({
		select: {
			id: true,
			title: true,
			notes: true,
			images: {
				select: {
					id: true,
					altText: true,
				},
			},
		},
		where: {
			id: params.eventId,
			ownerId: userId,
		},
	})
	invariantResponse(event, 'Not found', { status: 404 })
	return json({ event: event })
}

export default function EventEdit() {
	const data = useLoaderData<typeof loader>()

	return <EventEditor event={data.event} />
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No event with the id "{params.eventId}" exists</p>
				),
			}}
		/>
	)
}
