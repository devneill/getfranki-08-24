import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type User, type Category } from '@prisma/client'
import { type MetaFunction, type SerializeFrom } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
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
import { useIsPending } from '#app/utils/misc.tsx'
import {
	UsernameSchema,
	NameSchema,
	EmailSchema,
	NumberSchema,
	WebsiteSchema,
	AboutSchema,
} from '#app/utils/user-validation.js'
import { type action } from './__supplier-editor.server'

export const SupplierEditorSchema = z.object({
	id: z.string().optional(),
	username: UsernameSchema,
	name: NameSchema,
	email: EmailSchema,
	number: NumberSchema.optional(),
	website: WebsiteSchema.optional(),
	categoryId: z.string(),
	about: AboutSchema,
})

export function SupplierEditor({
	categories,
	user,
}: {
	categories: Array<SerializeFrom<Pick<Category, 'id' | 'name'>>>
	user?: SerializeFrom<
		Pick<
			User,
			'id' | 'username' | 'name' | 'email' | 'number' | 'website' | 'about'
		> & {
			category: Array<Pick<Category, 'id' | 'name'>>
		}
	>
}) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const categoryOptions = categories.map((cat) => ({
		value: cat.id,
		name: cat.name,
	}))

	const [form, fields] = useForm({
		id: 'create-supplier-form',
		constraint: getZodConstraint(SupplierEditorSchema),
		defaultValue: {
			...user,
			categoryId: user?.category[0]?.id,
		},
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: SupplierEditorSchema })
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
					{user ? <input type="hidden" name="id" value={user.id} /> : null}
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

export const meta: MetaFunction = () => {
	return [{ title: 'Add new supplier to GetFranki' }]
}
