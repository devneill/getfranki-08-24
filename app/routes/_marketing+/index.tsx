import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { ErrorList } from '#app/components/forms.tsx'
import { SearchBar } from '#app/components/search-bar.tsx'
import { Badge } from '#app/components/ui/badge.js'
import { prisma, sql } from '#app/utils/db.server.ts'
import { cn, getUserImgSrc, useDelayedIsPending } from '#app/utils/misc.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
	const categories = await prisma.category.findMany({
		select: { name: true },
	})

	const searchParams = new URL(request.url).searchParams
	const searchTerm = searchParams.get('search')
	const categoryFilter = searchParams.get('category')
	if (searchTerm === '' && categoryFilter === '') {
		return redirect('/')
	}

	const like = `%${searchTerm ?? ''}%`
	const cat = categoryFilter ? `%${categoryFilter}%` : '%'
	const rawUsers = await prisma.$queryRawTyped(sql.search(like, cat))

	const users = rawUsers.map((user) => ({
		...user,
		categories: user.categories?.split(',').map((category) => category.trim()),
	}))

	return json({ status: 'idle', users, categoryFilter, categories } as const)
}

export default function Index() {
	const data = useLoaderData<typeof loader>()
	const isPending = useDelayedIsPending({
		formMethod: 'GET',
		formAction: '/',
	})

	// Use a roll animation on intitial render and a simple fade after that
	const isInitialRenderRef = useRef(true)
	useEffect(() => {
		const timer = setTimeout(() => {
			isInitialRenderRef.current = false
		}, 2000)

		return () => clearTimeout(timer)
	}, [])

	return (
		<div className="container mb-14 mt-14 flex flex-col items-center justify-center gap-10 lg:mt-20">
			<h1 className="animate-slide-top text-center text-4xl font-extrabold leading-normal tracking-tight text-foreground sm:text-5xl sm:leading-snug xl:text-6xl">
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
				next event with{' '}
				<span className="underline decoration-primary decoration-2 underline-offset-2">
					only the best
				</span>{' '}
				professionals in the industry.
			</p>
			<div className="flex w-full max-w-[1000px] animate-slide-top flex-col gap-4 [animation-delay:0.4s] [animation-fill-mode:backwards] lg:mt-20">
				<SearchBar
					status={data.status}
					autoFocus
					autoSubmit
					categories={data.categories}
				/>
			</div>
			<main className="w-full">
				{data.status === 'idle' ? (
					data.users.length ? (
						<motion.ul
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className={cn(
								'flex w-full flex-col items-center justify-center gap-4',
								{ 'opacity-50': isPending },
							)}
						>
							{data.users.map((user, index) => (
								<li
									key={user.id}
									className={`w-full ${isInitialRenderRef.current ? 'animate-roll-reveal [animation-fill-mode:backwards]' : 'animate-in fade-in-0'}`}
									style={{
										animationDelay: isInitialRenderRef.current
											? `${0.5 + 0.1 * index}s`
											: '0s',
									}}
								>
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
						</motion.ul>
					) : (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="mt-14 flex w-full justify-center"
						>
							<p className="text-xl font-bold">No suppliers found</p>
						</motion.div>
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
