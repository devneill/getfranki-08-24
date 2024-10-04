import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import {
	json,
	unstable_createMemoryUploadHandler,
	unstable_parseMultipartFormData,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigation,
} from '@remix-run/react'
import { useState } from 'react'
import { z } from 'zod'
import { ErrorList } from '#app/components/forms.tsx'
import { Spacer } from '#app/components/spacer.js'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { prisma } from '#app/utils/db.server.ts'
import {
	getUserImgSrc,
	useDoubleCheck,
	useIsPending,
} from '#app/utils/misc.tsx'
import { requireUserWithRole } from '#app/utils/permissions.server.js'
import { redirectWithToast } from '#app/utils/toast.server.js'

const MAX_SIZE = 1024 * 1024 * 3 // 3MB

const DeleteImageSchema = z.object({
	intent: z.literal('delete'),
})

const NewImageSchema = z.object({
	intent: z.literal('submit'),
	photoFile: z
		.instanceof(File)
		.refine((file) => file.size > 0, 'Image is required')
		.refine(
			(file) => file.size <= MAX_SIZE,
			'Image size must be less than 3MB',
		),
})

const PhotoFormSchema = z.discriminatedUnion('intent', [
	DeleteImageSchema,
	NewImageSchema,
])

export async function loader({ request, params }: LoaderFunctionArgs) {
	await requireUserWithRole(request, 'admin')

	const user = await prisma.user.findUnique({
		where: { username: params.username },
		select: {
			id: true,
			name: true,
			username: true,
			image: { select: { id: true } },
		},
	})
	invariantResponse(user, 'User not found', { status: 404 })
	return json({ user })
}

export async function action({ request, params }: ActionFunctionArgs) {
	await requireUserWithRole(request, 'admin')

	const user = await prisma.user.findUnique({
		where: { username: params.username },
		select: {
			id: true,
			username: true,
		},
	})

	invariantResponse(user, 'User not found', { status: 404 })

	const formData = await unstable_parseMultipartFormData(
		request,
		unstable_createMemoryUploadHandler({ maxPartSize: MAX_SIZE }),
	)

	const submission = await parseWithZod(formData, {
		schema: PhotoFormSchema.transform(async (data) => {
			if (data.intent === 'delete') return { intent: 'delete' }
			if (data.photoFile.size <= 0) return z.NEVER
			return {
				intent: data.intent,
				image: {
					contentType: data.photoFile.type,
					blob: Buffer.from(await data.photoFile.arrayBuffer()),
				},
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

	const { image } = submission.value

	await prisma.$transaction(async ($prisma) => {
		await $prisma.userImage.deleteMany({ where: { userId: user.id } })
		await $prisma.user.update({
			where: { id: user.id },
			data: { image: { create: image } },
		})
	})

	return redirectWithToast(`/users/${user.username}`, {
		title: 'Profile picture saved',
		description: `Thanks for adding ${user.username}'s picture! You're awesome.`,
	})
}

export default function PhotoRoute() {
	const data = useLoaderData<typeof loader>()

	const actionData = useActionData<typeof action>()
	const navigation = useNavigation()

	const [form, fields] = useForm({
		id: 'profile-photo',
		constraint: getZodConstraint(PhotoFormSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: PhotoFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	const isPending = useIsPending()
	const pendingIntent = isPending ? navigation.formData?.get('intent') : null
	const lastSubmissionIntent = fields.intent.value

	const [newImageSrc, setNewImageSrc] = useState<string | null>(null)

	return (
		<div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="mx-auto w-full max-w-lg">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Add a profile pic</h1>
					<p className="text-body-md text-muted-foreground">
						This will make GetFranki the best supplier list out there.
					</p>
				</div>
				<Spacer size="xs" />
				<div>
					<Form
						method="POST"
						encType="multipart/form-data"
						className="flex flex-col items-center justify-center gap-10"
						onReset={() => setNewImageSrc(null)}
						{...getFormProps(form)}
					>
						<img
							src={
								newImageSrc ??
								(data.user ? getUserImgSrc(data.user.image?.id) : '')
							}
							className="h-52 w-52 rounded-full object-cover"
							alt={data.user?.name ?? data.user?.username}
						/>
						<ErrorList
							errors={fields.photoFile.errors}
							id={fields.photoFile.id}
						/>
						<div className="flex gap-4">
							{/*
						We're doing some kinda odd things to make it so this works well
						without JavaScript. Basically, we're using CSS to ensure the right
						buttons show up based on the input's "valid" state (whether or not
						an image has been selected). Progressive enhancement FTW!
					*/}
							<input
								{...getInputProps(fields.photoFile, { type: 'file' })}
								accept="image/*"
								className="peer sr-only"
								required
								tabIndex={newImageSrc ? -1 : 0}
								onChange={(e) => {
									const file = e.currentTarget.files?.[0]
									if (file) {
										const reader = new FileReader()
										reader.onload = (event) => {
											setNewImageSrc(event.target?.result?.toString() ?? null)
										}
										reader.readAsDataURL(file)
									}
								}}
							/>
							<Button
								asChild
								className="cursor-pointer peer-valid:hidden peer-focus-within:ring-2 peer-focus-visible:ring-2"
							>
								<label htmlFor={fields.photoFile.id}>
									<Icon name="pencil-1">Change</Icon>
								</label>
							</Button>
							<StatusButton
								name="intent"
								value="submit"
								type="submit"
								className="peer-invalid:hidden"
								status={
									pendingIntent === 'submit'
										? 'pending'
										: lastSubmissionIntent === 'submit'
											? (form.status ?? 'idle')
											: 'idle'
								}
							>
								Save Photo
							</StatusButton>
							<Button
								variant="destructive"
								className="peer-invalid:hidden"
								{...form.reset.getButtonProps()}
							>
								<Icon name="trash">Reset</Icon>
							</Button>
						</div>
						<ErrorList errors={form.errors} />
					</Form>
				</div>
			</div>
		</div>
	)
}
