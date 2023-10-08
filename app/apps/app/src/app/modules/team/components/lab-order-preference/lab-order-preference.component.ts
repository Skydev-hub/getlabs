import { Component, ContentChildren, Directive, Input, QueryList, TemplateRef } from '@angular/core';
import { LabCompany, LabOrderDetailsEntity } from '@app/ui';
import { BehaviorSubject, Observable } from 'rxjs';

interface LabOrderPreferenceAssignment {
  labCompany: LabCompany;
  labOrderDetails: LabOrderDetailsEntity[];
}

type LabOrderPreferenceAssignmentSet = {
  [key in LabCompany]?: LabOrderPreferenceAssignment;
};

export enum LabOrderPreferenceCase {
  SinglePreferredLab = 'SinglePreferredLab',
  NoPreferredLab = 'NoPreferredLab',
  SplitPreferredLab = 'SplitPreferredLab',
}

@Directive({
  /* eslint-disable-next-line @angular-eslint/directive-selector */
  selector: 'ng-template[labOrderPreferenceCase]',
})
export class LabOrderPreferenceTemplateDirective {
  @Input()
  public labOrderPreferenceCase: LabOrderPreferenceCase;

  constructor(public readonly templateRef: TemplateRef<any>) {}
}

@Component({
  selector: 'app-lab-order-preference',
  templateUrl: './lab-order-preference.component.html',
})
export class LabOrderPreferenceComponent {
  private _preferredLabsSubject$ = new BehaviorSubject<LabOrderPreferenceAssignment[]>(null);

  public preferredLabs$: Observable<LabOrderPreferenceAssignment[]> = this._preferredLabsSubject$.asObservable();

  private _labOrderDetails: LabOrderDetailsEntity[];

  @ContentChildren(LabOrderPreferenceTemplateDirective)
  private readonly caseTemplates: QueryList<LabOrderPreferenceTemplateDirective>;

  @Input()
  public set labOrderDetails(labOrderDetails: LabOrderDetailsEntity[]) {
    /* Extract the preferred labs from the supplied lab order details set... */
    this._preferredLabsSubject$.next(
      Object.values(
        labOrderDetails.reduce((collector: LabOrderPreferenceAssignmentSet, lod) => {
          /* If the supplied lab order details entity has a preferred lab, and said lab is not already defined in the collector,
           * add a corresponding entry here. */
          if (lod.lab) {
            collector[lod.lab] = collector[lod.lab] || { labCompany: lod.lab, labOrderDetails: [] };
            collector[lod.lab].labOrderDetails.push(lod);
          }

          return collector;
        }, {})
      )
    );

    this._labOrderDetails = labOrderDetails;
  }

  public get labOrderDetails() {
    return this._labOrderDetails;
  }

  public getCaseTemplate(preferredLabs: LabOrderPreferenceAssignment[]) {
    /* Identify the appropriate scenario according to the currently-known set of preferred labs... */
    const labOrderPreferenceCase =
      !preferredLabs || !preferredLabs.length
        ? LabOrderPreferenceCase.NoPreferredLab
        : preferredLabs.length === 1
        ? LabOrderPreferenceCase.SinglePreferredLab
        : LabOrderPreferenceCase.SplitPreferredLab;

    const caseTemplateDirective = this.caseTemplates.find((caseTemplate) => caseTemplate.labOrderPreferenceCase === labOrderPreferenceCase);
    return caseTemplateDirective && caseTemplateDirective.templateRef;
  }
}
