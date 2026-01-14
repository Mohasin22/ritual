// src/data/junkMenu.ts

export const JUNK_MENU = {
  harmLevels: {
    0: {
      label: "Least Harmful",
      description: "Whole or minimally processed foods with low oil and sugar",
    },
    1: {
      label: "Mildly Harmful",
      description: "Refined carbs or fats present, acceptable in moderation",
    },
    2: {
      label: "Moderately Harmful",
      description: "Fried, sugary, or high-fat foods requiring restriction",
    },
    3: {
      label: "Highly Harmful",
      description: "Ultra-processed foods, liquid sugar, trans fats, palm oil",
    },
  },

  foods: [
    {
      id: "shawarma_chicken",
      name: "Chicken Shawarma",
      category: "Street Food",
      harm_level: 1,
      allowed_frequency: "Once per week",
      harmful_components: [
        "Mayonnaise (high fat, refined oils)",
        "Refined flour wrap (maida)",
      ],
      beneficial_components: ["Chicken protein"],
      reason:
        "Provides protein but often contains high-fat sauces and refined carbohydrates.",
    },
    {
      id: "shawarma_fried",
      name: "Fried Chicken Shawarma",
      category: "Street Food",
      harm_level: 2,
      allowed_frequency: "Once per 2 weeks",
      harmful_components: [
        "Deep fried chicken",
        "Refined oil reuse",
        "High-fat mayonnaise",
      ],
      beneficial_components: ["Protein"],
      reason:
        "Protein content is offset by deep frying and excessive refined fats.",
    },
    {
      id: "pizza_cheese",
      name: "Cheese Pizza",
      category: "Fast Food",
      harm_level: 2,
      allowed_frequency: "Once per month",
      harmful_components: [
        "Refined flour base (maida)",
        "High saturated fat cheese",
        "High sodium sauces",
      ],
      beneficial_components: ["Some protein from cheese"],
      reason:
        "High calorie density with refined carbs and saturated fats.",
    },
    {
      id: "kfc_fried_chicken",
      name: "KFC Fried Chicken",
      category: "Fast Food",
      harm_level: 2,
      allowed_frequency: "Once per 2 weeks",
      harmful_components: [
        "Deep frying",
        "Refined vegetable oils",
        "High sodium breading",
      ],
      beneficial_components: ["Chicken protein"],
      reason:
        "High protein but deep frying increases fat load and inflammation risk.",
    },
    {
      id: "momos_steamed",
      name: "Steamed Momos",
      category: "Street Food",
      harm_level: 1,
      allowed_frequency: "Once per week",
      harmful_components: ["Refined flour outer layer"],
      beneficial_components: ["Steamed cooking method", "Protein filling"],
      reason:
        "Low fat cooking method but uses refined flour.",
    },
    {
      id: "momos_fried",
      name: "Fried Momos",
      category: "Street Food",
      harm_level: 2,
      allowed_frequency: "Once per 2 weeks",
      harmful_components: [
        "Deep frying",
        "Refined oils",
        "Refined flour",
      ],
      beneficial_components: [],
      reason:
        "Combination of deep frying and refined carbohydrates.",
    },
    {
      id: "biryani_chicken",
      name: "Chicken Biryani",
      category: "Restaurant Food",
      harm_level: 1,
      allowed_frequency: "Once per week",
      harmful_components: ["Excess oil or ghee"],
      beneficial_components: [
        "Chicken protein",
        "Spices with antioxidant properties",
      ],
      reason:
        "Balanced meal but can be oil-heavy depending on preparation.",
    },
    {
      id: "fried_rice",
      name: "Veg / Egg Fried Rice",
      category: "Restaurant Food",
      harm_level: 2,
      allowed_frequency: "Once per week",
      harmful_components: [
        "High oil usage",
        "Often palm oil",
        "Refined white rice",
      ],
      beneficial_components: ["Some protein (egg)"],
      reason:
        "High glycemic load combined with excessive oil.",
    },
    {
      id: "regular_coke",
      name: "Regular Coke",
      category: "Soft Drink",
      harm_level: 3,
      allowed_frequency: "Once per month",
      harmful_components: [
        "Liquid sugar",
        "Phosphoric acid",
      ],
      beneficial_components: [],
      reason:
        "Liquid sugar causes insulin spikes and has zero satiety.",
    },
    {
      id: "diet_coke",
      name: "Diet Coke",
      category: "Soft Drink",
      harm_level: 2,
      allowed_frequency: "Once per week",
      harmful_components: [
        "Artificial sweeteners",
        "Enamel erosion",
      ],
      beneficial_components: ["Zero sugar"],
      reason:
        "No sugar but impacts dental health and appetite regulation.",
    },
    {
      id: "packaged_chips",
      name: "Packaged Potato Chips",
      category: "Snacks",
      harm_level: 3,
      allowed_frequency: "Once per month",
      harmful_components: [
        "Palm oil",
        "Ultra-processing",
        "High sodium",
      ],
      beneficial_components: [],
      reason:
        "Highly processed with inflammatory oils and low nutritional value.",
    },
    {
      id: "namkeen",
      name: "Indian Namkeen / Mixture",
      category: "Snacks",
      harm_level: 2,
      allowed_frequency: "Once per 2 weeks",
      harmful_components: [
        "Deep frying",
        "High salt",
      ],
      beneficial_components: [],
      reason:
        "Less processed than chips but still oil and salt heavy.",
    },
    {
      id: "ice_cream_packaged",
      name: "Packaged Ice Cream",
      category: "Dessert",
      harm_level: 2,
      allowed_frequency: "Once per 2 weeks",
      harmful_components: [
        "High sugar",
        "Saturated fats",
      ],
      beneficial_components: [],
      reason:
        "High sugar density with low micronutrient value.",
    },
    {
      id: "kulfi",
      name: "Kulfi",
      category: "Dessert",
      harm_level: 1,
      allowed_frequency: "Once per week",
      harmful_components: ["Sugar"],
      beneficial_components: ["Milk solids"],
      reason:
        "Traditional dessert with fewer additives than ice cream.",
    },
    {
      id: "milk_chocolate",
      name: "Milk Chocolate",
      category: "Sweets",
      harm_level: 2,
      allowed_frequency: "Once per week",
      harmful_components: [
        "High sugar",
        "Milk fats",
      ],
      beneficial_components: [],
      reason:
        "Sugar-heavy with limited micronutrient benefit.",
    },
    {
      id: "dark_chocolate",
      name: "Dark Chocolate (70%+)",
      category: "Sweets",
      harm_level: 1,
      allowed_frequency: "2–3 per week",
      harmful_components: ["Some sugar"],
      beneficial_components: [
        "Polyphenols",
        "Lower sugar content",
      ],
      reason:
        "Lower sugar and contains antioxidants when consumed in small portions.",
    },
    {
      id: "idli_dosa",
      name: "Idli / Plain Dosa",
      category: "South Indian",
      harm_level: 0,
      allowed_frequency: "Unlimited",
      harmful_components: [],
      beneficial_components: [
        "Fermented batter",
        "Low fat",
      ],
      reason:
        "Fermented, easy to digest, and low in harmful components.",
    },
  ],
};
