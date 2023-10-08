import { InjectionToken } from '@angular/core';

/**
 * Describes an injection token for the generic LabPipe pipe.  Pipes are non-injectables; the purpose of this token is to
 * clearly delineate the usage of LabPipe as an injectable and LabPipe as a template-inlined pipe.
 */
export const LAB_PIPE = new InjectionToken('LAB_PIPE');
