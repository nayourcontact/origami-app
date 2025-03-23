const translations = {
    hu: {
      home: "Főoldal",
      gallery: "Galéria",
      tutorial: "Ismeretterjesztő",
      order: "Megrendelés",
      homeTitle: "Origami Alfredo - Főoldal",
      homeDescription: "Fedezd fel az origami világát! Ismeretterjesztő cikkek, gyönyörű alkotások és oktatóanyagok.",
      galleryTitle: "Origami Alfredo - Galéria",
      galleryDescription: "Tekintsd meg a legszebb origami alkotásokat! Egyedi papírhajtogatási technikák.",
      tutorialTitle: "Origami Alfredo - Ismeretterjesztő",
      tutorialDescription: "Tanulj meg origami figurákat hajtogatni lépésről lépésre az oktatóanyagainkkal.",
      orderTitle: "Origami Alfredo - Megrendelés",
      orderDescription: "Rendelj egyedi origami alkotásokat ajándéknak vagy dekorációnak.",
      newsletterPlaceholder: "Add meg az email címed!",
      subscribe: "Iratkozz fel",
      notFoundMessage: "Az oldal nem található.",
      backHome: "Vissza a főoldalra",
      homeTooltip: "Ugrás a kezdőlapra",
      galleryTooltip: "Nézd meg a galériát",
      tutorialTooltip: "Tanulj meg origamizni",
      orderTooltip: "Vásárlás és rendelés",
      toggleLanguage: "Váltás magyar és angol között",
      subscribeTooltip: "Iratkozz fel a hírlevélre"
    },
    en: {
      home: "Home",
      gallery: "Gallery",
      tutorial: "Tutorial",
      order: "Order",
      homeTitle: "Origami Alfredo - Home",
      homeDescription: "Explore the world of origami! Educational articles, beautiful creations, and tutorials.",
      galleryTitle: "Origami Alfredo - Gallery",
      galleryDescription: "Discover the most beautiful origami creations! Unique paper folding techniques.",
      tutorialTitle: "Origami Alfredo - Tutorial",
      tutorialDescription: "Learn how to fold origami figures step by step with our tutorials.",
      orderTitle: "Origami Alfredo - Order",
      orderDescription: "Order unique origami creations as gifts or decorations.",
      newsletterPlaceholder: "Write your email",
      subscribe: "Subscribe",
      notFoundMessage: "The page could not be found.",
      backHome: "Back to Home",
      homeTooltip: "Go to the homepage",
      galleryTooltip: "Check out the gallery",
      tutorialTooltip: "Learn origami",
      orderTooltip: "Shop and order",
      toggleLanguage: "Switch between Hungarian and English",
      subscribeTooltip: "Subscribe to our newsletter"
    },
  };
  
  export const t = (lang, key) => {
    return translations[lang]?.[key] || key;
  };
  
  export default translations;
  