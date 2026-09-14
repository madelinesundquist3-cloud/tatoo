export interface Tattoo {
  id: string;
  title: string;
  imageUrl: string;
  style: string;
  placement: string;
  author: {
    name: string;
    username: string;
    avatarUrl: string;
  };
  likesCount: number;
  savesCount: number;
  tags: string[];
  aspectRatio: "tall" | "square" | "wide";
  description?: string;
  featured?: boolean;
}

export interface DiscoverItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  tagline: string;
  imageUrl: string;
}

export const CATEGORIES = [
  "Fine Line",
  "Realism",
  "Black & Grey",
  "Traditional",
  "Japanese",
  "Minimalist",
  "Geometric",
  "Color",
  "Lettering",
  "Small Tattoos",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SAMPLE_TATTOOS: Tattoo[] = [
  {
    id: "tat-top-spine",
    title: "Ethereal Ornamental Lotus & Chandelier Filigree Spine",
    imageUrl: "/tattoos/ornamental-lotus-spine.jpg",
    style: "Fine Line",
    placement: "Back Piece",
    author: {
      name: "Elena Solis",
      username: "elena_ornamental",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 18940,
    savesCount: 11230,
    tags: ["spine", "ornamental", "fine line", "lotus", "chandelier", "single needle", "trending", "most liked"],
    aspectRatio: "tall",
    description: "Delicate single-needle cascading lotus blossoms and ornamental chandelier filigree beadwork flowing down the spine column. One of the studio's most saved and requested pieces.",
    featured: true,
  },
  {
    id: "tat-top-dragon",
    title: "Traditional Japanese Ryu Water Dragon & Sakura Full Sleeve",
    imageUrl: "/tattoos/japanese-dragon-irezumi.jpg",
    style: "Japanese",
    placement: "Full Sleeve",
    author: {
      name: "Kenji Takahashi",
      username: "kenji_irezumi",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 16350,
    savesCount: 9810,
    tags: ["japanese", "irezumi", "ryu", "dragon", "waves", "sakura", "sleeve", "most liked"],
    aspectRatio: "tall",
    description: "Authentic Japanese horimono sleeve showcasing a celestial water dragon cresting over dynamic tidal swells, clouds, and floating cherry blossoms.",
    featured: true,
  },
  {
    id: "tat-top-cyber",
    title: "Cybersigilism Fluid Chrome Cyber-Wing Linework",
    imageUrl: "/tattoos/cybersigilism-neo-tribal.jpg",
    style: "Minimalist",
    placement: "Collarbone",
    author: {
      name: "Kira Vane",
      username: "kira_cybersigil",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 15620,
    savesCount: 9400,
    tags: ["cybersigilism", "neo tribal", "cyberpunk", "chrome", "y2k", "collarbone", "trending", "most liked"],
    aspectRatio: "tall",
    description: "Modern vanguard cybersigilism linework draping organically across the shoulder and clavicle with razor-sharp aerodynamic barb flourishes.",
    featured: true,
  },
  {
    id: "tat-top-medusa",
    title: "Classical Greek Medusa Sculpture & Serpent Crown",
    imageUrl: "/tattoos/medusa-sculpture-realism.jpg",
    style: "Realism",
    placement: "Forearm",
    author: {
      name: "Aurelius Gray",
      username: "aurelius_blackwork",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 14820,
    savesCount: 8490,
    tags: ["medusa", "mythology", "greek sculpture", "realism", "black and grey", "serpents", "trending", "most liked"],
    aspectRatio: "tall",
    description: "Masterwork charcoal black & grey realism depicting the classical marble statue of Medusa with serpentine coiling locks and dramatic chiaroscuro shadow play.",
    featured: true,
  },
  {
    id: "tat-top-mandala",
    title: "Sacred Geometry Mandala & Stippled Dotwork Cap",
    imageUrl: "/tattoos/geometric-sacred-mandala.jpg",
    style: "Geometric",
    placement: "Shoulder Blade",
    author: {
      name: "Maya Linnea",
      username: "maya_sacredgeo",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 13970,
    savesCount: 7890,
    tags: ["sacred geometry", "mandala", "dotwork", "stippling", "symmetry", "shoulder cap", "most liked"],
    aspectRatio: "tall",
    description: "Hyper-precise algorithmic sacred geometry mandala with hypnotic concentric petal layers and smooth stippled gradient transitions.",
    featured: true,
  },
  {
    id: "tat-top-panther",
    title: "Neo-Traditional Velvet Panther & Crimson Peony",
    imageUrl: "/tattoos/neotraditional-panther-peony.jpg",
    style: "Traditional",
    placement: "Forearm",
    author: {
      name: "Marco Santos",
      username: "santos_neotrad",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 12410,
    savesCount: 7150,
    tags: ["neo traditional", "panther", "peony", "bold will hold", "emerald eyes", "color", "loyalty", "most liked"],
    aspectRatio: "tall",
    description: "Punchy neo-traditional panther head with piercing emerald eyes clutching a rich velvet crimson peony and parchment banner.",
    featured: true,
  },
  {
    id: "client-tat-1",
    title: "Dark Fantasy Dagger with Ethereal Smoke & Script",
    imageUrl: "/clients/client-sword-celine.jpg",
    style: "Black & Grey",
    placement: "Forearm",
    author: {
      name: "Celine K.",
      username: "celine_k",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 2980,
    savesCount: 1450,
    tags: ["sword", "dagger", "script", "celine", "black and grey", "forearm", "dark art", "verified client"],
    aspectRatio: "tall",
    description: "Dark fantasy dagger hilt enveloped by dark mystical smoke with custom calligraphy lettering on the forearm.",
    featured: true,
  },
  {
    id: "client-tat-2",
    title: "Bold Traditional 'Lover Boy' Rose & Heart Banner",
    imageUrl: "/clients/client-lover-boy-rose.jpg",
    style: "Traditional",
    placement: "Arm",
    author: {
      name: "Jordan M.",
      username: "jordan_m",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 3120,
    savesCount: 1620,
    tags: ["lover boy", "rose", "traditional", "color", "heart", "banner", "vintage", "verified client"],
    aspectRatio: "tall",
    description: "Classic American Traditional rose with vibrant golden amber petals, crimson heart, and Lover Boy banner.",
    featured: true,
  },
  {
    id: "client-tat-3",
    title: "Ocean Humpback Whale Chest Cover-Up",
    imageUrl: "/clients/client-whale-chest.jpg",
    style: "Realism",
    placement: "Chest",
    author: {
      name: "Marcus V.",
      username: "marcus_v",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 4230,
    savesCount: 2480,
    tags: ["whale", "coverup", "chest", "ink splash", "marine", "realism", "transformation", "verified client"],
    aspectRatio: "tall",
    description: "Dynamic marine composition seamlessly transforming a dark legacy tattoo into an ink-splash humpback whale.",
    featured: true,
  },
  {
    id: "client-tat-4",
    title: "Botanical Fine-Line Wildflower Blossom Vine",
    imageUrl: "/clients/client-botanical-fine-line.jpg",
    style: "Fine Line",
    placement: "Forearm",
    author: {
      name: "Elena R.",
      username: "elena_r",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 3890,
    savesCount: 2110,
    tags: ["fine line", "floral", "botanical", "single needle", "flowers", "wrist", "verified client"],
    aspectRatio: "tall",
    description: "Micro fine line blooming blossoms and leaf vine gracefully wrapping down the inner forearm and wrist.",
    featured: true,
  },
  {
    id: "client-tat-5",
    title: "Texas Turquoise & Wildflower Memorial Cover-Up",
    imageUrl: "/clients/client-turquoise-coverup.jpg",
    style: "Color",
    placement: "Full Sleeve",
    author: {
      name: "Kaylie & Donna S.",
      username: "kaylie_donna",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 3670,
    savesCount: 1840,
    tags: ["turquoise", "texas", "coverup", "flowers", "memorial", "transformation", "verified client"],
    aspectRatio: "tall",
    description: "Complete sleeve transformation turning a 17-year-old faded script into a glowing turquoise gemstone and Western floral filigree.",
    featured: true,
  },
  {
    id: "tat-1",
    title: "Botanical Micro-Fine Line Flora",
    imageUrl: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80",
    style: "Fine Line",
    placement: "Forearm",
    author: {
      name: "Sora Vance",
      username: "soravance",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 1420,
    savesCount: 618,
    tags: ["botanical", "florals", "single needle", "delicate"],
    aspectRatio: "tall",
    description: "Single-needle wild meadow flowers wrapped around the inner forearm with hyper-delicate stippling.",
    featured: true,
  },
  {
    id: "tat-2",
    title: "Hyper-Realistic Marble Sculpture & Raven",
    imageUrl: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=900&q=80",
    style: "Realism",
    placement: "Full Sleeve",
    author: {
      name: "Darius Kael",
      username: "kael_realism",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 2890,
    savesCount: 1140,
    tags: ["realism", "sculpture", "statue", "sleeve"],
    aspectRatio: "tall",
    description: "Deep contrast classical Roman sculpture juxtaposed with shadow study plumage.",
    featured: true,
  },
  {
    id: "tat-3",
    title: "Traditional Dagger & Sacred Heart",
    imageUrl: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=900&q=80",
    style: "Traditional",
    placement: "Thigh",
    author: {
      name: "Mateo Cruz",
      username: "cruz_trad",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 940,
    savesCount: 380,
    tags: ["bold will hold", "flash", "vintage", "heart"],
    aspectRatio: "square",
    description: "Solid black lining with deep crimson and vintage gold pigment tones.",
  },
  {
    id: "tat-4",
    title: "Japanese Irezumi Dragon & Chrysanthemum",
    imageUrl: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=900&q=80",
    style: "Japanese",
    placement: "Back Piece",
    author: {
      name: "Kenji Sato",
      username: "kenjisato",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 3410,
    savesCount: 1820,
    tags: ["irezumi", "ryu", "waves", "windbars"],
    aspectRatio: "tall",
    description: "Traditional tebori inspired full back layout of the water dragon navigating mist and wind.",
    featured: true,
  },
  {
    id: "tat-5",
    title: "Geometric Sacred Torus & Dotwork",
    imageUrl: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=900&q=80",
    style: "Geometric",
    placement: "Shoulder Blade",
    author: {
      name: "Nova Sterling",
      username: "nova_geometry",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 1680,
    savesCount: 790,
    tags: ["sacred geometry", "dotwork", "symmetry", "mandala"],
    aspectRatio: "square",
    description: "Precise algorithmic linework with hand-poked gradient density transitions.",
  },
  {
    id: "tat-6",
    title: "Ethereal Minimalist Constellation & Orbit",
    imageUrl: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=900&q=80",
    style: "Minimalist",
    placement: "Wrist",
    author: {
      name: "Lina Chen",
      username: "linatatt",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 2150,
    savesCount: 1205,
    tags: ["astronomy", "subtle", "clean", "micro"],
    aspectRatio: "wide",
    description: "Continuous line cosmic orbit with single focal point starburst.",
  },
  {
    id: "tat-7",
    title: "Gothic Black & Grey Dark Art Skull",
    imageUrl: "https://images.unsplash.com/photo-1550537687-c91072c4792d?auto=format&fit=crop&w=900&q=80",
    style: "Black & Grey",
    placement: "Chest",
    author: {
      name: "Viktor Draven",
      username: "draven_ink",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 1890,
    savesCount: 920,
    tags: ["dark art", "skull", "gothic", "chicano"],
    aspectRatio: "tall",
    description: "Smooth tonal grey wash transitions with sharp specular skin breaks.",
  },
  {
    id: "tat-8",
    title: "Cinematic Neo-Tokyo Cyberpunk Color",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80",
    style: "Color",
    placement: "Calf",
    author: {
      name: "Aria Thorne",
      username: "ariacolors",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 2470,
    savesCount: 1040,
    tags: ["neon", "illustrative", "vibrant", "synthwave"],
    aspectRatio: "tall",
    description: "Ultraviolet magenta and electric cyan saturation with high-key contrast.",
  },
  {
    id: "tat-9",
    title: "Custom Chicano Script & Calligraphy",
    imageUrl: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=900&q=80",
    style: "Lettering",
    placement: "Collarbone",
    author: {
      name: "Rafael Ortiz",
      username: "ortiz_scripts",
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 1120,
    savesCount: 510,
    tags: ["script", "custom lettering", "calligraphy", "filigree"],
    aspectRatio: "wide",
    description: "Bespoke freehand flourishes contoured organically along the clavicle.",
  },
  {
    id: "tat-10",
    title: "Micro Crescent Moon & Wild Lavender",
    imageUrl: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=900&q=80",
    style: "Small Tattoos",
    placement: "Behind Ear",
    author: {
      name: "Yuki Tanaka",
      username: "yukitiny",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 3100,
    savesCount: 1980,
    tags: ["tiny", "hidden", "botanical", "lunar"],
    aspectRatio: "square",
    description: "Subtle 2-inch composition tucked neatly behind the ear with 0.15mm needle work.",
  },
  {
    id: "tat-11",
    title: "Surrealist Fine Line Floating Eye",
    imageUrl: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80",
    style: "Fine Line",
    placement: "Bicep",
    author: {
      name: "Mira Sol",
      username: "mirasol_ink",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 1750,
    savesCount: 830,
    tags: ["surreal", "fine line", "illustration", "modern"],
    aspectRatio: "tall",
    description: "Dreamlike surrealism with immaculate concentric line weights.",
  },
  {
    id: "tat-12",
    title: "Blackwork Ornamental Mandala Sleeve",
    imageUrl: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=900&q=80",
    style: "Black & Grey",
    placement: "Arm & Hand",
    author: {
      name: "Zane Moreau",
      username: "zanemoreau",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    likesCount: 2310,
    savesCount: 1190,
    tags: ["blackwork", "ornamental", "sleeve", "geometry"],
    aspectRatio: "tall",
    description: "Full body ornamental flow harmonizing anatomical musculature with sacred geometry.",
  },
];

export const HERO_HIGHLIGHT_TATTOOS = [
  {
    id: "hero-1",
    imageUrl: "/clients/client-botanical-fine-line.jpg",
    title: "Botanical Fine Line",
    artist: "Elena R. • Verified",
    style: "Fine Line",
  },
  {
    id: "hero-2",
    imageUrl: "/clients/client-whale-chest.jpg",
    title: "Ocean Whale Cover-Up",
    artist: "Marcus V. • Verified",
    style: "Realism",
  },
  {
    id: "hero-3",
    imageUrl: "/clients/client-lover-boy-rose.jpg",
    title: "Lover Boy Traditional",
    artist: "Jordan M. • Verified",
    style: "Traditional",
  },
  {
    id: "hero-4",
    imageUrl: "/clients/client-sword-celine.jpg",
    title: "Dark Fantasy Dagger",
    artist: "Celine K. • Verified",
    style: "Black & Grey",
  },
];

export const DISCOVER_ITEMS: DiscoverItem[] = [
  {
    id: "disc-1",
    title: "Find Tattoo Inspiration",
    description: "Browse thousands of styles, placements, and curated flash designs from creators worldwide.",
    iconName: "Compass",
    tagline: "Explore styles & placements",
    imageUrl: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "disc-2",
    title: "Share Your Tattoo Idea",
    description: "Post your vision, sketches, or moodboards to receive feedback, refinement, and artist interest.",
    iconName: "Sparkles",
    tagline: "Bring your vision to life",
    imageUrl: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "disc-3",
    title: "Discover People",
    description: "Connect with passionate collectors, illustrators, and custom artists who match your exact aesthetic.",
    iconName: "Users",
    tagline: "A unified community of users",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "disc-4",
    title: "Find Tattoo Services",
    description: "Locate practitioners offering custom pieces, flash sessions, touch-ups, or custom consultations.",
    iconName: "Palette",
    tagline: "Connect for upcoming work",
    imageUrl: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=600&q=80",
  },
];

export const PLACEMENTS = [
  "Forearm",
  "Full Sleeve",
  "Thigh",
  "Back Piece",
  "Shoulder Blade",
  "Wrist",
  "Chest",
  "Calf",
  "Collarbone",
  "Behind Ear",
  "Arm & Hand",
] as const;

export type Placement = (typeof PLACEMENTS)[number];

export function getTattooById(id: string): Tattoo | undefined {
  return SAMPLE_TATTOOS.find((t) => t.id === id);
}

export function getRelatedTattoos(id: string, limit: number = 4): Tattoo[] {
  const current = getTattooById(id);
  if (!current) return SAMPLE_TATTOOS.slice(0, limit);

  // Filter out current, prioritize same style or author
  const sameStyle = SAMPLE_TATTOOS.filter(
    (t) => t.id !== id && t.style.toLowerCase() === current.style.toLowerCase()
  );
  const others = SAMPLE_TATTOOS.filter(
    (t) => t.id !== id && t.style.toLowerCase() !== current.style.toLowerCase()
  );

  return [...sameStyle, ...others].slice(0, limit);
}

