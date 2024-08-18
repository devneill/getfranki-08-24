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
	return (
		<main className="font-poppins grid h-full place-items-center">
			<div className="grid place-items-center px-4 py-10 xl:grid-cols-2 xl:gap-24">
				<div className="flex max-w-lg flex-col items-center gap-8 text-center xl:order-2 xl:items-start xl:text-left">
					<h1 className="animate-slide-top text-4xl font-bold leading-normal text-foreground [animation-fill-mode:backwards] sm:text-6xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]">
						Run your events,
						<br />
						<span className="rounded bg-foreground px-2 text-background shadow-xl">
							in one place.
						</span>
					</h1>
					<p
						data-paragraph
						className="animate-slide-top text-lg text-muted-foreground [animation-fill-mode:backwards] md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						Quit managing suppliers through multiple apps. <br />
						Let Franki do it for you.
					</p>
					<Button size="wide">🍔 Get Started</Button>
					<p
						data-paragraph
						className="animate-slide-top text-lg text-muted-foreground [animation-fill-mode:backwards] md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						<span className="font-bold text-green-600">R1000</span> off for the
						first 20 customers 🚀
					</p>
					<p
						data-paragraph
						className="w-full rounded-md border p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						Testimonials here
					</p>
				</div>
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
											className="grid size-20 place-items-center rounded-2xl bg-violet-600/10 p-4 transition hover:-rotate-6 hover:bg-violet-600/15 dark:bg-violet-200 dark:hover:bg-violet-100 sm:size-24"
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
				<div className="mt-16 flex w-full flex-col gap-8 text-center">
					<p
						data-paragraph
						className="rounded-md bg-red-100/50 p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
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
						className="p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						↓ There's an easier way
					</p>
					<h2 className="animate-slide-top text-2xl font-bold leading-normal text-foreground [animation-fill-mode:backwards] sm:text-6xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]">
						See every message, calendar and payment in one place, with your
						commission{' '}
						<span className="underline underline-offset-2">automatically</span>{' '}
						included.
						<br />
					</h2>
					<p
						data-paragraph
						className="p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						expand on value here
					</p>
					<p
						data-paragraph
						className="w-full rounded-md border p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						Team overview here
					</p>
					<h2 className="animate-slide-top text-2xl font-bold leading-normal text-foreground [animation-fill-mode:backwards] sm:text-6xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]">
						Leave the chaos behind. Run your event from one, powerful dashboard.
						<br />
					</h2>
					<p
						data-paragraph
						className="w-full rounded-md border p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						Pricing tier 1 here
					</p>
					<p
						data-paragraph
						className="w-full rounded-md border p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						Pricing tier 2 here
					</p>
					<p
						data-paragraph
						className="w-full rounded-md border p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						FAQs here
					</p>
					<p
						data-paragraph
						className="w-full rounded-md border p-8 text-lg text-muted-foreground md:text-2xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]"
					>
						More testimonials here
					</p>
					<h2 className="animate-slide-top text-2xl font-bold leading-normal text-foreground [animation-fill-mode:backwards] sm:text-6xl xl:mt-2 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:0.3s] xl:[animation-fill-mode:backwards]">
						One more catchy headline here
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
					<Button size="wide">Get Started</Button>
				</div>
			</div>
		</main>
	)
}
