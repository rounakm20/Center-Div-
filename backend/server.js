const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 5000;

const reviews = [
  { id: 1, name: "Sarah Jenkins", company: "TechFlow", text: "Centrediv completely transformed our web presence. The new SaaS platform they built is blazing fast and incredibly intuitive.", rating: 5 },
  { id: 2, name: "Michael Chen", company: "Aura E-Commerce", text: "The e-commerce store they developed for us increased our conversion rate by 40%. Their attention to UI/UX detail is unmatched.", rating: 5 },
  { id: 3, name: "Elena Rodriguez", company: "Innovate AI", text: "We needed a complex dashboard with AI integration, and they delivered flawlessly. Highly recommend their automation expertise.", rating: 5 },
  { id: 4, name: "David Smith", company: "Apex Business", text: "From speed optimization to a complete redesign, they handled everything. Our site now ranks #1 for our keywords thanks to their SEO work.", rating: 5 },
  { id: 5, name: "Jessica Taylor", company: "StartupX", text: "They built our SaaS MVP in record time without compromising quality. The animations and transitions make the site feel premium.", rating: 5 },
];

app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

module.exports = app;