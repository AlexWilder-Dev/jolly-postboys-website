import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'recurring',
      title: 'Recurring event',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description: 'For one-off events',
      hidden: ({document}) => document?.recurring === true,
    }),
    defineField({
      name: 'recurringDay',
      title: 'Day of the week',
      type: 'string',
      hidden: ({document}) => !document?.recurring,
      options: {
        list: [
          {title: 'Monday', value: 'monday'},
          {title: 'Tuesday', value: 'tuesday'},
          {title: 'Wednesday', value: 'wednesday'},
          {title: 'Thursday', value: 'thursday'},
          {title: 'Friday', value: 'friday'},
          {title: 'Saturday', value: 'saturday'},
          {title: 'Sunday', value: 'sunday'},
        ],
      },
    }),
    defineField({
      name: 'recurringFrequency',
      title: 'Frequency',
      type: 'string',
      hidden: ({document}) => !document?.recurring,
      options: {
        list: [
          {title: 'Weekly', value: 'weekly'},
          {title: 'Fortnightly', value: 'fortnightly'},
          {title: 'Monthly', value: 'monthly'},
        ],
      },
    }),
    defineField({
      name: 'time',
      title: 'Time',
      type: 'string',
      description: 'e.g. 7:30pm or 7pm – 10pm',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Uncheck to hide without deleting',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      recurring: 'recurring',
      recurringDay: 'recurringDay',
      recurringFrequency: 'recurringFrequency',
      active: 'active',
    },
    prepare({title, date, recurring, recurringDay, recurringFrequency, active}) {
      const when = recurring
        ? `${recurringFrequency || ''} ${recurringDay || ''}`.trim()
        : date || 'No date'
      return {
        title: `${active === false ? '⚠ ' : ''}${title}`,
        subtitle: when,
      }
    },
  },
})
