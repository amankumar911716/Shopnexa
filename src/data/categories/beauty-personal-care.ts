import { generateCategoryProducts } from '../product-generator';

const rawProducts: [string, string, number, number, number, number, number, number, boolean, boolean, boolean, number | undefined, string][] = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // SKINCARE (1-25)
  // ═══════════════════════════════════════════════════════════════════════════════

  // 1 - Featured, Trending
  ['Neutrogena Oil-Free Acne Wash', 'Neutrogena', 449, 599, 4.3, 8760, 280, 7230, true, true, false, undefined, 'seller1'],
  // 2 - Featured, Trending
  ['Minimalist 10% Niacinamide Face Serum', 'Minimalist', 549, 750, 4.5, 12340, 380, 10560, true, true, false, undefined, 'seller2'],
  // 3 - Featured, Trending
  ['CeraVe Moisturizing Cream', 'CeraVe', 649, 899, 4.6, 9870, 320, 8430, true, true, false, undefined, 'seller3'],
  // 4 - Featured, Trending
  ['LOreal Paris Hyaluron Expert Serum', 'LOreal Paris', 799, 1199, 4.4, 7650, 260, 6340, true, true, false, undefined, 'seller4'],
  // 5 - Featured, Trending, Flash Deal
  ['Lakme Absolute Perfect Radiance Skin Brightening Cream', 'Lakme', 499, 699, 4.2, 6540, 220, 5430, true, true, true, 349, 'seller1'],
  // 6 - Trending
  ['Mamaearth Vitamin C Face Wash', 'Mamaearth', 349, 499, 4.3, 14320, 450, 12560, false, true, false, undefined, 'seller5'],
  // 7 - Trending
  ['Plum Green Tea Pore Cleansing Face Wash', 'Plum', 399, 549, 4.4, 8760, 300, 7540, false, true, false, undefined, 'seller2'],
  // 8 - Trending
  ['Dot and Key Watermelon Hyaluronic Serum', 'Dot & Key', 599, 850, 4.5, 9560, 310, 8230, false, true, false, undefined, 'seller3'],
  // 9 - Trending
  ['WOW Skin Science Vitamin C Face Serum', 'WOW', 449, 699, 4.3, 11230, 380, 9870, false, true, false, undefined, 'seller1'],
  // 10 - Trending, Flash Deal
  ['MCaffeine Coffee Face Scrub', 'MCaffeine', 349, 549, 4.4, 7890, 270, 6780, false, true, true, 249, 'seller4'],
  // 11
  ['Nykaa Naturals Papaya Face Wash', 'Nykaa Naturals', 299, 449, 4.2, 5430, 190, 4560, false, false, false, undefined, 'seller5'],
  // 12
  ['Forest Essentials Soundarya Radiance Cream', 'Forest Essentials', 2899, 3500, 4.7, 4320, 140, 3650, false, false, false, undefined, 'seller2'],
  // 13
  ['Khadi Natural Vitamin E Cream', 'Khadi Natural', 249, 399, 4.1, 6230, 220, 5340, false, false, false, undefined, 'seller3'],
  // 14
  ['Biotique Bio Morning Nectar Flawless Skin Cream', 'Biotique', 199, 325, 4.2, 8760, 310, 7540, false, false, false, undefined, 'seller1'],
  // 15 - Flash Deal
  ['Himalaya Purifying Neem Face Wash', 'Himalaya', 199, 299, 4.3, 18560, 580, 16200, false, false, true, 149, 'seller4'],
  // 16
  ['Nivea Soft Light Moisturizer', 'Nivea', 199, 299, 4.4, 15670, 500, 13500, false, false, false, undefined, 'seller5'],
  // 17
  ['Garnier Skin Naturals Bright Complete Vitamin C Cream', 'Garnier', 249, 399, 4.2, 9560, 320, 8230, false, false, false, undefined, 'seller2'],
  // 18
  ['Minimalist Salicylic Acid 2% Face Serum', 'Minimalist', 499, 700, 4.5, 7650, 260, 6540, false, false, false, undefined, 'seller3'],
  // 19
  ['Neutrogena Hydro Boost Water Gel', 'Neutrogena', 599, 849, 4.5, 6780, 230, 5760, false, false, false, undefined, 'seller1'],
  // 20 - Flash Deal
  ['Mamaearth Tea Tree Face Wash', 'Mamaearth', 349, 499, 4.3, 11230, 380, 9870, false, false, true, 249, 'seller4'],
  // 21
  ['Plum 15% Vitamin C Face Serum', 'Plum', 649, 899, 4.5, 5430, 190, 4560, false, false, false, undefined, 'seller5'],
  // 22
  ['CeraVe Hydrating Cleanser', 'CeraVe', 749, 999, 4.6, 8430, 280, 7230, false, false, false, undefined, 'seller2'],
  // 23
  ['LOreal Paris Revitalift Crystal Micro-Essence', 'LOreal Paris', 1299, 1699, 4.4, 4320, 150, 3650, false, false, false, undefined, 'seller3'],
  // 24
  ['Dot and Key Vitamin C + Niacinamide Serum', 'Dot & Key', 649, 899, 4.5, 6230, 210, 5340, false, false, false, undefined, 'seller1'],
  // 25 - Flash Deal
  ['WOW Anti-Aging Retinol Face Serum', 'WOW', 549, 799, 4.3, 5230, 180, 4320, false, false, true, 379, 'seller4'],

  // ═══════════════════════════════════════════════════════════════════════════════
  // HAIRCARE (26-45)
  // ═══════════════════════════════════════════════════════════════════════════════

  // 26
  ['Dove Intense Damage Repair Shampoo', 'Dove', 299, 449, 4.4, 14320, 450, 12560, false, false, false, undefined, 'seller5'],
  // 27
  ['Pantene Advanced Hair Fall Solution Shampoo', 'Pantene', 279, 425, 4.3, 12340, 400, 10800, false, false, false, undefined, 'seller1'],
  // 28
  ['LOreal Paris Total Repair 5 Shampoo', 'LOreal Paris', 349, 525, 4.4, 9560, 320, 8230, false, false, false, undefined, 'seller2'],
  // 29
  ['Streax Professional Vitariche Gloss Shampoo', 'Streax', 199, 325, 4.2, 6780, 230, 5760, false, false, false, undefined, 'seller3'],
  // 30 - Flash Deal
  ['Schwarzkopf BC Moisture Kick Shampoo', 'Schwarzkopf', 599, 899, 4.5, 5430, 180, 4560, false, false, true, 399, 'seller4'],
  // 31
  ['TRESemme Keratin Smooth Shampoo', 'TRESemme', 349, 549, 4.3, 8760, 300, 7540, false, false, false, undefined, 'seller5'],
  // 32
  ['Head and Shoulders Anti Dandruff Shampoo', 'Head & Shoulders', 249, 399, 4.4, 16540, 520, 14500, false, false, false, undefined, 'seller1'],
  // 33
  ['Indulekha Bringha Hair Oil', 'Indulekha', 449, 649, 4.3, 9870, 340, 8540, false, false, false, undefined, 'seller2'],
  // 34
  ['Himalaya Anti Hair Fall Cream', 'Himalaya', 199, 299, 4.2, 11230, 380, 9870, false, false, false, undefined, 'seller3'],
  // 35 - Flash Deal
  ['BBlunt Climate Control Anti-Frizz Leave-In Cream', 'BBlunt', 449, 649, 4.3, 4320, 150, 3560, false, false, true, 319, 'seller4'],
  // 36
  ['Garnier Ultra Blends Shampoo Royal Jelly', 'Garnier', 249, 399, 4.2, 7650, 260, 6540, false, false, false, undefined, 'seller5'],
  // 37
  ['Matrix Opti Care Smooth Straight Shampoo', 'Matrix', 449, 649, 4.4, 5230, 180, 4320, false, false, false, undefined, 'seller1'],
  // 38
  ['Dove Dryness Care Shampoo', 'Dove', 299, 449, 4.3, 7890, 270, 6780, false, false, false, undefined, 'seller2'],
  // 39
  ['Pantene Lively Clean Shampoo', 'Pantene', 279, 425, 4.2, 6540, 230, 5560, false, false, false, undefined, 'seller3'],
  // 40 - Flash Deal
  ['LOreal Paris 6 Oil Nourish Shampoo', 'LOreal Paris', 349, 525, 4.4, 8430, 290, 7230, false, false, true, 249, 'seller4'],
  // 41
  ['Streax Professional Hair Serum', 'Streax', 199, 325, 4.1, 5430, 190, 4560, false, false, false, undefined, 'seller5'],
  // 42
  ['Schwarzkopf OSiS+ Damped Hair Cream', 'Schwarzkopf', 699, 999, 4.3, 3210, 120, 2650, false, false, false, undefined, 'seller1'],
  // 43
  ['TRESemme Split End Repair Serum', 'TRESemme', 349, 549, 4.2, 4560, 160, 3780, false, false, false, undefined, 'seller2'],
  // 44
  ['Indulekha Gold Hair Oil', 'Indulekha', 549, 799, 4.4, 6540, 220, 5560, false, false, false, undefined, 'seller3'],
  // 45 - Flash Deal
  ['Himalaya Protein Shampoo Gentle Daily Care', 'Himalaya', 199, 299, 4.3, 8760, 300, 7540, false, false, true, 149, 'seller4'],

  // ═══════════════════════════════════════════════════════════════════════════════
  // MAKEUP (46-60)
  // ═══════════════════════════════════════════════════════════════════════════════

  // 46
  ['Lakme Absolute Skin Dew Serum Foundation', 'Lakme', 699, 999, 4.3, 8760, 300, 7540, false, false, false, undefined, 'seller5'],
  // 47
  ['Maybelline Fit Me Matte Foundation', 'Maybelline', 449, 649, 4.4, 12340, 420, 10800, false, false, false, undefined, 'seller1'],
  // 48
  ['LOreal Paris Infallible 24H Fresh Wear Foundation', 'LOreal Paris', 799, 1199, 4.4, 6540, 220, 5560, false, false, false, undefined, 'seller2'],
  // 49
  ['MAC Studio Fix Fluid Foundation', 'MAC', 2499, 2999, 4.6, 9560, 320, 8230, false, false, false, undefined, 'seller3'],
  // 50 - Flash Deal
  ['Nykaa matteTT Lasting Lipstick', 'Nykaa', 399, 599, 4.3, 11230, 380, 9870, false, false, true, 279, 'seller4'],
  // 51
  ['Kay Beauty Matte Lipstick', 'Kay Beauty', 499, 749, 4.4, 7890, 270, 6780, false, false, false, undefined, 'seller5'],
  // 52
  ['Sugar Cosmetics Matte As Hell Crayon Lipstick', 'Sugar', 399, 599, 4.3, 8430, 290, 7230, false, false, false, undefined, 'seller1'],
  // 53
  ['Swiss Beauty Ultimate Eyeshadow Palette', 'Swiss Beauty', 499, 799, 4.2, 6540, 230, 5560, false, false, false, undefined, 'seller2'],
  // 54
  ['Insight Cosmetics 12 Shade Eyeshadow Palette', 'Insight Cosmetics', 349, 549, 4.1, 4320, 150, 3560, false, false, false, undefined, 'seller3'],
  // 55 - Flash Deal
  ['Colorbar Perfect Match Primer', 'Colorbar', 599, 899, 4.3, 5230, 180, 4320, false, false, true, 399, 'seller4'],
  // 56
  ['Lakme 9to5 Primer + Matte Lipstick Combo', 'Lakme', 599, 849, 4.2, 7650, 260, 6540, false, false, false, undefined, 'seller5'],
  // 57
  ['Maybelline Colossal Kajal Waterproof', 'Maybelline', 199, 325, 4.5, 19870, 650, 17500, false, false, false, undefined, 'seller1'],
  // 58
  ['LOreal Paris Volume Million Lashes Mascara', 'LOreal Paris', 449, 699, 4.4, 7230, 250, 6120, false, false, false, undefined, 'seller2'],
  // 59
  ['MAC Ruby Woo Matte Lipstick', 'MAC', 1999, 2499, 4.7, 11230, 380, 9870, false, false, false, undefined, 'seller3'],
  // 60 - Flash Deal
  ['Nykaa Nail Enamel Set of 6', 'Nykaa', 499, 749, 4.2, 5670, 200, 4890, false, false, true, 349, 'seller4'],

  // ═══════════════════════════════════════════════════════════════════════════════
  // PERFUMES (61-75)
  // ═══════════════════════════════════════════════════════════════════════════════

  // 61
  ['Fogg Xtremo Scent for Men Body Spray', 'Fogg', 349, 499, 4.2, 12340, 420, 10800, false, false, false, undefined, 'seller5'],
  // 62
  ['Engage Rush Men Body Spray', 'Engage', 229, 399, 4.1, 8760, 300, 7540, false, false, false, undefined, 'seller1'],
  // 63
  ['Bella Vita Fragrance Ocean Body Perfume', 'Bella Vita', 799, 1199, 4.4, 6540, 220, 5560, false, false, false, undefined, 'seller2'],
  // 64
  ['Nivea Men Deep Espresso Body Deodorant', 'Nivea', 249, 399, 4.2, 7650, 260, 6540, false, false, false, undefined, 'seller3'],
  // 65 - Flash Deal
  ['Wild Stone Hydra Deodorant', 'Wild Stone', 299, 499, 4.2, 9560, 320, 8230, false, false, true, 199, 'seller4'],
  // 66
  ['Denver Hamilton Imperial Body Spray', 'Denver', 299, 449, 4.1, 5430, 190, 4560, false, false, false, undefined, 'seller5'],
  // 67
  ['Playground Deodorant Body Spray', 'Playground', 199, 349, 4.0, 4320, 150, 3560, false, false, false, undefined, 'seller1'],
  // 68
  ['Bella Vita Fragrance CEO Perfume', 'Bella Vita', 1299, 1799, 4.5, 4320, 140, 3650, false, false, false, undefined, 'seller2'],
  // 69
  ['Fogg Marco Body Perfume', 'Fogg', 449, 699, 4.2, 7890, 270, 6780, false, false, false, undefined, 'seller3'],
  // 70 - Flash Deal
  ['Engage LAmante Couple Body Spray Combo', 'Engage', 399, 649, 4.1, 5230, 180, 4320, false, false, true, 279, 'seller4'],
  // 71
  ['Bella Kotn Premium Perfume for Women', 'Bella Kotn', 999, 1499, 4.4, 3210, 110, 2650, false, false, false, undefined, 'seller5'],
  // 72
  ['Wild Stone Assault Deodorant', 'Wild Stone', 299, 449, 4.1, 6540, 230, 5560, false, false, false, undefined, 'seller1'],
  // 73
  ['Denver Sir Hamilton Deodorant', 'Denver', 349, 549, 4.2, 4560, 160, 3780, false, false, false, undefined, 'seller2'],
  // 74
  ['Fogg Charming Body Mist', 'Fogg', 399, 599, 4.3, 5430, 190, 4560, false, false, false, undefined, 'seller3'],
  // 75 - Flash Deal
  ['Engage W1 Fragrance Body Spray', 'Engage', 249, 399, 4.0, 4320, 150, 3560, false, false, true, 169, 'seller4'],

  // ═══════════════════════════════════════════════════════════════════════════════
  // MENS GROOMING (76-85)
  // ═══════════════════════════════════════════════════════════════════════════════

  // 76
  ['Beardo Ultraglow Face Serum', 'Beardo', 549, 799, 4.2, 6540, 220, 5560, false, false, false, undefined, 'seller5'],
  // 77
  ['The Man Company Vitamin C Face Wash', 'The Man Company', 399, 599, 4.2, 5430, 190, 4560, false, false, false, undefined, 'seller1'],
  // 78
  ['Bombay Shaving Company Charcoal Face Wash', 'Bombay Shaving Co', 349, 549, 4.1, 4320, 150, 3560, false, false, false, undefined, 'seller2'],
  // 79
  ['Ustraa Complete Grooming Kit Face Wash', 'Ustraa', 449, 649, 4.2, 3210, 120, 2650, false, false, false, undefined, 'seller3'],
  // 80 - Flash Deal
  ['Man Matters Anti Acne Face Wash', 'Man Matters', 399, 599, 4.1, 5430, 190, 4560, false, false, true, 279, 'seller4'],
  // 81
  ['Gillette Mach3 Turbo Razor', 'Gillette', 449, 649, 4.5, 11230, 380, 9870, false, false, false, undefined, 'seller5'],
  // 82
  ['Nivea Men Dark Spot Reduction Moisturizer', 'Nivea Men', 249, 399, 4.2, 7650, 260, 6540, false, false, false, undefined, 'seller1'],
  // 83
  ['Park Avenue Alpha Body Deodorant', 'Park Avenue', 299, 449, 4.1, 4320, 150, 3560, false, false, false, undefined, 'seller2'],
  // 84
  ['Almighty Face Scrub Activated Charcoal', 'Almighty', 299, 499, 4.0, 3450, 120, 2870, false, false, false, undefined, 'seller3'],
  // 85 - Flash Deal
  ['Beardo Hemp Face Wash', 'Beardo', 449, 699, 4.1, 4560, 160, 3780, false, false, true, 319, 'seller4'],

  // ═══════════════════════════════════════════════════════════════════════════════
  // BODY CARE (86-100)
  // ═══════════════════════════════════════════════════════════════════════════════

  // 86
  ['Nivea Body Lotion Shea Butter Smooth Milk', 'Nivea', 249, 399, 4.4, 16540, 520, 14500, false, false, false, undefined, 'seller5'],
  // 87
  ['Vaseline Healthy Bright Sun + Pollution Protection', 'Vaseline', 199, 325, 4.3, 14320, 450, 12560, false, false, false, undefined, 'seller1'],
  // 88
  ['Dove Deep Nourishment Body Wash', 'Dove', 299, 449, 4.4, 9560, 320, 8230, false, false, false, undefined, 'seller2'],
  // 89
  ['Bajaj Almond Drops Hair Oil', 'Bajaj', 149, 249, 4.2, 18560, 580, 16200, false, false, false, undefined, 'seller3'],
  // 90 - Flash Deal
  ['Himalaya Herbals Purifying Neem Body Wash', 'Himalaya', 199, 325, 4.3, 8760, 300, 7540, false, false, true, 149, 'seller4'],
  // 91
  ['Parachute 100% Pure Coconut Oil', 'Parachute', 149, 225, 4.5, 21340, 650, 19500, false, false, false, undefined, 'seller5'],
  // 92
  ['Ayush Purifying Turmeric Body Wash', 'Ayush', 179, 299, 4.2, 5430, 190, 4560, false, false, false, undefined, 'seller1'],
  // 93
  ['Khadi Natural Rose Water Body Lotion', 'Khadi Natural', 299, 449, 4.1, 4320, 150, 3560, false, false, false, undefined, 'seller2'],
  // 94
  ['Dettol Original Antibacterial Soap', 'Dettol', 149, 225, 4.4, 19870, 620, 17500, false, false, false, undefined, 'seller3'],
  // 95 - Flash Deal
  ['Nivea Cocoa Butter Body Lotion', 'Nivea', 249, 399, 4.3, 8430, 290, 7230, false, false, true, 169, 'seller4'],
  // 96
  ['Vaseline Intensive Care Aloe Soothe Lotion', 'Vaseline', 199, 325, 4.3, 7650, 260, 6540, false, false, false, undefined, 'seller5'],
  // 97
  ['Dove Cream Beauty Body Wash', 'Dove', 279, 449, 4.4, 6780, 230, 5760, false, false, false, undefined, 'seller1'],
  // 98
  ['Bajaj Brahmi Amla Hair Oil', 'Bajaj', 149, 225, 4.1, 7230, 250, 6120, false, false, false, undefined, 'seller2'],
  // 99
  ['Himalaya Lip Balm Natural', 'Himalaya', 99, 150, 4.3, 11230, 380, 9870, false, false, false, undefined, 'seller3'],
  // 100 - Flash Deal
  ['Dettol Cool Soap Bar Pack of 6', 'Dettol', 249, 399, 4.4, 9560, 320, 8230, false, false, true, 179, 'seller4'],
];

export const beautyProducts = generateCategoryProducts(
  'cat6',
  'Beauty & Personal Care',
  rawProducts,
  [
    '/images/products/vitamin-serum.png',
    '/images/categories/beauty-personal-care.png',
    '/images/products/vitamin-serum.png',
    '/images/categories/beauty-personal-care.png',
    '/images/products/vitamin-serum.png',
    '/images/categories/beauty-personal-care.png',
    '/images/products/vitamin-serum.png',
    '/images/categories/beauty-personal-care.png',
    '/images/products/vitamin-serum.png',
    '/images/categories/beauty-personal-care.png',
    '/images/products/vitamin-serum.png',
    '/images/categories/beauty-personal-care.png',
    '/images/products/vitamin-serum.png',
    '/images/categories/beauty-personal-care.png',
    '/images/products/vitamin-serum.png',
    '/images/categories/beauty-personal-care.png',
    '/images/products/vitamin-serum.png',
    '/images/categories/beauty-personal-care.png',
    '/images/products/vitamin-serum.png',
    '/images/categories/beauty-personal-care.png',
  ],
  ['skincare', 'beauty', 'cosmetics', 'personal-care', 'grooming', 'wellness', 'organic'],
  [
    ['All Skin Types', 'Oily Skin', 'Dry Skin', 'Sensitive Skin', 'Normal Skin', 'Combination Skin', 'Acne Prone'],
    ['Vitamin C, Niacinamide, Hyaluronic Acid', 'Salicylic Acid, Tea Tree Oil', 'Retinol, Peptides, Ceramides', 'Charcoal, Kaolin Clay', 'Aloe Vera, Green Tea Extract', 'Coffee Extract, Turmeric', 'Rose Water, Glycerin'],
    ['30ml', '50ml', '100ml', '150ml', '200ml', '75ml', '120ml'],
    ['Men & Women', 'Men', 'Women', 'All Genders', 'Teenagers & Adults'],
    ['Cruelty Free', 'Dermatologically Tested', 'Paraben Free', 'Organic', 'Vegan', 'FDA Approved', 'Sulfate Free'],
    ['24 Months', '36 Months', '18 Months', '12 Months', '30 Months', '48 Months'],
  ],
  (name: string, brand: string, specs: string[]) =>
    name + ' by ' + brand + '. Suitable for ' + specs[0] + '. Enriched with ' + specs[1] + ' for effective results. Pack size: ' + specs[2] + '. Ideal for ' + specs[3] + '. ' + specs[4] + ' certified. Shelf life: ' + specs[5] + '. Shop now on Shopnexa with free delivery and easy returns!',
  600
);
