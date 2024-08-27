import { type MetaFunction } from '@remix-run/node'
import { useEffect, useRef, useState } from 'react'
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from '#app/components/ui/accordion'
import { Button } from '#app/components/ui/button.js'
import { Icon, type IconName } from '#app/components/ui/icon.js'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '#app/components/ui/tooltip.tsx'
import { cn } from '#app/utils/misc.tsx'
import { logos } from './logos/logos.ts'

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
		<main className="font-poppins grid h-full place-items-center gap-24 xl:gap-28 xl:pt-14">
			<div className="flex flex-col items-center">
				<div className="grid place-items-center px-5 xl:grid-cols-2 xl:gap-48">
					<section className="flex max-w-lg flex-col items-center gap-10 py-16 text-center sm:py-20 lg:max-w-2xl lg:gap-12 xl:order-2 xl:items-start xl:text-left">
						<Open />
						<div className="animate-slide-top fill-mode-backwards [animation-delay:1s] xl:hidden">
							<Testimonial index={0} />
						</div>
					</section>
					<IconWall />
				</div>
				<div className="hidden animate-slide-top fill-mode-backwards [animation-delay:2.8s] xl:block">
					<Testimonial index={0} />
				</div>
			</div>
			<Agitation />
			<Solution />
			<Team />
			<div className="flex w-full flex-col items-center gap-24 bg-secondary/70">
				<Pricing />
				<Testimonial index={1} />
				<FAQs />
				<Close />
			</div>
		</main>
	)
}

function Open() {
	return (
		<div className="flex flex-col gap-10 lg:gap-12">
			<Icon
				name="logo"
				className="-mb-12 -ml-4 hidden size-28 animate-slide-left self-start fill-mode-backwards [animation-delay:1.5s] xl:block"
			/>
			<h1 className="animate-slide-top text-4xl font-extrabold leading-normal tracking-tight text-foreground sm:text-5xl sm:leading-snug xl:animate-slide-left xl:text-6xl xl:leading-snug xl:[animation-delay:1.5s] xl:[animation-fill-mode:backwards]">
				Run your events,
				<br />
				<span className="rounded-md bg-foreground px-3 py-1 text-background">
					in one place
				</span>
			</h1>
			<p
				data-paragraph
				className="animate-slide-top text-lg leading-relaxed text-muted-foreground [animation-delay:0.3s] [animation-fill-mode:backwards] xl:animate-slide-left xl:[animation-delay:1.9s] xl:[animation-fill-mode:backwards]"
			>
				The event management tool with all you need to run large-scale events,
				with multiple suppliers, and make your commission automatically.
			</p>
			<div className="animate-slide-top space-y-4 [animation-delay:0.5s] [animation-fill-mode:backwards] xl:[animation-delay:2.2s]">
				<Button size="wide">
					Get Started <Icon name="arrow-right" className="ml-2 font-bold" />
				</Button>
				<p data-paragraph className="text-sm text-muted-foreground">
					<span className="font-bold text-green-600">
						<Icon size="md" className="mr-1" name="rocket" /> R2000
					</span>{' '}
					off for the first 10 customers (3 left)
				</p>
			</div>
		</div>
	)
}

function IconWall() {
	return (
		<div className="flex flex-col gap-2 xl:-mr-64 xl:flex-row xl:gap-0">
			<ul className="flex max-w-3xl flex-wrap justify-center gap-2 sm:gap-4 xl:mt-0 xl:grid xl:grid-flow-col xl:grid-cols-5 xl:grid-rows-6">
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
										className="grid size-20 place-items-center rounded-2xl bg-secondary/70 p-4 transition hover:-rotate-6 hover:bg-primary/15 dark:bg-violet-200 dark:hover:bg-violet-100 lg:size-24"
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
			<div className="flex animate-slide-top flex-col items-center gap-2 [animation-delay:1.4s] [animation-fill-mode:backwards] xl:flex-row">
				<Icon
					name="arrow-right-hand"
					className="ml-8 hidden size-32 xl:block"
				/>
				<Icon name="arrow-down-hand" className="mr-2 block size-28 xl:hidden" />
				<Icon name="logo" className="-mt-3 size-36 xl:hidden" />
			</div>
		</div>
	)
}

function Agitation() {
	return (
		<div className="w-full max-w-xl px-5">
			<section className="flex flex-col items-center gap-8">
				<ul className="w-full space-y-2 rounded-md bg-red-200/40 p-8 text-center text-lg leading-relaxed text-muted-foreground xl:max-w-xl xl:text-xl/6">
					<li>❌ Seperate chat and email threads</li>
					<li>❌ Multiple event calendars</li>
					<li>❌ Commission negotiations per supplier</li>
					<li>❌ Manual bank transfers</li>
					<li>🌧️</li>
				</ul>
				<p data-paragraph className="pt-2 text-sm text-muted-foreground">
					<Icon size="md" className="mr-2" name="arrow-down" />
					There's an easier way
				</p>
			</section>
		</div>
	)
}

function Solution() {
	const feature = {
		bookings: <FeatureContent key="bookings" content="Bookings description" />,
		commission: (
			<FeatureContent key="commission" content="Commission description" />
		),
		chat: <FeatureContent key="chat" content="Chat description" />,
		notes: <FeatureContent key="notes" content="Notes description" />,
		files: <FeatureContent key="files" content="Files description" />,
		invoicing: (
			<FeatureContent key="invoicing" content="Invoicing description" />
		),
		payments: <FeatureContent key="payments" content="Payments description" />,
	}

	const features = Object.keys(feature) as FeatureKey[]
	type FeatureKey = keyof typeof feature
	const [activeFeature, setActiveFeature] = useState<FeatureKey>('bookings')
	const [featureClicked, setFeatureClicked] = useState(false)

	let featureIndex = useRef(0)

	useEffect(() => {
		const featureKeys = Object.keys(feature) as FeatureKey[]
		const totalFeatures = featureKeys.length

		const interval = setInterval(() => {
			if (featureIndex.current >= totalFeatures - 1) {
				featureIndex.current = 0
			} else {
				featureIndex.current++
			}
			setActiveFeature(featureKeys[featureIndex.current] ?? 'bookings')
		}, 4000)

		if (featureClicked) {
			clearInterval(interval)
		}

		return () => clearInterval(interval)
	})

	const selectFeature = (feature: FeatureKey) => {
		setActiveFeature(feature)
		setFeatureClicked(true)
	}
	return (
		<div className="flex flex-col items-center">
			<section className="flex max-w-3xl flex-col gap-10 px-5 md:px-0">
				<h2 className="text-3xl font-bold leading-normal tracking-tight text-foreground sm:text-4xl xl:text-5xl">
					Every booking, message and payment in one place, with your commission{' '}
					<span className="underline underline-offset-2">automatically</span>{' '}
					included.
					<br />
				</h2>
				<p
					data-paragraph
					className="leading-relaxed text-muted-foreground xl:text-left"
				>
					Book suppliers, create invoices, process payments and get paid with
					ease. Spend your time creating the ultimate occasion for your clients,
					not dealing with logistics. GetFranki provides you with the control
					you need to run your events, EASILY.
				</p>
			</section>
			<div id="features" className="flex flex-col items-center pt-10 xl:pt-12">
				<div className="flex max-w-3xl flex-wrap justify-center gap-2 xl:gap-4">
					{features.map((feature) => (
						<FeatureTrigger
							key={feature}
							name={feature}
							isActive={activeFeature === feature}
							setActive={() => selectFeature(feature)}
						/>
					))}
				</div>
				<div className="w-screen items-center bg-secondary/70 px-5 py-8">
					<div className="mx-auto max-w-3xl text-left">
						{feature[activeFeature]}
					</div>
				</div>
			</div>
		</div>
	)
}

function FeatureTrigger({
	isActive,
	setActive,
	name,
}: {
	isActive: boolean
	setActive: () => void
	name: IconName
}) {
	return (
		<div
			className={cn(
				'flex size-24 cursor-pointer flex-col items-center gap-2 text-sm font-semibold text-muted-foreground',
				{
					'text-primary': isActive,
				},
			)}
			onClick={setActive}
		>
			<Icon size="xl" name={name} />
			{name.charAt(0).toUpperCase() + name.slice(1)}
		</div>
	)
}

function FeatureContent({ content }: { content: string }) {
	return (
		<p
			data-paragraph
			key="commission"
			className="text-muted-foreground duration-700 animate-in fade-in"
		>
			{content}
		</p>
	)
}

function Team() {
	return (
		<div className="flex max-w-3xl flex-col gap-10 px-5 leading-relaxed text-muted-foreground lg:gap-12">
			<h3 className="text-center font-bold text-primary">Meet the team</h3>
			<div className="grid grid-cols-2 gap-4 xl:gap-8">
				<NameTag name="Ollie Swart" />
				<NameTag name="Keegs Foreman" />
				<NameTag name="Nick Schooling" />
				<NameTag name="Dev Neill" />
			</div>
			<p data-paragraph className="leading-relaxed text-muted-foreground">
				Together, we've organised 1000+ events in different areas of the Western
				Cape. We've seen the chaos that comes with organising events, and we've
				built a solution to make it easy for you.
			</p>
		</div>
	)
}

function NameTag({ name = '' }) {
	return (
		<div className="flex items-center gap-4">
			<div className="size-12 rounded-full bg-gray-300" />
			<p>{name}</p>
		</div>
	)
}

function Pricing() {
	return (
		<div
			id="pricing"
			className="flex w-full max-w-5xl flex-col items-center gap-24 px-5 pt-24 lg:gap-12"
		>
			<div className="flex max-w-3xl flex-col gap-10">
				<h1 className="text-center font-bold text-primary">Pricing</h1>
				<h2 className="text-center text-3xl font-bold leading-normal tracking-tight text-foreground sm:text-4xl xl:text-5xl">
					Leave the chaos behind. Run your event from one, powerful dashboard.
					<br />
				</h2>
				<p data-paragraph className="text-center text-sm text-muted-foreground">
					<span className="font-bold text-green-600">
						<Icon size="md" className="mr-1" name="rocket" /> R2000
					</span>{' '}
					off for the first 10 customers (3 left)
				</p>
			</div>
			<div className="flex w-full flex-col gap-8 lg:flex-row lg:gap-10">
				<div className="flex w-full flex-col justify-between gap-5 rounded-md bg-background p-8 text-foreground">
					<p className="text-lg font-bold">Starter</p>
					<div className="relative flex items-end gap-2">
						<p className="relative text-base opacity-80">
							<span className="absolute inset-x-0 top-[47%] h-[1.8px] bg-foreground/80"></span>
							<span className="font-semibold tracking-tight">R4999</span>
						</p>
						<div className="flex">
							<p className="text-5xl font-extrabold tracking-tight">R2999</p>
							<span className="self-end font-semibold tracking-tight opacity-80">
								/month
							</span>
						</div>
					</div>
					<ul className="space-y-2 leading-relaxed">
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited events
						</li>
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited events Unlimited guests
						</li>
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited events Unlimited suppliers
						</li>
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited events Unlimited invoices
						</li>
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited events Unlimited payments
						</li>
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited events Unlimited payments
						</li>
						<li className="flex gap-2 text-muted-foreground/70">
							<Icon size="md" className="p-1" name="cross-1" />
							Unlimited payments
						</li>
						<li className="flex gap-2 text-muted-foreground/70">
							<Icon size="md" className="p-1" name="cross-1" />
							Unlimited payments
						</li>
						<li className="flex gap-2 text-muted-foreground/70">
							<Icon size="md" className="p-1" name="cross-1" />
							Unlimited payments
						</li>
					</ul>
					<Button size="wide">
						Get started
						<Icon name="arrow-right" className="ml-2 font-bold" />
					</Button>
					<p
						data-paragraph
						className="text-center text-sm font-medium text-muted-foreground"
					>
						Catchy reminder that this is a great deal!
					</p>
				</div>
				<div className="flex w-full flex-col justify-between gap-5 rounded-md border-2 border-primary bg-background p-8 text-foreground">
					<p className="text-lg font-bold">Pro</p>
					<div className="relative flex items-end gap-2">
						<p className="relative text-base opacity-80">
							<span className="absolute inset-x-0 top-[47%] h-[1.8px] bg-foreground/80"></span>
							<span className="font-semibold tracking-tight">R5499</span>
						</p>
						<div className="flex">
							<p className="text-5xl font-extrabold tracking-tight">R3499</p>
							<span className="self-end font-semibold tracking-tight opacity-80">
								/month
							</span>
						</div>
					</div>
					<ul className="space-y-2 leading-relaxed">
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited events
						</li>
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited guests
						</li>
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited suppliers
						</li>
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited invoices
						</li>
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited payments
						</li>
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited payments
						</li>
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited payments
						</li>
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited payments
						</li>
						<li className="flex gap-2">
							<Icon name="check" size="md" />
							Unlimited payments
						</li>
					</ul>
					<Button size="wide">
						Get started
						<Icon name="arrow-right" className="ml-2 font-bold" />
					</Button>
					<p
						data-paragraph
						className="text-center text-sm font-medium text-muted-foreground"
					>
						Catchy reminder that this is a great deal!
					</p>
				</div>
			</div>
		</div>
	)
}

function FAQs() {
	return (
		<div className="flex w-full max-w-5xl flex-col gap-10 px-5 lg:gap-12">
			<h3 className="text-center font-bold">Frequently Asked Questions</h3>
			<Accordion
				type="multiple"
				className="border-t border-muted-foreground/10"
			>
				<AccordionItem value="item-1">
					<AccordionTrigger>Question</AccordionTrigger>
					<AccordionContent>Answer</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-2">
					<AccordionTrigger>Question</AccordionTrigger>
					<AccordionContent>Answer</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-3">
					<AccordionTrigger>Question</AccordionTrigger>
					<AccordionContent>Answer</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-4">
					<AccordionTrigger>Question</AccordionTrigger>
					<AccordionContent>Answer</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	)
}

function Close() {
	return (
		<div className="flex max-w-3xl flex-col items-center gap-8 px-4 py-16">
			<h2 className="text-center text-3xl font-bold leading-normal tracking-tight text-foreground sm:text-4xl xl:text-5xl">
				Focus on the occasion, not the admin.
			</h2>
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
	)
}

function Testimonial({ index = 0 }: { index: 0 | 1 }) {
	const testimonials = [
		{
			name: '@chefollie',
			image: '',
			quote: '"Oh my zeus. This app is amazing"',
		},
		{
			name: '@eventpro',
			image: '',
			quote:
				'"I never have to negotiate commission again. I just foward the invoice. The supplier and I get paid. It\'s that simple."',
		},
	]

	if (testimonials[index] === undefined) {
		console.error('Testimonial index out of range')
		return null
	}

	return (
		<div className="text-md flex w-full max-w-3xl flex-col gap-2 px-5 text-center leading-relaxed text-muted-foreground">
			<p>{testimonials[index].quote}</p>
			<div className="flex items-center justify-center gap-2">
				<div className="size-12 rounded-full bg-gray-300" />
				{testimonials[index].name}
			</div>
		</div>
	)
}
