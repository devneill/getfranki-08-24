import {
	FormProvider,
	getFormProps,
	getInputProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { ErrorList, Field, SelectField } from '#app/components/forms.tsx'
import { Spacer } from '#app/components/spacer.js'
import { StatusButton } from '#app/components/ui/status-button.js'
import { getUserImgSrc, useIsPending } from '#app/utils/misc.tsx'
import { userHasRole, useUser } from '#app/utils/user.js'
import {
	type action,
	type loader,
} from './bookings_.$bookingId_.pay.server.tsx'

export { loader, action } from './bookings_.$bookingId_.pay.server.tsx'

const amountMin = 200
const amountMax = 5_000_000

export const PaymentEditorSchema = z.object({
	bookingId: z.string().optional(),
	supplierBusinessName: z.string(),
	supplierBank: z.string(),
	supplierAccountNumber: z.string(),
	organiserBusinessName: z.string(),
	organiserBank: z.string(),
	organiserAccountNumber: z.string(),
	amount: z.number().min(amountMin).max(amountMax),
})

export default function BookingPayRoute() {
	const data = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const { booking, banks } = data
	const { supplier } = booking
	const supplierDisplayName = supplier.name ?? supplier.username
	const loggedInUser = useUser()
	const isLoggedInOrganiser = userHasRole(loggedInUser, 'organiser')

	const [form, fields] = useForm({
		id: 'payment-editor',
		constraint: getZodConstraint(PaymentEditorSchema),
		// @ts-expect-error - not sure about this, I suspect it's a bug in conform/remix
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: PaymentEditorSchema })
		},
		defaultValue: {
			supplierBusinessName: booking?.supplier?.bankAccount?.businessName,
			supplierBank: booking?.supplier?.bankAccount?.bank,
			supplierAccountNumber: booking?.supplier?.bankAccount?.accountNumber,
			organiserBusinessName: booking?.event?.owner?.bankAccount?.businessName,
			organiserBank: booking?.event?.owner?.bankAccount?.bank,
			organiserAccountNumber: booking?.event?.owner?.bankAccount?.accountNumber,
			amount: '',
		},
	})

	if (!isLoggedInOrganiser) {
		return (
			<div className="container mb-48 mt-36 flex flex-col items-center justify-center">
				<p>Log in as an organiser to pay this booking</p>
			</div>
		)
	}

	const bankOptions = banks.map((bank: { name: string; code: string }) => ({
		value: bank.code,
		name: bank.name,
	}))

	return (
		<div className="container mt-14 flex flex-col justify-center">
			<Spacer size="4xs" />

			<div className="container flex flex-col rounded-3xl bg-muted p-12">
				<div className="relative w-52 self-center">
					<div className="absolute -top-40">
						<img
							src={getUserImgSrc(supplier.image?.id)}
							alt={supplierDisplayName}
							className="h-52 w-52 rounded-full object-cover"
						/>
					</div>
				</div>

				<Spacer size="sm" />

				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-4">
						<h1 className="text-center text-h2">Make a payment</h1>
						<h2 className="text-center text-h4">{supplierDisplayName}</h2>
					</div>
					<div className="flex flex-col gap-4">
						<FormProvider context={form.context}>
							<Form
								method="post"
								className="flex h-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden px-2 pb-8 pt-12 md:self-center"
								{...getFormProps(form)}
							>
								<div className="flex flex-col gap-1">
									<div className="flex flex-col gap-10 md:flex md:flex-row">
										<div className="flex flex-col gap-1 md:w-72 lg:w-96">
											<h3 className="text-h6">Supplier bank details</h3>
											<Field
												labelProps={{ children: 'Business name' }}
												inputProps={{
													...getInputProps(fields.supplierBusinessName, {
														type: 'text',
														ariaAttributes: true,
													}),
												}}
												errors={fields.supplierBusinessName.errors}
											/>
											<SelectField
												labelProps={{ children: 'Bank' }}
												placeholder="Select supplier bank"
												meta={fields.supplierBank}
												items={bankOptions}
												errors={fields.supplierBank.errors}
											/>
											<Field
												labelProps={{ children: 'Account number' }}
												inputProps={{
													...getInputProps(fields.supplierAccountNumber, {
														type: 'text',
														ariaAttributes: true,
													}),
												}}
												errors={fields.supplierAccountNumber.errors}
											/>
										</div>
										<div className="flex flex-col gap-1 md:w-72 lg:w-96">
											<h3 className="text-h6">Organiser bank details</h3>
											<Field
												labelProps={{ children: 'Business name' }}
												inputProps={{
													...getInputProps(fields.organiserBusinessName, {
														type: 'text',
														ariaAttributes: true,
													}),
												}}
												errors={fields.organiserBusinessName.errors}
											/>
											<SelectField
												labelProps={{ children: 'Bank' }}
												placeholder="Select your bank"
												meta={fields.organiserBank}
												items={bankOptions}
												errors={fields.organiserBank.errors}
											/>
											<Field
												labelProps={{ children: 'Account number' }}
												inputProps={{
													...getInputProps(fields.organiserAccountNumber, {
														type: 'text',
														ariaAttributes: true,
													}),
												}}
												errors={fields.organiserAccountNumber.errors}
											/>
										</div>
									</div>
									<Field
										className="md:w-96 md:self-center"
										labelProps={{ children: 'Amount' }}
										inputProps={{
											...getInputProps(fields.amount, {
												type: 'text',
												ariaAttributes: true,
											}),
										}}
										errors={fields.amount.errors}
									/>
									<input hidden name="bookingId" readOnly value={booking.id} />
								</div>
								<ErrorList id={form.errorId} errors={form.errors} />
							</Form>
							<StatusButton
								className="w-72 self-center"
								form={form.id}
								type="submit"
								disabled={isPending}
								status={isPending ? 'pending' : 'idle'}
							>
								Pay
							</StatusButton>
						</FormProvider>
					</div>
				</div>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No booking with the id "{params.bookingId}" exists</p>
				),
			}}
		/>
	)
}
