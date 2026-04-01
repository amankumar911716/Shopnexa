import { generateCategoryProducts } from '../product-generator';

const rawProducts: [string, string, number, number, number, number, number, number, boolean, boolean, boolean, number | undefined, string][] = [
  // ────────────────────────────────────────────────────────────────
  // MEN'S SHIRTS (25 products) — Formal, Casual, Party
  // ────────────────────────────────────────────────────────────────
  // 1
  ['Peter England Men\'s Slim Fit Formal Shirt', 'Peter England', 1299, 2499, 4.3, 8540, 320, 12400, true, true, false, undefined, 'seller1'],
  // 2
  ['Van Heusen Men\'s Regular Fit Cotton Formal Shirt', 'Van Heusen', 1599, 2899, 4.4, 6720, 210, 9800, true, true, false, undefined, 'seller2'],
  // 3
  ['Allen Solly Men\'s Casual Checkered Shirt', 'Allen Solly', 1199, 2199, 4.2, 12350, 450, 18500, true, true, false, undefined, 'seller3'],
  // 4
  ['Levi\'s Men\'s Classic Fit Casual Shirt', 'Levi\'s', 1799, 3299, 4.5, 5430, 180, 7600, true, true, false, undefined, 'seller4'],
  // 5 (flash)
  ['H&M Men\'s Premium Cotton Slim Fit Shirt', 'H&M', 999, 1799, 4.1, 15600, 560, 22000, true, true, true, 749, 'seller5'],
  // 6
  ['UCB Men\'s Striped Formal Shirt', 'UCB', 1499, 2799, 4.3, 4200, 150, 6300, false, true, false, undefined, 'seller1'],
  // 7
  ['Jack & Jones Men\'s Printed Casual Shirt', 'Jack & Jones', 1899, 3499, 4.4, 3100, 95, 4800, false, true, false, undefined, 'seller2'],
  // 8
  ['Arrow Men\'s Formal Cotton Shirt - Blue', 'Arrow', 2199, 3999, 4.5, 2890, 120, 4200, false, true, false, undefined, 'seller3'],
  // 9
  ['Pepe Jeans Men\'s Denim Casual Shirt', 'Pepe Jeans', 1699, 3199, 4.2, 9800, 340, 14500, false, true, false, undefined, 'seller4'],
  // 10 (flash)
  ['Tommy Hilfiger Men\'s Polo Classic Fit Shirt', 'Tommy Hilfiger', 3499, 5999, 4.6, 2100, 80, 3200, false, true, true, 2799, 'seller5'],
  // 11
  ['Nautica Men\'s Solid Formal Shirt - White', 'Nautica', 2299, 4499, 4.5, 1750, 65, 2600, false, false, false, undefined, 'seller1'],
  // 12
  ['US Polo Assn. Men\'s Slim Fit Casual Shirt', 'US Polo Assn.', 1399, 2599, 4.2, 7800, 280, 11200, false, false, false, undefined, 'seller2'],
  // 13
  ['Louis Philippe Men\'s Premium Formal Shirt', 'Louis Philippe', 2499, 4599, 4.6, 1900, 70, 2900, false, false, false, undefined, 'seller3'],
  // 14
  ['Peter England Men\'s Linen Casual Shirt', 'Peter England', 1099, 1999, 3.6, 6200, 230, 9100, false, false, false, undefined, 'seller4'],
  // 15 (flash)
  ['Van Heusen Men\'s Anti-Wrinkle Formal Shirt', 'Van Heusen', 1899, 3499, 4.4, 3450, 110, 5200, false, false, true, 1499, 'seller5'],
  // 16
  ['Allen Solly Men\'s Mandarin Collar Casual Shirt', 'Allen Solly', 1349, 2499, 4.3, 5600, 200, 8400, false, false, false, undefined, 'seller1'],
  // 17
  ['Levi\'s Men\'s Printed Casual Shirt', 'Levi\'s', 1999, 3699, 4.5, 2800, 90, 4100, false, false, false, undefined, 'seller2'],
  // 18
  ['H&M Men\'s Oxford Button-Down Shirt', 'H&M', 1299, 2299, 4.2, 8900, 310, 13400, false, false, false, undefined, 'seller3'],
  // 19
  ['Jack & Jones Men\'s Slim Fit Party Shirt', 'Jack & Jones', 2099, 3899, 4.3, 2300, 75, 3500, false, false, false, undefined, 'seller4'],
  // 20 (flash)
  ['UCB Men\'s Polo T-Shirt Style Shirt', 'UCB', 1199, 2199, 4.1, 10500, 380, 15800, false, false, true, 899, 'seller5'],
  // 21
  ['Tommy Hilfiger Men\'s Striped Formal Shirt', 'Tommy Hilfiger', 3299, 5799, 4.7, 1500, 55, 2300, false, false, false, undefined, 'seller1'],
  // 22
  ['Arrow Men\'s Stretch Formal Shirt - Grey', 'Arrow', 2099, 3799, 3.8, 3100, 105, 4600, false, false, false, undefined, 'seller2'],
  // 23
  ['Nautica Men\'s Checked Casual Shirt', 'Nautica', 1999, 3699, 3.7, 2400, 85, 3600, false, false, false, undefined, 'seller3'],
  // 24
  ['Pepe Jeans Men\'s Slim Fit Casual Shirt', 'Pepe Jeans', 1549, 2899, 4.2, 6500, 250, 9800, false, false, false, undefined, 'seller4'],
  // 25 (flash)
  ['US Polo Assn. Men\'s Premium Cotton Shirt', 'US Polo Assn.', 1599, 2999, 4.3, 4800, 170, 7200, false, false, true, 1199, 'seller5'],

  // ────────────────────────────────────────────────────────────────
  // WOMEN'S KURTIS (20 products) — Designer, Casual, Party
  // ────────────────────────────────────────────────────────────────
  // 26
  ['Biba Women\'s Anarkali Kurti - Floral Print', 'Biba', 1499, 2799, 4.4, 11200, 400, 16800, true, false, false, undefined, 'seller1'],
  // 27
  ['W Women\'s Straight Cut Kurti - Solid', 'W', 899, 1699, 4.2, 8900, 350, 13400, true, false, false, undefined, 'seller2'],
  // 28
  ['Fabindia Women\'s Handblock Printed Kurti', 'Fabindia', 1899, 3499, 4.6, 5400, 160, 8100, true, false, false, undefined, 'seller3'],
  // 29
  ['Aurelia Women\'s Designer A-Line Kurti', 'Aurelia', 1299, 2499, 4.3, 9600, 310, 14500, true, false, false, undefined, 'seller4'],
  // 30 (flash)
  ['Jaipur Kurti Women\'s Ethnic Printed Kurti', 'Jaipur Kurti', 999, 1899, 4.1, 13400, 480, 20100, true, false, true, 699, 'seller5'],
  // 31
  ['Global Desi Women\'s Boho Printed Kurti', 'Global Desi', 1399, 2599, 4.3, 4200, 130, 6300, false, false, false, undefined, 'seller1'],
  // 32
  ['Aks Women\'s Thread Work Kurti', 'Aks', 1599, 2999, 4.4, 3100, 95, 4700, false, false, false, undefined, 'seller2'],
  // 33
  ['FabAlley Women\'s asymmetric Kurti', 'FabAlley', 1199, 2299, 4.2, 6800, 240, 10200, false, false, false, undefined, 'seller3'],
  // 34
  ['Libas Women\'s Embroidered Kurti Set', 'Libas', 1799, 3299, 4.5, 3500, 120, 5300, false, false, false, undefined, 'seller4'],
  // 35 (flash)
  ['Anoukhi Women\'s Handloom Cotton Kurti', 'Anoukhi', 2199, 4199, 4.6, 1800, 60, 2700, false, false, true, 1699, 'seller5'],
  // 36
  ['Biba Women\'s Straight Kurti with Dupatta', 'Biba', 1699, 3199, 4.4, 7600, 270, 11500, false, false, false, undefined, 'seller1'],
  // 37
  ['Fabindia Women\'s Chikankari Kurti', 'Fabindia', 2099, 3899, 4.7, 2900, 85, 4400, false, false, false, undefined, 'seller2'],
  // 38
  ['W Women\'s Flared Kurti - Rayon', 'W', 649, 1299, 3.9, 14200, 520, 21300, false, false, false, undefined, 'seller3'],
  // 39
  ['Aurelia Women\'s Palazzo Kurti Set', 'Aurelia', 1899, 3599, 4.4, 4100, 140, 6200, false, false, false, undefined, 'seller4'],
  // 40 (flash)
  ['Jaipur Kurti Women\'s Bandhani Print Kurti', 'Jaipur Kurti', 1099, 2099, 4.2, 8100, 290, 12200, false, false, true, 799, 'seller5'],
  // 41
  ['Global Desi Women\'s Maxi Kurti', 'Global Desi', 1599, 2999, 3.6, 320, 110, 480, false, false, false, undefined, 'seller1'],
  // 42
  ['Libas Women\'s Digital Printed Kurti', 'Libas', 1299, 2399, 4.2, 5800, 200, 8700, false, false, false, undefined, 'seller2'],
  // 43
  ['FabAlley Women\'s Tiered Kurti', 'FabAlley', 1499, 2799, 4.3, 3700, 125, 5600, false, false, false, undefined, 'seller3'],
  // 44
  ['Aks Women\'s Mirror Work Kurti', 'Aks', 1899, 3499, 4.5, 240, 20, 360, false, false, false, undefined, 'seller4'],
  // 45 (flash)
  ['Anoukhi Women\'s Block Print Kurti', 'Anoukhi', 2399, 4499, 4.7, 1200, 40, 1800, false, false, true, 1899, 'seller5'],

  // ────────────────────────────────────────────────────────────────
  // JEANS (15 products) — Men's & Women's
  // ────────────────────────────────────────────────────────────────
  // 46
  ['Levi\'s Men\'s 511 Slim Fit Jeans - Blue', 'Levi\'s', 2799, 4599, 4.5, 18900, 620, 28500, true, false, false, undefined, 'seller1'],
  // 47
  ['Wrangler Men\'s Straight Fit Jeans - Dark Blue', 'Wrangler', 2199, 3999, 4.4, 12300, 410, 18500, true, false, false, undefined, 'seller2'],
  // 48
  ['Spykar Men\'s Slim Jogger Jeans', 'Spykar', 1399, 2799, 3.9, 8700, 300, 13100, true, false, false, undefined, 'seller3'],
  // 49
  ['Pepe Jeans Men\'s Tapered Fit Jeans - Black', 'Pepe Jeans', 1899, 3499, 4.3, 7600, 260, 11400, true, false, false, undefined, 'seller4'],
  // 50 (flash)
  ['Lee Men\'s Original Fit Jeans - Mid Blue', 'Lee', 2499, 4299, 4.4, 5400, 180, 8100, true, false, true, 1999, 'seller5'],
  // 51
  ['Tommy Hilfiger Men\'s Slim Fit Jeans', 'Tommy Hilfiger', 4299, 7499, 4.6, 3200, 100, 4800, false, false, false, undefined, 'seller1'],
  // 52
  ['H&M Men\'s Skinny Fit Jeans - Ripped', 'H&M', 1499, 2799, 4.1, 11200, 390, 16800, false, false, false, undefined, 'seller2'],
  // 53
  ['Van Heusen Men\'s Comfort Fit Jeans', 'Van Heusen', 1799, 3299, 4.3, 6800, 230, 10200, false, false, false, undefined, 'seller3'],
  // 54
  ['Allen Solly Men\'s Slim Fit Jeans - Grey', 'Allen Solly', 1999, 3699, 4.2, 5500, 190, 8300, false, false, false, undefined, 'seller4'],
  // 55 (flash)
  ['USPA Men\'s Classic Straight Jeans', 'USPA Assn.', 1699, 3099, 4.2, 9400, 330, 14100, false, false, true, 1299, 'seller5'],
  // 56
  ['Levi\'s Women\'s 711 High-Rise Skinny Jeans', 'Levi\'s', 3199, 5499, 4.5, 7800, 240, 11700, false, false, false, undefined, 'seller1'],
  // 57
  ['Wrangler Women\'s Bootcut Jeans - Blue', 'Wrangler', 2399, 4199, 4.3, 4500, 150, 6800, false, false, false, undefined, 'seller2'],
  // 58
  ['H&M Women\'s Mom Fit Jeans - Light Wash', 'H&M', 1299, 2499, 3.5, 960, 340, 1440, false, false, false, undefined, 'seller3'],
  // 59
  ['Pepe Jeans Women\'s Skinny Fit Jeans - Black', 'Pepe Jeans', 2099, 3799, 4.3, 5200, 170, 7800, false, false, false, undefined, 'seller4'],
  // 60 (flash)
  ['Lee Women\'s Slim Fit Jeans - Indigo', 'Lee', 2699, 4799, 4.4, 3800, 120, 5700, false, false, true, 2099, 'seller5'],

  // ────────────────────────────────────────────────────────────────
  // SAREES (15 products) — Silk, Cotton, Designer
  // ────────────────────────────────────────────────────────────────
  // 61
  ['Nalli Pure Banarasi Silk Saree - Red', 'Nalli', 5999, 12999, 4.7, 6200, 80, 9300, true, false, false, undefined, 'seller1'],
  // 62
  ['Fabindia Handloom Cotton Saree - Indigo', 'Fabindia', 2499, 4999, 4.5, 8900, 200, 13400, true, false, false, undefined, 'seller2'],
  // 63
  ['Jaipur Pure Georgette Designer Saree', 'Jaipur', 3499, 7499, 4.6, 4100, 120, 6200, true, false, false, undefined, 'seller3'],
  // 64
  ['FabAlley Printed Organza Saree', 'FabAlley', 1899, 3799, 4.3, 5600, 180, 8400, true, false, false, undefined, 'seller4'],
  // 65 (flash)
  ['Biba Cotton Silk Saree with Blouse Piece', 'Biba', 2199, 4599, 4.4, 7200, 220, 10800, true, false, true, 1699, 'seller5'],
  // 66
  ['Chanderi Silk Handwoven Saree - Peach', 'Chanderi', 3999, 8499, 4.6, 2800, 75, 4200, false, false, false, undefined, 'seller1'],
  // 67
  ['Banarasi Paithani Silk Saree - Maroon', 'Banarasi', 7999, 15999, 4.8, 1900, 45, 2900, false, false, false, undefined, 'seller2'],
  // 68
  ['Patola Double Ikat Silk Saree - Green', 'Patola', 6499, 13999, 4.7, 2200, 55, 3300, false, false, false, undefined, 'seller3'],
  // 69
  ['Pochampally Ikat Cotton Saree - Yellow', 'Pochampally', 2999, 5999, 4.5, 3900, 110, 5900, false, false, false, undefined, 'seller4'],
  // 70 (flash)
  ['Kanchipuram Pure Silk Saree - Purple', 'Kanchipuram', 8999, 15999, 4.9, 1500, 35, 2300, false, false, true, 6999, 'seller5'],
  // 71
  ['Nalli Chiffon Party Wear Saree - Teal', 'Nalli', 3299, 6999, 4.5, 4800, 140, 7200, false, false, false, undefined, 'seller1'],
  // 72
  ['Fabindia Linen Saree - Beige', 'Fabindia', 1999, 3999, 4.4, 6100, 190, 9200, false, false, false, undefined, 'seller2'],
  // 73
  ['Jaipur Bandhani Saree - Pink', 'Jaipur', 2699, 5499, 4.5, 3400, 100, 5100, false, false, false, undefined, 'seller3'],
  // 74
  ['Banarasi Tussar Silk Saree - Gold', 'Banarasi', 5499, 10999, 4.7, 250, 15, 380, false, false, false, undefined, 'seller4'],
  // 75 (flash)
  ['Chanderi Cotton Silk Saree - Mint', 'Chanderi', 3499, 7499, 4.6, 310, 25, 470, false, false, true, 2699, 'seller5'],

  // ────────────────────────────────────────────────────────────────
  // T-SHIRTS (10 products) — Casual, Graphic, Sports
  // ────────────────────────────────────────────────────────────────
  // 76
  ['Nike Men\'s Dri-FIT Running T-Shirt', 'Nike', 1999, 3499, 4.5, 14500, 500, 21800, true, false, false, undefined, 'seller1'],
  // 77
  ['Adidas Men\'s Aeroready Sports T-Shirt', 'Adidas', 1799, 2999, 4.4, 11200, 420, 16800, true, false, false, undefined, 'seller2'],
  // 78
  ['Puma Men\'s Graphic Print T-Shirt', 'Puma', 999, 1799, 4.2, 18900, 650, 28400, true, false, false, undefined, 'seller3'],
  // 79
  ['Under Armour Men\'s Tech 2.0 T-Shirt', 'Under Armour', 1499, 2799, 4.3, 7800, 280, 11700, true, false, false, undefined, 'seller4'],
  // 80 (flash)
  ['Levi\'s Men\'s Classic Logo T-Shirt', 'Levi\'s', 899, 1599, 4.1, 22400, 780, 33600, true, false, true, 599, 'seller5'],
  // 81
  ['H&M Men\'s Oversized Drop Shoulder T-Shirt', 'H&M', 499, 999, 3.8, 25600, 890, 38400, false, false, false, undefined, 'seller1'],
  // 82
  ['Tommy Hilfiger Men\'s Essential Polo T-Shirt', 'Tommy Hilfiger', 2499, 4499, 4.5, 5600, 180, 8400, false, false, false, undefined, 'seller2'],
  // 83
  ['UCB Men\'s Striped Crew Neck T-Shirt', 'UCB', 799, 1499, 4.1, 13200, 460, 19800, false, false, false, undefined, 'seller3'],
  // 84
  ['Peter England Men\'s Polo T-Shirt - Navy', 'Peter England', 599, 1099, 3.7, 16800, 580, 25200, false, false, false, undefined, 'seller4'],
  // 85 (flash)
  ['Nike Women\'s Dri-FIT Training T-Shirt', 'Nike', 1799, 3199, 4.4, 8900, 310, 13400, false, false, true, 1399, 'seller5'],

  // ────────────────────────────────────────────────────────────────
  // SUITS / BLAZERS (5 products)
  // ────────────────────────────────────────────────────────────────
  // 86
  ['Raymond Men\'s Premium Wool Blazer - Navy', 'Raymond', 6999, 14999, 4.7, 280, 10, 420, true, false, false, undefined, 'seller1'],
  // 87
  ['Arrow Men\'s Slim Fit Formal Suit - Charcoal', 'Arrow', 8999, 15999, 4.6, 1900, 40, 2900, true, false, false, undefined, 'seller2'],
  // 88
  ['Louis Philippe Men\'s Executive Blazer - Black', 'Louis Philippe', 7999, 13999, 4.7, 2200, 50, 3300, true, false, false, undefined, 'seller3'],
  // 89
  ['Van Heusen Men\'s Formal Blazer - Grey', 'Van Heusen', 5999, 11999, 4.5, 3400, 75, 5100, true, false, false, undefined, 'seller4'],
  // 90 (flash)
  ['Allen Solly Men\'s Slim Fit Casual Blazer', 'Allen Solly', 5499, 10999, 4.5, 4100, 90, 6200, true, false, true, 4199, 'seller5'],

  // ────────────────────────────────────────────────────────────────
  // SHOES (5 products) — Formal & Casual
  // ────────────────────────────────────────────────────────────────
  // 91
  ['Clarks Men\'s Formal Leather Oxford Shoes', 'Clarks', 5499, 9999, 4.6, 3200, 85, 4800, true, false, false, undefined, 'seller1'],
  // 92
  ['Metro Men\'s Formal Derbies - Tan', 'Metro', 3299, 6499, 3.8, 450, 30, 680, true, false, false, undefined, 'seller2'],
  // 93
  ['Red Chief Men\'s Leather Casual Shoes', 'Red Chief', 2499, 4999, 4.3, 7800, 220, 11700, true, false, false, undefined, 'seller3'],
  // 94
  ['Bata Men\'s Formal Slip-On Shoes - Black', 'Bata', 1299, 2499, 3.9, 11200, 340, 16800, true, false, false, undefined, 'seller4'],
  // 95 (flash)
  ['Hush Puppies Men\'s Suede Loafers - Brown', 'Hush Puppies', 4999, 8999, 4.5, 3800, 100, 5700, true, false, true, 3999, 'seller5'],

  // ────────────────────────────────────────────────────────────────
  // HANDBAGS (5 products)
  // ────────────────────────────────────────────────────────────────
  // 96
  ['Lavie Women\'s Leather Tote Bag - Black', 'Lavie', 2499, 4999, 4.4, 6500, 180, 9800, true, false, false, undefined, 'seller1'],
  // 97
  ['Caprese Women\'s Satchel Handbag - Maroon', 'Caprese', 1899, 3799, 4.3, 5400, 150, 8100, true, false, false, undefined, 'seller2'],
  // 98
  ['Baggit Women\'s Vegan Leather Hobo Bag', 'Baggit', 1299, 2599, 4.3, 8900, 260, 13400, true, false, false, undefined, 'seller3'],
  // 99
  ['Lino Perros Women\'s Crossbody Bag - Beige', 'Lino Perros', 1299, 2599, 4.2, 7200, 210, 10800, true, false, false, undefined, 'seller4'],
  // 100 (flash)
  ['Fastrack Women\'s Trendy Backpack Handbag', 'Fastrack', 799, 1599, 3.8, 13500, 400, 20300, true, false, true, 499, 'seller5'],
];

export const fashionProducts = generateCategoryProducts(
  'cat2',
  'Fashion',
  rawProducts,
  [
    '/images/products/leather-jacket.png',
    '/images/products/silk-saree.png',
    '/images/products/running-shoes.png',
    '/images/products/backpack.png',
    '/images/banners/fashion-week.png',
    '/images/categories/fashion.png',
    '/images/products/leather-jacket.png',
    '/images/products/silk-saree.png',
    '/images/products/running-shoes.png',
    '/images/products/backpack.png',
    '/images/banners/fashion-week.png',
    '/images/categories/fashion.png',
    '/images/products/leather-jacket.png',
    '/images/products/silk-saree.png',
    '/images/products/running-shoes.png',
    '/images/products/backpack.png',
    '/images/banners/fashion-week.png',
    '/images/categories/fashion.png',
    '/images/products/leather-jacket.png',
    '/images/products/silk-saree.png',
  ],
  ['fashion', 'clothing', 'style', 'trendy', 'premium', 'wear', 'men', 'women', 'unisex'],
  [
    ['100% Cotton', 'Slim Fit', 'Casual Wear', 'Machine Washable', 'Regular Fit', 'Wrinkle-Free', 'Breathable'],
    ['Polyester Blend', 'Relaxed Fit', 'Party Wear', 'Hand Wash', 'Skin Friendly', 'Quick Dry', 'Lightweight'],
  ],
  (name: string, brand: string, specs: string[]) =>
    `Elevate your wardrobe with ${name} from ${brand}. Crafted from ${specs[0]} for ${specs[1]} that ensures all-day comfort. Perfect for ${specs[2]}. ${specs[3]}. ${specs[4]} fabric keeps you fresh. ${specs[5]} and ${specs[6]} for everyday wear. Available exclusively on Shopnexa!`,
  200
);
