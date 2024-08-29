import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData, type MetaFunction } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Spacer } from '#app/components/spacer.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { getUserImgSrc } from '#app/utils/misc.tsx'
import { useOptionalUser, userHasRole } from '#app/utils/user.ts'

export async function loader({ params }: LoaderFunctionArgs) {
	const user = await prisma.user.findFirst({
		select: {
			id: true,
			name: true,
			about: true,
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

	return json({ user, userJoinedDisplay: user.createdAt.toLocaleDateString() })
}

export default function ProfileRoute() {
	const data = useLoaderData<typeof loader>()
	const user = data.user
	const userDisplayName = user.name ?? user.username
	const loggedInUser = useOptionalUser()
	const isLoggedInUser = data.user.id === loggedInUser?.id
	const isSupplier = userHasRole(user, 'supplier')
	const isOrganiser = userHasRole(user, 'organiser')
	const isLoggedInOrganiser =
		loggedInUser && userHasRole(loggedInUser, 'organiser')

	if (!loggedInUser) {
		return (
			<div className="container mb-48 mt-36 flex flex-col items-center justify-center">
				<p>Log in to view suppliers</p>
			</div>
		)
	}

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

				<div className="flex flex-col items-center gap-4">
					<div className="flex flex-wrap items-center justify-center gap-4">
						<h1 className="text-center text-h2">{userDisplayName}</h1>
					</div>
					{isSupplier && (
						<div className="flex flex-col items-center gap-4">
							<p className="text-center">Supplier</p>
							{isLoggedInOrganiser && (
								<Button asChild>
									<Link to={`/users/${user.username}/book`} prefetch="intent">
										Book this supplier
									</Link>
								</Button>
							)}
						</div>
					)}
					{isOrganiser && <p className="text-center">Organiser</p>}
					{user.about ? <p className="text-center">{user.about}</p> : null}
					<p className="mt-2 text-center text-muted-foreground">
						Joined {data.userJoinedDisplay}
					</p>
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
								{isOrganiser && (
									<Button asChild>
										<Link to="events" prefetch="intent">
											My events
										</Link>
									</Button>
								)}
								{isSupplier && (
									<Button asChild>
										<Link to="bookings" prefetch="intent">
											My bookings
										</Link>
									</Button>
								)}
								<Button asChild>
									<Link to="/settings/profile" prefetch="intent">
										Edit profile
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
			content: `Profile of ${displayName} on GetFranki`,
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
