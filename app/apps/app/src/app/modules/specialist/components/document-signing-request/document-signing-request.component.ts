import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DocumentType, SpecialistUser, SpecialistUserService } from '@app/ui';
import HelloSign from 'hellosign-embedded';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-document-signing-request',
  templateUrl: './document-signing-request.component.html',
  styleUrls: ['./document-signing-request.component.scss'],
})
export class DocumentSigningRequestComponent implements OnInit {

  @Input()
  user: SpecialistUser;

  @Input()
  type: DocumentType;

  @Output()
  signed: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  finished: EventEmitter<void> = new EventEmitter<void>();

  loaded = false;

  client: HelloSign;

  constructor(private service: SpecialistUserService) {
    this.client = new HelloSign({ clientId: environment.helloSignClientId });
  }

  ngOnInit() {

    if (!(this.user instanceof SpecialistUser)) {
      throw new TypeError('The property \'user\' must be an instance of SpecialistUser');
    }

    if (!this.type) {
      throw new TypeError('The property \'type\' is required');
    }

    this.service.readDocumentSigningUrl(this.user.id, this.type).subscribe(d => {
      this.loaded = true;

      this.client.open(d.signUrl, {
        allowCancel: false,
        skipDomainVerification: true,
      });

      this.client.on('sign', data => {
        this.signed.emit(data.signatureId);
      });

      this.client.on('finish', () => {
        this.finished.emit();
      });
    });
  }

}
