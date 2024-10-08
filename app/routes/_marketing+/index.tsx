import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { ErrorList } from '#app/components/forms.tsx'
import { SearchBar } from '#app/components/search-bar.tsx'
import { Badge } from '#app/components/ui/badge.js'
import { prisma } from '#app/utils/db.server.ts'
import { cn, getUserImgSrc, useDelayedIsPending } from '#app/utils/misc.tsx'

const UserSearchResultSchema = z.object({
	id: z.string(),
	username: z.string(),
	name: z.string().nullable(),
	about: z.string().nullable(),
	categories: z.string(),
	imageId: z.string().nullable(),
})

const UserSearchResultsSchema = z.array(UserSearchResultSchema)

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
	const rawUsers = await prisma.$queryRaw`
	  SELECT
			User.id,
			User.username,
			User.name,
			User.about,
			UserImage.id AS imageId,
			GROUP_CONCAT(DISTINCT C.name) AS categories,
			r.name as role
		FROM User
		LEFT JOIN UserImage ON User.id = UserImage.userId
		JOIN _RoleToUser ru ON User.id = ru.b
		JOIN Role r ON ru.a = r.id
		JOIN _CategoryToUser cu ON User.id = cu.b
		JOIN Category c ON cu.a = c.id
		WHERE role LIKE "supplier"
		AND (User.username LIKE ${like} OR User.name LIKE ${like})
		AND C.name LIKE ${cat}
		GROUP BY User.id
		ORDER BY (
		  SELECT Event.updatedAt
			FROM Event
			WHERE Event.ownerId = User.id
			ORDER BY Event.updatedAt DESC
			LIMIT 1
		) DESC
		LIMIT 50
`

	const result = UserSearchResultsSchema.safeParse(rawUsers)

	if (!result.success) {
		return json({ status: 'error', error: result.error.message } as const, {
			status: 400,
		})
	}

	const users = result.data.map((user) => ({
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

	if (data.status === 'error') {
		console.error(data.error)
	}

	return (
		<div className="container mb-48 mt-14 flex flex-col items-center justify-center gap-6">
			<h1 className="animate-slide-top text-center text-h3 font-extrabold">
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
				<SearchBar
					status={data.status}
					autoFocus
					autoSubmit
					categories={data.status !== 'error' ? data.categories : []}
				/>
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
						<div className="mt-14 flex w-full justify-center">
							<p className="text-xl font-bold">No suppliers found</p>
						</div>
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
