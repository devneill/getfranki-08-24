import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { json, redirect } from '@remix-run/react'
import { z } from 'zod'
import { prisma } from '#app/utils/db.server.js'
import { getDomainUrl } from '#app/utils/misc.js'
import {
	addSubAccount,
	getBanks,
	startTransaction,
} from '#app/utils/paystack.server.js'
import { PaymentEditorSchema } from './bookings_.$bookingId_.pay'

export async function loader({ params }: LoaderFunctionArgs) {
	const booking = await prisma.booking.findUnique({
		where: { id: params.bookingId },
		select: {
			id: true,
			event: {
				select: {
					id: true,
					owner: {
						select: {
							bankAccount: {
								select: {
									businessName: true,
									bank: true,
									accountNumber: true,
								},
							},
						},
					},
				},
			},
			supplier: {
				select: {
					name: true,
					username: true,
					image: { select: { id: true } },
					bankAccount: {
						select: {
							businessName: true,
							bank: true,
							accountNumber: true,
						},
					},
				},
			},
		},
	})

	invariantResponse(booking, 'Booking not found', { status: 404 })

	const banks = await getBanks()

	return {
		booking,
		banks,
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema: PaymentEditorSchema.superRefine(async (data, ctx) => {
			if (!data.bookingId) return

			const booking = await prisma.booking.findUnique({
				where: { id: data.bookingId },
				select: {
					id: true,
				},
			})

			if (!booking) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Booking not found',
				})
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
		bookingId,
		supplierBusinessName,
		supplierBank,
		supplierAccountNumber,
		organiserBusinessName,
		organiserBank,
		organiserAccountNumber,
		amount,
	} = submission.value

	const booking = await prisma.booking.findFirst({
		where: { id: bookingId },
		select: {
			id: true,
			event: {
				select: {
					id: true,
					owner: {
						select: {
							id: true,
							email: true,
							username: true,
							bankAccount: { select: { id: true, paystackSubAccount: true } },
						},
					},
				},
			},
			supplier: {
				select: {
					id: true,
					email: true,
					bankAccount: {
						select: {
							id: true,
							bank: true,
							businessName: true,
							accountNumber: true,
							paystackSubAccount: true,
						},
					},
				},
			},
		},
	})

	if (!booking) {
		return json({ status: 'error', submission } as const, { status: 400 })
	}

	const {
		supplier,
		event: { owner: organiser },
	} = booking

	// TODO: Create real payment success page that saves payment details to db
	const domain = getDomainUrl(request)
	const callbackUrl = `${domain}/users/${organiser.username}/events/${booking.event.id}`

	const supplierBankAccount = await upsertBankAccount(
		supplierBusinessName,
		supplierBank,
		supplierAccountNumber,
		supplier.id,
		supplier.bankAccount?.id,
	)

	// create supplier subaccount if needed
	if (!supplierBankAccount.paystackSubAccount) {
		supplierBankAccount.paystackSubAccount = await addSubAccount(
			supplier.email,
			supplierBankAccount,
			91,
		)
	}

	console.log({ subaccount: supplierBankAccount.paystackSubAccount })

	const organiserBankAccount = await upsertBankAccount(
		organiserBusinessName,
		organiserBank,
		organiserAccountNumber,
		organiser.id,
		organiser.bankAccount?.id,
	)

	// create organiser subaccount if needed
	if (!organiserBankAccount?.paystackSubAccount) {
		organiserBankAccount.paystackSubAccount = await addSubAccount(
			organiser.email,
			organiserBankAccount,
			5,
		)
	}

	// initiate split payment
	const transactionAuthUrl = await startTransaction(
		amount,
		organiser.email,
		callbackUrl,
		supplierBankAccount.paystackSubAccount,
		organiserBankAccount.paystackSubAccount,
	)

	// update booking status
	await prisma.booking.update({
		where: { id: booking.id },
		data: { status: 'paid' },
	})

	return redirect(transactionAuthUrl)
}

async function upsertBankAccount(
	businessName: string,
	bank: string,
	accountNumber: bigint,
	ownerId: string,
	id?: string,
) {
	return await prisma.$transaction(async ($prisma) => {
		return await $prisma.bankAccount.upsert({
			where: { id: id ?? '__new_account__' },
			update: {
				businessName,
				bank,
				accountNumber,
			},
			create: {
				businessName,
				bank,
				accountNumber,
				ownerId,
			},
		})
	})
}
