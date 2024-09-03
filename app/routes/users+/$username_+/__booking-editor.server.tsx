import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { z } from 'zod'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.js'
import { BookingEditorSchema } from './__booking-editor'

export async function loader({ params, request }: LoaderFunctionArgs) {
	await requireUserId(request)

	const user = await prisma.user.findFirst({
		select: {
			id: true,
			name: true,
			username: true,
			image: { select: { id: true } },
			roles: { select: { name: true, permissions: true } },
		},
		where: {
			username: params.username,
		},
	})
	invariantResponse(user, 'User not found', { status: 404 })

	const sessionUserId = await requireUserId(request)
	const events = await prisma.event.findMany({
		select: {
			id: true,
			title: true,
		},
		where: {
			ownerId: sessionUserId,
		},
	})

	return json({ user, events })
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema: BookingEditorSchema.superRefine(async (data, ctx) => {
			if (!data.id) return

			const booking = await prisma.booking.findUnique({
				select: { id: true },
				where: { id: data.id },
			})
			if (!booking) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Booking not found',
				})
			}
		}).transform(async ({ ...data }) => {
			return {
				...data,
			}
		}),
		async: true,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const {
		id: bookingId,
		eventId,
		supplierId,
		message,
		status,
	} = submission.value

	const updatedBooking = await prisma.booking.upsert({
		select: {
			id: true,
			event: { select: { owner: { select: { username: true } }, id: true } },
		},
		where: { id: bookingId ?? '__new_booking' },
		create: {
			eventId,
			supplierId,
			message,
			status,
		},
		update: {
			message,
			status,
		},
	})

	return redirectWithToast(
		`/users/${updatedBooking.event.owner.username}/events/${updatedBooking.event.id}`,
		{
			description: bookingId ? 'Booking updated' : 'Booking requested',
		},
	)
}
