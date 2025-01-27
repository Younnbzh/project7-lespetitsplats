// Set vars
const resetInput = document.querySelector('#header-search-close');
const searchInput = document.querySelector('#keyword-search');
const recipesContainer = document.querySelector('#recipes');
let currentSearchTerm = '';
let activeTags = {
    ingredients: [],
    appareils: [],
    ustensiles: []
};

// Fonction pour afficher ou cacher un élément (la croix dans les input de recherche par ex)
const showHide = (elementId, action) => {
    const element = document.getElementById(elementId);
    if (element) {
        switch (action) {
            case 'show':
                element.style.display = 'block';
                break;
            case 'hide':
                element.style.display = 'none';
                break;
        }
    }
};

// Génération des tags de filtrage en fonction d'une liste de recettes
const getUniqueFilters = (recipesList) => {
    const filters = {
        ingredients: new Set(),
        appliances: new Set(),
        ustensils: new Set()
    };
    for (let i = 0; i < recipesList.length; i++) {
        const recipe = recipesList[i];
        // ingrédients
        for (let j = 0; j < recipe.ingredients.length; j++) {
            filters.ingredients.add(recipe.ingredients[j].ingredient);
        }
        // appareils
        filters.appliances.add(recipe.appliance);
        // ustensiles
        for (let k = 0; k < recipe.ustensils.length; k++) {
            filters.ustensils.add(recipe.ustensils[k]);
        }
    }

    // création des array
    const sortedIngredients = Array.from(filters.ingredients);
    const sortedAppliances = Array.from(filters.appliances);
    const sortedUstensils = Array.from(filters.ustensils);

    // Tri des tags par ordre alphabétique
    for (let i = 0; i < sortedIngredients.length; i++) {
        for (let j = i + 1; j < sortedIngredients.length; j++) {
            if (sortedIngredients[i] > sortedIngredients[j]) {
                const temp = sortedIngredients[i];
                sortedIngredients[i] = sortedIngredients[j];
                sortedIngredients[j] = temp;
            }
        }
    }
    for (let i = 0; i < sortedAppliances.length; i++) {
        for (let j = i + 1; j < sortedAppliances.length; j++) {
            if (sortedAppliances[i] > sortedAppliances[j]) {
                const temp = sortedAppliances[i];
                sortedAppliances[i] = sortedAppliances[j];
                sortedAppliances[j] = temp;
            }
        }
    }
    for (let i = 0; i < sortedUstensils.length; i++) {
        for (let j = i + 1; j < sortedUstensils.length; j++) {
            if (sortedUstensils[i] > sortedUstensils[j]) {
                const temp = sortedUstensils[i];
                sortedUstensils[i] = sortedUstensils[j];
                sortedUstensils[j] = temp;
            }
        }
    }

    return {
        ingredients: sortedIngredients,
        appliances: sortedAppliances,
        ustensils: sortedUstensils
    };
};

// fonction recherche principale (tag & text)
const filterRecipes = () => {
    const matchingRecipes = [];
    // Si aucun critère de recherche (pas de terme de recherche et pas de tags), on reset
    if (currentSearchTerm.length < 3 &&
        activeTags.ingredients.length === 0 &&
        activeTags.appareils.length === 0 &&
        activeTags.ustensiles.length === 0) {
        // on affiche toutes les recettes
        let html = '';
        for (let i = 0; i < recipes.length; i++) {
            html += generateRecipeHTML(recipes[i]);
        }
        recipesContainer.innerHTML = html;
        // Mise à jour du nombre de recettes
        const nbRecipes = document.querySelector('.filters-nb');
        nbRecipes.textContent = `${recipes.length} recettes`;
        // On reset les filtres
        const updatedFilters = getUniqueFilters(recipes);
        updateFiltersLists(updatedFilters);
        return;
    }
    for (let i = 0; i < recipes.length; i++) {
        const recipe = recipes[i];
        let matchesTags = true;
        let matchesSearch = true;
        // Recherche par tags
        // ingrédients
        for (let j = 0; j < activeTags.ingredients.length; j++) {
            let hasIngredient = false;
            for (let k = 0; k < recipe.ingredients.length; k++) {
                if (recipe.ingredients[k].ingredient === activeTags.ingredients[j]) {
                    hasIngredient = true;
                    break;
                }
            }
            if (!hasIngredient) {
                matchesTags = false;
                break;
            }
        }
        // appareils
        if (matchesTags && activeTags.appareils.length > 0) {
            let hasAppliance = false;
            for (let j = 0; j < activeTags.appareils.length; j++) {
                if (recipe.appliance === activeTags.appareils[j]) {
                    hasAppliance = true;
                    break;
                }
            }
            if (!hasAppliance) {
                matchesTags = false;
            }
        }
        // ustensiles
        if (matchesTags) {
            for (let j = 0; j < activeTags.ustensiles.length; j++) {
                let hasUstensil = false;
                for (let k = 0; k < recipe.ustensils.length; k++) {
                    if (recipe.ustensils[k] === activeTags.ustensiles[j]) {
                        hasUstensil = true;
                        break;
                    }
                }
                if (!hasUstensil) {
                    matchesTags = false;
                    break;
                }
            }
        }
        // Recherche par mot clé
        if (currentSearchTerm.length >= 3) {
            matchesSearch = false;
            if (recipe.name.toLowerCase().includes(currentSearchTerm)) {
                matchesSearch = true;
            }
            if (recipe.description.toLowerCase().includes(currentSearchTerm)) {
                matchesSearch = true;
            }

            let j = 0;
            while (j < recipe.ingredients.length && !matchesSearch) {
                if (recipe.ingredients[j].ingredient.toLowerCase().includes(currentSearchTerm)) {
                    matchesSearch = true;
                }
                j++;
            }
        }
        // Si ça correspond au mot clé et tag on push
        if (matchesTags && matchesSearch) {
            matchingRecipes.push(recipe);
        }
    }
    // Après avoir filtré, on vérifie s'il y a des résultats
    if (matchingRecipes.length === 0 && currentSearchTerm.length >= 3) {
        // On injecte un msg d'erreur si aucun resultat
        recipesContainer.innerHTML = `
            <div class="noResults">Aucune recette ne contient '${currentSearchTerm}', vous pouvez chercher « tarte aux pommes », « poisson »</div>`;
    } else {
        // Sinon on affiche les recettes trouvées
        let html = '';
        for (let i = 0; i < matchingRecipes.length; i++) {
            html += generateRecipeHTML(matchingRecipes[i]);
        }
        recipesContainer.innerHTML = html;
    }
    // On met à jour les tags
    const updatedFilters = getUniqueFilters(matchingRecipes);
    updateFiltersLists(updatedFilters);
    // Maj nb recettes
    const nbRecipes = document.querySelector('.filters-nb');
    nbRecipes.textContent = `${matchingRecipes.length} recettes`;
};
// Fonction de recherche texte
const searchRecipesNative = () => {
    const searchInput = document.querySelector('#keyword-search');
    // initialisation des filtres
    const initialFilters = getUniqueFilters(recipes);
    updateFiltersLists(initialFilters);
     // Affiche toutes les recettes au chargement
     let initialHtml = '';
     for (let i = 0; i < recipes.length; i++) {
         initialHtml += generateRecipeHTML(recipes[i]);
     }
     recipesContainer.innerHTML = initialHtml;
     const nbRecipes = document.querySelector('.filters-nb');
     nbRecipes.textContent = `${recipes.length} recettes`;
     // listener input
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.toLowerCase();
        // Show hide de la croix dans le champ de recherche
        if (currentSearchTerm.length > 0) {
            showHide('header-search-close', 'show');
        } else {
            showHide('header-search-close', 'hide');
        }
        filterRecipes();
    });
};
// Fonction push d'un tag dans une liste
const addTag = (type, value) => {
    // Vérifier si le tag n'existe pas déjà
    let exists = false;
    for (let i = 0; i < activeTags[type].length; i++) {
        if (activeTags[type][i] === value) {
            exists = true;
            break;
        }
    }
    if (!exists) {
        activeTags[type].push(value);
        updateActiveTagsDisplay();
        filterRecipes();
    }
};

// Ajout des écouteurs pour supprimer les tags (croix)
const addTagRemoveListeners = () => {
    const tagElements = document.querySelectorAll('.filters-active-elem');
    for (let i = 0; i < tagElements.length; i++) {
        const tag = tagElements[i];
        tag.querySelector('.fa-xmark').addEventListener('click', () => {
            const type = tag.dataset.type;
            const value = tag.dataset.value;
            removeTag(type, value);
        });
    }
};

// Fonction pour supprimer un tag
const removeTag = (type, value) => {
    let newTags = [];
    for (let i = 0; i < activeTags[type].length; i++) {
        if (activeTags[type][i] !== value) {
            newTags.push(activeTags[type][i]);
        }
    }
    activeTags[type] = newTags;
    updateActiveTagsDisplay();
    filterRecipes();
};

// Ajout des événements de clic sur les listes de tags
const addTagListeners = () => {
    const tagLists = document.querySelectorAll('.filters-list-ul');
    for (let i = 0; i < tagLists.length; i++) {
        const list = tagLists[i];
        list.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'li') {
                const tagType = e.target.closest('.filters-list').id;
                const tagValue = e.target.textContent;
                addTag(tagType, tagValue);
            }
        });
    }
};

// Input des tags (affiche masque tag en fonction du texte dans l'input)
const filterInputs = document.querySelectorAll('.filters-search input');
for (let i = 0; i < filterInputs.length; i++) {
    const input = filterInputs[i];
    input.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filterList = e.target.closest('.filters-list');
        const items = filterList.querySelectorAll('.filters-list-ul li');

        if (searchTerm.length > 0) {
            showHide('filters-search-close-' + filterList.id, 'show');
        } else {
            showHide('filters-search-close-' + filterList.id, 'hide');
        }

        for (let j = 0; j < items.length; j++) {
            const item = items[j];
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

// Vide la recherche input au clic sur une croix pour la recherche générale
resetInput.addEventListener("click", function () {
    searchInput.value = "";
    currentSearchTerm = "";
    filterRecipes();
});

// Affiche et masque la liste des tags et la recherche au clic sur le chevron du titre des tags concernés
document.addEventListener('DOMContentLoaded', function () {
    const headers = document.querySelectorAll('.filters-header');

    headers.forEach(header => {
        header.addEventListener('click', function () {
            console.log('clic');
            const parent = this.closest('.filters-list');
            const arrowUp = parent.querySelector('.filters-arrow-up');
            const arrowDown = parent.querySelector('.filters-arrow-down');
            const search = parent.querySelector('.filters-search');
            const list = parent.querySelector('.filters-cont');

            if (arrowUp.style.display === 'none') {
                // show
                arrowUp.style.display = 'block';
                arrowDown.style.display = 'none';
                search.style.display = 'block';
                list.style.display = 'block';
            } else {
                // hide
                arrowUp.style.display = 'none';
                arrowDown.style.display = 'block';
                search.style.display = 'none';
                list.style.display = 'none';
            }
        });
    });
});
// on set l'affichage par défaut
document.querySelectorAll('.filters-arrow-up, .filters-search, .filters-cont').forEach(element => {
    element.style.display = 'none';
});
// Vide la recherche input au clic sur une croix pour les tags
const filterCloses = document.querySelectorAll('.filters-search-close');
for (let i = 0; i < filterCloses.length; i++) {
    const close = filterCloses[i];
    close.addEventListener("click", (e) => {
        const filterSearch = e.target.closest('.filters-search');
        const inputClose = filterSearch.querySelector('.tagsearch');
        inputClose.value = "";
        inputClose.dispatchEvent(new Event('input', {}));
    });
}

// Création du html

// Fonction pour échapper les caractères spéciaux HTML
const escapeHtml = (unsafe) => {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// Fonction pour générer le HTML des ingrédients
const generateIngredientsHTML = (ingredients) => {
    let ingredientsList = '';
    for (let j = 0; j < ingredients.length; j++) {
        if (ingredients[j].unit === undefined) {
            ingredients[j].unit = '';
        }
        ingredientsList += `
        <div class="recipes-ingredients-elem">
            <h5>${ingredients[j].ingredient}</h5>
            ${ingredients[j].quantity} ${ingredients[j].unit}
        </div>`;
    }
    return ingredientsList;
};

// Fonction pour générer le HTML d'une recette complète
const generateRecipeHTML = (recipe) => {
    const ingredientsList = generateIngredientsHTML(recipe.ingredients);

    return `<article class="recipes-card" id="recipe-${recipe.id}">
                <div class="recipes-imgcont">
                    <div class="recipes-time">${recipe.time}min</div>
                    <img src="assets/images/recipes/${recipe.image}" alt="Image de la recette ${recipe.name}">
                </div>
                <div class="recipes-content">
                    <div class="recipes-title">${recipe.name}</div>
                    <div class="recipes-recette">
                        <h4>Recette</h4>
                        <span>${recipe.description}</span>
                    </div>
                    <div class="recipes-ingredients">
                        <h4>Ingrédients</h4>
                        <div class="recipes-ingredients-list">
                            ${ingredientsList}
                        </div>
                    </div>
                </div>
            </article>`;
};

// Update html des liste de tags
const updateFiltersLists = (filters) => {
    // Mise à jour des ingrédients
    const ingredientsList = document.querySelector('#ingredients .filters-list-ul');
    let ingredientsHtml = '';
    for (let i = 0; i < filters.ingredients.length; i++) {
        ingredientsHtml += `<li>${filters.ingredients[i]}</li>`;
    }
    ingredientsList.innerHTML = ingredientsHtml;

    // Mise à jour des appareils
    const appliancesList = document.querySelector('#appareils .filters-list-ul');
    let appliancesHtml = '';
    for (let i = 0; i < filters.appliances.length; i++) {
        appliancesHtml += `<li>${filters.appliances[i]}</li>`;
    }
    appliancesList.innerHTML = appliancesHtml;

    // Mise à jour des ustensiles
    const ustensilsList = document.querySelector('#ustensiles .filters-list-ul');
    let ustensilsHtml = '';
    for (let i = 0; i < filters.ustensils.length; i++) {
        ustensilsHtml += `<li>${filters.ustensils[i]}</li>`;
    }
    ustensilsList.innerHTML = ustensilsHtml;
};

// On injecte en html les tags sélectionnés
const updateActiveTagsDisplay = () => {
    const activeTagsContainer = document.querySelector('.filters-active');
    let html = '';
    for (let type in activeTags) {
        for (let i = 0; i < activeTags[type].length; i++) {
            html += `<div class="filters-active-elem" data-type="${type}" data-value="${activeTags[type][i]}">
                        ${activeTags[type][i]} <i class="fa-solid fa-xmark"></i>
                    </div>`;
        }
    }
    activeTagsContainer.innerHTML = html;
    // on set les listener pour suppression du tag
    addTagRemoveListeners();
};

// Initialisation
searchRecipesNative();
addTagListeners();

/*
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
//searchRecipesFunctional();

*/