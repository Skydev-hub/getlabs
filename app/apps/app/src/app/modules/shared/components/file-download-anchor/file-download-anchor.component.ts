import { Component, Input } from '@angular/core';
import { File, FileService } from '@app/ui';

@Component({
  selector: 'app-file-download-anchor',
  templateUrl: './file-download-anchor.component.html',
  styleUrls: ['./file-download-anchor.component.scss'],
})
export class FileDownloadAnchorComponent {
  @Input()
  file: File;

  constructor(private readonly fileService: FileService) {}

  download() {
    this.fileService.saveToDisk(this.file);
  }
}
