import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithRole } from '#app/utils/permissions.server.js'
import { SupplierEditor } from './__supplier-editor.tsx'

export { action } from './__supplier-editor.server.tsx'

export async function loader({ params, request }: LoaderFunctionArgs) {
	await requireUserWithRole(request, 'admin')

	const user = await prisma.user.findFirst({
		select: {
			id: true,
			username: true,
			name: true,
			email: true,
			number: true,
			website: true,
			location: true,
			category: true,
			about: true,
			productImages: {
				select: {
					id: true,
					altText: true,
				},
			},
		},
		where: {
			username: params.username,
		},
	})
	invariantResponse(user, 'Not found', { status: 404 })

	const locations = await prisma.location.findMany({
		select: { id: true, name: true },
	})

	const categories = await prisma.category.findMany({
		select: { id: true, name: true },
	})

	return json({ locations, categories, user })
}

export default function SupplierEdit() {
	const data = useLoaderData<typeof loader>()

	return (
		<SupplierEditor
			locations={data.locations}
			categories={data.categories}
			user={data.user}
		/>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No supplier with the id "{params.username}" exists</p>
				),
			}}
		/>
	)
}
