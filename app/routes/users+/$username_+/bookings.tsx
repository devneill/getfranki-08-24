import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, NavLink, Outlet, useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { cn, getUserImgSrc } from '#app/utils/misc.tsx'
import { userHasRole, useUser } from '#app/utils/user.ts'

export async function loader({ params }: LoaderFunctionArgs) {
	const supplier = await prisma.user.findFirst({
		select: {
			id: true,
			name: true,
			username: true,
			image: { select: { id: true } },
			bookings: { select: { id: true, event: { select: { title: true } } } },
		},
		where: { username: params.username },
	})

	invariantResponse(supplier, 'Supplier not found', { status: 404 })

	return json({ supplier })
}

export default function BookingsRoute() {
	const data = useLoaderData<typeof loader>()
	const user = useUser()
	const hasBookings = data.supplier.bookings.length > 0
	const supplierDisplayName = data.supplier.name ?? data.supplier.username
	const navLinkDefaultClassName =
		'line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl'

	if (userHasRole(user, 'organiser')) {
		return (
			<div className="container mb-48 mt-36 flex flex-col items-center justify-center">
				<p>Log in as an event supplier to view booking requests</p>
			</div>
		)
	}

	return (
		<main className="container flex h-full min-h-[400px] px-0 md:px-8">
			<div className="grid w-full grid-cols-4 bg-muted pl-2 md:container md:rounded-3xl md:pr-0">
				<div className="relative col-span-1">
					<div className="absolute inset-0 flex flex-col">
						<Link
							to={`/users/${data.supplier.username}`}
							className="flex flex-col items-center justify-center gap-2 bg-muted pb-4 pl-8 pr-4 pt-12 lg:flex-row lg:justify-start lg:gap-4"
						>
							<img
								src={getUserImgSrc(data.supplier.image?.id)}
								alt={supplierDisplayName}
								className="h-16 w-16 rounded-full object-cover lg:h-24 lg:w-24"
							/>
							<h1 className="text-center text-base font-bold md:text-lg lg:text-left lg:text-2xl">
								{supplierDisplayName}'s Bookings
							</h1>
						</Link>
						<ul className="overflow-y-auto overflow-x-hidden pb-12">
							{hasBookings ? (
								data.supplier.bookings.map((booking) => (
									<li key={booking.id} className="p-1 pr-0">
										<NavLink
											to={booking.id}
											preventScrollReset
											prefetch="intent"
											className={({ isActive }) =>
												cn(navLinkDefaultClassName, isActive && 'bg-accent')
											}
										>
											{booking.event.title}
										</NavLink>
									</li>
								))
							) : (
								<p>You have no bookings yet</p>
							)}
						</ul>
					</div>
				</div>
				<div className="relative col-span-3 bg-accent md:rounded-r-3xl">
					<Outlet />
				</div>
			</div>
		</main>
	)
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
