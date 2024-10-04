import { invariant } from '@epic-web/invariant'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { restoreDB } from '#app/utils/db.server.js'

export async function action({ request }: ActionFunctionArgs) {
	const apiKey = request.headers.get('X-API-KEY')

	invariant(process.env.API_KEY, 'API_KEY must be set')

	if (apiKey !== process.env.API_KEY) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 })
	}
	try {
		await restoreDB()
		return json({ success: true, message: 'DB restored successfully' })
	} catch (error) {
		console.error('DB restoration failed:', error)
		return json(
			{ success: false, message: 'DB restoration failed' },
			{ status: 500 },
		)
	}
}
