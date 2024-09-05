import { faker } from '@faker-js/faker'
import { HttpResponse, http, type HttpHandler } from 'msw'
import { requireHeader } from './utils.ts'

const { json } = HttpResponse

export const handlers: Array<HttpHandler> = [
	http.get(
		'https://api.paystack.co/bank?country=south%20africa?country=south%20africa',
		async ({ request }) => {
			requireHeader(request.headers, 'Content-Type')

			return json({
				data: [
					{ code: '632005', name: 'Absa Bank Limited, South Africa' },
					{ code: '410506', name: 'Access Bank South Africa' },
					{ code: '430000', name: 'African Bank Limited' },
					{ code: '800000', name: 'Albaraka Bank' },
					{ code: '888000', name: 'Bank Zero' },
					{ code: '462005', name: 'Bidvest Bank Limited' },
					{ code: '470010', name: 'Capitec Bank Limited' },
					{ code: '450105', name: 'Capitec Business' },
					{ code: '350005', name: 'CitiBank' },
					{ code: '679000', name: 'Discovery Bank Limited' },
					{ code: '591000', name: 'Finbond EPE' },
					{ code: '589000', name: 'Finbond Mutual Bank' },
					{ code: '250655', name: 'First National Bank' },
					{ code: '201419', name: 'FirstRand Bank' },
					{ code: '584000', name: 'Grindrod Bank' },
					{ code: '570226', name: 'HBZ Bank (Westville)' },
					{ code: '587000', name: 'HSBC South Africa' },
					{ code: '580105', name: 'Investec Bank Ltd' },
					{ code: '432000', name: 'JP Morgan South Africa' },
					{ code: '198765', name: 'Nedbank' },
					{ code: '585001', name: 'Olympus Mobile' },
					{ code: '261251', name: 'Rand Merchant Bank' },
					{ code: '222026', name: 'RMB Private Bank' },
					{ code: '683000', name: 'SASFIN Bank' },
					{ code: '351005', name: 'Société Générale South Africa' },
					{ code: '410105', name: 'South African Bank of Athens' },
					{ code: '051001', name: 'Standard Bank South Africa' },
					{ code: '730020', name: 'Standard Chartered Bank' },
					{ code: '678910', name: 'TymeBank' },
					{ code: '431010', name: 'Ubank Ltd' },
					{ code: '588000', name: 'VBS Mutual Bank' },
				],
			})
		},
	),
	http.post(`https://api.paystack.co/subaccount`, async ({ request }) => {
		requireHeader(request.headers, 'Authorization')

		return json({
			data: {
				subaccount_code: faker.string.uuid(),
			},
		})
	}),
	http.post(
		`https://api.paystack.co/transaction/initialize`,
		async ({ request }) => {
			requireHeader(request.headers, 'Authorization')

			return json({
				data: {
					authorization_url: `/fake-paystack-page`,
				},
			})
		},
	),
]
