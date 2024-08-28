import fs from 'fs'
import { faker } from '@faker-js/faker'
import { type EventImage, type Event } from '@prisma/client'
import { prisma } from '#app/utils/db.server.ts'
import { expect, test } from '#tests/playwright-utils.ts'

test('Users can create event with an image', async ({ page, login }) => {
	const user = await login()
	await page.goto(`/users/${user.username}/events`)

	const newEvent = createEvent()
	const altText = 'cute koala'
	await page.getByRole('link', { name: 'new event' }).click()

	// fill in form and submit
	await page.getByRole('textbox', { name: 'title' }).fill(newEvent.title)
	await page
		.getByLabel('Date')
		.fill(newEvent.date.toISOString().split('T')[0] ?? '')
	await page.getByRole('radio', { name: newEvent.type }).setChecked(true)
	await page.getByRole('textbox', { name: 'venue' }).fill(newEvent.venue)
	await page
		.getByRole('spinbutton', { name: 'Number of people' })
		.fill(newEvent.capacity.toString())
	await page
		.getByRole('spinbutton', { name: 'budget' })
		.fill(newEvent.budget.toString())
	await page.getByRole('textbox', { name: 'notes' }).fill(newEvent.notes)
	await page
		.getByLabel('image')
		.nth(0)
		.setInputFiles('tests/fixtures/images/kody-events/cute-koala.png')
	await page.getByRole('textbox', { name: 'alt text' }).fill(altText)

	await page.getByRole('button', { name: 'submit' }).click()
	await expect(page).toHaveURL(new RegExp(`/users/${user.username}/events/.*`))
	await expect(
		page.getByRole('heading', { name: newEvent.title }),
	).toBeVisible()
	await expect(page.getByAltText(altText)).toBeVisible()
})

test('Users can create event with multiple images', async ({ page, login }) => {
	const user = await login()
	await page.goto(`/users/${user.username}/events`)

	const newEvent = createEvent()
	const altText1 = 'cute koala'
	const altText2 = 'koala coder'
	await page.getByRole('link', { name: 'new event' }).click()

	// fill in form and submit
	await page.getByRole('textbox', { name: 'title' }).fill(newEvent.title)
	await page
		.getByLabel('Date')
		.fill(newEvent.date.toISOString().split('T')[0] ?? '')
	await page.getByRole('radio', { name: newEvent.type }).setChecked(true)
	await page.getByRole('textbox', { name: 'venue' }).fill(newEvent.venue)
	await page
		.getByRole('spinbutton', { name: 'Number of people' })
		.fill(newEvent.capacity.toString())
	await page
		.getByRole('spinbutton', { name: 'budget' })
		.fill(newEvent.budget.toString())
	await page.getByRole('textbox', { name: 'notes' }).fill(newEvent.notes)
	await page
		.getByLabel('image')
		.nth(0)
		.setInputFiles('tests/fixtures/images/kody-events/cute-koala.png')
	await page.getByLabel('alt text').nth(0).fill(altText1)
	await page.getByRole('button', { name: 'add image' }).click()

	await page
		.getByLabel('image')
		.nth(1)
		.setInputFiles('tests/fixtures/images/kody-events/koala-coder.png')
	await page.getByLabel('alt text').nth(1).fill(altText2)

	await page.getByRole('button', { name: 'submit' }).click()
	await expect(page).toHaveURL(new RegExp(`/users/${user.username}/events/.*`))
	await expect(
		page.getByRole('heading', { name: newEvent.title }),
	).toBeVisible()
	await expect(page.getByAltText(altText1)).toBeVisible()
	await expect(page.getByAltText(altText2)).toBeVisible()
})

test('Users can edit event image', async ({ page, login }) => {
	const user = await login()

	const event = await prisma.event.create({
		select: { id: true },
		data: {
			...createEventWithImage(),
			ownerId: user.id,
		},
	})
	await page.goto(`/users/${user.username}/events/${event.id}`)

	// edit the image
	await page.getByRole('link', { name: 'Edit', exact: true }).click()
	const updatedImage = {
		altText: 'koala coder',
		location: 'tests/fixtures/images/kody-events/koala-coder.png',
	}
	await page.getByLabel('image').nth(0).setInputFiles(updatedImage.location)
	await page.getByLabel('alt text').nth(0).fill(updatedImage.altText)
	await page.getByRole('button', { name: 'submit' }).click()

	await expect(page).toHaveURL(`/users/${user.username}/events/${event.id}`)
	await expect(page.getByAltText(updatedImage.altText)).toBeVisible()
})

test('Users can delete event image', async ({ page, login }) => {
	const user = await login()

	const event = await prisma.event.create({
		select: { id: true, title: true },
		data: {
			...createEventWithImage(),
			ownerId: user.id,
		},
	})
	await page.goto(`/users/${user.username}/events/${event.id}`)

	await expect(page.getByRole('heading', { name: event.title })).toBeVisible()
	// find image tags
	const images = page
		.getByRole('main')
		.getByRole('list')
		.getByRole('listitem')
		.getByRole('img')
	const countBefore = await images.count()
	await page.getByRole('link', { name: 'Edit', exact: true }).click()
	await page.getByRole('button', { name: 'remove image' }).click()
	await page.getByRole('button', { name: 'submit' }).click()
	await expect(page).toHaveURL(`/users/${user.username}/events/${event.id}`)
	const countAfter = await images.count()
	expect(countAfter).toEqual(countBefore - 1)
})

function createEvent() {
	return {
		title: faker.lorem.words(3),
		date: faker.date.future(),
		type: faker.helpers.arrayElement(['Corporate', 'Wedding', 'Private']),
		venue: faker.location.streetAddress(),
		capacity: faker.number.int(5000),
		budget: faker.number.int(5000000),
		notes: faker.lorem.paragraphs(3),
	} satisfies Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>
}
function createEventWithImage() {
	return {
		...createEvent(),
		images: {
			create: {
				altText: 'cute koala',
				contentType: 'image/png',
				blob: fs.readFileSync(
					'tests/fixtures/images/kody-events/cute-koala.png',
				),
			},
		},
	} satisfies Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'> & {
		images: { create: Pick<EventImage, 'altText' | 'blob' | 'contentType'> }
	}
}
