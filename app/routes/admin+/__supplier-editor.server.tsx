import { parseWithZod } from '@conform-to/zod'
import { createId as cuid } from '@paralleldrive/cuid2'
import {
	type ActionFunctionArgs,
	json,
	unstable_parseMultipartFormData as parseMultipartFormData,
	unstable_createMemoryUploadHandler as createMemoryUploadHandler,
} from '@remix-run/node'
import { z } from 'zod'
import { prisma } from '#app/utils/db.server.js'
import { requireUserWithRole } from '#app/utils/permissions.server.js'
import { redirectWithToast } from '#app/utils/toast.server.js'
import {
	type ImageFieldset,
	MAX_UPLOAD_SIZE,
	SupplierEditorSchema,
} from './__supplier-editor'

function imageHasFile(
	image: ImageFieldset,
): image is ImageFieldset & { file: NonNullable<ImageFieldset['file']> } {
	return Boolean(image.file?.size && image.file?.size > 0)
}

function imageHasId(
	image: ImageFieldset,
): image is ImageFieldset & { id: NonNullable<ImageFieldset['id']> } {
	return image.id != null
}

export async function action({ request }: ActionFunctionArgs) {
	await requireUserWithRole(request, 'admin')

	console.log({ request })

	const formData = await parseMultipartFormData(
		request,
		createMemoryUploadHandler({ maxPartSize: MAX_UPLOAD_SIZE }),
	)
	const submission = await parseWithZod(formData, {
		schema: () =>
			SupplierEditorSchema.superRefine(async (data, ctx) => {
				const currentUser = await prisma.user.findFirst({
					where: { id: data.id },
					select: { id: true, username: true, email: true, number: true },
				})

				const existingUser = await prisma.user.findFirst({
					where: {
						NOT: { id: currentUser?.id },
						OR: [
							{ username: data.username },
							{ email: data.email },
							{ number: data.number },
						],
					},
					select: { id: true, username: true, email: true, number: true },
				})

				if (
					existingUser?.username &&
					existingUser?.username === data.username
				) {
					ctx.addIssue({
						path: ['username'],
						code: z.ZodIssueCode.custom,
						message: 'A user already exists with this username',
					})
					return
				}
				if (existingUser?.email && existingUser?.email === data.email) {
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
			}).transform(async ({ productImages = [], ...data }) => {
				return {
					...data,
					imageUpdates: await Promise.all(
						productImages.filter(imageHasId).map(async (i) => {
							if (imageHasFile(i)) {
								return {
									id: i.id,
									altText: i.altText,
									contentType: i.file.type,
									blob: Buffer.from(await i.file.arrayBuffer()),
								}
							} else {
								return {
									id: i.id,
									altText: i.altText,
								}
							}
						}),
					),
					newImages: await Promise.all(
						productImages
							.filter(imageHasFile)
							.filter((i) => !i.id)
							.map(async (image) => {
								return {
									altText: image.altText,
									contentType: image.file.type,
									blob: Buffer.from(await image.file.arrayBuffer()),
								}
							}),
					),
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
		id,
		username,
		name,
		email,
		number,
		website,
		about,
		categoryId,
		locationId,
		imageUpdates = [],
		newImages = [],
	} = submission.value

	const role = await prisma.role.findUnique({
		where: { name: 'supplier' },
		select: { id: true },
	})

	const user = await prisma.user.upsert({
		select: { username: true },
		where: { id: id ?? '__new_supplier' },
		create: {
			username,
			name,
			email,
			number,
			website,
			about,
			location: { connect: { id: locationId } },
			category: { connect: { id: categoryId } },
			roles: { connect: { id: role?.id } },
			productImages: { create: newImages },
		},
		update: {
			username,
			name,
			email,
			number,
			website,
			about,
			location: { connect: { id: locationId } },
			category: { connect: { id: categoryId } },
			productImages: {
				deleteMany: { id: { notIn: imageUpdates.map((i) => i.id) } },
				updateMany: imageUpdates.map((updates) => ({
					where: { id: updates.id },
					data: { ...updates, id: updates.blob ? cuid() : updates.id },
				})),
				create: newImages,
			},
		},
	})

	return redirectWithToast(`/admin/suppliers/${user.username}/photo`, {
		title: 'Supplier created',
		description: `Thanks for adding ${user.username} as a supplier!`,
	})
}
