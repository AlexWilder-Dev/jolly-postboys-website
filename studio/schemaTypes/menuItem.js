import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'menuItem',
  title: 'Menu Item',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'menuCategory'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (£)',
      type: 'number',
      description: 'Leave blank for "ask us" items',
    }),
    defineField({
      name: 'priceLabel',
      title: 'Price label override',
      type: 'string',
      description: 'Overrides the price field display — e.g. "ask us" or "£5/pint"',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'dietaryTags',
      title: 'Dietary tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Vegetarian (V)', value: 'V'},
          {title: 'Vegan (VE)', value: 'VE'},
          {title: 'Gluten-free (GF)', value: 'GF'},
        ],
        layout: 'tags',
      },
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Highlight this item (e.g. Burger of the Month)',
      initialValue: false,
    }),
    defineField({
      name: 'available',
      title: 'Available',
      type: 'boolean',
      description: 'Uncheck to hide from the menu without deleting',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first within the category',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Category then order',
      name: 'categoryOrder',
      by: [{field: 'category.order', direction: 'asc'}, {field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'name',
      category: 'category.title',
      price: 'price',
      priceLabel: 'priceLabel',
      available: 'available',
    },
    prepare({title, category, price, priceLabel, available}) {
      const priceStr = priceLabel || (price != null ? `£${price}` : '—')
      return {
        title: `${available === false ? '⚠ ' : ''}${title}`,
        subtitle: `${category || 'No category'} · ${priceStr}`,
      }
    },
  },
})
