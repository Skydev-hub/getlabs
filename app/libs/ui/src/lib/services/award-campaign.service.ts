import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ConfigurationService } from './configuration.service';
import { filterFalsy } from '../utils/http.utils';
import { plainToClass } from 'class-transformer';
import { map, tap } from 'rxjs/operators';
import { AwardCampaignEntity, AwardType } from '../models/award-campaign.entity';

@Injectable({
  providedIn: 'root',
})
export class AwardCampaignService {
  constructor(
    private readonly http: HttpClient,
    private readonly configurationService: ConfigurationService,
  ) {
  }

  private readonly cache: {
    /* First sorted by award type */
    [key in AwardType]?: {
      /* Then sorted by award name */
      defaultCampaign?: AwardCampaignEntity;
      [key: string]: AwardCampaignEntity;
    }
  } = {};

  getAwardCampaignByName(awardType: AwardType, name?: string) {
    /* First check the cache - if the defined award type / name (or default, if the name is not defined) is already in the cache, return
     * the mapped award campaign. */
    const cached = this.cache[awardType] && (name ? this.cache[awardType][name] : this.cache[awardType].defaultCampaign);
    if (cached) {
      return of(cached);
    }

    /* Otherwise, resolve the campaign from the API. */
    return this.http.get<AwardCampaignEntity>(this._getApiEndpoint(`type/${ awardType }`), {
      params: filterFalsy({
        name,
      })
    }).pipe(
      map(val => plainToClass(AwardCampaignEntity, val)),

      tap(result => {
        /* If no cache group is defined for the supplied award type, create one now. */
        if (!this.cache[awardType]) {
          this.cache[awardType] = {};
        }

        /* Define the resulting award by its name (and 'default' if the supplied name parameter is not defined) */
        this.cache[awardType][result.name] = result;

        if (!name) {
          this.cache[awardType].defaultCampaign = result;
        }
      })
    );
  }

  private _getApiEndpoint(path: string) {
    return this.configurationService.getApiEndPoint(`award-campaign/${path}`);
  }
}
