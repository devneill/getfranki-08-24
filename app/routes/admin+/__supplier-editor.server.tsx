import { parseWithZod } from '@conform-to/zod'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { z } from 'zod'
import { prisma } from '#app/utils/db.server.js'
import { requireUserWithRole } from '#app/utils/permissions.server.js'
import { redirectWithToast } from '#app/utils/toast.server.js'
import { SupplierEditorSchema } from './__supplier-editor'

export async function action({ request }: ActionFunctionArgs) {
	await requireUserWithRole(request, 'admin')

	const formData = await request.formData()
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
				console.log({ existingUser })

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
			}),
		async: true,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { id, username, name, email, number, website, about, categoryId } =
		submission.value

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
			category: { connect: { id: categoryId } },
			roles: { connect: { id: role?.id } },
		},
		update: {
			username,
			name,
			email,
			number,
			website,
			about,
			category: { connect: { id: categoryId } },
		},
	})

	return redirectWithToast(`/admin/suppliers/${user.username}/photo`, {
		title: 'Supplier created',
		description: `Thanks for adding ${user.username} as a supplier!`,
	})
}
