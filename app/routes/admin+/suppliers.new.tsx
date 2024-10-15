import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { prisma } from '#app/utils/db.server.js'
import { requireUserWithRole } from '#app/utils/permissions.server.js'
import { SupplierEditor } from './__supplier-editor.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserWithRole(request, 'admin')

	const locations = await prisma.location.findMany({
		select: { id: true, name: true },
	})
	const categories = await prisma.category.findMany({
		select: { id: true, name: true },
	})

	return json({ locations, categories })
}

export { action } from './__supplier-editor.server.tsx'

export default function SupplierNew() {
	const data = useLoaderData<typeof loader>()

	return (
		<SupplierEditor locations={data.locations} categories={data.categories} />
	)
}

// This tells the SEO plugin that this route should not be included in the sitemap.
export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}
