import { Product } from './types';

export const mockProducts: Product[] = [
  {
    id: 1,
    slug: "beginners-piping-tip-set",
    name: "Beginner's Piping Tip Set",
    price: 24.99,
    images: [
      { src: "/placeholder_daisy.jpg", alt: "White Daisy - Simple beauty for beginners" },
      { src: "/placeholder_lily.jpg", alt: "White Lily - Perfect starter blooms" },
      { src: "/placeholder_rose-pink.jpg", alt: "Pink Rose - Classic beginner flower" }
    ],
    shortDescription: "Perfect starter set for new cake decorators",
    longDescription: "The Beginner's Piping Tip Set is designed specifically for those just starting their buttercream flower journey. This carefully curated collection includes the most essential tips needed to create beautiful, simple flowers that will build your confidence and skills. Each tip is selected based on ease of use and versatility, making it perfect for beginners who want to achieve professional-looking results from day one.",
    category: "piping-tips",
    inStock: true,
    variants: {
      hasHandPreference: false,
      hasSizeOptions: false,
      hasColorOptions: false
    },
    specifications: {
      accessories: [
        "Disposable Piping Bags (Quantity 25)",
        "Basic Couplers (x2)",
        "Quick Start Guide"
      ],
      tipCategories: [
        {
          name: "Round Tips",
          items: ["#3 Round Tip", "#5 Round Tip", "#8 Round Tip"]
        },
        {
          name: "Straight Petal Tips",
          items: ["#104 Petal Tip", "#125 Petal Tip"]
        },
        {
          name: "Leaf Tips",
          items: ["#352 Leaf Tip", "#366 Leaf Tip"]
        }
      ]
    }
  },
  {
    id: 2,
    slug: "blooming-buttercream-mix",
    name: "Blooming Buttercream™ Mix",
    price: 18.50,
    images: [
      { src: "/placeholder_peony.jpg", alt: "Pink Peony - Blooming buttercream perfection" },
      { src: "/placeholder_orchid-pink.jpg", alt: "Pink Orchid - Delicate buttercream texture" },
      { src: "/placeholder_chrysanthemum.jpg", alt: "Chrysanthemum - Golden buttercream blend" }
    ],
    shortDescription: "Premium buttercream mix designed for perfect flower piping",
    longDescription: "Our signature Blooming Buttercream™ Mix is specially formulated to hold intricate piped flower details while maintaining a smooth, creamy texture. This professional-grade mix provides the perfect consistency for creating realistic buttercream flowers that won't lose their shape. The blend includes stabilizing agents that help your flowers maintain their form in various temperatures, making it ideal for both practice sessions and special occasions.",
    category: "ingredients",
    inStock: true,
    variants: {
      hasHandPreference: false,
      hasSizeOptions: true,
      hasColorOptions: false
    },
    specifications: {
      accessories: [
        "2lb Premium Buttercream Mix",
        "Detailed Mixing Instructions",
        "Storage Guidelines"
      ]
    }
  },
  {
    id: 3,
    slug: "reusable-silicone-piping-bags",
    name: "Reusable Silicone Piping Bags",
    price: 15.99,
    images: [
      { src: "/placeholder_lily.jpg", alt: "White Lily - Clean piping with reusable bags" },
      { src: "/placeholder_peony-blue.jpg", alt: "Blue Peony - Eco-friendly piping solution" },
      { src: "/placeholder_daisy.jpg", alt: "White Daisy - Sustainable cake decorating" }
    ],
    shortDescription: "Eco-friendly, professional-grade silicone piping bags",
    longDescription: "These premium reusable silicone piping bags offer superior grip and control for precision flower piping. Made from food-grade silicone, they're easy to clean, environmentally friendly, and provide better tactile feedback than disposable alternatives. The non-slip exterior ensures a secure grip even when working with buttercream for extended periods. Perfect for serious decorators who want professional results and sustainable practices.",
    category: "tools",
    inStock: true,
    variants: {
      hasHandPreference: false,
      hasSizeOptions: true,
      hasColorOptions: true
    },
    specifications: {
      accessories: [
        "Set of 3 Silicone Bags (12\", 14\", 16\")",
        "Cleaning Instructions",
        "Storage Clips (x3)"
      ]
    }
  },
  {
    id: 4,
    slug: "artisan-food-coloring-gels",
    name: "Artisan Food Coloring Gels",
    price: 29.99,
    images: [
      { src: "/placeholder_rose-pink.jpg", alt: "Pink Rose - Vibrant artisan coloring" },
      { src: "/placeholder_oriental-lily.jpg", alt: "Oriental Lily - Professional color range" },
      { src: "/placeholder_peony.jpg", alt: "Pink Peony - Rich gel pigments" }
    ],
    shortDescription: "Professional-grade gel colors for realistic flower tones",
    longDescription: "Our Artisan Food Coloring Gel collection features highly concentrated, professional-grade colors specifically chosen for creating realistic buttercream flowers. These gels won't thin your buttercream and provide vibrant, true-to-nature colors that bring your piped flowers to life. The collection includes both natural flower tones and creative accent colors, allowing you to create everything from classic roses to exotic tropical blooms.",
    category: "ingredients",
    inStock: true,
    variants: {
      hasHandPreference: false,
      hasSizeOptions: false,
      hasColorOptions: false
    },
    specifications: {
      accessories: [
        "12 Professional Gel Colors (0.75oz each)",
        "Color Mixing Guide",
        "Flower Color Reference Chart"
      ]
    }
  },
  {
    id: 5,
    slug: "cake-turntable-stand",
    name: "Cake Turntable Stand",
    price: 35.00,
    images: [
      { src: "/placeholder_chrysanthemum.jpg", alt: "Chrysanthemum - Professional turntable display" },
      { src: "/placeholder_lily.jpg", alt: "White Lily - Smooth rotation for decorating" },
      { src: "/placeholder_orchid-pink.jpg", alt: "Pink Orchid - Precision cake positioning" }
    ],
    shortDescription: "Heavy-duty rotating stand for professional cake decorating",
    longDescription: "This professional-grade cake turntable provides smooth, effortless rotation for precise flower placement and overall cake decoration. The heavy cast-iron base ensures stability while working, and the smooth-rotating top allows for continuous motion while piping intricate flower designs. Essential for creating evenly spaced floral arrangements and achieving professional-level cake decoration results.",
    category: "equipment",
    inStock: true,
    variants: {
      hasHandPreference: false,
      hasSizeOptions: false,
      hasColorOptions: false
    },
    specifications: {
      accessories: [
        "12\" Heavy-Duty Turntable",
        "Non-Slip Base Pad",
        "Assembly Instructions"
      ]
    }
  },
  {
    id: 6,
    slug: "offset-spatula-set",
    name: "Offset Spatula Set",
    price: 12.99,
    images: [
      { src: "/placeholder_peony-blue.jpg", alt: "Blue Peony - Precision with offset spatulas" },
      { src: "/placeholder_daisy.jpg", alt: "White Daisy - Smooth buttercream application" },
      { src: "/placeholder_rose-pink.jpg", alt: "Pink Rose - Professional finishing tools" }
    ],
    shortDescription: "Essential offset spatulas for smooth buttercream work",
    longDescription: "This comprehensive offset spatula set provides the essential tools for creating perfectly smooth buttercream surfaces and precise detail work. The angled design allows for better control and access when working around piped flowers and intricate decorations. Each spatula is crafted from high-quality stainless steel with comfortable, ergonomic handles that reduce hand fatigue during extended decorating sessions.",
    category: "tools",
    inStock: true,
    variants: {
      hasHandPreference: true,
      hasSizeOptions: false,
      hasColorOptions: false
    },
    specifications: {
      accessories: [
        "4\" Offset Spatula",
        "8\" Offset Spatula",
        "10\" Offset Spatula",
        "Protective Blade Guards (x3)"
      ]
    }
  },
  {
    id: 7,
    slug: "peony-masterclass-ebook",
    name: "The Peony Masterclass eBook",
    price: 49.99,
    images: [
      { src: "/placeholder_peony.jpg", alt: "Pink Peony - Masterclass techniques" },
      { src: "/placeholder_peony-blue.jpg", alt: "Blue Peony - Advanced piping methods" },
      { src: "/placeholder_oriental-lily.jpg", alt: "Oriental Lily - Professional flower guide" }
    ],
    shortDescription: "Comprehensive digital guide to mastering buttercream peonies",
    longDescription: "The Peony Masterclass eBook is your complete guide to creating stunning, realistic buttercream peonies. This comprehensive digital resource includes step-by-step tutorials, professional tips, troubleshooting guides, and high-resolution photos that walk you through every aspect of peony creation. From basic petal techniques to advanced layering and color blending, this masterclass covers everything you need to create show-stopping peony decorations.",
    category: "education",
    inStock: true,
    variants: {
      hasHandPreference: false,
      hasSizeOptions: false,
      hasColorOptions: false
    },
    specifications: {
      accessories: [
        "150+ Page Digital eBook",
        "Step-by-Step Photo Tutorials",
        "Video Link Supplements",
        "Downloadable Practice Templates"
      ]
    }
  },
  {
    id: 8,
    slug: "flower-nail-lifter-set",
    name: "Flower Nail & Lifter Set",
    price: 9.99,
    images: [
      { src: "/placeholder_chrysanthemum.jpg", alt: "Chrysanthemum - Perfect nail positioning" },
      { src: "/placeholder_lily.jpg", alt: "White Lily - Gentle flower transfer" },
      { src: "/placeholder_rose-pink.jpg", alt: "Pink Rose - Professional flower handling" }
    ],
    shortDescription: "Essential tools for creating and transferring piped flowers",
    longDescription: "This essential flower nail and lifter set provides everything you need for creating perfect individual buttercream flowers. The flower nails allow you to pipe flowers separately before transferring them to your cake, while the specialized lifters ensure safe, damage-free transfer. This technique results in more precise, professional-looking flower arrangements and allows you to work at your own pace without time pressure.",
    category: "tools",
    inStock: true,
    variants: {
      hasHandPreference: false,
      hasSizeOptions: false,
      hasColorOptions: false
    },
    specifications: {
      accessories: [
        "Large Flower Nail (#7)",
        "Medium Flower Nail (#9)",
        "Curved Flower Lifter",
        "Angled Flower Lifter"
      ]
    }
  },
  {
    id: 9,
    slug: "premium-russian-tips-collection",
    name: "Premium Russian Tips Collection",
    price: 89.99,
    images: [
      { src: "/placeholder_peony.jpg", alt: "Pink Peony - Russian tip perfection" },
      { src: "/placeholder_orchid-pink.jpg", alt: "Pink Orchid - Advanced Russian techniques" },
      { src: "/placeholder_oriental-lily.jpg", alt: "Oriental Lily - Professional Russian piping" },
      { src: "/placeholder_chrysanthemum.jpg", alt: "Chrysanthemum - Intricate Russian details" }
    ],
    shortDescription: "Professional Russian piping tips for stunning one-motion flowers",
    longDescription: "This premium collection features authentic Russian piping tips that allow you to create incredibly realistic flowers in a single motion. Each tip is precision-crafted to produce multiple petals simultaneously, creating stunning depth and texture that's impossible to achieve with traditional tips. Perfect for advanced decorators ready to elevate their buttercream flower game with professional Russian techniques.",
    category: "piping-tips",
    inStock: true,
    variants: {
      hasHandPreference: false,
      hasSizeOptions: false,
      hasColorOptions: false
    },
    specifications: {
      accessories: [
        "12 Premium Russian Tips (Assorted Sizes)",
        "Specialty Coupling System",
        "Russian Technique Video Tutorial Access",
        "Premium Storage Case"
      ],
      tipCategories: [
        {
          name: "Rose Tips",
          items: ["Large Russian Rose", "Medium Russian Rose", "Small Russian Rose"]
        },
        {
          name: "Chrysanthemum Tips",
          items: ["Large Chrysanthemum", "Medium Chrysanthemum"]
        },
        {
          name: "Specialty Blooms",
          items: ["Russian Tulip", "Russian Carnation", "Russian Sunflower", "Russian Dahlia"]
        }
      ]
    }
  },
  {
    id: 10,
    slug: "edible-shimmer-dust-garden",
    name: "Edible Shimmer Dust Garden",
    price: 32.75,
    images: [
      { src: "/placeholder_lily.jpg", alt: "White Lily - Sparkling shimmer effects" },
      { src: "/placeholder_rose-pink.jpg", alt: "Pink Rose - Elegant pearl dust finish" },
      { src: "/placeholder_peony-blue.jpg", alt: "Blue Peony - Iridescent garden sparkle" }
    ],
    shortDescription: "Luxurious edible shimmer collection for ethereal flower finishes",
    longDescription: "Transform your buttercream flowers into magical, shimmering works of art with this curated collection of premium edible shimmer dusts. Each shade is carefully selected to complement natural flower tones while adding an ethereal, luminous quality that catches light beautifully. Food-safe and flavor-neutral, these shimmers blend seamlessly with buttercream and can be applied wet or dry for varying intensity levels.",
    category: "ingredients",
    inStock: true,
    variants: {
      hasHandPreference: false,
      hasSizeOptions: false,
      hasColorOptions: true
    },
    specifications: {
      accessories: [
        "8 Premium Shimmer Shades (0.25oz each)",
        "Professional Application Brushes (x3)",
        "Mixing Medium for Wet Application",
        "Shimmer Technique Guide",
        "UV-Safe Storage Container"
      ]
    },
    disclaimer: "Shimmer effects may vary under different lighting conditions. Store in cool, dry place away from direct sunlight."
  },
  {
    id: 11,
    slug: "heated-workspace-mat",
    name: "Temperature-Controlled Workspace Mat",
    price: 156.50,
    images: [
      { src: "/placeholder_chrysanthemum.jpg", alt: "Chrysanthemum - Consistent temperature workspace" },
      { src: "/placeholder_oriental-lily.jpg", alt: "Oriental Lily - Professional heated surface" },
      { src: "/placeholder_daisy.jpg", alt: "White Daisy - Temperature-controlled decorating" },
      { src: "/placeholder_orchid-pink.jpg", alt: "Pink Orchid - Precision temperature control" }
    ],
    shortDescription: "Professional temperature-controlled mat for consistent buttercream handling",
    longDescription: "This innovative heated workspace mat maintains the perfect temperature for buttercream work, ensuring consistent texture and workability regardless of room conditions. The mat features precise digital temperature control, allowing you to set the optimal warmth for your specific buttercream recipe and working style. Essential for professional decorators working in varying environments or during temperature-sensitive seasons.",
    category: "equipment",
    inStock: true,
    variants: {
      hasHandPreference: false,
      hasSizeOptions: true,
      hasColorOptions: false
    },
    specifications: {
      accessories: [
        "24\" x 18\" Heated Mat",
        "Digital Temperature Controller",
        "Non-Slip Bottom Surface",
        "Easy-Clean Silicone Top Layer",
        "Power Adapter & 6ft Cord",
        "Temperature Guide Chart"
      ]
    },
    disclaimer: "Electrical equipment. Follow all safety guidelines. Not waterproof - wipe clean only."
  },
  {
    id: 12,
    slug: "botanical-inspiration-cards",
    name: "Botanical Inspiration Card Deck",
    price: 19.95,
    images: [
      { src: "/placeholder_peony.jpg", alt: "Pink Peony - Botanical inspiration deck" },
      { src: "/placeholder_lily.jpg", alt: "White Lily - Nature study cards" },
      { src: "/placeholder_rose-pink.jpg", alt: "Pink Rose - Floral reference guide" }
    ],
    shortDescription: "Beautiful reference cards featuring real flower photography and piping guides",
    longDescription: "This stunning deck of 50 botanical inspiration cards features high-quality photography of real flowers paired with detailed piping instructions for recreating each bloom in buttercream. Each card includes seasonal information, color mixing suggestions, and step-by-step technique notes. Perfect for sparking creativity and expanding your flower repertoire with nature-accurate color palettes and forms.",
    category: "education",
    inStock: true,
    variants: {
      hasHandPreference: false,
      hasSizeOptions: false,
      hasColorOptions: false
    },
    specifications: {
      accessories: [
        "50 Premium Photo Cards (4\" x 6\")",
        "Protective Storage Box",
        "Seasonal Flower Calendar",
        "Quick Reference Guide",
        "Waterproof Card Coating"
      ]
    }
  },
  {
    id: 13,
    slug: "micro-detail-sculpting-tools",
    name: "Micro Detail Sculpting Tool Set",
    price: 27.40,
    images: [
      { src: "/placeholder_orchid-pink.jpg", alt: "Pink Orchid - Intricate detail work" },
      { src: "/placeholder_oriental-lily.jpg", alt: "Oriental Lily - Precision sculpting tools" },
      { src: "/placeholder_chrysanthemum.jpg", alt: "Chrysanthemum - Fine detail enhancement" },
      { src: "/placeholder_peony-blue.jpg", alt: "Blue Peony - Professional micro sculpting" },
      { src: "/placeholder_daisy.jpg", alt: "White Daisy - Delicate flower details" }
    ],
    shortDescription: "Precision tools for adding intricate details to buttercream flowers",
    longDescription: "This specialized set of micro sculpting tools allows you to add incredibly fine details to your buttercream flowers - from delicate petal textures and realistic stamens to intricate leaf veining and flower centers. Each tool is crafted from food-safe materials with ergonomic handles designed for precision work. Perfect for decorators who want to achieve botanical-level realism in their buttercream creations.",
    category: "tools",
    inStock: true,
    variants: {
      hasHandPreference: true,
      hasSizeOptions: false,
      hasColorOptions: false
    },
    specifications: {
      accessories: [
        "7 Precision Sculpting Tools",
        "Texture Rolling Pin (Mini)",
        "Detail Brush Set (x4)",
        "Magnifying Work Light",
        "Tool Rest Stand",
        "Protective Tool Roll"
      ]
    }
  }
];

// Helper functions for the mock API
export const getProductBySlug = (slug: string): Product | undefined => {
  return mockProducts.find(product => product.slug === slug);
};

export const getProductById = (id: number): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const getAllProducts = (): Product[] => {
  return mockProducts;
};

export const getProductsByCategory = (category: string): Product[] => {
  return mockProducts.filter(product => product.category === category);
};
