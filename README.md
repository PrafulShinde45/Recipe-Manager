
## How To Run The App
- VS Code + Live Server
  - Open the project folder in VS Code (File → Open Folder)
  - Install the “Live Server” extension
  - Right‑click `index.html` → Open with Live Server
  
## Data Structure in localStorage
- Key: `recipes`
- Value: JSON array of recipe objects with a consistent schema:

```json
[
  {
    "id": "uuid-string",
    "title": "Chicken Biryani",
    "description": "Short summary...",
    "ingredients": ["item 1", "item 2", "..."],
    "steps": ["step 1", "step 2", "..."],
    "prepTime": 20,
    "cookTime": 60,
    "difficulty": "Easy | Medium | Hard",
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": 1732180000000,
    "updatedAt": 1732180000000
  }
]
```

- Initialization:
  - On first load (when `recipes` is absent or empty), the app seeds `localStorage` with the candidate’s recipe (Chicken Biryani) plus sample recipes.
- Corruption handling:
  - If the stored value is not valid JSON or not an array, the app resets to safe defaults and shows a banner message

## Assumptions & Limitations
- No backend or authentication; everything is local to the browser
- Hash‑based navigation (`#home`, `#detail/{id}`, `#add`, `#edit/{id}`) to avoid page reloads
- Images are remote (CDN/stock photo URLs); offline usage may display placeholders
- URL field is optional and lightly validated (basic `http/https` check)
- Form validation focuses on essential fields and reasonable minimums (e.g., title/description length, at least two ingredients/steps, non‑negative times)
- `localStorage` is per‑browser; clearing storage or using a different browser resets the dataset


## Known Issues
- Mobile select dropdowns are rendered natively by browsers; visual behavior (menu width/height) can vary slightly across devices even with responsive CSS
- Very long descriptions, step lists, or ingredient lists may require more scrolling on small screens
- If third‑party images fail to load, the app falls back to a placeholder; slow networks can still cause brief blank states
- `localStorage` capacity is limited (~5–10 MB depending on browser); extremely large datasets aren’t supported
- Hash routing is simple: deep links rely on existing IDs; if an ID doesn’t exist (after deletion), the app returns to Home

