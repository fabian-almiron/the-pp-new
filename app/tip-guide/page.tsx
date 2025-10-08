export default function TipGuidePage() {
  const tips = [
    {
      number: 10,
      brand: "Snip tip",
      name: "",
      uses: "Sunflowers, Peonies and Daisies",
      description: "This tip is great for adding realistic stamens and center accents to your flowers!"
    },
    {
      number: 9,
      brand: "Ateco",
      name: "227",
      uses: "Dahlias and Chrysanthemums",
      description: "If this tip were a person, it would be considered, strong, and full of surprises! This is a great tip for achieving long thin petals that can hold their own!"
    },
    {
      number: 8,
      brand: "GG Cakraft",
      name: "106",
      uses: "Lemons, Eucalyptus, anemones",
      description: "There was never a better tip made for Justicia! This tip is thick enough to create substantial single leaves, and thicker petals that can hold their own! I like the GG Cakraft 102 to add sizing variation!"
    },
    {
      number: 7,
      brand: "Ateco",
      name: "00",
      uses: "Peonies, Love Lies Bleeding, Raspberries, succulents, anemones, billy balls",
      description: "Sometimes it's in the details! This tip is great for piping fine details on everything from rivulets to succulents, and everything in between!"
    },
    {
      number: 6,
      brand: "Wilton",
      name: "4D or 2a",
      uses: "Making an appearance in literally every 1-dimensional flower you see! Looks where!",
      description: "It's all about that base!"
    },
    {
      number: 5,
      brand: "Wilton",
      name: "349",
      uses: "Leafing accents, smaller flowers like lily of the valley and lilacs, sunflowers, dahlias",
      description: "This tip is a work horse! It's great for fine veining detail, but also exactly what you need for smaller center petals of a flower."
    },
    {
      number: 4,
      brand: "Wilton",
      name: "101",
      uses: "Lilacs, lily of the valley, artichokes, peonies, daisies, Gerber dahlias, forget-me-nots, apple blossoms, hydrangea",
      description: "This tip is small but might! It's perfect for adding small details, or piping small flowers to accent your buttercream flower cake or cupcake."
    },
    {
      number: 3,
      brand: "Wilton",
      name: "123",
      uses: "Peonies",
      description: "Once upon a time, Wilton 123 was born. He just knew he would grow up to pipe peonies, and one day he did. This tip is the most perfectly made tip for peony flowers in all shapes of bloom, which you can learn to pipe at the Academy!"
    },
    {
      number: 2,
      brand: "GG Cakraft",
      name: "1062 or 1061",
      uses: "Roses, English roses, David Austin roses, Julliette roses, peonies, anemones, leafing",
      description: "This tip is perfect for achieving those delicate larger curved petals on your two-dimensional and three-dimensional flowers!"
    },
    {
      number: 1,
      brand: "Ateco",
      name: "124k",
      uses: "Roses, English roses, David Austin roses, Julliette roses, ranunculus flowers, peonies, anemones, carnations, leafing",
      description: "If I were trapped on an island, I would want to have this tip and chopstick! This tip does it all! Purchase at least 10 and you'll never feel lonely."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      {/* Header */}
      <div 
        className="relative py-16 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/archive-header-bg.svg)' }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <p className="text-sm uppercase tracking-wider text-gray-600 mb-2" style={{ fontFamily: 'var(--font-dancing-script)' }}>
            Tip 10
          </p>
          <h1 className="text-4xl md:text-6xl font-serif mb-4 text-black uppercase">
            TIP GUIDE
          </h1>
          <p className="text-base text-gray-700 max-w-2xl mx-auto">
            The correct piping tip is essential for executing floral piping designs, as it enables you to achieve various silhouettes. bringing your creative visions to life.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 md:p-12">
          <div className="space-y-8">
            {tips.map((tip, index) => (
              <div 
                key={tip.number} 
                className={`flex gap-6 ${index !== tips.length - 1 ? 'pb-8 border-b border-gray-200' : ''}`}
              >
                {/* Number Badge */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center text-xl font-bold">
                    {tip.number}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-serif text-black mb-1">
                    {tip.brand}
                  </h3>
                  {tip.name && (
                    <p className="text-lg text-black mb-3">{tip.name}</p>
                  )}
                  
                  <p className="text-sm font-semibold text-black mb-2">
                    Uses: {tip.uses}
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
