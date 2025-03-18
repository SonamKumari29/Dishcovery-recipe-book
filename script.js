const searchBox = document.querySelector('.searchBox');
const searchBtn = document.querySelector('.searchBtn');
const recipeContainer = document.querySelector('.recipe-container');
const recipeDetailsContent = document.querySelector('.recipe-details-content');
const recipeCloseBtn = document.querySelector('.recipe-close-btn');
const categoryPills = document.querySelectorAll('.category-pill');

// Add loading state
const setLoading = () => {
    recipeContainer.innerHTML = '<div class="loading">Discovering recipes for you</div>';
};

const fetchRecipes = async (query) => {
    setLoading();
    try {
        const data = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        const response = await data.json();
        
        recipeContainer.innerHTML = "";
        if (!response.meals) {
            recipeContainer.innerHTML = `<h2>No recipes found for '${query}'. Try another search!</h2>`;
            return;
        }

        response.meals.forEach(meal => {
            const recipeDiv = document.createElement('div');
            recipeDiv.classList.add('recipe');
            recipeDiv.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="recipe-content">
                    <h3>${meal.strMeal}</h3>
                    <p><span>${meal.strArea}</span> Cuisine</p>
                    <p>Category: <span>${meal.strCategory}</span></p>
                    <button type="button">View Recipe</button>
                </div>
            `;

            const button = recipeDiv.querySelector('button');
            button.addEventListener('click', () => {
                openRecipePopup(meal);
            });
            
            recipeContainer.appendChild(recipeDiv);
        });

        // Scroll to results
        recipeContainer.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        recipeContainer.innerHTML = `<h2>Sorry, we couldn't fetch the recipes. Please try again later.</h2>`;
    }
};

const fetchByCategory = async (category) => {
    setLoading();
    try {
        const data = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        const response = await data.json();
        
        recipeContainer.innerHTML = "";
        if (!response.meals) {
            recipeContainer.innerHTML = `<h2>No recipes found in category '${category}'</h2>`;
            return;
        }

        // Fetch full details for each meal
        const detailedMeals = await Promise.all(
            response.meals.map(async (meal) => {
                const mealData = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
                const mealResponse = await mealData.json();
                return mealResponse.meals[0];
            })
        );

        detailedMeals.forEach(meal => {
            const recipeDiv = document.createElement('div');
            recipeDiv.classList.add('recipe');
            recipeDiv.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="recipe-content">
                    <h3>${meal.strMeal}</h3>
                    <p><span>${meal.strArea}</span> Cuisine</p>
                    <p>Category: <span>${meal.strCategory}</span></p>
                    <button type="button">View Recipe</button>
                </div>
            `;

            const button = recipeDiv.querySelector('button');
            button.addEventListener('click', () => {
                openRecipePopup(meal);
            });
            
            recipeContainer.appendChild(recipeDiv);
        });

        // Scroll to results
        recipeContainer.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        recipeContainer.innerHTML = `<h2>Sorry, we couldn't fetch the recipes. Please try again later.</h2>`;
    }
};

const fetchIngredients = (meal) => {
    let ingredientsList = "";
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        if (ingredient) {
            const measure = meal[`strMeasure${i}`];
            ingredientsList += `<li><i class="fas fa-check"></i> ${measure} ${ingredient}</li>`;
        } else {
            break;
        }
    }
    return ingredientsList;
};

const openRecipePopup = (meal) => {
    recipeDetailsContent.innerHTML = `
        <h2 class="recipeName">${meal.strMeal}</h2>
        <h3><i class="fas fa-list-ul"></i> Ingredients</h3>
        <ul class="ingredientsList">${fetchIngredients(meal)}</ul>
        <div class="recipeInstructions">
            <h3><i class="fas fa-clipboard-list"></i> Instructions</h3>
            <p>${meal.strInstructions}</p>
        </div>
    `;

    recipeDetailsContent.parentElement.style.display = "block";
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
};

recipeCloseBtn.addEventListener('click', () => {
    recipeDetailsContent.parentElement.style.display = "none";
    document.body.style.overflow = 'auto'; // Restore scrolling
});

searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const searchInput = searchBox.value.trim();
    if (!searchInput) {
        recipeContainer.innerHTML = `<h2>Please enter a recipe to search</h2>`;
        return;
    }
    fetchRecipes(searchInput);
});

// Add search on Enter key
searchBox.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const searchInput = searchBox.value.trim();
        if (searchInput) {
            fetchRecipes(searchInput);
        }
    }
});

// Category pills functionality
categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
        const category = pill.dataset.category;
        if (category === 'Breakfast') {
            fetchByCategory('Breakfast');
        } else if (category === 'Main Course') {
            fetchByCategory('Main course');
        } else if (category === 'Dessert') {
            fetchByCategory('Dessert');
        } else if (category === 'Vegetarian') {
            fetchByCategory('Vegetarian');
        }
    });
});

// Handle featured cards clicks
document.querySelectorAll('.featured-card').forEach(card => {
    card.addEventListener('click', () => {
        const category = card.classList[1];
        if (category === 'breakfast') {
            fetchByCategory('Breakfast');
        } else if (category === 'dinner') {
            fetchByCategory('Main course');
        } else if (category === 'dessert') {
            fetchByCategory('Dessert');
        }
    });
});

// Handle navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('href').substring(1);
        
        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        // Add active class to clicked link
        link.classList.add('active');

        if (section === 'categories') {
            fetchByCategory('Breakfast'); // Default to showing breakfast category
        } else if (section === 'about') {
            recipeContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; max-width: 800px; margin: 0 auto;">
                    <h2 style="color: var(--primary); margin-bottom: 1.5rem;">About Dishcovery </h2>
                    <p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 1.5rem;">
                        Welcome to Dishcovery , your ultimate destination for discovering delicious recipes from around the world. 
                        Our mission is to make cooking accessible, enjoyable, and inspiring for everyone, from beginners to seasoned chefs.
                    </p>
                    <p style="font-size: 1.1rem; line-height: 1.8;">
                        Browse through our extensive collection of recipes, from quick weekday meals to elaborate weekend feasts. 
                        Whether you're looking for breakfast ideas, main courses, or decadent desserts, we've got you covered.
                    </p>
                </div>
            `;
        }
    });
});

// Initial state with smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Initial state
recipeContainer.innerHTML = `
    <h2>Search for your favorite recipes above to begin your dishcovery  journey!</h2>
`;