import { Component, HostListener, Inject, OnDestroy } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { File, FileService } from '@app/ui';
import { Observable, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LightboxRef } from './lightbox-ref';
import { LIGHTBOX_FILE } from './lightbox.tokens';


@Component({
  selector: 'app-lightbox',
  templateUrl: './lightbox.component.html',
  styleUrls: ['./lightbox.component.scss'],
})
export class LightboxComponent implements OnDestroy {

  file$: Observable<File>;

  router$: Subscription;

  constructor(
    public ref: LightboxRef,
    @Inject(LIGHTBOX_FILE) public file: File,
    private readonly service: FileService,
    private readonly router: Router,
  ) {
    // Close lightbox on routing start events
    this.router$ = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.ref.close();
      }
    });

    // Refresh the file in order to get fresh access url (urls expire after a certain time)
    this.file$ = this.service.read(file.id).pipe(catchError(errObj => {
      console.warn(`[lightbox] Unable to access remote file resource: ${ errObj.error.statusCode }: ${ errObj.error.error } - attempting old access url...`);
      return of(file);
    }));
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.ref.close();
    }
  }

  ngOnDestroy(): void {
    this.router$.unsubscribe();
  }
}
