// Run with: npx sanity exec populate.js --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})

async function populate() {
  console.log('Clearing existing documents...')
  const existing = await client.fetch(
    `*[_type in ["menuCategory","menuItem","special","event","siteSettings"]]._id`
  )
  for (const id of existing) {
    await client.delete(id)
  }
  console.log(`Deleted ${existing.length} existing documents`)

  // ── Menu Categories ───────────────────────────────────────────
  console.log('\nCreating menu categories...')
  const categories = [
    {_id: 'cat-starters', title: 'Starters & Sharers', order: 1, slug: 'starters'},
    {_id: 'cat-mains',    title: 'Mains',               order: 2, slug: 'mains'},
    {_id: 'cat-burgers',  title: 'Burgers',              order: 3, slug: 'burgers'},
    {_id: 'cat-sides',    title: 'Sides',                order: 4, slug: 'sides'},
    {_id: 'cat-sunday',   title: 'Sunday Roast',         order: 5, slug: 'sunday'},
    {_id: 'cat-drinks',   title: 'Drinks',               order: 6, slug: 'drinks'},
  ]
  for (const cat of categories) {
    await client.createOrReplace({
      _type: 'menuCategory',
      ...cat,
      slug: {_type: 'slug', current: cat.slug},
    })
    console.log(`  ✓ ${cat.title}`)
  }

  const ref = (id) => ({_type: 'reference', _ref: id})

  // ── Menu Items ────────────────────────────────────────────────
  console.log('\nCreating menu items...')
  const items = [
    // Starters & Sharers
    {name: 'Crispy Chicken Wings',    category: ref('cat-starters'), price: 7,    dietaryTags: [],       description: 'Buffalo or BBQ sauce, blue cheese dip',                               order: 1},
    {name: 'Loaded Skins',            category: ref('cat-starters'), price: 6,    dietaryTags: ['V'],    description: 'Crispy potato skins, cheddar, sour cream, chives',                    order: 2},
    {name: 'Garlic Flatbread',        category: ref('cat-starters'), price: 5,    dietaryTags: ['V'],    description: 'Toasted flatbread, garlic butter, fresh herbs',                        order: 3},
    {name: 'Battered Halloumi Fries', category: ref('cat-starters'), price: 6.50, dietaryTags: ['V'],    description: 'Beer-battered halloumi, sweet chilli dip',                             order: 4},
    {name: 'Prawn Cocktail',          category: ref('cat-starters'), price: 7,    dietaryTags: [],       description: 'Classic Marie Rose, little gem, crusty bread',                         order: 5},
    {name: 'Soup of the Day',         category: ref('cat-starters'), price: 5,    dietaryTags: ['V'],    description: 'Ask your server — served with crusty bread',                           order: 6},

    // Mains
    {name: 'Beef & Ale Pie',           category: ref('cat-mains'), price: 15, dietaryTags: [],    description: 'Slow-braised beef, shortcrust pastry, mash, seasonal veg, gravy',        order: 1},
    {name: 'Fish & Chips',             category: ref('cat-mains'), price: 15, dietaryTags: [],    description: 'Beer-battered cod, chunky chips, mushy peas, tartare sauce',             order: 2},
    {name: 'Sausage & Mash',           category: ref('cat-mains'), price: 14, dietaryTags: [],    description: 'Cumberland sausages, creamy mash, caramelised onion gravy',              order: 3},
    {name: 'Butternut Squash Risotto', category: ref('cat-mains'), price: 13, dietaryTags: ['V'], description: 'Roasted squash, sage, parmesan, toasted seeds',                          order: 4},
    {name: 'Scampi & Chips',           category: ref('cat-mains'), price: 13, dietaryTags: [],    description: 'Wholetail scampi, chunky chips, peas, tartare sauce',                    order: 5},
    {name: 'Chicken & Mushroom Pasta', category: ref('cat-mains'), price: 13, dietaryTags: [],    description: 'Tagliatelle, grilled chicken, wild mushrooms, cream sauce',               order: 6},

    // Burgers
    {name: 'Burger of the Month', category: ref('cat-burgers'), priceLabel: 'Ask us', dietaryTags: [], featured: true, description: "Ask your server for this month's special — changes monthly — not included in Twos-Day deal", order: 1},
    {name: 'The Classic',         category: ref('cat-burgers'), price: 13, dietaryTags: [],       description: '6oz beef patty, baby gem, tomato, gherkin, burger sauce, brioche bun',   order: 2},
    {name: 'The Smash',           category: ref('cat-burgers'), price: 14, dietaryTags: [],       description: 'Double smashed beef patty, American cheese, pickles, mustard, onion',    order: 3},
    {name: 'BBQ Bacon',           category: ref('cat-burgers'), price: 14, dietaryTags: [],       description: '6oz beef patty, smoked bacon, cheddar, BBQ sauce, crispy onions',         order: 4},
    {name: 'Crispy Chicken',      category: ref('cat-burgers'), price: 13, dietaryTags: [],       description: 'Southern fried chicken thigh, pickled slaw, hot honey mayo',              order: 5},
    {name: 'Veggie Burger',       category: ref('cat-burgers'), price: 12, dietaryTags: ['V'],    description: 'Fried halloumi or plant-based patty, relish, dressed leaves',             order: 6},

    // Sides
    {name: 'Chunky Chips',       category: ref('cat-sides'), price: 3.50, dietaryTags: ['VE'], description: 'Skin-on, sea salt',              order: 1},
    {name: 'Sweet Potato Fries', category: ref('cat-sides'), price: 4,    dietaryTags: ['V'],  description: 'Chipotle mayo',                  order: 2},
    {name: 'Onion Rings',        category: ref('cat-sides'), price: 3.50, dietaryTags: ['V'],  description: 'Beer-battered',                  order: 3},
    {name: 'House Salad',        category: ref('cat-sides'), price: 3.50, dietaryTags: ['VE'], description: 'Mixed leaves, dressing',          order: 4},
    {name: 'Mac & Cheese',       category: ref('cat-sides'), price: 4.50, dietaryTags: ['V'],  description: 'Aged cheddar, crispy breadcrumbs', order: 5},
    {name: 'Garlic Bread',       category: ref('cat-sides'), price: 3,    dietaryTags: ['V'],  description: '',                               order: 6},

    // Sunday Roast
    {name: 'Roast Beef',     category: ref('cat-sunday'), price: 16, dietaryTags: [],          description: 'Slow-roasted topside, Yorkshire pudding, roasties, seasonal veg, gravy',           order: 1},
    {name: 'Roast Chicken',  category: ref('cat-sunday'), price: 15, dietaryTags: [],          description: 'Half free-range chicken, stuffing, roasties, seasonal veg, gravy',                  order: 2},
    {name: 'Roast Pork',     category: ref('cat-sunday'), price: 15, dietaryTags: [],          description: 'Slow-roasted belly, crackling, apple sauce, roasties, seasonal veg',                order: 3},
    {name: 'Nut Roast',      category: ref('cat-sunday'), price: 14, dietaryTags: ['V','VE'],  description: 'House nut roast, roasties, seasonal veg, red wine gravy',                           order: 4},

    // Drinks (draught + wine & spirits combined)
    {name: 'House Lager',         category: ref('cat-drinks'), priceLabel: '£5 / pint',    dietaryTags: [], description: 'Ask your server for the current house lager',                   order: 1},
    {name: 'Cask Ale',            category: ref('cat-drinks'), priceLabel: '£5 / pint',    dietaryTags: [], description: 'Rotating local & regional ales — ask what\'s on',               order: 2},
    {name: 'Craft Keg',           category: ref('cat-drinks'), priceLabel: 'From £5.50',   dietaryTags: [], description: 'Rotating craft beers from local & independent breweries',        order: 3},
    {name: 'Guinness',            category: ref('cat-drinks'), price: 5.50,                dietaryTags: [], description: 'The black stuff, poured properly',                               order: 4},
    {name: 'House Wine',          category: ref('cat-drinks'), priceLabel: '£5 / 175ml',   dietaryTags: [], description: 'Red, white & rosé — ask your server',                           order: 5},
    {name: 'Spirits & Mixers',    category: ref('cat-drinks'), priceLabel: 'From £4',      dietaryTags: [], description: 'Full back bar — ask your server',                               order: 6},
    {name: 'Soft Drinks',         category: ref('cat-drinks'), priceLabel: 'From £2.50',   dietaryTags: [], description: 'Coke, Diet Coke, Lemonade, J2O, Cordials',                      order: 7},
    {name: 'Hot Drinks',          category: ref('cat-drinks'), priceLabel: 'From £2.50',   dietaryTags: [], description: 'Tea, coffee, hot chocolate',                                    order: 8},
  ]

  for (const item of items) {
    await client.create({_type: 'menuItem', available: true, featured: false, ...item})
    console.log(`  ✓ ${item.name}`)
  }

  // ── Weeknight Specials ────────────────────────────────────────
  console.log('\nCreating weeknight specials...')
  const specials = [
    {_id: 'special-tuesday',   day: 'Tuesday',   nickname: 'Twos-Day',  deal: '2 Burgers for £20',              note: 'Excl. Burger of the Month', timeWindow: '4–9pm',  order: 1},
    {_id: 'special-wednesday', day: 'Wednesday', nickname: '3 for £18', deal: 'Any 3 Starters / Sharers for £18', timeWindow: '4–9pm',  order: 2},
    {_id: 'special-thursday',  day: 'Thursday',  nickname: 'Thirst-Day',deal: '£4 House Lager or Cask Pint',    note: '£5 House Wine 175ml',       timeWindow: '4–11pm', order: 3},
  ]
  for (const s of specials) {
    await client.createOrReplace({_type: 'special', active: true, ...s})
    console.log(`  ✓ ${s.day}`)
  }

  // ── Events ────────────────────────────────────────────────────
  console.log('\nCreating events...')
  const events = [
    {_id: 'event-sunday-roast', title: 'Sunday Roast',      description: 'All the trimmings. Booking recommended — call 01865 777767.',                                                       recurring: true,  recurringDay: 'sunday',    recurringFrequency: 'weekly',   time: '12–6pm'},
    {_id: 'event-quiz',         title: 'Pub Quiz Night',    description: 'General knowledge, music rounds and more. Teams of up to 6. Follow @jollypostboysoxford for the next date.',        recurring: true,  recurringFrequency: 'monthly', time: 'Check Instagram'},
    {_id: 'event-live-music',   title: 'Live Music Nights', description: 'Local artists and bands. Follow us on Instagram for upcoming acts.',                                                 recurring: true,  recurringFrequency: 'monthly', time: 'Check Instagram'},
    {_id: 'event-community',    title: 'Community Events',  description: "From charity fundraisers to seasonal celebrations — we're at the heart of Florence Park.",                          recurring: false, time: 'Throughout the year'},
  ]
  for (const e of events) {
    await client.createOrReplace({_type: 'event', active: true, ...e})
    console.log(`  ✓ ${e.title}`)
  }

  // ── Site Settings ─────────────────────────────────────────────
  console.log('\nCreating site settings...')
  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    phone: '01865 777767',
    email: 'hello@jollypostboys.co.uk',
    address: {street: '22 Florence Park Rd', city: 'Oxford', postcode: 'OX4 3PH'},
    instagramUrl: 'https://instagram.com/jollypostboysoxford',
    openingHours: [
      {_key: 'mon', day: 'Monday',    closed: true},
      {_key: 'tue', day: 'Tuesday',   open: '4pm',  close: '11pm', closed: false},
      {_key: 'wed', day: 'Wednesday', open: '4pm',  close: '11pm', closed: false},
      {_key: 'thu', day: 'Thursday',  open: '4pm',  close: '11pm', closed: false},
      {_key: 'fri', day: 'Friday',    open: '3pm',  close: '11pm', closed: false},
      {_key: 'sat', day: 'Saturday',  open: '12pm', close: '11pm', closed: false},
      {_key: 'sun', day: 'Sunday',    open: '12pm', close: '7pm',  closed: false},
    ],
  })
  console.log('  ✓ Site settings')

  console.log('\n✅ All done!')
}

populate().catch((err) => { console.error(err); process.exit(1) })
