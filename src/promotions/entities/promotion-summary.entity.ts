export class PromotionSummary {
  totalPromotions: number;
  activePromotions: number;
  expiredPromotions: number;
  heroPromotions: number;
  averageDiscountPercentage: number;
  topPromotedProducts: {
    productId: string;
    productName: string;
    promotionTitle: string;
    discountPercentage: number;
  }[];

  constructor(data: {
    totalPromotions: number;
    activePromotions: number;
    expiredPromotions: number;
    heroPromotions: number;
    averageDiscountPercentage: number;
    topPromotedProducts: {
      productId: string;
      productName: string;
      promotionTitle: string;
      discountPercentage: number;
    }[];
  }) {
    this.totalPromotions = data.totalPromotions;
    this.activePromotions = data.activePromotions;
    this.expiredPromotions = data.expiredPromotions;
    this.heroPromotions = data.heroPromotions;
    this.averageDiscountPercentage = data.averageDiscountPercentage;
    this.topPromotedProducts = data.topPromotedProducts;
  }
}
