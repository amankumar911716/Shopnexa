import { generateCategoryProducts } from '../product-generator';

const rawProducts: [string, string, number, number, number, number, number, number, boolean, boolean, boolean, number | undefined, string][] = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // SELF-HELP / MOTIVATION (1-30)
  // ═══════════════════════════════════════════════════════════════════════════════

  // 1 - Featured, Trending
  ['Atomic Habits', 'James Clear', 299, 499, 4.7, 12580, 340, 8920, true, true, false, undefined, 'seller1'],
  // 2 - Featured, Trending
  ['The 5 AM Club', 'Robin Sharma', 249, 450, 4.5, 9840, 280, 7650, true, true, false, undefined, 'seller2'],
  // 3 - Featured, Trending
  ['How to Win Friends and Influence People', 'Dale Carnegie', 199, 350, 4.6, 15230, 450, 12400, true, true, false, undefined, 'seller3'],
  // 4 - Featured, Trending
  ['Think and Grow Rich', 'Napoleon Hill', 179, 320, 4.5, 11340, 380, 9870, true, true, false, undefined, 'seller1'],
  // 5 - Featured, Trending, Flash Deal
  ['The Secret', 'Rhonda Byrne', 189, 399, 4.3, 8760, 220, 6540, true, true, true, 129, 'seller4'],
  // 6 - Trending
  ['The Power of Now', 'Eckhart Tolle', 259, 450, 4.6, 7230, 310, 5430, false, true, false, undefined, 'seller2'],
  // 7 - Trending
  ['The Seven Spiritual Laws of Success', 'Deepak Chopra', 229, 399, 4.4, 5430, 180, 4120, false, true, false, undefined, 'seller5'],
  // 8 - Trending
  ['The 7 Habits of Highly Effective People', 'Stephen Covey', 349, 599, 4.7, 16890, 520, 14500, false, true, false, undefined, 'seller1'],
  // 9 - Trending
  ['Way of the Peaceful Warrior', 'Sunil Chaudhary', 149, 250, 4.2, 3210, 150, 2340, false, true, false, undefined, 'seller3'],
  // 10 - Trending, Flash Deal
  ['You Can Win', 'Shiv Khera', 199, 350, 4.4, 10560, 400, 8900, false, true, true, 139, 'seller4'],
  // 11
  ['Wings of Fire', 'APJ Abdul Kalam', 199, 350, 4.8, 21340, 600, 19800, false, false, false, undefined, 'seller1'],
  // 12
  ['The Monk Who Sold His Ferrari', 'Robin Sharma', 219, 399, 4.5, 8920, 350, 7230, false, false, false, undefined, 'seller2'],
  // 13
  ['Awaken the Giant Within', 'Tony Robbins', 329, 550, 4.5, 6780, 240, 5120, false, false, false, undefined, 'seller5'],
  // 14
  ['Mindfulness in Plain English', 'Henepola Gunaratana', 179, 299, 4.3, 4560, 200, 3420, false, false, false, undefined, 'seller3'],
  // 15 - Flash Deal
  ['Inner Engineering', 'Sadhguru', 299, 499, 4.6, 7890, 280, 6230, false, false, true, 199, 'seller1'],
  // 16
  ['The Art of Happiness', 'Dalai Lama', 249, 450, 4.4, 5670, 210, 4350, false, false, false, undefined, 'seller4'],
  // 17
  ['Celebrating Silence', 'Sri Sri Ravi Shankar', 169, 299, 4.2, 3450, 160, 2560, false, false, false, undefined, 'seller2'],
  // 18
  ['Karma: A Yogi Guide to Crafting Your Destiny', 'Sadhguru', 279, 499, 4.5, 6230, 250, 5010, false, false, false, undefined, 'seller5'],
  // 19
  ['Living with the Himalayan Masters', 'Swami Rama', 199, 350, 4.6, 4890, 190, 3780, false, false, false, undefined, 'seller3'],
  // 20 - Flash Deal
  ['The Alchemist', 'Paulo Coelho', 169, 299, 4.7, 18560, 550, 16200, false, false, true, 119, 'seller1'],
  // 21
  ['Auto Suggestion', 'Swami Vivekananda', 129, 250, 4.3, 6230, 270, 5120, false, false, false, undefined, 'seller4'],
  // 22
  ['The Power of Your Subconscious Mind', 'Joseph Murphy', 149, 275, 4.4, 9870, 380, 8230, false, false, false, undefined, 'seller2'],
  // 23
  ['As a Man Thinketh', 'James Allen', 99, 180, 4.3, 4320, 200, 3450, false, false, false, undefined, 'seller5'],
  // 24
  ['Rich Dad Poor Dad', 'Robert Kiyosaki', 229, 399, 4.5, 14560, 450, 12340, false, false, false, undefined, 'seller1'],
  // 25 - Flash Deal
  ['The Psychology of Money', 'Morgan Housel', 279, 499, 4.7, 11230, 340, 9650, false, false, true, 189, 'seller3'],
  // 26
  ['Ikigai', 'Hector Garcia', 249, 450, 4.5, 8760, 300, 7430, false, false, false, undefined, 'seller4'],
  // 27
  ['Start with Why', 'Simon Sinek', 299, 499, 4.5, 6540, 230, 5120, false, false, false, undefined, 'seller2'],
  // 28
  ['The Magic of Thinking Big', 'David Schwartz', 179, 320, 4.3, 7120, 280, 5980, false, false, false, undefined, 'seller5'],
  // 29
  ['Who Moved My Cheese', 'Spencer Johnson', 149, 250, 4.2, 8340, 350, 7120, false, false, false, undefined, 'seller1'],
  // 30 - Flash Deal
  ['Eat That Frog', 'Brian Tracy', 169, 299, 4.4, 5230, 200, 4120, false, false, true, 119, 'seller3'],

  // ═══════════════════════════════════════════════════════════════════════════════
  // FICTION NOVELS (31-50)
  // ═══════════════════════════════════════════════════════════════════════════════

  // 31
  ['One Indian Girl', 'Chetan Bhagat', 179, 299, 4.1, 7230, 280, 5980, false, false, false, undefined, 'seller2'],
  // 32
  ['2 States', 'Chetan Bhagat', 149, 250, 4.2, 11230, 400, 9560, false, false, false, undefined, 'seller1'],
  // 33
  ['The Immortals of Meluha', 'Amish Tripathi', 249, 450, 4.4, 9560, 320, 8120, false, false, false, undefined, 'seller4'],
  // 34
  ['The Secret of the Nagas', 'Amish Tripathi', 249, 450, 4.3, 8430, 290, 7230, false, false, false, undefined, 'seller3'],
  // 35 - Flash Deal
  ['Harry Potter and the Philosopher Stone', 'J.K. Rowling', 299, 499, 4.8, 23450, 650, 21500, false, false, true, 199, 'seller1'],
  // 36
  ['Harry Potter and the Chamber of Secrets', 'J.K. Rowling', 299, 499, 4.7, 19870, 580, 18200, false, false, false, undefined, 'seller5'],
  // 37
  ['The Guide', 'R.K. Narayan', 169, 299, 4.5, 6230, 210, 5340, false, false, false, undefined, 'seller2'],
  // 38
  ['Malgudi Days', 'R.K. Narayan', 149, 250, 4.6, 7890, 260, 6780, false, false, false, undefined, 'seller4'],
  // 39
  ['The Room on the Roof', 'Ruskin Bond', 149, 250, 4.5, 5430, 190, 4560, false, false, false, undefined, 'seller3'],
  // 40 - Flash Deal
  ['The God of Small Things', 'Arundhati Roy', 229, 399, 4.4, 4320, 150, 3560, false, false, true, 159, 'seller1'],
  // 41
  ['A Suitable Boy', 'Vikram Seth', 349, 599, 4.3, 3210, 120, 2560, false, false, false, undefined, 'seller5'],
  // 42
  ['The Kite Runner', 'Khaled Hosseini', 249, 450, 4.7, 11230, 380, 9870, false, false, false, undefined, 'seller2'],
  // 43
  ['A Thousand Splendid Suns', 'Khaled Hosseini', 249, 450, 4.7, 9870, 340, 8540, false, false, false, undefined, 'seller4'],
  // 44
  ['The Da Vinci Code', 'Dan Brown', 249, 450, 4.5, 14320, 450, 12670, false, false, false, undefined, 'seller1'],
  // 45 - Flash Deal
  ['Angels and Demons', 'Dan Brown', 229, 399, 4.4, 11230, 380, 9870, false, false, true, 159, 'seller3'],
  // 46
  ['Murder on the Orient Express', 'Agatha Christie', 199, 350, 4.6, 8760, 290, 7540, false, false, false, undefined, 'seller5'],
  // 47
  ['And Then There Were None', 'Agatha Christie', 179, 299, 4.7, 9560, 320, 8230, false, false, false, undefined, 'seller2'],
  // 48
  ['Feluda Samagra Vol 1', 'Satyajit Ray', 349, 599, 4.6, 6540, 220, 5430, false, false, false, undefined, 'seller4'],
  // 49
  ['Professor Shonku Omnibus', 'Satyajit Ray', 299, 499, 4.5, 4320, 180, 3650, false, false, false, undefined, 'seller1'],
  // 50 - Flash Deal
  ['Half Girlfriend', 'Chetan Bhagat', 149, 250, 3.9, 8430, 350, 7120, false, false, true, 99, 'seller3'],

  // ═══════════════════════════════════════════════════════════════════════════════
  // BUSINESS / FINANCE (51-65)
  // ═══════════════════════════════════════════════════════════════════════════════

  // 51
  ['Rich Dad Poor Dad Marathi Edition', 'Robert Kiyosaki', 199, 350, 4.4, 4320, 160, 3650, false, false, false, undefined, 'seller5'],
  // 52
  ['Cashflow Quadrant', 'Robert Kiyosaki', 249, 450, 4.4, 5230, 180, 4320, false, false, false, undefined, 'seller2'],
  // 53
  ['One Up on Wall Street', 'Peter Lynch', 299, 499, 4.5, 6780, 230, 5760, false, false, false, undefined, 'seller1'],
  // 54
  ['The Intelligent Investor', 'Benjamin Graham', 349, 599, 4.7, 8760, 280, 7650, false, false, false, undefined, 'seller4'],
  // 55 - Flash Deal
  ['Common Stocks and Uncommon Profits', 'Philip Fisher', 279, 499, 4.4, 3450, 140, 2870, false, false, true, 189, 'seller3'],
  // 56
  ['The Essays of Warren Buffett', 'Warren Buffett', 399, 699, 4.6, 5670, 200, 4890, false, false, false, undefined, 'seller5'],
  // 57
  ['The Psychology of Money Hindi', 'Morgan Housel', 229, 399, 4.6, 7230, 260, 6120, false, false, false, undefined, 'seller1'],
  // 58
  ['Fooled by Randomness', 'Nassim Taleb', 329, 550, 4.3, 4320, 150, 3560, false, false, false, undefined, 'seller2'],
  // 59
  ['The Black Swan', 'Nassim Taleb', 349, 599, 4.4, 5230, 180, 4320, false, false, false, undefined, 'seller4'],
  // 60 - Flash Deal
  ['Execution: The Discipline of Getting Things Done', 'Ram Charan', 329, 550, 4.3, 3450, 130, 2760, false, false, true, 219, 'seller3'],
  // 61
  ['Good to Great', 'Jim Collins', 349, 599, 4.5, 7890, 260, 6780, false, false, false, undefined, 'seller5'],
  // 62
  ['Doglapan', 'Ashneer Grover', 249, 450, 4.0, 6540, 230, 5430, false, false, false, undefined, 'seller1'],
  // 63
  ['Get Epic Shit Done', 'Ankur Warikoo', 229, 399, 4.2, 8760, 300, 7540, false, false, false, undefined, 'seller2'],
  // 64
  ['Built to Last', 'Jim Collins', 329, 550, 4.4, 5430, 190, 4560, false, false, false, undefined, 'seller4'],
  // 65 - Flash Deal
  ['Zero to One', 'Peter Thiel', 279, 499, 4.5, 7650, 250, 6540, false, false, true, 189, 'seller3'],

  // ═══════════════════════════════════════════════════════════════════════════════
  // ACADEMIC / COMPETITIVE (66-80)
  // ═══════════════════════════════════════════════════════════════════════════════

  // 66
  ['Quantitative Aptitude for Competitive Exams', 'R.S. Aggarwal', 349, 599, 4.5, 15670, 520, 13500, false, false, false, undefined, 'seller1'],
  // 67
  ['A Modern Approach to Verbal Reasoning', 'R.S. Aggarwal', 299, 499, 4.4, 12340, 420, 10800, false, false, false, undefined, 'seller2'],
  // 68
  ['Advanced Maths for General Competitions', 'R.S. Aggarwal', 279, 450, 4.3, 9870, 350, 8540, false, false, false, undefined, 'seller3'],
  // 69
  ['S. Chand Numerical Chemistry', 'S. Chand', 329, 550, 4.4, 8760, 300, 7540, false, false, false, undefined, 'seller4'],
  // 70 - Flash Deal
  ['S. Chand Physics for JEE Main', 'S. Chand', 379, 649, 4.3, 6540, 230, 5560, false, false, true, 249, 'seller5'],
  // 71
  ['Arihant All in One CBSE Science Class 10', 'Arihant', 299, 499, 4.5, 11230, 380, 9870, false, false, false, undefined, 'seller1'],
  // 72
  ['Arihant Master the NCERT Biology', 'Arihant', 279, 450, 4.4, 9560, 340, 8230, false, false, false, undefined, 'seller2'],
  // 73
  ['Arihant Objective GK', 'Arihant', 199, 350, 4.2, 7650, 280, 6540, false, false, false, undefined, 'seller3'],
  // 74
  ['Pearson NEET Biology', 'Pearson', 449, 750, 4.5, 6540, 220, 5430, false, false, false, undefined, 'seller4'],
  // 75 - Flash Deal
  ['McGraw Hill Education JEE Main Maths', 'McGraw Hill', 499, 850, 4.4, 5430, 190, 4560, false, false, true, 349, 'seller5'],
  // 76
  ['Disha 42 Years IIT JEE Physics', 'Disha', 399, 699, 4.5, 8760, 300, 7540, false, false, false, undefined, 'seller1'],
  // 77
  ['Disha Rapid General Knowledge', 'Disha', 199, 350, 4.3, 7120, 260, 6120, false, false, false, undefined, 'seller2'],
  // 78
  ['Oswaal CBSE Question Bank English Class 12', 'Oswaal', 299, 499, 4.4, 6540, 230, 5560, false, false, false, undefined, 'seller3'],
  // 79
  ['Oswaal NEET Previous Year Solved Papers', 'Oswaal', 449, 750, 4.5, 7890, 270, 6780, false, false, false, undefined, 'seller4'],
  // 80 - Flash Deal
  ['MTG NEET Guide Biology', 'MTG', 399, 699, 4.4, 5670, 200, 4890, false, false, true, 279, 'seller5'],

  // ═══════════════════════════════════════════════════════════════════════════════
  // BIOGRAPHIES / AUTOBIOGRAPHIES (81-90)
  // ═══════════════════════════════════════════════════════════════════════════════

  // 81
  ['Steve Jobs', 'Walter Isaacson', 399, 699, 4.7, 12340, 400, 10800, false, false, false, undefined, 'seller1'],
  // 82
  ['Becoming', 'Michelle Obama', 349, 599, 4.6, 8760, 290, 7540, false, false, false, undefined, 'seller2'],
  // 83
  ['Wings of Fire Autobiography', 'APJ Abdul Kalam', 199, 350, 4.8, 18900, 550, 17200, false, false, false, undefined, 'seller3'],
  // 84
  ['Steve Jobs Hindi Edition', 'Walter Isaacson', 349, 599, 4.6, 5430, 190, 4560, false, false, false, undefined, 'seller4'],
  // 85 - Flash Deal
  ['Elon Musk: Tesla SpaceX and the Quest', 'Ashlee Vance', 349, 599, 4.5, 7650, 260, 6540, false, false, true, 239, 'seller5'],
  // 86
  ['My Experiments with Truth', 'Mahatma Gandhi', 149, 250, 4.7, 14320, 480, 12670, false, false, false, undefined, 'seller1'],
  // 87
  ['The Story of My Life', 'Narendra Modi', 229, 399, 4.2, 8760, 300, 7540, false, false, false, undefined, 'seller2'],
  // 88
  ['Ratan Tata: A Life', 'Thomas Mathew', 299, 499, 4.5, 6540, 220, 5560, false, false, false, undefined, 'seller3'],
  // 89
  ['Einstein: His Life and Universe', 'Walter Isaacson', 349, 599, 4.6, 5230, 180, 4320, false, false, false, undefined, 'seller4'],
  // 90 - Flash Deal
  ['Mahatma Gandhi: The Man Who Became Mahatma', 'D.G. Tendulkar', 249, 450, 4.5, 4320, 160, 3650, false, false, true, 169, 'seller5'],

  // ═══════════════════════════════════════════════════════════════════════════════
  // CHILDREN'S BOOKS (91-100)
  // ═══════════════════════════════════════════════════════════════════════════════

  // 91
  ['Charlie and the Chocolate Factory', 'Roald Dahl', 199, 350, 4.7, 9560, 320, 8230, false, false, false, undefined, 'seller1'],
  // 92
  ['Matilda', 'Roald Dahl', 179, 299, 4.6, 7890, 280, 6780, false, false, false, undefined, 'seller2'],
  // 93
  ['The Famous Five: Five on a Treasure Island', 'Enid Blyton', 179, 299, 4.5, 6540, 230, 5560, false, false, false, undefined, 'seller3'],
  // 94
  ['The Secret Seven', 'Enid Blyton', 169, 299, 4.4, 5430, 200, 4560, false, false, false, undefined, 'seller4'],
  // 95 - Flash Deal
  ['The Blue Umbrella', 'Ruskin Bond', 129, 220, 4.5, 6780, 250, 5760, false, false, true, 89, 'seller5'],
  // 96
  ['Geronimo Stilton: The Kingdom of Fantasy', 'Geronimo Stilton', 249, 450, 4.4, 5230, 180, 4320, false, false, false, undefined, 'seller1'],
  // 97
  ['Grandmas Bag of Stories', 'Sudha Murty', 199, 350, 4.6, 8760, 300, 7540, false, false, false, undefined, 'seller2'],
  // 98
  ['The Magic of the Lost Temple', 'Sudha Murty', 179, 299, 4.5, 7230, 260, 6120, false, false, false, undefined, 'seller3'],
  // 99
  ['How I Braved Anu Aunty and Co-Founded a Million Dollar Company', 'Varun Agarwal', 179, 299, 4.1, 5430, 200, 4560, false, false, false, undefined, 'seller4'],
  // 100 - Flash Deal
  ['The Boy Who Loved', 'Durjoy Datta', 149, 250, 4.0, 4560, 170, 3780, false, false, true, 99, 'seller5'],
];

export const booksProducts = generateCategoryProducts(
  'cat5',
  'Books & Media',
  rawProducts,
  [
    '/images/products/atomic-habits.png',
    '/images/categories/books-media.png',
    '/images/products/atomic-habits.png',
    '/images/categories/books-media.png',
    '/images/products/atomic-habits.png',
    '/images/categories/books-media.png',
    '/images/products/atomic-habits.png',
    '/images/categories/books-media.png',
    '/images/products/atomic-habits.png',
    '/images/categories/books-media.png',
    '/images/products/atomic-habits.png',
    '/images/categories/books-media.png',
    '/images/products/atomic-habits.png',
    '/images/categories/books-media.png',
    '/images/products/atomic-habits.png',
    '/images/categories/books-media.png',
    '/images/products/atomic-habits.png',
    '/images/categories/books-media.png',
    '/images/products/atomic-habits.png',
    '/images/categories/books-media.png',
  ],
  ['book', 'read', 'bestseller', 'fiction', 'non-fiction', 'self-help', 'knowledge', 'learning'],
  [
    ['James Clear', 'Robin Sharma', 'Dale Carnegie', 'Napoleon Hill', 'Rhonda Byrne', 'Eckhart Tolle', 'Deepak Chopra', 'Stephen Covey', 'Sunil Chaudhary', 'Shiv Khera', 'APJ Abdul Kalam', 'Swami Vivekananda', 'Paulo Coelho', 'Sadhguru', 'Sri Sri Ravi Shankar', 'Chetan Bhagat', 'Amish Tripathi', 'J.K. Rowling', 'R.K. Narayan', 'Ruskin Bond', 'Arundhati Roy', 'Vikram Seth', 'Khaled Hosseini', 'Dan Brown', 'Agatha Christie', 'Satyajit Ray', 'Robert Kiyosaki', 'Peter Lynch', 'Benjamin Graham', 'Warren Buffett', 'Morgan Housel', 'Nassim Taleb', 'Ram Charan', 'Jim Collins', 'Ashneer Grover', 'Ankur Warikoo', 'Peter Thiel', 'R.S. Aggarwal', 'S. Chand', 'Arihant', 'Pearson', 'McGraw Hill', 'Disha', 'Oswaal', 'MTG', 'Walter Isaacson', 'Michelle Obama', 'Ashlee Vance', 'Mahatma Gandhi', 'Narendra Modi', 'Roald Dahl', 'Enid Blyton', 'Geronimo Stilton', 'Sudha Murty', 'Durjoy Datta'],
    ['320 pages', '280 pages', '250 pages', '200 pages', '350 pages', '400 pages', '176 pages', '160 pages', '448 pages', '560 pages', '300 pages', '240 pages', '192 pages', '450 pages', '220 pages', '380 pages', '480 pages', '512 pages', '128 pages', '96 pages', '340 pages', '1080 pages', '371 pages', '410 pages', '256 pages', '576 pages', '336 pages', '320 pages', '640 pages', '280 pages', '256 pages', '352 pages', '288 pages', '320 pages', '272 pages', '256 pages', '195 pages', '720 pages', '520 pages', '400 pages', '680 pages', '750 pages', '450 pages', '620 pages', '656 pages', '448 pages', '180 pages', '400 pages', '352 pages', '304 pages', '160 pages', '192 pages', '224 pages', '280 pages', '240 pages'],
    ['English', 'Hindi', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'Bengali', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'Hindi', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'Hindi', 'English', 'English', 'English', 'English', 'English', 'English', 'English', 'English'],
    ['Paperback', 'Hardcover', 'Paperback', 'Paperback', 'Hardcover', 'Paperback', 'Hardcover', 'Paperback', 'Kindle Edition', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Hardcover', 'Paperback', 'Paperback', 'Paperback', 'Hardcover', 'Paperback', 'Paperback', 'Paperback', 'Hardcover', 'Paperback', 'Paperback', 'Paperback', 'Hardcover', 'Paperback', 'Paperback', 'Paperback', 'Hardcover', 'Paperback', 'Hardcover', 'Paperback', 'Hardcover', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Hardcover', 'Hardcover', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Paperback', 'Paperback'],
    ['Avery Publishing', 'Jaico Publishing', 'Simon & Schuster', 'Bloomsbury', 'Penguin Books', 'New World Library', 'HarperCollins', 'Free Press', 'Westland', 'Macmillan', 'Penguin India', 'Advaita Ashrama', 'HarperOne', 'HarperCollins India', 'Art of Living', 'Rupa Publications', 'Westland', 'Bloomsbury', 'Indian Thought', 'Penguin India', 'Random House', 'Viking', 'Riverhead Books', 'Doubleday', 'HarperCollins UK', 'Penguin Books India', 'Warner Books', 'Simon & Schuster', 'Harper Business', 'Scribner', 'Harriman House', 'Random House', 'Crown Business', 'Harper Business', 'Juggernaut', 'Portfolio Penguin', 'S. Chand Publishing', 'Arihant Publications', 'Pearson Education', 'McGraw Hill India', 'Disha Publications', 'Oswaal Books', 'MTG Learning', 'Simon & Schuster', 'Crown', 'Penguin India', 'Ecco', 'Navneet', 'Penguin India', 'Puffin Books', 'Hachette', 'Scholastic', 'Puffin India', 'Westland'],
    ['ISBN: 978-0-7352-1174-4', 'ISBN: 978-0-06-288846-4', 'ISBN: 978-0-671-02456-1', 'ISBN: 978-1-59420-230-2', 'ISBN: 978-1-58270-170-7', 'ISBN: 978-1-57031-493-5', 'ISBN: 978-0-06-250218-3', 'ISBN: 978-0-7432-5096-5', 'ISBN: 978-9-3865-7801-2', 'ISBN: 978-0-330-93020-1', 'ISBN: 978-8-17167-5902-5', 'ISBN: 978-8-18585-1155-0', 'ISBN: 978-0-06-112241-5', 'ISBN: 978-0-06-251892-5', 'ISBN: 978-9-3827-2101-8', 'ISBN: 978-8-1291-5045-3', 'ISBN: 978-9-3820-0952-6', 'ISBN: 978-0-7475-3269-9', 'ISBN: 978-8-18498-2485-6', 'ISBN: 978-0-140-25784-7', 'ISBN: 978-0-679-43952-4', 'ISBN: 978-0-679-75295-3', 'ISBN: 978-1-59448-385-1', 'ISBN: 978-0-307-47427-8', 'ISBN: 978-0-06-26934-1', 'ISBN: 978-8-12349-7560-8', 'ISBN: 978-1-61039-401-8', 'ISBN: 978-0-671-66102-1', 'ISBN: 978-0-06-055566-5', 'ISBN: 978-1-5011-7448-1', 'ISBN: 978-1-84489-882-2', 'ISBN: 978-0-8129-8426-4', 'ISBN: 978-0-553-38097-1', 'ISBN: 978-0-06-662099-2', 'ISBN: 978-0-140-11134-2', 'ISBN: 978-0-670-91980-7', 'ISBN: 978-9-3521-6651-2', 'ISBN: 978-9-3514-1265-3', 'ISBN: 978-9-3351-8145-6', 'ISBN: 978-0-07461-253-3', 'ISBN: 978-9-3552-3941-5', 'ISBN: 978-9-3527-6871-2', 'ISBN: 978-9-3896-8231-6', 'ISBN: 978-9-3878-7654-3', 'ISBN: 978-9-3891-0078-4', 'ISBN: 978-1-4516-4853-9', 'ISBN: 978-1-5247-6313-2', 'ISBN: 978-8-17167-5524-9', 'ISBN: 978-0-06-230125-5', 'ISBN: 978-9-3508-6901-2', 'ISBN: 978-9-3507-9201-5', 'ISBN: 978-9-3506-7123-7', 'ISBN: 978-0-14034-560-4', 'ISBN: 978-9-3527-3672-8', 'ISBN: 978-9-38078-412-5', 'ISBN: 978-9-3858-1234-8', 'ISBN: 978-8-1291-7890-1'],
  ],
  (name: string, brand: string, specs: string[]) =>
    name + ' by ' + specs[0] + '. ' + specs[1] + ' long. Written in ' + specs[2] + '. Published in ' + specs[3] + ' format by ' + specs[4] + '. ' + specs[5] + ' for easy reference. A must-read available on Shopnexa with free delivery!',
  500
);
