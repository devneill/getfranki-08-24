import {
	json,
	type LoaderFunctionArgs,
	type HeadersFunction,
	type LinksFunction,
	type MetaFunction,
} from '@remix-run/node'
import {
	Form,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useSubmit,
} from '@remix-run/react'
import { withSentry } from '@sentry/remix'
import { useRef } from 'react'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import appleTouchIconAssetUrl from './assets/images/favicons/apple-touch-icon.png'
import faviconAltAssetUrl from './assets/images/favicons/favicon-32x32.png'
import faviconAssetUrl from './assets/images/favicons/favicon.svg'
import maskIconAssetUrl from './assets/images/favicons/mask-icon.svg'
import { GeneralErrorBoundary } from './components/error-boundary.tsx'
import { EpicProgress } from './components/progress-bar.tsx'
import { useToast } from './components/toaster.tsx'
import { Button } from './components/ui/button.tsx'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from './components/ui/dropdown-menu.tsx'
import { Icon, href as iconsHref } from './components/ui/icon.tsx'
import { EpicToaster } from './components/ui/sonner.tsx'
import { ThemeSwitch, useTheme } from './routes/resources+/theme-switch.tsx'
import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import { getUserId, logout } from './utils/auth.server.ts'
import { ClientHintCheck, getHints } from './utils/client-hints.tsx'
import { prisma } from './utils/db.server.ts'
import { getEnv } from './utils/env.server.ts'
import { honeypot } from './utils/honeypot.server.ts'
import {
	cn,
	combineHeaders,
	getCanonicalUrl,
	getDomainUrl,
	getUserImgSrc,
} from './utils/misc.tsx'
import { useNonce } from './utils/nonce-provider.ts'
import { type Theme, getTheme } from './utils/theme.server.ts'
import { makeTimings, time } from './utils/timing.server.ts'
import { getToast } from './utils/toast.server.ts'
import { useOptionalUser, userHasRole, useUser } from './utils/user.ts'

export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		{ rel: 'preload', href: iconsHref, as: 'image' },
		{ rel: 'mask-icon', href: maskIconAssetUrl },
		{
			rel: 'alternate icon',
			type: 'image/png',
			href: faviconAltAssetUrl,
		},
		{ rel: 'apple-touch-icon', href: appleTouchIconAssetUrl },
		{
			rel: 'manifest',
			href: '/site.webmanifest',
			crossOrigin: 'use-credentials',
		} as const, // necessary to make typescript happy
		{ rel: 'icon', type: 'image/svg+xml', href: faviconAssetUrl },
		{ rel: 'stylesheet', href: tailwindStyleSheetUrl },
	].filter(Boolean)
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const title = data
		? 'GetFranki | The best event suppliers in South Africa'
		: ' GetFranki | Error'
	const description =
		'Plan your next event with the best suppliers in South Africa'
	const imagePath = '/img/og-image.png'
	const image = `${data?.requestInfo.origin}${imagePath}`
	return [
		{ title },
		{ name: 'description', content: description },
		// Open Graph / Facebook
		{ property: 'og:type', content: 'website' },
		{ property: 'og:url', content: data?.requestInfo.origin },
		{ property: 'og:title', content: title },
		{ property: 'og:description', content: description },
		{ property: 'og:image', content: image },
		// Twitter
		{ name: 'twitter:title', content: title },
		{ name: 'twitter:description', content: description },
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:image', content: image },
		{ name: 'twitter:image:alt', content: 'GetFranki' },
		{ name: 'twitter:creator', content: '@devneill' },
		{ name: 'twitter:site', content: '@devneill' },
		{
			tagName: 'link',
			rel: 'canonical',
			href: getCanonicalUrl(data?.requestInfo.path ?? ''),
		},
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const timings = makeTimings('root loader')
	const userId = await time(() => getUserId(request), {
		timings,
		type: 'getUserId',
		desc: 'getUserId in root',
	})

	const user = userId
		? await time(
				() =>
					prisma.user.findUniqueOrThrow({
						select: {
							id: true,
							name: true,
							username: true,
							image: { select: { id: true } },
							roles: {
								select: {
									name: true,
									permissions: {
										select: { entity: true, action: true, access: true },
									},
								},
							},
						},
						where: { id: userId },
					}),
				{ timings, type: 'find user', desc: 'find user in root' },
			)
		: null
	if (userId && !user) {
		console.info('something weird happened')
		// something weird happened... The user is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await logout({ request, redirectTo: '/' })
	}
	const { toast, headers: toastHeaders } = await getToast(request)
	const honeyProps = honeypot.getInputProps()

	return json(
		{
			user,
			requestInfo: {
				hints: getHints(request),
				origin: getDomainUrl(request),
				path: new URL(request.url).pathname,
				userPrefs: {
					theme: getTheme(request),
				},
			},
			ENV: getEnv(),
			toast,
			honeyProps,
		},
		{
			headers: combineHeaders(
				{ 'Server-Timing': timings.toString() },
				toastHeaders,
			),
		},
	)
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	const headers = {
		'Server-Timing': loaderHeaders.get('Server-Timing') ?? '',
	}
	return headers
}

function Document({
	children,
	nonce,
	theme = 'light',
	env = {},
	allowIndexing = true,
}: {
	children: React.ReactNode
	nonce: string
	theme?: Theme
	env?: Record<string, string>
	allowIndexing?: boolean
}) {
	return (
		<html lang="en" className={`${theme} scroll-smooth`}>
			<head>
				<ClientHintCheck nonce={nonce} />
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				{allowIndexing ? null : (
					<meta name="robots" content="noindex, nofollow" />
				)}
				<Links />
				{env.MODE === 'production' ? (
					<script
						defer
						data-domain="getfranki.com"
						src="https://plausible.io/js/script.js"
					></script>
				) : null}
			</head>
			<body className="overflow-y-scroll bg-background text-foreground">
				{children}
				<script
					nonce={nonce}
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env)}`,
					}}
				/>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
			</body>
		</html>
	)
}

function App() {
	const data = useLoaderData<typeof loader>()
	const nonce = useNonce()
	const user = useOptionalUser()
	const theme = useTheme()
	const allowIndexing = data.ENV.ALLOW_INDEXING !== 'false'
	useToast(data.toast)

	return (
		<Document
			nonce={nonce}
			theme={theme}
			allowIndexing={allowIndexing}
			env={data.ENV}
		>
			<div className="flex h-screen flex-col justify-between">
				<header className="container px-5 py-2">
					<nav className="flex items-center justify-between gap-8 md:gap-16">
						<Logo />
						<div className={cn('flex w-full items-center justify-end')}>
							<div className="flex items-center gap-4">
								{user ? (
									<UserDropdown />
								) : (
									<>
										<Button asChild className="min-w-20">
											<Link to="https://y5pjft0758o.typeform.com/to/qk3aCfvE">
												Feature as a supplier
											</Link>
										</Button>
									</>
								)}
							</div>
						</div>
					</nav>
				</header>

				<div className="flex-1">
					<Outlet />
				</div>

				<div className="container flex items-center justify-between px-5 py-2">
					<Logo />
					<p className="text-sm">
						Built with <Icon name="heart-filled" /> by{' '}
						<a href="https://devneill.com">devneill</a>
					</p>
					<div className="flex gap-8">
						<Link
							to="/login"
							className="flex align-middle"
							aria-label="admin login"
						>
							<Icon name="gear" />
						</Link>
						<ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
					</div>
				</div>
			</div>
			<EpicToaster closeButton position="top-center" theme={theme} />
			<EpicProgress />
		</Document>
	)
}

function Logo() {
	return (
		<>
			<Link to="/">
				<Icon
					name="logo-text"
					title="logo"
					className="hidden h-20 w-32 transition hover:translate-x-2 sm:block"
				/>
				<Icon
					name="logo"
					title="logo"
					className="size-12 transition hover:translate-x-2 sm:hidden"
				/>
			</Link>
		</>
	)
}

function AppWithProviders() {
	const data = useLoaderData<typeof loader>()
	return (
		<HoneypotProvider {...data.honeyProps}>
			<App />
		</HoneypotProvider>
	)
}

export default withSentry(AppWithProviders)

function UserDropdown() {
	const user = useUser()
	const isAdmin = userHasRole(user, 'admin')

	const submit = useSubmit()
	const formRef = useRef<HTMLFormElement>(null)
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button asChild variant="secondary">
					<Link
						to={`/users/${user.username}`}
						// this is for progressive enhancement
						onClick={(e) => e.preventDefault()}
						className="flex items-center gap-2"
					>
						<img
							className="h-8 w-8 rounded-full object-cover"
							alt={user.name ?? user.username}
							src={getUserImgSrc(user.image?.id)}
						/>
						<span className="text-body-sm font-bold">
							{user.name ?? user.username}
						</span>
					</Link>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent sideOffset={8} align="start">
					<DropdownMenuItem asChild>
						<Link prefetch="intent" to={`/users/${user.username}`}>
							<Icon className="text-body-md" name="avatar">
								Profile
							</Icon>
						</Link>
					</DropdownMenuItem>
					{isAdmin ? (
						<DropdownMenuItem asChild>
							<Link prefetch="intent" to={`/admin/suppliers/new`}>
								<Icon className="text-body-md" name="pencil-2">
									Add supplier
								</Icon>
							</Link>
						</DropdownMenuItem>
					) : null}
					<DropdownMenuItem
						asChild
						// this prevents the menu from closing before the form submission is completed
						onSelect={(event) => {
							event.preventDefault()
							submit(formRef.current)
						}}
					>
						<Form action="/logout" method="POST" ref={formRef}>
							<Icon className="text-body-md" name="exit">
								<button type="submit">Logout</button>
							</Icon>
						</Form>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	)
}

export function ErrorBoundary() {
	// the nonce doesn't rely on the loader so we can access that
	const nonce = useNonce()

	// NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
	// likely failed to run so we have to do the best we can.
	// We could probably do better than this (it's possible the loader did run).
	// This would require a change in Remix.

	// Just make sure your root route never errors out and you'll always be able
	// to give the user a better UX.

	return (
		<Document nonce={nonce}>
			<GeneralErrorBoundary />
		</Document>
	)
}
