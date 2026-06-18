import { Product, Brand, BlogPost, PromoCode, Review } from './types';

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'babyhug',
    name: 'Babyhug',
    logo: 'BB',
    description: 'Babyhug is South Asias largest brand for baby and kids products, known for safety, durability, and comfort.',
    founded: '2016',
    specialty: 'Comfort Apparel & Premium Baby Strollers'
  },
  {
    id: 'carters',
    name: "Carter's",
    logo: "C's",
    description: "The leading brand of baby clothes, gifts, and accessories in America, designed on the belief that childhood is a celebration.",
    founded: '1865',
    specialty: 'Ultra-soft Organic Rompers & Sleepsuits'
  },
  {
    id: 'pampers',
    name: 'Pampers',
    logo: 'P',
    description: 'Trusted by parents worldwide, Pampers provides exceptional diaper comfort and premium dry-care protection for growing babies.',
    founded: '1961',
    specialty: 'Active Dry Tape & Pant-Style Diapers'
  },
  {
    id: 'fisherprice',
    name: 'Fisher-Price',
    logo: 'FP',
    description: 'Creating developmental, safety-tested wooden and interactive toys that help children reach milestones while playing.',
    founded: '1930',
    specialty: 'Cognitive Development & High-Grade Plastic Toys'
  },
  {
    id: 'huggies',
    name: 'Huggies',
    logo: 'H',
    description: 'Providing clinically proven skin protection and supreme softness with organic cotton elements.',
    founded: '1978',
    specialty: 'Newborn Dry Touch Soft Pants'
  },
  {
    id: 'chicco',
    name: 'Chicco',
    logo: 'CH',
    description: 'An Italian brand offering multi-product solutions for the well-being of mother and child before and during their developmental phase.',
    founded: '1958',
    specialty: 'Car Seats, Feeding Equipment & Skin Care'
  }
];

export const INITIAL_CATEGORIES = [
  { id: 'apparel', name: 'Apparel & Clothes', icon: 'Shirt', count: 124 },
  { id: 'diapering', name: 'Diapering & Hygiene', icon: 'Sparkles', count: 48 },
  { id: 'toys', name: 'Toys & Gaming', icon: 'Gamepad2', count: 86 },
  { id: 'gear', name: 'Baby Gear & Strollers', icon: 'Car', count: 32 },
  { id: 'feeding', name: 'Feeding & Nursing', icon: 'Milk', count: 59 },
  { id: 'nursery', name: 'Nursery & Bedding', icon: 'Bed', count: 18 }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Organic Cotton Printed Front-Open Sleepsuit',
    brand: 'Carter\'s',
    category: 'apparel',
    subCategory: 'rompers',
    price: 499,
    originalPrice: 799,
    images: [
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Ensure a blissful night\'s sleep for your precious little one with Carter\'s organic sleepsuit. Crafted from pure, hand-harvested organic cotton, this sleep-and-play features an easy front-snap closure extending from neck to ankle. Designed with built-in foldover mittens for infants and non-skid footies for toddlers to prevent midnight scratches.',
    rating: 4.8,
    reviewsCount: 38,
    variants: {
      sizes: ['Newborn', '0-3M', '3-6M', '6-12M', '12-18M'],
      colors: [
        { name: 'Peach Pink', class: 'bg-rose-200' },
        { name: 'Sky Blue', class: 'bg-sky-200' },
        { name: 'Sage Green', class: 'bg-emerald-100' }
      ]
    },
    inStock: true,
    stockCount: 45,
    features: [
      'GOTS Certified 100% Organic Stretch Cotton',
      'Nickel-free snaps along reinforced panels',
      'Fold-over protective scratch mittens',
      'Breathable double-stitch mesh weave'
    ],
    frequentlyBoughtTogether: ['p2', 'p5']
  },
  {
    id: 'p2',
    name: 'Premium Ultra-Dry Pants Diapers (M - 64 Pack)',
    brand: 'Pampers',
    category: 'diapering',
    subCategory: 'pants',
    price: 1199,
    originalPrice: 1499,
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1522836924445-4478bdeb860c?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Pampers premium active dry care offers your baby 5-star skin protection. Features unique organic lotion-infused liners that actively shield sensitive skin against redness and rashes. Supported by a 360-degree cloud-stretch waistband that fits seamlessly without irritating waistlines.',
    rating: 4.7,
    reviewsCount: 142,
    variants: {
      sizes: ['S (4-8kg)', 'M (7-12kg)', 'L (9-14kg)', 'XL (12kg+)'],
      colors: [
        { name: 'Aqua Cloud', class: 'bg-teal-100' }
      ]
    },
    inStock: true,
    stockCount: 120,
    features: [
      'Inbuilt protective cream with organic Aloe Vera extracts',
      'Extra-dry channels absorbing wetness up to 12 hours',
      'Wetness color indicator turning yellow to blue',
      'Double leak-guards protecting thighs'
    ],
    frequentlyBoughtTogether: ['p9']
  },
  {
    id: 'p3',
    name: 'Luxe Folding Smart Travel Stroller with Canopy',
    brand: 'Babyhug',
    category: 'gear',
    subCategory: 'strollers',
    price: 4999,
    originalPrice: 6999,
    images: [
      'https://images.unsplash.com/photo-1594913785162-e678310c1f6b?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1596854407944-bf87f6f94c25?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Take the hassle out of traveling with Babyhug\'s ultra-lightweight one-second auto folding cabin stroller. Constructed with double-enforced aircraft grade aluminum alloy, it features 360-degree shockproof dual castor wheels, multi-position backrest recline, and expandable UV 50+ canopy with side ventilation panels.',
    rating: 4.9,
    reviewsCount: 22,
    variants: {
      sizes: ['One Size (0-4Y)'],
      colors: [
        { name: 'Slate Gray', class: 'bg-slate-600' },
        { name: 'Cosmo Black', class: 'bg-zinc-900' },
        { name: 'Royal Navy', class: 'bg-blue-900' }
      ]
    },
    inStock: true,
    stockCount: 8,
    features: [
      'One-click gravity self folding mechanism',
      '5-point safety belt with padded shoulder harnesses',
      'Cabin friendly dimensions fits overhead compartment',
      'Under-seat storage bag carrying up to 5kg'
    ],
    frequentlyBoughtTogether: ['p7', 'p10']
  },
  {
    id: 'p4',
    name: '3-in-1 Educational Stack and Roll Sensory Blocks',
    brand: 'Fisher-Price',
    category: 'toys',
    subCategory: 'educational',
    price: 799,
    originalPrice: 999,
    images: [
      'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Ignite infant cognitive thinking and visual comprehension with sensory multi-activity stacking toys. Ten colorful, easy-grip panels to build, nest, match, and snap into place. Decorated with tactile relief shapes, raised letters, and cute jungle characters on every face.',
    rating: 4.6,
    reviewsCount: 54,
    variants: {
      sizes: ['Standard'],
      colors: [
        { name: 'Multicolor Play', class: 'bg-amber-400' }
      ]
    },
    inStock: true,
    stockCount: 30,
    features: [
      'BPA-free medical-grade kid safe materials',
      'Promotes micro-motor precision and spatial skills',
      'Tactile surfaces with built-in soft click chimes',
      'Waterproof structure for bathtub bath play'
    ],
    frequentlyBoughtTogether: ['p1']
  },
  {
    id: 'p5',
    name: 'Natural Comfort Infant Feeding Anti-Colic Bottle',
    brand: 'Chicco',
    category: 'feeding',
    subCategory: 'bottles',
    price: 349,
    originalPrice: 499,
    images: [
      'https://images.unsplash.com/photo-1522836924445-4478bdeb860c?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Chicco\'s Well-Being feeding bottle protects baby from colic, reflux, and bloating. Outfitted with dual-channel anti-vacuum vents, the premium extra-soft satin-finish silicone teat mimics maternal skin flex, supporting steady rhythmic feeds without milk backflow.',
    rating: 4.5,
    reviewsCount: 79,
    variants: {
      sizes: ['150ml (0M+)', '250ml (2M+)', '330ml (4M+)'],
      colors: [
        { name: 'Frosted White', class: 'bg-stone-50' },
        { name: 'Pastel Blue', class: 'bg-blue-100' },
        { name: 'Pastel Pink', class: 'bg-pink-100' }
      ]
    },
    inStock: true,
    stockCount: 65,
    features: [
      'Dual anti-colic valves engineered at teat base',
      'Heat resistant premium borosilicate glass body',
      'Spill-proof sealing cap and wide mouth setup',
      'Aero-ergonomic handle design for self-grip'
    ],
    frequentlyBoughtTogether: ['p1', 'p2']
  },
  {
    id: 'p6',
    name: 'Premium Breathable Nursery Crib Nest & Mattress',
    brand: 'Babyhug',
    category: 'nursery',
    subCategory: 'bedding',
    price: 1899,
    originalPrice: 2499,
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1596854407944-bf87f6f94c25?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Recreate the safe, enclosed feeling of a mother\'s womb with Babyhug\'s memory foam crib lounger nest. It delivers supportive ergonomic posture for infants to reduce flat-head syndrome risks. Lined with hypoallergenic antibacterial bamboo fabric for dynamic thermoregulation.',
    rating: 4.8,
    reviewsCount: 16,
    variants: {
      sizes: ['Newborn-12M'],
      colors: [
        { name: 'Marshmallow White', class: 'bg-slate-50' },
        { name: 'Mint Mist', class: 'bg-teal-50' }
      ]
    },
    inStock: true,
    stockCount: 14,
    features: [
      '100% Breathable 3D mesh borders, zero choke risk',
      'Hypoallergenic machine-washable cotton zip cover',
      'Adjustable foot cords adapting to infant height growth',
      'Infused with safe silver-ion anti-bacterial agents'
    ],
    frequentlyBoughtTogether: ['p1']
  },
  {
    id: 'p7',
    name: 'Interactive Piano Kick gym and Play Mat',
    brand: 'Fisher-Price',
    category: 'toys',
    subCategory: 'gaming',
    price: 2499,
    originalPrice: 2999,
    images: [
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Kick-start your infant’s nursery milestones with the Smart Stages interactive key-piano play mat. Your baby can kick the colorful piano keys to activate fun stories, cheerful music tunes, lessons in counting, geometric shapes, colors, and friendly forest animal sounds.',
    rating: 4.8,
    reviewsCount: 92,
    variants: {
      sizes: ['One Size'],
      colors: [
        { name: 'Joyful Play', class: 'bg-yellow-100' }
      ]
    },
    inStock: true,
    stockCount: 22,
    features: [
      '4 Modes of play: Lay & Play, Tummy Time, Sit & Play, Take-Along',
      'Large light-up LED piano keys detachable for toddler strolls',
      '5 Activity toys: self-discovery mirror, hippo bite teething loop, clackers',
      'Variable smart volumes corresponding to infant developmental stages'
    ],
    frequentlyBoughtTogether: ['p4']
  },
  {
    id: 'p8',
    name: 'Gentle Cleansing Skin-Safe Baby Wipes (80 Pack)',
    brand: 'Babyhug',
    category: 'diapering',
    subCategory: 'wipes',
    price: 199,
    originalPrice: 299,
    images: [
      'https://images.unsplash.com/photo-1521133573892-e44906baee46?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Ensure clean and smooth skin for your bundle of joy with Babyhug\'s fragrance-free premium wet wipes. Designed with thick, cross-woven spunlace fabric and saturated with 99.8% pure distilled water and organic Aloe Vera. Free from alcohol, parabens, and hazardous chlorines.',
    rating: 4.4,
    reviewsCount: 180,
    variants: {
      sizes: ['Pack of 1', 'Pack of 3 (Combo)', 'Pack of 5 (Jumbo)'],
      colors: [
        { name: 'Premium Soft', class: 'bg-sky-50' }
      ]
    },
    inStock: true,
    stockCount: 500,
    features: [
      'Dermatologically tested pH-balanced protective layer',
      'Enriched with moisturizing Vitamin E and Jojoba extracts',
      'Premium plastic-lock pop lid retaining freshness indefinitely',
      'Hypoallergenic thick fabric sheets'
    ],
    frequentlyBoughtTogether: ['p2']
  },
  {
    id: 'p9',
    name: 'Complete Bio-Cotton Soft Infant Wash & Shampoo',
    brand: 'Chicco',
    category: 'feeding',
    subCategory: 'hygiene',
    price: 399,
    originalPrice: 499,
    images: [
      'https://images.unsplash.com/photo-1522836924445-4478bdeb860c?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1521133573892-e44906baee46?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Nourish your newborn\'s sensitive skin and clean fine baby locks safely with Chicco Baby Moments rich tear-free bath wash. Made with natural, dermatologist-certified organic oat extracts and plant glycerin. Its unique moisturizing formula strengthens skin defense layers right from birth.',
    rating: 4.6,
    reviewsCount: 46,
    variants: {
      sizes: ['100ml', '200ml', '500ml with pump'],
      colors: [
        { name: 'Clean Lavender', class: 'bg-purple-100' }
      ]
    },
    inStock: true,
    stockCount: 75,
    features: [
      '100% Tear-free certified gentle soap-free formula',
      'Consists of 92% natural origin ingredients',
      'Contains organic wheat germ oil maintaining skin barrier',
      'Zero synthetic dyes, silicones, sulfates, or microplastics'
    ],
    frequentlyBoughtTogether: ['p8', 'p2']
  },
  {
    id: 'p10',
    name: 'Convertible Isofix Baby Car Seat (Group 0+/1/2/3)',
    brand: 'Chicco',
    category: 'gear',
    subCategory: 'carseats',
    price: 8999,
    originalPrice: 11999,
    images: [
      'https://images.unsplash.com/photo-1596854407944-bf87f6f94c25?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1594913785162-e678310c1f6b?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Chicco\'s premium convertible safety-certified Isofix infant car seat evolves with your growing baby. Approved for children from birth up to 36kg (approx 12 years). It relies on premium Isofix installation connectors for unwavering cabin stability against high-speed impacts.',
    rating: 4.9,
    reviewsCount: 15,
    variants: {
      sizes: ['All-in-One (0-12Y)'],
      colors: [
        { name: 'Charcoal Deep', class: 'bg-slate-800' },
        { name: 'Berry Red Line', class: 'bg-red-800' }
      ]
    },
    inStock: true,
    stockCount: 5,
    features: [
      '360-degree rotation base enabling easiest boarding',
      'Inbuilt side-impact air-bumper crash protect shields',
      '10-Position adjustable ergonomic headrest heights',
      'Removable specialized newborn posture reducer pillow'
    ],
    frequentlyBoughtTogether: ['p3']
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    productId: 'p1',
    userName: 'Aanya Sharma',
    rating: 5,
    title: 'Extremely soft and cute!',
    comment: 'The cotton fabric is incredibly fine. My 2-month-old daughter sleeps beautifully, and the snaps are very convenient for late-night diaper changes. Highly recommended!',
    date: '2026-05-12',
    verified: true
  },
  {
    id: 'r2',
    productId: 'p1',
    userName: 'Rajesh Patel',
    rating: 4,
    title: 'Very practical sleeve cuffs',
    comment: 'The foldover scratch mittens are a lifesaver. Fabric color remains vibrant and soft even after 5 machine washes using mild detergent.',
    date: '2026-05-28',
    verified: true
  },
  {
    id: 'r3',
    productId: 'p2',
    userName: 'Sneha Rao',
    rating: 5,
    title: 'Keeps baby dry all night long',
    comment: 'I was hesitant about diaper rash, but Pampers premium is excellent. Up to 11 hours of hassle-free sleep. The yellow line turns blue letting us know when it is ready for a swap.',
    date: '2026-06-02',
    verified: true
  },
  {
    id: 'r4',
    productId: 'p3',
    userName: 'Vikram Mehta',
    rating: 5,
    title: 'Amazing folded cabin stroller',
    comment: 'Took it on our domestic flight last week! Auto-folds cleanly with one hand. It is light yet sturdy, and the suspension absorbs bumps perfectly.',
    date: '2026-06-05',
    verified: true
  }
];

export const PROMO_CODES: PromoCode[] = [
  {
    code: 'FIRSTBABY',
    discountType: 'percentage',
    value: 15,
    minSpend: 999,
    description: 'Get 15% OFF on your first order. Minimum purchase value: ₹999.'
  },
  {
    code: 'TOYJOY20',
    discountType: 'fixed',
    value: 200,
    minSpend: 1499,
    description: 'Enjoy ₹200 flat discount on toys and educational items above ₹1499.'
  },
  {
    code: 'DIAPERCARE',
    discountType: 'percentage',
    value: 10,
    description: 'Take 10% off diapers and health hygiene products.'
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: 'The Ultimate First-Time Parent Crib Safety Guide',
    summary: 'Everything you need to know about setting up a safe sleep environment for your precious newborn baby.',
    content: `## Setting up a Safe Nursery Crib

Creating a secure and soothing nursery crib for your newborn child is one of the most critical preparation stages for every parent. According to healthcare pediatricians, a safe sleep environment significantly minimizes accidental hazards.

### 1. The Sleep Posture Rule
Always place your baby to sleep on their back on a firm, flat mattress inside the crib. Side or stomach sleeping is highly discouraged until they can roll back easily on their own.

### 2. Guard against Loose Fabrics
Remove all loose quilts, pillows, bumpers, stuffed toys, or extra fleece sheets from the mattress area. They present breathing hazards. Opt instead for a high-quality GOTS certified cotton baby swaddle layer or wearable sleepbag.

### 3. Mattress Fit Checks
Ensure there are no gaps wider than two fingers between the mattress edge and the timber crib frame. This eliminates any risk of entrapment.`,
    category: 'Nursery Care',
    author: 'Dr. Priya Sen (Pediatrician)',
    date: '2026-05-15',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=60',
    readTime: '5 min read'
  },
  {
    id: 'b2',
    title: 'Cognitive Development Milestones For Months 0-12',
    summary: 'How sensory colors, shapes, and active crawling assist brain synapses in infants during their first vital year.',
    content: `## Supporting Infant Cognitive Growth

Your infant\'s brain is building double-million connections every passing second. What games or toys play a crucial role in these stages?

### Months 1-3: Contrast & Sounds
Newborn babies primarily track high contrast shades. Black and white cards, slow moving ceiling hangers, or toys making gentle musical chimes grab visual attention easily.

### Months 4-7: Grip & Reach
This is when your child discovers their fingers! Providing BPA-free teething ring accessories, rattling shapes, and soft stacking textures supports visual focus and finger control.

### Months 8-12: The Kick and Explore
At this stage baby starts crawling, sorting blocks, and kicking items. Gym playmats, stacking cubes, and tracking musical wooden blocks help develop deep spatial reasoning.`,
    category: 'Baby Growth',
    author: 'Sam Wood (Toddler Neuroscientist)',
    date: '2026-05-24',
    image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=500&auto=format&fit=crop&q=60',
    readTime: '7 min read'
  }
];

export const INITIAL_FAQS = [
  {
    q: 'How long does shipping take and how is my order delivered?',
    a: 'We ship all our baby products directly from climate-controlled sanitised warehouses. Most metropolitan orders are delivered within 2-4 business days. Regional areas can count on 4-6 days. You will receive an SMS and email notification with an active tracking link once shipped.'
  },
  {
    q: 'What is your returns and replacement policy for child safety products?',
    a: 'Due to safety and hygiene guidelines, diapers, creams, formula feeding, and bath liquids are non-returnable. However, clothing apparel, baby gear, toys, and nursery beddings are eligible for a free 10-day exchange or return guarantee as long as tags are intact.'
  },
  {
    q: 'Are your toys and baby gear tested for child chemical safety?',
    a: 'Absolutely! Our toys and gear are certified free of lead, phthalates, and formaldehyde. All timber and plastic objects undergo strict physical pressure drop tests and salivation durability checks, in agreement with global pediatric safety criteria.'
  },
  {
    q: 'Is it safe to pay online via your platform?',
    a: 'Yes, our platform uses Shopify Payments certified 256-bit SSL encryption. We never store raw credit card details on our system. We also offer Cash on Delivery (COD) across thousands of pin codes.'
  }
];
