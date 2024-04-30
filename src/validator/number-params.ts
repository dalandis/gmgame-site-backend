import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: Record<string, string>, metadata: ArgumentMetadata) {
    const transformed = {};
    for (const key in value) {
      transformed[key] = parseInt(value[key], 10);
    }
    return transformed;
  }
}
