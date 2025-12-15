// Test script to simulate blog post creation in localStorage
// This simulates what the browser would do

const testBlogPost = {
  id: `${Date.now()}-test123`,
  title: "Test Blog Post - Christmas in Iloilo",
  slug: "test-christmas-iloilo",
  excerpt: "Experience the magical Christmas season in Iloilo City while staying at our cozy condominiums.",
  content: "Christmas in Iloilo City is truly magical. The streets come alive with colorful parols (Christmas lanterns) and the warm hospitality of the Ilonggo people makes the season extra special.\n\nStay at our comfortable condominiums and enjoy easy access to all the Christmas festivities happening around the city.",
  author: "Cozy Condo Team",
  category: "Local Guide",
  tags: ["christmas", "iloilo", "festivals", "local-culture"],
  featured_image: "",
  published: false,
  published_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

console.log("Test blog post data:");
console.log(JSON.stringify(testBlogPost, null, 2));