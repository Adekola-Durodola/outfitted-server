import { Injectable, Logger } from '@nestjs/common';
import { CreateGoogleShoppingDto } from './dto/create-google-shopping.dto';
import { UpdateGoogleShoppingDto } from './dto/update-google-shopping.dto';
import fetch from 'node-fetch';
import { GoogleShoppingQueryDto, GoogleSort } from './dto/google-shopping-query.dto';

interface ProductResult {
  title: string;
  link: string;
  image?: string;
  price?: string;
  currency?: string;
}

@Injectable()
export class GoogleShoppingService {
  private readonly logger = new Logger('GoogleShoppingService');
  private readonly cache = new Map<string, { data: ProductResult[]; ts: number }>();
  private readonly CACHE_DURATION = 1000 * 60 * 30; // 30 mins
  private readonly requestTracker = new Map<string, number>();
  private readonly REQUEST_COOLDOWN = 1000 * 60; // 1 min

  private get apiKey() {
    return process.env.GOOGLE_API_KEY;
  }
  private get cx() {
    return process.env.GOOGLE_SEARCH_ENGINE_ID;
  }

  private async fetchProducts(query: string): Promise<ProductResult[]> {
    if (!this.apiKey || !this.cx) {
      this.logger.warn('Google API credentials not set');
      return [];
    }
    const url = `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.cx}&q=${encodeURIComponent(query)}&gl=us`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google API error ${res.status}`);
    const json: any = await res.json();
    const items = json.items || [];
    const products: ProductResult[] = items.map((it: any) => ({
      title: it.title,
      link: it.link,
      image: it.pagemap?.cse_thumbnail?.[0]?.src || it.pagemap?.cse_image?.[0]?.src,
      price: it.pagemap?.offer?.[0]?.price,
      currency: it.pagemap?.offer?.[0]?.pricecurrency,
    }));
    return products;
  }

  async search(dto: GoogleShoppingQueryDto) {
    const { query, category, maxPrice, sort } = dto;
    const key = `${query}_${category}_${maxPrice}_${sort}`;
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.ts < this.CACHE_DURATION) {
      return cached.data;
    }
    const last = this.requestTracker.get(query);
    if (last && Date.now() - last < this.REQUEST_COOLDOWN) {
      return cached?.data || [];
    }
    this.requestTracker.set(query, Date.now());
    let products = await this.fetchProducts(category ? `${query} ${category}` : query);
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      products = products.filter((p) => p.price && parseFloat(p.price) <= max);
    }
    if (sort === GoogleSort.PRICE) {
      products.sort((a, b) => (parseFloat(a.price || '0') || Infinity) - (parseFloat(b.price || '0') || Infinity));
    }
    this.cache.set(key, { data: products, ts: Date.now() });
    return products;
  }
}
