// Represents the decoded auth token that arrived in the transfer object
export class DecodedAuthToken {
  exp: number;
  iat: number;
  id: string;
  type: 'PatientUser' | 'SpecialistUser' | 'StaffUser';
}
