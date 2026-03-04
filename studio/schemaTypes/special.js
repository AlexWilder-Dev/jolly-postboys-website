import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'special',
  title: 'Weeknight Special',
  type: 'document',
  fields: [
    defineField({
      name: 'day',
      title: 'Day',
      type: 'string',
      options: {
        list: [
          {title: 'Tuesday', value: 'Tuesday'},
          {title: 'Wednesday', value: 'Wednesday'},
          {title: 'Thursday', value: 'Thursday'},
          {title: 'Friday', value: 'Friday'},
          {title: 'Saturday', value: 'Saturday'},
          {title: 'Sunday', value: 'Sunday'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'nickname',
      title: 'Nickname',
      type: 'string',
      description: 'e.g. Twos-Day, Thirst-Day',
    }),
    defineField({
      name: 'deal',
      title: 'Deal',
      type: 'string',
      description: 'e.g. 2 Burgers for £20',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'note',
      title: 'Small print / note',
      type: 'string',
      description: 'e.g. excl. Burger of the Month',
    }),
    defineField({
      name: 'timeWindow',
      title: 'Time window',
      type: 'string',
      description: 'e.g. 4–9pm',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {title: 'day', subtitle: 'deal', active: 'active'},
    prepare({title, subtitle, active}) {
      return {title: `${active === false ? '⚠ ' : ''}${title}`, subtitle}
    },
  },
})
