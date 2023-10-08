import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { plainToClass } from 'class-transformer';
import { Subscription } from 'rxjs';
import { AuthService, File, FilePurpose, getFieldError, LabOrderDetailsEntity } from '@app/ui';
import { DragDropFileUploadComponent } from '../../../../../shared/components/drag-drop-file-upload/drag-drop-file-upload.component';
import { UploadState } from '../../../../../shared/components/form/input/file-input/file-input.component';
import { BookPageComponent } from '../../../../pages/book/book-page.component';
import { BookingFlowService } from '../../../../services/booking-flow.service';
import { AbstractLabComponent } from '../abstract-lab-component/abstract-lab.component';

@Component({
  templateUrl: './book-upload-lab.component.html',
  styleUrls: ['./book-upload-lab.component.scss']
})
export class BookUploadLabComponent extends AbstractLabComponent implements OnInit {

  @ViewChild(DragDropFileUploadComponent, { static: true })
  fileInput: DragDropFileUploadComponent;

  @ViewChild(DragDropFileUploadComponent, { static: true })
  dragDropFileUpload: DragDropFileUploadComponent;

  public disabled = false;

  public error: string;

  public UploadState = UploadState;

  input: FormControl;

  req$: Subscription;

  loading = false;

  constructor(
    @Optional() private bookPageComponent: BookPageComponent,
    private bookingFlowService: BookingFlowService,
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {
    super();
    this.input = new FormControl();
  }

  async ngOnInit() {
    // Ensure PDF type is available here
    this.fileInput.types = Array.from(new Set(['application/pdf', ...this.fileInput.types]));
  }

  getError(): string {
    return getFieldError(this.input);
  }

  getFilePurpose() {
    return FilePurpose.LabOrder;
  }

  getUser() {
    return this.auth.getUser();
  }

  doAccept(labOrderFiles: Array<File>) {
    this.submit.emit(plainToClass(LabOrderDetailsEntity, [{ labOrderFiles }]));
  }

}
