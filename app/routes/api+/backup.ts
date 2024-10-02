import { invariant } from '@epic-web/invariant'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { backupDatabase } from '#app/utils/db.server.js'

export async function action({ request }: ActionFunctionArgs) {
	const apiKey = request.headers.get('X-API-KEY')

	invariant(process.env.BACKUP_API_KEY, 'BACKUP_API_KEY must be set')

	if (apiKey !== process.env.BACKUP_API_KEY) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 })
	}

	try {
		await backupDatabase()
		return json({ success: true, message: 'Backup completed successfully' })
	} catch (error) {
		console.error('Backup failed:', error)
		return json({ success: false, message: 'Backup failed' }, { status: 500 })
	}
}
