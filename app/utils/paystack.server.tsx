import { invariantResponse } from '@epic-web/invariant'
import { type BankAccount } from '@prisma/client'
import { z } from 'zod'
import { prisma } from './db.server'

const BankListSchema = z.object({
	data: z.array(
		z.object({
			code: z.string(),
			name: z.string(),
		}),
	),
})

export async function getBanks() {
	const response = await fetch(
		'https://api.paystack.co/bank?country=south%20africa',
		{
			headers: {
				'Content-Type': 'application/json',
			},
		},
	)

	if (!response.ok) {
		console.error(await response.text())
		throw new Error('Failed to retrieve banks list')
	}
	const json = await response.json()

	const result = BankListSchema.safeParse(json)
	invariantResponse(result.success, () => result.error?.issues.join('\n') ?? '')

	const banks = result.data.data

	return banks
}

const SubAccountSchema = z.object({
	data: z.object({
		subaccount_code: z.string(),
	}),
})

export async function addSubAccount(
	ownerEmail: string,
	account: BankAccount,
	percentage: number,
) {
	const response = await fetch('https://api.paystack.co/subaccount', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			business_name: account.businessName,
			settlement_bank: account.bank,
			account_number: account.accountNumber.toString(),
			percentage_charge: percentage,
			primary_contact_email: ownerEmail,
		}),
	})

	if (!response.ok) {
		console.error(await response.text())
		throw new Error('Failed to create subaccount')
	}
	const json = await response.json()

	const result = SubAccountSchema.safeParse(json)
	invariantResponse(result.success, () => result.error?.issues.join('\n') ?? '')

	const subAccountCode = result.data.data.subaccount_code

	await prisma.bankAccount.update({
		where: { id: account.id },
		data: { paystackSubAccount: subAccountCode },
	})

	return subAccountCode
}

const TransactionSchema = z.object({
	data: z.object({
		authorization_url: z.string(),
	}),
})

export async function startTransaction(
	amount: number,
	email: string,
	callbackUrl: string,
	supplierSubAccount: string,
	organiserSubAccount: string,
) {
	const response = await fetch(
		'https://api.paystack.co/transaction/initialize',
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				amount: amount * 100,
				email,
				callback_url: callbackUrl,
				split: {
					type: 'percentage',
					bearer_type: 'account',
					subaccounts: [
						{ subaccount: supplierSubAccount, share: 91 },
						{ subaccount: organiserSubAccount, share: 5 },
						// remaining 4% goes to GetFranki, minus paystack's fee
					],
				},
			}),
		},
	)

	if (!response.ok) {
		console.error(await response.text())
		throw new Error('Failed to initiate split payment')
	}
	const json = await response.json()

	const result = TransactionSchema.safeParse(json)
	invariantResponse(result.success, () => result.error?.issues.join('\n') ?? '')

	const { authorization_url } = result.data.data

	return authorization_url
}
