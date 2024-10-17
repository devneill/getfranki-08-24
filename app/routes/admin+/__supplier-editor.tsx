import {
	type FieldMetadata,
	getFieldsetProps,
	getFormProps,
	getInputProps,
	getTextareaProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type User, type Category, type ProductImage } from '@prisma/client'
import { type MetaFunction, type SerializeFrom } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { useState } from 'react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.js'
import {
	ErrorList,
	Field,
	SelectField,
	TextareaField,
} from '#app/components/forms.tsx'
import { Spacer } from '#app/components/spacer.tsx'
import { Button } from '#app/components/ui/button.js'
import { Icon } from '#app/components/ui/icon.js'
import { Label } from '#app/components/ui/label.js'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { Textarea } from '#app/components/ui/textarea.js'
import { cn, getProductImgSrc, useIsPending } from '#app/utils/misc.tsx'
import {
	UsernameSchema,
	NameSchema,
	EmailSchema,
	NumberSchema,
	WebsiteSchema,
	AboutSchema,
} from '#app/utils/user-validation.js'
import { type action } from './__supplier-editor.server'

export const MAX_UPLOAD_SIZE = 1024 * 1024 * 6 // 6MB

const ImageFieldsetSchema = z.object({
	id: z.string().optional(),
	file: z
		.instanceof(File)
		.optional()
		.refine((file) => {
			return !file || file.size <= MAX_UPLOAD_SIZE
		}, 'File size must be less than 6MB'),
	altText: z.string().optional(),
})

export type ImageFieldset = z.infer<typeof ImageFieldsetSchema>

export const SupplierEditorSchema = z.object({
	id: z.string().optional(),
	username: UsernameSchema,
	name: NameSchema,
	email: EmailSchema,
	number: NumberSchema.optional(),
	website: WebsiteSchema.optional(),
	categoryId: z.string(),
	locationId: z.string(),
	about: AboutSchema,
	productImages: z.array(ImageFieldsetSchema).max(5).optional(),
})

export function SupplierEditor({
	categories,
	locations,
	user,
}: {
	locations: Array<SerializeFrom<Pick<Category, 'id' | 'name'>>>
	categories: Array<SerializeFrom<Pick<Category, 'id' | 'name'>>>
	user?: SerializeFrom<
		Pick<
			User,
			'id' | 'username' | 'name' | 'email' | 'number' | 'website' | 'about'
		> & {
			location: Array<Pick<Category, 'id' | 'name'>>
			category: Array<Pick<Category, 'id' | 'name'>>
			productImages: Array<Pick<ProductImage, 'id' | 'altText'>>
		}
	>
}) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const locationOptions = locations.map((loc) => ({
		value: loc.id,
		name: loc.name,
	}))
	const categoryOptions = categories.map((cat) => ({
		value: cat.id,
		name: cat.name,
	}))

	const [form, fields] = useForm({
		id: 'create-supplier-form',
		constraint: getZodConstraint(SupplierEditorSchema),
		defaultValue: {
			...user,
			locationId: user?.location[0]?.id,
			categoryId: user?.category[0]?.id,
			productImages: user?.productImages ?? [{}],
		},
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: SupplierEditorSchema })
		},
		shouldRevalidate: 'onBlur',
	})
	const imageList = fields.productImages.getFieldList()

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
					encType="multipart/form-data"
				>
					{/*
				This hidden submit button is here to ensure that when the user hits
				"enter" on an input field, the primary form function is submitted
				rather than the first button in the form (which is delete/add image).
			*/}
					<button type="submit" className="hidden" />
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
						labelProps={{ children: 'Location' }}
						placeholder="Select a location"
						meta={fields.locationId}
						items={locationOptions}
						errors={fields.locationId.errors}
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
					<div className="mb-8 rounded-lg bg-muted p-6">
						<div>
							<Label>Images</Label>
							<ul className="flex flex-col gap-4">
								{imageList.map((image, index) => {
									return (
										<li
											key={image.key}
											className="relative border-b-2 border-muted-foreground"
										>
											<button
												className="absolute right-0 top-0 text-foreground-destructive"
												{...form.remove.getButtonProps({
													name: fields.productImages.name,
													index,
												})}
											>
												<span aria-hidden>
													<Icon name="cross-1" />
												</span>{' '}
												<span className="sr-only">
													Remove image {index + 1}
												</span>
											</button>
											<ImageChooser meta={image} />
										</li>
									)
								})}
							</ul>
						</div>
						<Button
							className="mt-3"
							{...form.insert.getButtonProps({
								name: fields.productImages.name,
							})}
						>
							<span aria-hidden>
								<Icon name="plus">Image</Icon>
							</span>{' '}
							<span className="sr-only">Add image</span>
						</Button>
					</div>
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

function ImageChooser({ meta }: { meta: FieldMetadata<ImageFieldset> }) {
	const fields = meta.getFieldset()
	const existingImage = Boolean(fields.id.initialValue)
	const [previewImage, setPreviewImage] = useState<string | null>(
		fields.id.initialValue ? getProductImgSrc(fields.id.initialValue) : null,
	)
	const [altText, setAltText] = useState(fields.altText.initialValue ?? '')

	return (
		<fieldset {...getFieldsetProps(meta)}>
			<div className="flex gap-3">
				<div className="w-32">
					<div className="relative h-32 w-32">
						<label
							htmlFor={fields.file.id}
							className={cn('group absolute h-32 w-32 rounded-lg', {
								'bg-accent opacity-40 focus-within:opacity-100 hover:opacity-100':
									!previewImage,
								'cursor-pointer focus-within:ring-2': !existingImage,
							})}
						>
							{previewImage ? (
								<div className="relative">
									<img
										src={previewImage}
										alt={altText ?? ''}
										className="h-32 w-32 rounded-lg object-cover"
									/>
									{existingImage ? null : (
										<div className="pointer-events-none absolute -right-0.5 -top-0.5 rotate-12 rounded-sm bg-secondary px-2 py-1 text-xs text-secondary-foreground shadow-md">
											new
										</div>
									)}
								</div>
							) : (
								<div className="flex h-32 w-32 items-center justify-center rounded-lg border border-muted-foreground text-4xl text-muted-foreground">
									<Icon name="plus" />
								</div>
							)}
							{existingImage ? (
								<input {...getInputProps(fields.id, { type: 'hidden' })} />
							) : null}
							<input
								aria-label="Image"
								className="absolute left-0 top-0 z-0 h-32 w-32 cursor-pointer opacity-0"
								onChange={(event) => {
									const file = event.target.files?.[0]

									if (file) {
										const reader = new FileReader()
										reader.onloadend = () => {
											setPreviewImage(reader.result as string)
										}
										reader.readAsDataURL(file)
									} else {
										setPreviewImage(null)
									}
								}}
								accept="image/*"
								{...getInputProps(fields.file, { type: 'file' })}
							/>
						</label>
					</div>
					<div className="min-h-[32px] px-4 pb-3 pt-1">
						<ErrorList id={fields.file.errorId} errors={fields.file.errors} />
					</div>
				</div>
				<div className="flex-1">
					<Label htmlFor={fields.altText.id}>Alt Text</Label>
					<Textarea
						className="min-h-[104px]"
						onChange={(e) => setAltText(e.currentTarget.value)}
						{...getTextareaProps(fields.altText)}
					/>
					<div className="min-h-[32px] px-4 pb-3 pt-1">
						<ErrorList
							id={fields.altText.errorId}
							errors={fields.altText.errors}
						/>
					</div>
				</div>
			</div>
			<div className="min-h-[32px] px-4 pb-3 pt-1">
				<ErrorList id={meta.errorId} errors={meta.errors} />
			</div>
		</fieldset>
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
