import { type MetaFunction } from '@remix-run/node'
import { Icon } from '#app/components/ui/icon.js'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '#app/components/ui/tooltip.tsx'
import { cn } from '#app/utils/misc.tsx'
import { logos } from './logos/logos.ts'
import { Button } from '#app/components/ui/button.js'
import { useState } from 'react'

export const meta: MetaFunction = () => [{ title: 'GetFranki' }]

// Tailwind Grid cell classes lookup
const columnClasses: Record<(typeof logos)[number]['column'], string> = {
	1: 'xl:col-start-1',
	2: 'xl:col-start-2',
	3: 'xl:col-start-3',
	4: 'xl:col-start-4',
	5: 'xl:col-start-5',
}
const rowClasses: Record<(typeof logos)[number]['row'], string> = {
	1: 'xl:row-start-1',
	2: 'xl:row-start-2',
	3: 'xl:row-start-3',
	4: 'xl:row-start-4',
	5: 'xl:row-start-5',
	6: 'xl:row-start-6',
}

export default function Index() {
	const featureText = {
		bookings: 'Bookings description',
		chat: 'Chat description',
		notes: 'Notes description',
		files: 'Files description',
		invoicing: 'Invoicing description',
		payments: 'Payments description',
		commission: 'Commission description',
	}
	const [activeFeature, setActiveFeature] = useState('bookings')

	return (
		<main className="font-poppins grid h-full place-items-center">
			<div className="grid place-items-center px-4 py-10 xl:grid-cols-2 xl:gap-24">
				<div className="flex max-w-lg flex-col items-center gap-8 text-center xl:order-2 xl:items-start xl:text-left">
					<h1 className="animate-slide-top text-4xl font-extrabold leading-normal text-foreground [animation-fill-mode:backwards] sm:text-6xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]">
						Run your events,
						<br />
						<span className="relative whitespace-nowrap">
							<span className="absolute -bottom-1 -left-3 -right-3 -top-1 rounded-md bg-foreground"></span>
							<span className="relative text-background">in one place</span>
						</span>
					</h1>
					<p
						data-paragraph
						className="animate-slide-top text-lg text-muted-foreground [animation-fill-mode:backwards] md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						The event management tool with all you need to run large-scale
						events, with multiple suppliers, and make your commission
						automatically.
					</p>
					{/* Quit managing suppliers through multiple apps. <br />
					Let Franki do it for you. */}
					<Button size="wide">
						Get Started <Icon name="arrow-right" className="ml-2 font-bold" />
					</Button>
					<p
						data-paragraph
						className="animate-slide-top text-sm text-muted-foreground [animation-fill-mode:backwards] md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						<span className="font-bold text-green-600">
							<Icon size="md" className="mr-1" name="rocket" /> R2000
						</span>{' '}
						off for the first 10 customers (3 left)
					</p>
					<p
						data-paragraph
						className="w-full p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						"Oh my zeus. This app is amazing"
						<div className="mt-4 flex items-center justify-center gap-4">
							<div className="size-12 rounded-full bg-gray-300" />
							@chefollie
						</div>
					</p>
				</div>
				{/* Make the icons below represent all the tasks that are normally scatted across multiple apps.*/}
				<ul className="mt-16 flex max-w-3xl flex-wrap justify-center gap-2 sm:gap-4 xl:mt-0 xl:grid xl:grid-flow-col xl:grid-cols-5 xl:grid-rows-6">
					<TooltipProvider>
						{logos.map((logo, i) => (
							<li
								key={logo.href}
								className={cn(
									columnClasses[logo.column],
									rowClasses[logo.row],
									'animate-roll-reveal [animation-fill-mode:backwards]',
								)}
								style={{ animationDelay: `${i * 0.07}s` }}
							>
								<Tooltip>
									<TooltipTrigger asChild>
										<a
											href={logo.href}
											className="grid size-20 place-items-center rounded-2xl bg-secondary/70 p-4 transition hover:-rotate-6 hover:bg-primary/15 dark:bg-violet-200 dark:hover:bg-violet-100 sm:size-24"
										>
											<img src={logo.src} alt="" />
										</a>
									</TooltipTrigger>
									<TooltipContent>{logo.alt}</TooltipContent>
								</Tooltip>
							</li>
						))}
					</TooltipProvider>
				</ul>
				<Icon size="xl" name="arrow-down" className="mt-16" />
				<Icon name="logo" className="mt-8 size-28" />
				<div className="mt-16 flex w-full flex-col gap-8 text-center">
					<p
						data-paragraph
						className="rounded-md bg-red-200/40 p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						❌ Seperate chat and email threads
						<br />
						❌ Multiple event calendars
						<br />
						❌ Commission negotiations per supplier
						<br />❌ Manual bank transfers
					</p>
					<p
						data-paragraph
						className="text-md p-8 text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						<Icon size="md" className="mr-2" name="arrow-down" />
						There's an easier way
					</p>
					<h2 className="animate-slide-top text-2xl font-bold leading-normal text-foreground [animation-fill-mode:backwards] sm:text-6xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]">
						Every booking, message and payment in one place, with your
						commission{' '}
						<span className="underline underline-offset-2">automatically</span>{' '}
						included.
						<br />
					</h2>
					<p
						data-paragraph
						className="text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						Book suppliers, create invoices, process payments and get paid with
						ease. Spend your time creating the ultimate occasion for your
						clients, not dealing with logistics. GetFranki provides you with the
						organisation you need to run your events, EASILY.
					</p>
					<div className="flex flex-col">
						<div className="flex w-full flex-wrap justify-center gap-2">
							<div
								className={cn(
									'flex size-24 cursor-pointer flex-col items-center gap-2',
									{
										'text-primary': activeFeature === 'bookings',
									},
								)}
								onClick={() => setActiveFeature('bookings')}
							>
								<Icon size="xl" name="pencil-1" />
								<p className="font-bold">Bookings</p>
							</div>
							<div
								className={cn(
									'flex size-24 cursor-pointer flex-col items-center gap-2',
									{
										'text-primary': activeFeature === 'chat',
									},
								)}
								onClick={() => setActiveFeature('chat')}
							>
								<Icon size="xl" name="camera" />
								<p className="font-bold">Chat</p>
							</div>
							<div
								className={cn(
									'flex size-24 cursor-pointer flex-col items-center gap-2',
									{
										'text-primary': activeFeature === 'notes',
									},
								)}
								onClick={() => setActiveFeature('notes')}
							>
								<Icon size="xl" name="avatar" />
								<p className="font-bold">Notes</p>
							</div>
							<div
								className={cn(
									'flex size-24 cursor-pointer flex-col items-center gap-2',
									{
										'text-primary': activeFeature === 'files',
									},
								)}
								onClick={() => setActiveFeature('files')}
							>
								<Icon size="xl" name="avatar" />
								<p className="font-bold">Files</p>
							</div>
							<div
								className={cn(
									'flex size-24 cursor-pointer flex-col items-center gap-2',
									{
										'text-primary': activeFeature === 'invoicing',
									},
								)}
								onClick={() => setActiveFeature('invoicing')}
							>
								<Icon size="xl" name="avatar" />
								<p className="font-bold">Invoicing</p>
							</div>
							<div
								className={cn(
									'flex size-24 cursor-pointer flex-col items-center gap-2',
									{
										'text-primary': activeFeature === 'payments',
									},
								)}
								onClick={() => setActiveFeature('payments')}
							>
								<Icon size="xl" name="moon" />
								<p className="font-bold">Payments</p>
							</div>
							<div
								className={cn(
									'flex size-24 cursor-pointer flex-col items-center gap-2',
									{
										'text-primary': activeFeature === 'commission',
									},
								)}
								onClick={() => setActiveFeature('commission')}
							>
								<Icon size="xl" name="avatar" />
								<p className="font-bold">Commission</p>
							</div>
						</div>
						<div className="rounded-md bg-secondary/70 p-8">
							<p
								data-paragraph
								className="text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
							>
								{featureText[activeFeature]}
							</p>
						</div>
					</div>
					<div className="mt-8 flex flex-col gap-10 text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]">
						<h3 className="font-bold text-primary">Meet the team</h3>
						<div className="grid grid-cols-2 place-items-center gap-4 text-left">
							<div className="flex w-full items-center gap-4">
								<div className="size-12 rounded-full bg-gray-300" />
								<p>Ollie Swart</p>
							</div>
							<div className="flex w-full items-center gap-4 text-left">
								<div className="size-12 min-w-12 rounded-full bg-gray-300" />
								<p>Keegs Foreman</p>
							</div>
							<div className="flex w-full items-center gap-4 text-left">
								<div className="size-12 min-w-12 rounded-full bg-gray-300" />
								<p>Nick Schooling</p>
							</div>
							<div className="flex w-full items-center gap-4 text-left">
								<div className="size-12 rounded-full bg-gray-300" />
								<p>Dev Neill</p>
							</div>
						</div>
						<p
							data-paragraph
							className="text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
						>
							Together, we've organised 1000+ events in different areas of the
							Western Cape. We've seen the chaos that comes with organising
							events, and we've built a solution to make it easy for you.
						</p>
					</div>
					<h3 className="mt-8 font-bold text-primary">Pricing</h3>
					<h2 className="animate-slide-top text-2xl font-bold leading-normal text-foreground [animation-fill-mode:backwards] sm:text-6xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]">
						Leave the chaos behind. Run your event from one, powerful dashboard.
						<br />
					</h2>
					<p
						data-paragraph
						className="animate-slide-top text-sm text-muted-foreground [animation-fill-mode:backwards] md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						<span className="font-bold text-green-600">
							<Icon size="md" className="mr-1" name="rocket" /> R2000
						</span>{' '}
						off for the first 10 customers (3 left)
					</p>
					<div className="flex h-96 w-full flex-col justify-between rounded-md bg-secondary/70 p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]">
						<p className="font-bold">Starter</p>
						<Button size="wide">
							Get started
							<Icon name="arrow-right" className="ml-2 font-bold" />
						</Button>
					</div>
					<div className="flex h-96 w-full flex-col justify-between rounded-md border-2 border-primary bg-secondary/70 p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]">
						<p className="font-bold">Pro</p>
						<Button size="wide">
							Get started
							<Icon name="arrow-right" className="ml-2 font-bold" />
						</Button>
					</div>
					<h3 className="mt-8 font-bold text-primary">FAQs</h3>
					<p
						data-paragraph
						className="w-full rounded-md border border-gray-300 p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						FAQs here
					</p>
					<p
						data-paragraph
						className="w-full p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						"I never have to negotiate commission again. I just foward the
						invoice. The supplier and I get paid. It's that simple."
						<div className="mt-4 flex items-center justify-center gap-4">
							<div className="size-12 rounded-full bg-gray-300" />
							@ann_man
						</div>
					</p>
					<h2 className="animate-slide-top text-2xl font-bold leading-normal text-foreground [animation-fill-mode:backwards] sm:text-6xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]">
						Focus on the occasion, not the admin.
						<br />
					</h2>
				</div>
				<div className="mt-36 animate-slide-top [animation-delay:0.3s] [animation-fill-mode:backwards] xl:-ml-6 xl:animate-slide-left xl:[animation-delay:0.5s] xl:[animation-fill-mode:backwards]">
					<Icon name="logo" title="logo" className="size-28 md:size-36" />
				</div>
				<div
					data-heading
					className="animate-slide-top text-foreground [animation-delay:0.8s] [animation-fill-mode:backwards] xl:-ml-6 xl:animate-slide-left xl:[animation-delay:1s] xl:[animation-fill-mode:backwards]"
				>
					<Icon
						name="logo-text"
						title="logo text"
						className="-mt-4 h-40 w-72 md:-mt-6 md:h-48 md:w-80"
					/>
				</div>
				<div className="m-10 flex flex-row gap-6">
					<Button size="wide">
						Get started
						<Icon name="arrow-right" className="ml-2 font-bold" />
					</Button>
				</div>
			</div>
		</main>
	)
}
