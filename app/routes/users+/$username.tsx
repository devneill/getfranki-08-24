import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData, type MetaFunction } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Spacer } from '#app/components/spacer.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { getCanonicalUrl, getUserImgSrc } from '#app/utils/misc.tsx'
import { useOptionalUser, userHasRole } from '#app/utils/user.ts'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const user = await prisma.user.findFirst({
		select: {
			id: true,
			email: true,
			name: true,
			number: true,
			about: true,
			website: true,
			username: true,
			createdAt: true,
			image: { select: { id: true } },
			roles: { select: { name: true, permissions: true } },
		},
		where: {
			username: params.username,
		},
	})

	invariantResponse(user, 'User not found', { status: 404 })

	return json({
		user,
		userJoinedDisplay: user.createdAt.toLocaleDateString(),
		requestInfo: { path: new URL(request.url).pathname },
	})
}

export default function ProfileRoute() {
	const data = useLoaderData<typeof loader>()
	const user = data.user
	const userDisplayName = user.name ?? user.username
	const loggedInUser = useOptionalUser()
	const isLoggedInUser = data.user.id === loggedInUser?.id
	const isLoggedInAdmin = userHasRole(loggedInUser ?? null, 'admin')

	return (
		<div className="container mb-48 mt-36 flex flex-col items-center justify-center">
			<Spacer size="4xs" />

			<div className="container flex flex-col items-center rounded-3xl bg-muted p-12">
				<div className="relative w-52">
					<div className="absolute -top-40">
						<div className="relative">
							<img
								src={getUserImgSrc(user.image?.id)}
								alt={userDisplayName}
								className="h-52 w-52 rounded-full object-cover"
							/>
						</div>
					</div>
				</div>

				<Spacer size="sm" />

				<div className="flex flex-col items-center gap-8">
					<div className="flex flex-wrap items-center justify-center gap-4">
						<h1 className="text-center text-h2">{userDisplayName}</h1>
					</div>
					{user.about ? (
						<p className="text-center text-muted-foreground">{user.about}</p>
					) : null}
					<div className="mt-10 flex flex-col gap-2">
						<div className="flex gap-2">
							<Icon name="envelope-closed" />
							<p>{user.email}</p>
						</div>
						{user.number ? (
							<div className="flex gap-2">
								<Icon name="mobile" />
								<p>{user.number}</p>
							</div>
						) : null}
						{user.website ? (
							<div className="flex gap-2">
								<Icon name="globe" />
								<p>{user.website}</p>
							</div>
						) : null}
					</div>
					{isLoggedInUser ? (
						<Form action="/logout" method="POST" className="mt-3">
							<Button type="submit" variant="link" size="pill">
								<Icon name="exit" className="scale-125 max-md:scale-150">
									Logout
								</Icon>
							</Button>
						</Form>
					) : null}
					<div className="mt-10 flex gap-4">
						{isLoggedInUser ? (
							<>
								<Button asChild>
									<Link to="/settings/profile" prefetch="intent">
										Edit profile
									</Link>
								</Button>
							</>
						) : null}
						{isLoggedInAdmin && !isLoggedInUser ? (
							<>
								<Button asChild>
									<Link
										to={`/admin/suppliers/${user.username}/edit`}
										prefetch="intent"
									>
										Edit this supplier
									</Link>
								</Button>
							</>
						) : null}
					</div>
				</div>
			</div>
		</div>
	)
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
	const displayName = data?.user.name ?? params.username
	return [
		{ title: `${displayName} | GetFranki` },
		{
			name: 'description',
			content: `Find out more information abouth this South African event suppliers and get in touch to make a booking. Here you'll find the profile and contact details for ${displayName} | GetFranki`,
		},
		{
			tagName: 'link',
			rel: 'canonical',
			href: getCanonicalUrl(data?.requestInfo.path ?? ''),
		},
	]
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No user with the username "{params.username}" exists</p>
				),
			}}
		/>
	)
}
