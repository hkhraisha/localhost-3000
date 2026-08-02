// Service catalog seed data — converted from the "Done" prototype's `details` object,
// with a `category` field added so the API can group/filter the way the UI does.

const SERVICES = [
  // ---- Home services ----
  { key: 'cleaning', category: 'home', icon: 'ti-spray', title: 'Deep home cleaning', rating: 4.8, reviews: 540, price: 28.00, priceLabel: '28.00 JOD', desc: "A full top-to-bottom clean, from kitchens to baseboards. Bring-your-own supplies included at no extra cost." },
  { key: 'plumbing', category: 'home', icon: 'ti-droplet', title: 'Plumbing repair', rating: 4.8, reviews: 312, price: 20.00, priceLabel: '20.00 JOD', desc: "Licensed plumbers for leaks, clogs, and installations. Upfront pricing before any work begins." },
  { key: 'electric', category: 'home', icon: 'ti-bolt', title: 'Electrical repair', rating: 4.9, reviews: 287, price: 22.00, priceLabel: '22.00 JOD', desc: "Certified electricians for wiring, fixtures, and troubleshooting. Safety-inspected on every visit." },
  { key: 'ac', category: 'home', icon: 'ti-air-conditioning', title: 'Air conditioning services', rating: 4.8, reviews: 302, price: 20.00, priceLabel: 'From 20.00 JOD', desc: "Installation, maintenance, gas refill, cleaning, compressor repair, duct cleaning, and thermostat installation." },
  { key: 'carpentry', category: 'home', icon: 'ti-hammer', title: 'Carpentry', rating: 4.8, reviews: 176, price: 15.00, priceLabel: 'From 15.00 JOD', desc: "Furniture assembly, cabinet installation, shelving, custom furniture, door repair, flooring, and wooden partitions." },
  { key: 'painting', category: 'home', icon: 'ti-paint', title: 'Painting', rating: 4.7, reviews: 211, price: 40.00, priceLabel: 'From 40.00 JOD', desc: "Interior and exterior painting, decorative finishes, wallpaper installation and removal, and quick touch-ups." },
  { key: 'masonry', category: 'home', icon: 'ti-brick', title: 'Masonry', rating: 4.7, reviews: 89, price: 30.00, priceLabel: 'From 30.00 JOD', desc: "Tiling, marble installation, stone work, brick repair, and concrete repair." },
  { key: 'roofing', category: 'home', icon: 'ti-home-2', title: 'Roofing', rating: 4.7, reviews: 64, price: 35.00, priceLabel: 'From 35.00 JOD', desc: "Roof repair, waterproofing, gutter cleaning, and roof inspection." },
  { key: 'appliance', category: 'home', icon: 'ti-washmachine', title: 'Appliance repair', rating: 4.8, reviews: 398, price: 15.00, priceLabel: 'From 15.00 JOD', desc: "Refrigerator, washing machine, dryer, dishwasher, oven, stove, microwave, coffee machine, water dispenser, TV, vacuum, and air purifier repair." },
  { key: 'smarthome', category: 'home', icon: 'ti-device-cctv', title: 'Smart home', rating: 4.8, reviews: 142, price: 25.00, priceLabel: 'From 25.00 JOD', desc: "CCTV installation, alarm systems, smart locks, doorbells, Wi-Fi setup, home automation, voice assistant setup, and network optimization." },
  { key: 'outdoor', category: 'home', icon: 'ti-plant-2', title: 'Outdoor & garden', rating: 4.8, reviews: 167, price: 18.00, priceLabel: 'From 18.00 JOD', desc: "Gardening and landscaping, lawn mowing, tree trimming, irrigation, pool cleaning and maintenance, and pest control." },
  { key: 'pestcontrol', category: 'home', icon: 'ti-bug', title: 'Pest control', rating: 4.8, reviews: 223, price: 22.00, priceLabel: 'From 22.00 JOD', desc: "General pest, termite, rodent, mosquito, bed bug, and bird control." },

  // ---- Auto & moving ----
  { key: 'driver', category: 'auto', icon: 'ti-car', title: 'Private driver', rating: 4.9, reviews: 410, price: 15.00, priceLabel: '15.00 JOD', desc: "A vetted personal driver for the day or a single trip. Airport transfers available." },
  { key: 'automotive', category: 'auto', icon: 'ti-car', title: 'Automotive services', rating: 4.8, reviews: 287, price: 12.00, priceLabel: 'From 12.00 JOD', desc: "Maintenance, oil changes, battery and tire service, diagnostics, detailing, emergency towing and lockout, chauffeur, and inspections." },
  { key: 'movingstorage', category: 'auto', icon: 'ti-truck', title: 'Moving & storage', rating: 4.7, reviews: 156, price: 60.00, priceLabel: 'From 60.00 JOD', desc: "Home and office moving, packing, unpacking, furniture assembly, storage, and international moving." },
  { key: 'errands', category: 'auto', icon: 'ti-shopping-bag', title: 'Delivery & errands', rating: 4.9, reviews: 204, price: 5.00, priceLabel: 'From 5.00 JOD', desc: "Grocery and pharmacy pickup, parcel and document delivery, flower and gift delivery, dry cleaning pickup, and bank errands." },

  // ---- Health & beauty ----
  { key: 'physician', category: 'health', icon: 'ti-stethoscope', title: 'Physician home visit', rating: 5.0, reviews: 98, price: 30.00, priceLabel: '30.00 JOD', desc: "Board-certified physician comes to you. Full consultation, prescription service, and follow-up care included." },
  { key: 'massage', category: 'health', icon: 'ti-massage', title: 'Swedish massage, at home', rating: 4.9, reviews: 203, price: 45.00, priceLabel: '45.00 JOD', desc: "A signature 90-minute Swedish or deep tissue massage delivered to your door. Full professional setup included." },
  { key: 'iv', category: 'health', icon: 'ti-droplet-half-2', title: 'IV Wellness Drip', rating: 4.9, reviews: 203, price: 55.00, priceLabel: '55.00 JOD', desc: "Custom vitamin and hydration IV therapy administered by a registered nurse. Choose from energy, immunity, or recovery formulas." },
  { key: 'beauty', category: 'health', icon: 'ti-scissors', title: 'Beauty at home', rating: 4.8, reviews: 198, price: 25.00, priceLabel: '25.00 JOD', desc: "Hair, nails, and makeup services brought to your door by licensed professionals." },

  // ---- Family & learning ----
  { key: 'childfamily', category: 'family', icon: 'ti-baby-carriage', title: 'Child & family care', rating: 4.9, reviews: 118, price: 10.00, priceLabel: 'From 10.00 JOD/hr', desc: "Babysitting, nanny services, elder and companion care, special needs support, and homework supervision." },
  { key: 'petcare', category: 'family', icon: 'ti-paw', title: 'Pet care and walking', rating: 4.9, reviews: 167, price: 10.00, priceLabel: '10.00 JOD', desc: "Trusted pet sitters and walkers, background-checked and insured." },
  { key: 'personalassist', category: 'family', icon: 'ti-user-check', title: 'Personal assistance', rating: 4.9, reviews: 94, price: 15.00, priceLabel: 'From 15.00 JOD/hr', desc: "Personal, executive, and virtual assistant support — research, appointment booking, calendar management, reminders, and travel booking." },
  { key: 'education', category: 'family', icon: 'ti-book', title: 'Education', rating: 4.9, reviews: 240, price: 12.00, priceLabel: 'From 12.00 JOD/hr', desc: "Academic tutoring, languages, coding, music and art lessons, university admissions, test prep, and homework help." },
  { key: 'tutor', category: 'family', icon: 'ti-book', title: 'Private tutoring', rating: 4.9, reviews: 240, price: 12.00, priceLabel: '12.00 JOD/hr', desc: "Qualified tutors across school subjects and languages, in person or online." },

  // ---- Events & food ----
  { key: 'events', category: 'events', icon: 'ti-ticket', title: 'Events', rating: 4.9, reviews: 142, price: 0, priceLabel: 'On request', desc: "Wedding and birthday planning, corporate events, catering, decoration, entertainment, DJs, live bands, and venue booking." },
  { key: 'chef', category: 'events', icon: 'ti-chef-hat', title: 'Private chef, at home', rating: 4.8, reviews: 132, price: 40.00, priceLabel: '40.00 JOD', desc: "A private chef plans and prepares a full meal in your kitchen, groceries included." },

  // ---- Travel & VIP ----
  { key: 'travelconcierge', category: 'travel', icon: 'ti-plane', title: 'Travel concierge', rating: 4.9, reviews: 176, price: 0, priceLabel: 'On request', desc: "Flight and hotel booking, visa assistance, airport transfer, chauffeur, tour planning, travel insurance, and car rental." },
  { key: 'airport', category: 'travel', icon: 'ti-plane', title: 'VIP airport transfer', rating: 4.9, reviews: 176, price: 35.00, priceLabel: '35.00 JOD', desc: "A private, meet-and-greet airport transfer with a professional driver and flight tracking." },
  { key: 'realestate', category: 'travel', icon: 'ti-building-estate', title: 'Real estate', rating: 4.8, reviews: 72, price: 0, priceLabel: 'On request', desc: "Property search, buying and selling assistance, rentals, property management, home staging, inspection, and interior design." },
  { key: 'shoppingconcierge', category: 'travel', icon: 'ti-shopping-cart', title: 'Shopping concierge', rating: 4.8, reviews: 58, price: 0, priceLabel: 'On request', desc: "Personal shopping, gift and luxury sourcing, furniture and electronics shopping, and grocery runs." },

  // ---- Luxury / VIP (Done Plus) ----
  { key: 'jet', category: 'vip', icon: 'ti-plane-departure', title: 'Private jet charter', rating: 5.0, reviews: 41, price: 0, priceLabel: 'On request', desc: "On-demand private aviation for individuals, families, and groups. Routing, catering, and ground transfers arranged end-to-end." },
  { key: 'tailor', category: 'vip', icon: 'ti-shirt', title: 'Bespoke tailoring', rating: 4.9, reviews: 88, price: 180.00, priceLabel: 'From 180.00 JOD', desc: "A master tailor visits you for measurements and fittings, crafting made-to-measure suits, dresses, and formalwear." },
  { key: 'retreat', category: 'vip', icon: 'ti-mountain', title: 'Private retreats', rating: 5.0, reviews: 29, price: 0, priceLabel: 'On request', desc: "Fully curated getaways — villas, wellness retreats, and remote escapes, planned around exactly what you want." },
  { key: 'yacht', category: 'vip', icon: 'ti-anchor', title: 'Yacht & villa access', rating: 4.9, reviews: 37, price: 0, priceLabel: 'On request', desc: "Invite-only access to a network of private yachts and villas, with crew and concierge included." },
  { key: 'vipevents', category: 'vip', icon: 'ti-ticket', title: 'Sold-out events & reservations', rating: 5.0, reviews: 54, price: 0, priceLabel: 'On request', desc: "Access to sold-out shows, exclusive tables, and reservations at fully booked restaurants, arranged by our concierge." },
  { key: 'gifting', category: 'vip', icon: 'ti-gift', title: 'Personal gifting & sourcing', rating: 4.9, reviews: 63, price: 0, priceLabel: 'On request', desc: "Sourcing of rare, hard-to-find, and personalized gifts, handled from search to delivery." },

  // ---- Business & professional ----
  { key: 'businessservices', category: 'business', icon: 'ti-briefcase', title: 'Business services', rating: 4.8, reviews: 103, price: 0, priceLabel: 'On request', desc: "Company registration, PRO and government paperwork, HR, payroll, bookkeeping, tax prep, legal consultation, and translation." },
  { key: 'itservices', category: 'business', icon: 'ti-device-laptop', title: 'IT & technology', rating: 4.8, reviews: 187, price: 15.00, priceLabel: 'From 15.00 JOD', desc: "Computer, phone, and printer repair, software installs, data recovery, virus removal, web and app development, and cybersecurity." },
  { key: 'creative', category: 'business', icon: 'ti-palette', title: 'Creative services', rating: 4.9, reviews: 134, price: 0, priceLabel: 'On request', desc: "Graphic design, branding, photography, videography, animation, copywriting, content, social media, and marketing strategy." },
  { key: 'financial', category: 'business', icon: 'ti-chart-line', title: 'Financial services', rating: 4.8, reviews: 49, price: 0, priceLabel: 'On request', desc: "Financial planning, investment and insurance consultation, mortgage assistance, banking assistance, and retirement planning." },
  { key: 'legal', category: 'business', icon: 'ti-scale', title: 'Legal services', rating: 4.8, reviews: 61, price: 0, priceLabel: 'On request', desc: "Contracts, family and immigration law, company and employment law, notary services, and legal translation." },
  { key: 'corporate', category: 'business', icon: 'ti-building-skyscraper', title: 'Corporate services', rating: 4.8, reviews: 77, price: 0, priceLabel: 'On request', desc: "Office maintenance, cleaning contracts, facility management, corporate travel, employee relocation, and corporate gifting." },
  { key: 'government', category: 'business', icon: 'ti-stamp', title: 'Government & administrative', rating: 4.7, reviews: 55, price: 10.00, priceLabel: 'From 10.00 JOD', desc: "Passport renewal guidance, driver's license assistance, vehicle registration, municipality paperwork, and residency services." },

  // ---- Emergency & community ----
  { key: 'emergency', category: 'emergency', icon: 'ti-alert-triangle', title: 'Emergency services', rating: 4.9, reviews: 231, price: 15.00, priceLabel: 'From 15.00 JOD', desc: "Locksmith, emergency electrician and plumber, emergency towing and cleaning, and water or fire damage restoration." },
  { key: 'community', category: 'emergency', icon: 'ti-heart-handshake', title: 'Religious & community services', rating: 4.8, reviews: 36, price: 0, priceLabel: 'On request', desc: "Hajj and Umrah assistance, religious event planning, charity coordination, funeral arrangements, and community volunteering." },
];

const CATEGORIES = [
  { id: 'home', label: 'Home Services' },
  { id: 'auto', label: 'Auto & Moving' },
  { id: 'health', label: 'Health & Beauty' },
  { id: 'family', label: 'Family & Learning' },
  { id: 'events', label: 'Events & Food' },
  { id: 'travel', label: 'Travel & VIP' },
  { id: 'vip', label: 'Done VIP' },
  { id: 'business', label: 'Business & Pro' },
  { id: 'emergency', label: 'Emergency' },
];

module.exports = { SERVICES, CATEGORIES };
