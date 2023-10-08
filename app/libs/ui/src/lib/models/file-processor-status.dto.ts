import { File } from '@app/ui';

export class FileProcessorStatusDto {
  id?: string;
  generating: boolean;
  file?: File;
}
