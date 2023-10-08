export enum Countries {
  UNITED_STATES = 'us',
}

export class PlaceSessionTokenDto {
  sessionToken: string;
}

export class PlaceAutocompleteDto extends PlaceSessionTokenDto {
  query: string;
  country: Countries;
  lat?: number;
  lng?: number;
  radius?: number;
}
