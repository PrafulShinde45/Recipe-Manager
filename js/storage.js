// js/storage.js
const KEY = 'recipes';

function uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const DEFAULTS = [
  {
    id: uuid(),
    title: 'Chicken Biryani',
    description: 'Chicken Biryani for 2: layered basmati rice with spiced chicken and aromatics, finished on dum.',
    ingredients: ['Chicken – 500 g', 'Basmati rice – 120 g', 'Biryani masala – 1 packet', 'Red chilli powder – 2 tsp', 'Turmeric – 1 tsp', 'Jeera – 1 tsp', 'Yoghurt – 30 g', 'Coriander powder – 1 packet', 'Oil – 3–5 tbsp', 'Onions – 2 small, chopped', 'Tomatoes – 2 small, chopped', 'Salt – 2 tsp', 'Water – as needed'],
    steps: ['Marinate chicken with chilli powder, turmeric, yoghurt, coriander powder; rest 20–25 min', 'Wash rice; cook 70% in 500 ml water over low flame; turn off gas', 'Heat oil; add jeera; fry 1 min', 'Add onions and tomatoes; sauté 5 min', 'Add marinated chicken; cook 2–3 min', 'Add biryani masala + 250 ml water; cook low 15–25 min until masala ready', 'Layer: pot bottom 40% chicken masala; half rice; 60% masala; remaining rice', 'Cover, weight; dum cook 10 min low, 15 min high; rest 5 min; mix gently and serve'],
    prepTime: 20, cookTime: 60, difficulty: 'Hard',
    imageUrl: "https://img.freepik.com/free-photo/view-delicious-dish-food_23-2150777655.jpg",
    createdAt: Date.now(), updatedAt: Date.now()
  },
 
  {
    id: uuid(),
    title: 'Pav Bhaji',
    description: 'Spicy mashed vegetable curry served with buttered toasted pav.',
    ingredients: ['3 potatoes', '1/2 cup peas', '1 cup cauliflower florets', '1 onion, chopped', '2 tomatoes, chopped', '2 tbsp butter', '1 tbsp pav bhaji masala', '1 tsp chili powder', '1 tsp ginger-garlic paste', 'Pav buns', 'Lemon', 'Coriander', 'Salt'],
    steps: ['Boil and mash vegetables', 'Sauté onion, add ginger-garlic', 'Add tomatoes and spices, cook to a mash', 'Finish with butter and coriander', 'Toast pav with butter and serve'],
    prepTime: 20, cookTime: 30, difficulty: 'Medium',
    imageUrl: "https://img.freepik.com/free-photo/delicious-indian-street-food-delight_23-2151996227.jpg",
    createdAt: Date.now(), updatedAt: Date.now()
  },
  {
    id: uuid(),
    title: 'Paneer Masala',
    description: 'Creamy tomato-onion gravy with paneer cubes and warm spices.',
    ingredients: ['250g paneer', '1 onion, sliced', '2 tomatoes, chopped', '8 cashews', '2 tbsp cream', '1 tbsp butter', '1 tsp ginger-garlic paste', '1 tsp garam masala', '1/2 tsp chili powder', '1/4 tsp turmeric', '1 tsp coriander powder', 'Kasuri methi', 'Salt'],
    steps: ['Sauté onions, add ginger-garlic', 'Blend tomatoes with soaked cashews', 'Cook puree with spices', 'Add paneer and simmer', 'Finish with cream and kasuri methi'],
    prepTime: 15, cookTime: 25, difficulty: 'Medium',
    imageUrl: 'https://img.freepik.com/free-photo/healthy-homemade-meal-beef-curry-with-naan-generated-by-ai_188544-41071.jpg',
    createdAt: Date.now(), updatedAt: Date.now()
  },
  {
    id: uuid(),
    title: 'Fried Rice',
    description: 'Quick stir-fried rice with vegetables, aromatics, and savory sauces.',
    ingredients: ['3 cups cooked rice (day-old)', '1 cup mixed veggies', '2 spring onions', '2 cloves garlic', '1 tbsp soy sauce', '1 tsp vinegar', '1 egg (optional)', '1 tbsp oil', 'Pepper', 'Salt'],
    steps: ['Scramble egg and set aside', 'Stir-fry aromatics and veggies', 'Add rice and sauces; toss well', 'Return egg, season, and serve'],
    prepTime: 10, cookTime: 15, difficulty: 'Easy',
    imageUrl: 'https://img.freepik.com/free-photo/fried-rice-with-minced-pork-tomato-carrot-cucumber-plate_1150-27179.jpg',
    createdAt: Date.now(), updatedAt: Date.now()
  }
];

function safeParse(str) {
  try {
    const v = JSON.parse(str);
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

function isValidRecipe(r) {
  return r && typeof r.id === 'string' && typeof r.title === 'string' && Array.isArray(r.ingredients) && Array.isArray(r.steps);
}

export function loadRecipes() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  const parsed = safeParse(raw);
  if (!parsed) return [];
  return parsed.filter(isValidRecipe);
}

export function saveRecipes(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function initIfEmpty(onReset) {
  const list = loadRecipes();
  if (!list || list.length === 0) {
    saveRecipes(DEFAULTS);
    if (onReset) onReset('Initialized with default recipes.');
  }
}

export function resetCorrupt(onReset) {
  saveRecipes(DEFAULTS);
  if (onReset) onReset('Recipes were reset due to corrupted data.');
}