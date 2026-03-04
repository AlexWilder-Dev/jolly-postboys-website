import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Singleton — only one document of this type should exist
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'phone',
      title: 'Phone number',
      type: 'string',
      description: 'e.g. 01865 777767',
    }),
    defineField({
      name: 'email',
      title: 'Email address',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        {name: 'street', title: 'Street', type: 'string'},
        {name: 'city', title: 'City', type: 'string'},
        {name: 'postcode', title: 'Postcode', type: 'string'},
      ],
    }),
    defineField({
      name: 'googleMapsUrl',
      title: 'Google Maps URL',
      type: 'url',
    }),
    defineField({
      name: 'openingHours',
      title: 'Opening Hours',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'day',
              title: 'Day',
              type: 'string',
              options: {
                list: [
                  'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday',
                ],
              },
            },
            {name: 'open', title: 'Opens', type: 'string', description: 'e.g. 4pm'},
            {name: 'close', title: 'Closes', type: 'string', description: 'e.g. 11pm'},
            {
              name: 'closed',
              title: 'Closed',
              type: 'boolean',
              initialValue: false,
              description: 'Check if closed this day',
            },
          ],
          preview: {
            select: {title: 'day', open: 'open', close: 'close', closed: 'closed'},
            prepare({title, open, close, closed}) {
              return {title, subtitle: closed ? 'Closed' : `${open} – ${close}`}
            },
          },
        },
      ],
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
