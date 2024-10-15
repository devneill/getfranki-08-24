import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData, type MetaFunction } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Spacer } from '#app/components/spacer.tsx'
import { Badge } from '#app/components/ui/badge.js'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { prisma } from '#app/utils/db.server.ts'
import {
	getCanonicalUrl,
	getEventImgSrc,
	getProductImgSrc,
	getUserImgSrc,
} from '#app/utils/misc.tsx'
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
			location: { select: { name: true } },
			category: { select: { name: true } },
			image: { select: { id: true } },
			productImages: {
				select: {
					id: true,
					altText: true,
				},
			},
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
						{user.location.length > 0 ? (
							<div className="flex gap-2">
								<Icon name="sewing-pin-filled" />
								{user.location.map((loc) => (
									<p key={loc.name}>{loc.name} </p>
								))}
							</div>
						) : null}
						{user.category.length > 0 ? (
							<div className="flex gap-2">
								<Icon name="info-circled" />

								{user.category.map((cat) => (
									<Badge variant="secondary" key={cat.name}>
										{cat.name}{' '}
									</Badge>
								))}
							</div>
						) : null}
					</div>
					<ul className="mt-14 flex flex-wrap justify-center gap-5 py-5">
						{data.user.productImages.map((image) => (
							<li key={image.id}>
								<a href={getProductImgSrc(image.id)}>
									<img
										src={getProductImgSrc(image.id)}
										alt={image.altText ?? ''}
										className="size-48 rounded-lg object-cover transition-transform duration-200 ease-in-out hover:scale-105 sm:size-64 md:size-80 lg:size-96"
									/>
								</a>
							</li>
						))}
					</ul>
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
	const user = data?.user
	const displayName = user?.name ?? params.username
	const category = user?.category[0]?.name ?? 'Event Supplier'
	const location = user?.location[0]?.name ?? 'South Africa'
	return [
		{ title: `${category} hire in ${location} - ${displayName}` },
		{
			name: 'description',
			content: `${displayName} is available as a ${category} for hire in ${location}. Book the best ${category} in ${location} for your event with GetFranki.`,
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
