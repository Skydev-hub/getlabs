import { LabCompany } from '../models';
import { LabPipe } from '../pipes/lab.pipe';

export const getLabName = (lab: LabCompany): string => {
  return new LabPipe().transform(lab);
};

export const getLabCompanies = (): { lab: LabCompany; name: string }[] => {
  return Object.values(LabCompany).map(e => ({ lab: e, name: getLabName(e) }));
};
