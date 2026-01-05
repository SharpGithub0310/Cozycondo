// Script to seed the blog storage with sample posts that can be edited
import { saveBlogPost } from './blogStorageSupabase';

const sampleBlogPosts = [
  {
    title: 'Top 10 Things to Do in Iloilo City',
    slug: 'top-10-things-to-do-in-iloilo-city',
    excerpt: 'Discover the best attractions, hidden gems, and must-visit spots in the City of Love. From historic churches to modern malls, Iloilo has something for everyone.',
    content: `Iloilo City, known as the "City of Love," is a treasure trove of culture, history, and modern conveniences. Whether you're staying for a few days or an extended period, here are the top things you shouldn't miss.

## 1. Visit the Historic Churches

Iloilo is home to some of the Philippines' most beautiful Spanish colonial churches. Don't miss the Jaro Cathedral, the only basilica in Western Visayas, and the stunning Molo Church, known as the "feminist church" for its all-female saints.

## 2. Explore Calle Real

Take a walk down Calle Real (J.M. Basa Street) and admire the beautifully preserved heritage buildings. This historic street showcases Iloilo's rich past as a major trading hub.

## 3. Dine at the Iloilo River Esplanade

The Esplanade offers a scenic riverside walk with numerous restaurants and cafes. It's perfect for evening strolls and enjoying fresh seafood while watching the sunset.

## 4. Shop at SM City Iloilo and Festive Walk

For modern shopping experiences, head to these malls. Festive Walk in Iloilo Business Park is particularly impressive with its open-air design and diverse dining options.

## 5. Try Authentic Ilonggo Cuisine

No visit is complete without tasting local favorites like La Paz Batchoy, pancit molo, and fresh seafood. The city is a food lover's paradise!

## 6. Visit Museo Iloilo

Learn about the region's history, from pre-colonial times to the present, at this well-curated museum featuring archaeological artifacts and historical exhibits.

## 7. Day Trip to Guimaras Island

Just a 15-minute boat ride away, Guimaras is famous for its sweet mangoes, pristine beaches, and the Trappist Monastery. Perfect for a day trip!

## 8. Experience the Dinagyang Festival

If you're visiting in January, don't miss the Dinagyang Festival - one of the Philippines' most vibrant celebrations honoring the Santo Niño.

## 9. Relax at Smallville Complex

This entertainment hub comes alive at night with bars, restaurants, and live music venues. It's the go-to spot for nightlife in Iloilo.

## 10. Explore Iloilo Business Park

The newest development in the city features beautiful parks, modern architecture, and the impressive Iloilo Convention Center.

---

*Ready to explore Iloilo City? Book your stay at Cozy Condo and experience comfortable living in prime locations across the city.*`,
    author: 'Cozy Condo Team',
    category: 'travel-tips',
    tags: ['iloilo', 'attractions', 'travel guide', 'sightseeing'],
    featured_image: '',
    published: true,
    published_at: '2024-12-01',
  },
  {
    title: 'Best Restaurants Near Our Properties',
    slug: 'best-restaurants-near-our-properties',
    excerpt: 'A curated list of the best dining spots within walking distance of our condo units. From authentic Ilonggo cuisine to international flavors.',
    content: `One of the best things about staying at Cozy Condo is the amazing food scene right at your doorstep. Here's our curated guide to the best restaurants near our properties.

## Near Iloilo Business Park

### Breakthrough Restaurant
Famous for their unlimited samgyupsal and Korean BBQ. Great for groups and meat lovers.

### Farm to Table
Fresh, locally-sourced ingredients in a cozy setting. Perfect for health-conscious diners.

### Afritada
Modern Filipino cuisine with a twist. Their crispy pata is legendary!

## Near Smallville Complex

### Tatoy's Manokan
An Iloilo institution! Their chicken inasal is considered among the best in the city.

### Deco's
Another inasal favorite with generous servings and affordable prices.

### Bourbon Street
For those craving international flavors - great steaks and cocktails.

## Near City Proper

### Ted's Oldtimer La Paz Batchoy
The original La Paz Batchoy experience. A must-try for every visitor!

### Netong's Original Special La Paz Batchoy
Another excellent batchoy option with its own loyal following.

### Roberto's Siopao
Famous for their jumbo siopao - perfect for a quick, filling meal.

---

*Ask us for personalized restaurant recommendations based on your preferences and location!*`,
    author: 'Cozy Condo Team',
    category: 'local-guide',
    tags: ['restaurants', 'food', 'dining', 'iloilo'],
    featured_image: '',
    published: true,
    published_at: '2024-11-15',
  },
  {
    title: 'Why Iloilo City is Perfect for Remote Work',
    slug: 'why-iloilo-city-is-perfect-for-remote-work',
    excerpt: 'With fast internet, affordable living, and great cafes, Iloilo City is becoming a hotspot for digital nomads. Here\'s why you should consider it.',
    content: `Iloilo City has become an increasingly popular destination for remote workers and digital nomads. Here's why this charming Philippine city should be your next remote work destination.

## Excellent Infrastructure

Iloilo City boasts reliable internet connectivity with fiber optic networks throughout the metro area. Most cafes, coworking spaces, and accommodations offer high-speed WiFi perfect for video calls and collaborative work.

## Affordable Cost of Living

Your money goes much further in Iloilo compared to Metro Manila or Cebu. From accommodation to food to transportation, you can maintain a comfortable lifestyle at a fraction of the cost.

## Rich Culture and History

When you're not working, explore the city's rich heritage through its historic churches, museums, and colonial architecture. The city perfectly blends modern amenities with traditional Filipino culture.

## Great Food Scene

Iloilo is famous for its delicious local cuisine including La Paz Batchoy, Pancit Molo, and fresh seafood. The city offers everything from street food to fine dining.

## Friendly Community

Ilonggos are known for their warm hospitality. The local community is very welcoming to foreigners, making it easy to settle in and feel at home.

## Perfect Location

Iloilo serves as a gateway to beautiful destinations in the Visayas region. Weekend trips to Boracay, Guimaras, or Antique are just a few hours away.

---

*Ready to experience remote work in Iloilo? Book your stay with us and discover why so many remote workers are choosing this beautiful city as their base.*`,
    author: 'Cozy Condo Team',
    category: 'general',
    tags: ['remote work', 'digital nomad', 'lifestyle', 'iloilo'],
    featured_image: '',
    published: true,
    published_at: '2024-11-01',
  },
  {
    title: 'Getting Around Iloilo: Transportation Guide',
    slug: 'getting-around-iloilo-transportation-guide',
    excerpt: 'Everything you need to know about transportation in Iloilo City - from jeepneys and taxis to ride-hailing apps and bike rentals.',
    content: `Navigating Iloilo City is easier than you might think! This comprehensive guide will help you understand all your transportation options.

## Jeepneys - The Local Experience

Jeepneys are the most iconic form of public transport in the Philippines. In Iloilo, they're clean, affordable, and cover most major routes. Fare is typically ₱12-15 for most destinations within the city.

## Taxis and Grab

Traditional taxis are readily available, especially near malls and hotels. Grab is also widely used and often more convenient for tourists. Expect to pay ₱50-150 for most trips within the city center.

## Tricycles

For short distances, especially in residential areas, tricycles are your best bet. They're perfect for getting to places where larger vehicles can't go.

## Habal-Habal

For adventure seekers exploring areas outside the city, habal-habal (motorcycle taxis) can take you to more remote locations.

## Car Rentals

Several car rental companies operate in Iloilo. This is ideal if you plan to explore the province or prefer the convenience of your own vehicle.

## Walking and Biking

Many areas in Iloilo City are walkable, especially around malls and business districts. Some areas also have bike lanes for cycling enthusiasts.

## Airport Transportation

From Iloilo International Airport, you can take a taxi (₱200-300 to city center), Grab, or an airport shuttle to reach your accommodation.

---

*Need help getting around during your stay? We're happy to provide detailed directions and transportation tips!*`,
    author: 'Cozy Condo Team',
    category: 'travel-tips',
    tags: ['transportation', 'travel guide', 'getting around', 'iloilo'],
    featured_image: '',
    published: true,
    published_at: '2024-10-20',
  },
  {
    title: 'Weekend Getaways from Iloilo City',
    slug: 'weekend-getaways-from-iloilo-city',
    excerpt: 'Use Iloilo as your base to explore nearby islands and provinces. Discover Guimaras, Gigantes Islands, and more beautiful destinations.',
    content: `Iloilo City's strategic location makes it the perfect base for exploring the beautiful Western Visayas region. Here are the best weekend getaways you can easily access.

## Guimaras Island

Just a 15-minute boat ride from Iloilo, Guimaras is famous for its sweet mangoes and pristine beaches.

### What to Do:
- Visit mango plantations and taste the world's sweetest mangoes
- Relax at Alubihod Beach
- Explore the Trappist Monastery
- Island hopping to smaller islets

### How to Get There:
Take a pump boat from Ortiz Wharf or Parola Wharf in Iloilo City.

## Gigantes Islands

A group of stunning islands known for crystal-clear waters and fresh seafood.

### Highlights:
- Island hopping tours
- Scallop farming tours
- Tangke Saltwater Lagoon
- Antonia Beach

### Travel Time:
2-3 hours by van to Estancia Port, then 1-2 hours by boat.

## Antique Province

Perfect for those who love mountains, rivers, and cultural experiences.

### Must-Visit:
- Tibiao River (whitewater rafting)
- Sira-an Hot Springs
- Malumpati Health Spring
- Historic Culasi Church

### Travel Time:
2-4 hours by bus or van, depending on your destination.

## Boracay

While not exactly a weekend trip for everyone, Boracay is accessible from Iloilo.

### How to Get There:
- Fly from Iloilo to Caticlan (30 minutes)
- Take a bus to Caticlan (3-4 hours)

## Concepcion and Islas de Gigantes

Another beautiful island destination with fewer crowds.

### What to Expect:
- White sand beaches
- Fresh seafood
- Snorkeling and diving
- Local island culture

---

*Planning a weekend adventure? Let us help you arrange transportation and provide local insights for your trip!*`,
    author: 'Cozy Condo Team',
    category: 'travel-tips',
    tags: ['weekend trips', 'islands', 'travel guide', 'guimaras', 'gigantes'],
    featured_image: '',
    published: true,
    published_at: '2024-10-05',
  }
];

export async function seedBlogData() {
  console.log('Seeding blog data...');

  for (const post of sampleBlogPosts) {
    try {
      const savedPost = await saveBlogPost(post);
      console.log(`Saved blog post: ${savedPost.title}`);
    } catch (error) {
      console.error(`Error saving blog post: ${post.title}`, error);
    }
  }

  console.log('Blog data seeding completed!');
}