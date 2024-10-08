import { exec } from 'child_process'
import { promisify } from 'util'
import { remember } from '@epic-web/remember'
import { PrismaClient } from '@prisma/client'
export * as sql from '@prisma/client/sql'
import chalk from 'chalk'

export const prisma = remember('prisma', () => {
	// NOTE: if you change anything in this function you'll need to restart
	// the dev server to see your changes.

	// Feel free to change this log threshold to something that makes sense for you
	const logThreshold = 20

	const client = new PrismaClient({
		log: [
			{ level: 'query', emit: 'event' },
			{ level: 'error', emit: 'stdout' },
			{ level: 'warn', emit: 'stdout' },
		],
	})
	client.$on('query', async (e) => {
		if (e.duration < logThreshold) return
		const color =
			e.duration < logThreshold * 1.1
				? 'green'
				: e.duration < logThreshold * 1.2
					? 'blue'
					: e.duration < logThreshold * 1.3
						? 'yellow'
						: e.duration < logThreshold * 1.4
							? 'redBright'
							: 'red'
		const dur = chalk[color](`${e.duration}ms`)
		console.info(`prisma:query - ${dur} - ${e.query}`)
	})
	void client.$connect()
	return client
})

const execAsync = promisify(exec)

export async function backupDB() {
	try {
		const { stdout, stderr } = await execAsync('./other/backup_db.sh')
		if (stderr) {
			console.error('Failed to create db backup:', stderr)
			throw new Error('DB Backup script encountered an error')
		}
		console.log('DB backup output:', stdout)
	} catch (error) {
		console.error('Failed to execute DB backup script:', error)
		throw error
	}
}

export async function restoreDB() {
	try {
		const { stdout, stderr } = await execAsync('./other/restore_db.sh')
		if (stderr) {
			console.error('Failed to restore db backup:', stderr)
			throw new Error('DB Restore script encountered an error')
		}
		console.log('DB restore output:', stdout)
	} catch (error) {
		console.error('Failed to execute DB restore script:', error)
		throw error
	}
}
