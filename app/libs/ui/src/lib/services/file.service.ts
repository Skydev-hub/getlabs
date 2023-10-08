import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { File } from '../models';
import { popupDownloadDialog } from '../utils';
import { CrudService } from './crud.service';


@Injectable({
  providedIn: 'root',
})
export class FileService extends CrudService<File> {

  getResourceType() {
    return File;
  }

  getResourceEndpoint(): string {
    return 'file';
  }

  download(file: File): Observable<Blob> {
    return this.getHttpClient().get(this.getEndpoint(`${ file.id }/download`), { responseType: 'blob' });
  }

  saveToDisk(file: File) {
    return this.download(file).subscribe(blob => popupDownloadDialog(blob, file.name));
  }

  /**
   * Initiates a request to rotate the supplied image file by the supplied degrees
   */
  rotate(file: File, deg: number): Observable<File> {
    return this.getHttpClient().post<File>(this.getEndpoint(`${ file.id }/rotate/${ deg }`), {})
      .pipe(map(result => plainToClass(File, result)));
  }

}
