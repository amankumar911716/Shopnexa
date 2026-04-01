import { electronicsProducts } from './electronics';
import { fashionProducts } from './fashion';
import { homeProducts } from './home-furniture';
import { sportsProducts } from './sports-fitness';
import { booksProducts } from './books-media';
import { beautyProducts } from './beauty-personal-care';
import { toysProducts } from './toys-games';
import { groceryProducts } from './grocery-gourmet';

export const allCategoryProducts = [
  ...electronicsProducts,
  ...fashionProducts,
  ...homeProducts,
  ...sportsProducts,
  ...booksProducts,
  ...beautyProducts,
  ...toysProducts,
  ...groceryProducts,
];

export {
  electronicsProducts,
  fashionProducts,
  homeProducts,
  sportsProducts,
  booksProducts,
  beautyProducts,
  toysProducts,
  groceryProducts,
};
