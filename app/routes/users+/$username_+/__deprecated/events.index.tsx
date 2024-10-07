import { type MetaFunction } from '@remix-run/react'
import { type loader as eventsLoader } from './events.tsx'

export default function EventsIndexRoute() {
	return (
		<div className="container pt-12">
			<p className="text-body-md">Select an event</p>
		</div>
	)
}

export const meta: MetaFunction<
	null,
	{ 'routes/users+/$username_+/events': typeof eventsLoader }
> = ({ params, matches }) => {
	const eventsMatch = matches.find(
		(m) => m.id === 'routes/users+/$username_+/events',
	)
	const displayName = eventsMatch?.data?.owner.name ?? params.username
	const eventCount = eventsMatch?.data?.owner.events.length ?? 0
	const eventsText = eventCount === 1 ? 'event' : 'events'
	return [
		{ title: `${displayName}'s Events | GetFranki` },
		{
			name: 'description',
			content: `Checkout ${displayName}'s ${eventCount} ${eventsText} on GetFranki`,
		},
	]
}
