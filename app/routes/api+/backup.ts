import { invariant } from '@epic-web/invariant'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { backupDB } from '#app/utils/db.server.js'

export async function action({ request }: ActionFunctionArgs) {
	const apiKey = request.headers.get('X-API-KEY')

	invariant(process.env.API_KEY, 'API_KEY must be set')

	if (apiKey !== process.env.API_KEY) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 })
	}
	try {
		await backupDB()
		return json({ success: true, message: 'Backup completed successfully' })
	} catch (error) {
		console.error('Backup failed:', error)
		return json({ success: false, message: 'Backup failed' }, { status: 500 })
	}
}
