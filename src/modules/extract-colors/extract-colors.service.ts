import { Injectable, BadRequestException } from '@nestjs/common';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { CreateExtractColorDto } from './dto/create-extract-color.dto';
import { UpdateExtractColorDto } from './dto/update-extract-color.dto';
import { ExtractColorsDto, ColorFormat } from './dto/extract-colors.dto';

interface ColorResult { color: string; percentage: number; count: number; }

@Injectable()
export class ExtractColorsService {
  private readonly IMAGE_MAX = 800;

  async extract(dto: ExtractColorsDto) {
    const { imageUrl, maxColors, format, includePercentages } = dto;
    const buffer = await this.download(imageUrl);
    return this.process(buffer, maxColors, format, includePercentages);
  }

  private async download(url: string): Promise<Buffer> {
    const res = await fetch(url);
    if (!res.ok) throw new BadRequestException('Unable to fetch image');
    const ct = res.headers.get('content-type');
    if (!ct?.startsWith('image/')) throw new BadRequestException('URL is not an image');
    const buf = await res.buffer();
    return buf;
  }

  private async process(buffer: Buffer, maxColors: number, format: ColorFormat, includePercentages: boolean) {
    const { data, info } = await sharp(buffer)
      .resize(this.IMAGE_MAX, this.IMAGE_MAX, { fit: 'inside', withoutEnlargement: true })
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });
    const totalPixels = info.width * info.height;
    const map = new Map<string, number>();
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = [data[i], data[i+1], data[i+2], data[i+3]];
      if (a < 128) continue;
      const key = this.formatColor(r, g, b, format);
      map.set(key, (map.get(key) || 0) + 1);
    }
    const arr: ColorResult[] = Array.from(map.entries())
      .map(([color, count]) => ({ color, count, percentage: includePercentages ? (count/totalPixels)*100 : 0 }))
      .sort((a,b)=>b.count-a.count)
      .slice(0, maxColors);
    return { colors: arr, totalPixels };
  }

  private formatColor(r:number,g:number,b:number,format: ColorFormat){
    switch(format){
      case ColorFormat.RGB:
        return `rgb(${r}, ${g}, ${b})`;
      case ColorFormat.HSL:
        const [h,s,l] = this.rgbToHsl(r,g,b); return `hsl(${h}, ${s}%, ${l}%)`;
      default:
        return `#${[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('')}`;
    }
  }
  private rgbToHsl(r:number,g:number,b:number):[number,number,number]{
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    let h=0,s=0,l=(max+min)/2;
    if(max!==min){
      const d=max-min; s=l>0.5? d/(2-max-min): d/(max+min);
      switch(max){
        case r: h=(g-b)/d+(g<b?6:0); break;
        case g: h=(b-r)/d+2; break;
        case b: h=(r-g)/d+4; break;
      }
      h/=6;
    }
    return [Math.round(h*360),Math.round(s*100),Math.round(l*100)];
  }
}
