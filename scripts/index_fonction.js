// Version 2: Programmation fonctionnelle
const searchRecipesFunctional = () => {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm.length < 3) {
            recipesContainer.innerHTML = '';
            return;
        }
        // Filtrage des recettes avec filter()
        const result = recipes
            .filter(recipe => {
                const nameMatch = recipe.name.toLowerCase().includes(searchTerm);
                const descriptionMatch = recipe.description.toLowerCase().includes(searchTerm);
                const ingredientMatch = recipe.ingredients.some(ing => 
                    ing.ingredient.toLowerCase().includes(searchTerm)
                );
                return nameMatch || descriptionMatch || ingredientMatch;
            })
            // Génération du HTML final
            .map(recipe => generateRecipeHTML(recipe))
            .join('');
        // Injection du HTML
        recipesContainer.innerHTML = result;
    });
};
searchRecipesFunctional();
