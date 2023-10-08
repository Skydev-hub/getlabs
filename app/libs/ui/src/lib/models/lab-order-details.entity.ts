import { Type } from 'class-transformer';
import { File } from './file';
import { LabCompany } from './user';

export class LabOrderSeedTypes {
  constructor(public type: string, public isActive: (labOrderDetailsEmbed: LabOrderDetailsEntity) => boolean) {}

  public static readonly File = new LabOrderSeedTypes('File', () => {
    /* Not currently used, and the previously-leveraged criteria to identify this is now invalid... however, this may
     * be coming back soon, so let's not remove it just yet. */
    return false;
  });
  public static readonly DoctorContact = new LabOrderSeedTypes('DoctorContact', labOrderDetailsEmbed => {
    // Must use the affirmative in this case, as this seed type will eventually have a file...
    return !labOrderDetailsEmbed.isGetFromDoctor;
  });
  public static readonly DoctorSubmit = new LabOrderSeedTypes('DoctorSubmit', labOrderDetailsEmbed => {
    // Must use the affirmative in this case, as this seed type will eventually have a file
    return labOrderDetailsEmbed.isGetFromDoctor;
  });

  static *[Symbol.iterator] () {
    for (const lostKey of Object.keys(LabOrderSeedTypes)) {
      if (lostKey !== 'ctorParameters') {
        yield LabOrderSeedTypes[lostKey];
      }
    }
  }
}

export class LabOrderDetailsEntity {

  id: string;

  contactName?: string;

  contactPhone?: string;

  lab?: LabCompany;

  @Type(() => File)
  labOrderFiles?: Array<File>;

  isGetFromDoctor?: boolean;

  hasLabOrder?: boolean;

  @Type(() => File)
  abnDocument?: File;

  @Type(() => File)
  accuDraw?: File;

  isDeleted: boolean;

  getLabOrderType(): LabOrderSeedTypes {
    for (const labOrderSeedType of LabOrderSeedTypes) {
      if (labOrderSeedType.isActive(this)) {
        return labOrderSeedType;
      }
    }

    /* If we get here, then we're in an invalid state. */
    throw new Error('[LabOrderDetailsEntity] Cannot determine lab order type - LabOrderDetailsEntity is in an invalid state.');
  }
}
