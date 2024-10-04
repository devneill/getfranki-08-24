import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.js'
import {
	ErrorList,
	Field,
	SelectField,
	TextareaField,
} from '#app/components/forms.tsx'
import { Spacer } from '#app/components/spacer.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { requireUserWithRole } from '#app/utils/permissions.server.js'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import {
	AboutSchema,
	EmailSchema,
	NameSchema,
	NumberSchema,
	UsernameSchema,
	WebsiteSchema,
} from '#app/utils/user-validation.ts'

const CreateSupplierFormSchema = z.object({
	username: UsernameSchema,
	name: NameSchema,
	email: EmailSchema,
	number: NumberSchema.optional(),
	website: WebsiteSchema.optional(),
	categoryId: z.string(),
	about: AboutSchema,
})

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserWithRole(request, 'admin')

	const categories = await prisma.category.findMany({
		select: { id: true, name: true },
	})

	return json({ categories })
}

export async function action({ request }: ActionFunctionArgs) {
	await requireUserWithRole(request, 'admin')

	const formData = await request.formData()
	const submission = await parseWithZod(formData, {
		schema: () =>
			CreateSupplierFormSchema.superRefine(async (data, ctx) => {
				const existingUser = await prisma.user.findFirst({
					where: {
						OR: [
							{ username: data.username },
							{ email: data.email },
							{ number: data.number },
						],
					},
					select: { username: true, email: true, number: true },
				})

				if (existingUser?.username === data.username) {
					ctx.addIssue({
						path: ['username'],
						code: z.ZodIssueCode.custom,
						message: 'A user already exists with this username',
					})
					return
				}
				if (existingUser?.email === data.email) {
					ctx.addIssue({
						path: ['email'],
						code: z.ZodIssueCode.custom,
						message: 'A user already exists with this email',
					})
					return
				}
				if (existingUser?.number && existingUser.number === data.number) {
					ctx.addIssue({
						path: ['number'],
						code: z.ZodIssueCode.custom,
						message: 'A user already exists with this number',
					})
					return
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

	const { username, name, email, number, website, about, categoryId } =
		submission.value

	const role = await prisma.role.findUnique({
		where: { name: 'supplier' },
		select: { id: true },
	})

	await prisma.user.create({
		data: {
			username,
			name,
			email,
			number,
			website,
			about,
			category: { connect: { id: categoryId } },
			roles: { connect: { id: role?.id } },
		},
	})

	return redirectWithToast(`/admin/suppliers/${username}/photo`, {
		title: 'Supplier created',
		description: `Thanks for adding ${username} as a supplier!`,
	})
}

export const meta: MetaFunction = () => {
	return [{ title: 'Add new supplier to GetFranki' }]
}

export default function CreateSupplierRoute() {
	const data = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const categoryOptions = data.categories.map((cat) => ({
		value: cat.id,
		name: cat.name,
	}))

	const [form, fields] = useForm({
		id: 'create-supplier-form',
		constraint: getZodConstraint(CreateSupplierFormSchema),
		defaultValue: {},
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: CreateSupplierFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="mx-auto w-full max-w-lg">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Add supplier</h1>
					<p className="text-body-md text-muted-foreground">
						This will add them to our supplier directory.
					</p>
				</div>
				<Spacer size="xs" />
				<Form
					method="POST"
					className="mx-auto min-w-full max-w-sm sm:min-w-[368px]"
					{...getFormProps(form)}
				>
					<Field
						labelProps={{ htmlFor: fields.username.id, children: 'Username' }}
						inputProps={{
							...getInputProps(fields.username, { type: 'text' }),
							autoComplete: 'username',
							className: 'lowercase',
						}}
						errors={fields.username.errors}
					/>
					<Field
						labelProps={{ htmlFor: fields.name.id, children: 'Name' }}
						inputProps={{
							...getInputProps(fields.name, { type: 'text' }),
							autoComplete: 'name',
						}}
						errors={fields.name.errors}
					/>
					<Field
						labelProps={{ htmlFor: fields.email.id, children: 'Email' }}
						inputProps={{
							...getInputProps(fields.email, { type: 'text' }),
							autoComplete: 'email',
							className: 'lowercase',
						}}
						errors={fields.email.errors}
					/>
					<Field
						labelProps={{ htmlFor: fields.number.id, children: 'Number' }}
						inputProps={{
							...getInputProps(fields.number, { type: 'text' }),
							autoComplete: 'number',
						}}
						errors={fields.number.errors}
					/>
					<Field
						labelProps={{ htmlFor: fields.website.id, children: 'Website' }}
						inputProps={{
							...getInputProps(fields.website, { type: 'text' }),
							autoComplete: 'website',
						}}
						errors={fields.website.errors}
					/>
					<SelectField
						labelProps={{ children: 'Category' }}
						placeholder="Select a category"
						meta={fields.categoryId}
						items={categoryOptions}
						errors={fields.categoryId.errors}
					/>
					<TextareaField
						labelProps={{ htmlFor: fields.about.id, children: 'About' }}
						textareaProps={{
							...getInputProps(fields.about, { type: 'text' }),
							autoComplete: 'about',
						}}
						errors={fields.about.errors}
					/>
					<ErrorList errors={form.errors} id={form.errorId} />
					<div className="flex items-center justify-between gap-6">
						<StatusButton
							className="w-full"
							status={isPending ? 'pending' : (form.status ?? 'idle')}
							type="submit"
							disabled={isPending}
						>
							Add Supplier
						</StatusButton>
					</div>
				</Form>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				403: ({ error }) => (
					<p>You are not allowed to do that. {error?.data.message}</p>
				),
			}}
		/>
	)
}
