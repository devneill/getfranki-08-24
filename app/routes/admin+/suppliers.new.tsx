import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { prisma } from '#app/utils/db.server.js'
import { requireUserWithRole } from '#app/utils/permissions.server.js'
import { SupplierEditor } from './__supplier-editor.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserWithRole(request, 'admin')

	const categories = await prisma.category.findMany({
		select: { id: true, name: true },
	})

	return json({ categories })
}

export { action } from './__supplier-editor.server.tsx'

export default function SupplierNew() {
	const data = useLoaderData<typeof loader>()

	return <SupplierEditor categories={data.categories} />
}
