import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { ErrorList } from '#app/components/forms.tsx'
import { SearchBar } from '#app/components/search-bar.tsx'
import { Badge } from '#app/components/ui/badge.js'
import { prisma, sql } from '#app/utils/db.server.ts'
import { cn, getUserImgSrc, useDelayedIsPending } from '#app/utils/misc.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
	const searchParams = new URL(request.url).searchParams
	const searchTerm = searchParams.get('search')
	if (searchTerm === '') {
		return redirect('/')
	}
	const category = searchParams.get('category')
	if (category === '') {
		return redirect('/')
	}

	const like = `%${searchTerm ?? ''}%`
	const categoryFilter = category ? `%${category}%` : '%'

	const rawUsers = await prisma.$queryRawTyped(sql.search(like, categoryFilter))

	const users = rawUsers.map((user) => ({
		...user,
		categories: user.categories?.split(',').map((category) => category.trim()),
	}))

	return json({ status: 'idle', users, category } as const)
}

export default function Index() {
	const data = useLoaderData<typeof loader>()
	const isPending = useDelayedIsPending({
		formMethod: 'GET',
		formAction: '/',
	})

	return (
		<div className="container mb-48 mt-14 flex flex-col items-center justify-center gap-6">
			<h1 className="animate-slide-top text-center text-h3">
				Find {}
				<span className="rounded-md bg-foreground px-2 py-1 text-background">
					the best
				</span>
				{} event suppliers
			</h1>
			<p
				data-paragraph
				className="animate-slide-top text-center text-lg leading-relaxed text-muted-foreground [animation-delay:0.3s] [animation-fill-mode:backwards]"
			>
				Choose from our high quality, hand-selected suppliers. <br /> Run your
				next event with only the best professionals in the industry.
			</p>
			<div className="mt-20 flex w-full max-w-[700px] flex-col gap-4">
				<SearchBar status={data.status} autoFocus autoSubmit />
			</div>
			<main className="w-full">
				{data.status === 'idle' ? (
					data.users.length ? (
						<ul
							className={cn(
								'flex w-full flex-col items-center justify-center gap-4 delay-200',
								{ 'opacity-50': isPending },
							)}
						>
							{data.users.map((user) => (
								<li key={user.id} className="w-full">
									<Link
										to={`/users/${user.username}`}
										className="flex h-32 w-full items-center gap-4 overflow-hidden rounded-lg bg-muted px-5 py-3"
									>
										<img
											alt={user.name ?? user.username}
											src={getUserImgSrc(user.imageId)}
											className="h-16 w-16 rounded-full"
										/>
										<div className="flex flex-grow flex-col justify-center gap-2 overflow-hidden text-ellipsis">
											<div className="flex items-center">
												{user.name ? (
													<span className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold">
														{user.name}
													</span>
												) : null}
												<div className="flex">
													{user.categories?.map((category) => (
														<Badge
															key={category}
															variant="secondary"
															className="mr-1 whitespace-nowrap"
														>
															{category}
														</Badge>
													))}
												</div>
											</div>
											{user.about ? (
												<span className="overflow-hidden text-ellipsis whitespace-nowrap text-body-sm text-muted-foreground">
													{user.about}
												</span>
											) : null}
										</div>
									</Link>
								</li>
							))}
						</ul>
					) : (
						<p>No users found</p>
					)
				) : data.status === 'error' ? (
					<ErrorList errors={['There was an error parsing the results']} />
				) : null}
			</main>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
