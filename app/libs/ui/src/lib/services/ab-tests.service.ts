import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { addDays } from 'date-fns';
import { ConfigurationService } from './configuration.service';
import { UserAgentService } from './user-agent.service';

interface AbTestVersionDescription {
  name: string;
  weight: number; // weight of all test versions should add up to 100
  default?: boolean;
}

interface AbTestDescription {
  [testName: string]: {
    versions: AbTestVersionDescription[];
    expirationDays?: number; // number of days for the cookie, if not set it will last for the session
  };
}

interface AbTestsForUser {
  [key: string]: AbTestVersionDescription;
}

const GL_AB_TESTS_COOKIE_KEY_PREFIX = 'GlAbTests';

export class AbTestNotFoundError extends Error {}

@Injectable({
  providedIn: 'root'
})
export class AbTestsService {
  // all available tests
  private tests: AbTestDescription = {
    HomepageBookNow: {
      versions: [{ name: 'Button', weight: 50 }, { name: 'AddressForm', weight: 50 }],
      expirationDays: 30
    }
  };

  // caches test versions that are currently active for a user
  private activeTests: AbTestsForUser = {};

  constructor(
    private readonly cookieService: CookieService,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly config: ConfigurationService,
    private readonly userAgent: UserAgentService
  ) {
    this.sortVersionsByWeight();
  }

  public shouldRender(testName: string, versionName: string): boolean {
    if (!this.isValidTest(testName, versionName)) {
      throw new AbTestNotFoundError(`Invalid AB test: ${testName}:${versionName}`);
    }
    const userVersion = this.getUserVersionForTest(testName);
    return userVersion.name === versionName;
  }

  private randomTestVersion(testName: string): AbTestVersionDescription {
    const randNumber = Math.random() * 100;
    const versions = this.tests[testName].versions;
    let weightsChecked = 0;
    for (const [i, version] of versions.entries()) {
      // if it's the last version being tested always return it, for cases such as total weight 99.9%
      if (i === versions.length - 1 || randNumber <= version.weight + weightsChecked) {
        return version;
      }
      weightsChecked += version.weight;
    }
  }

  /**
   * Return either the test version flagged as default or the highest weighted.
   */
  private getDefaultVersionOfTest(testName: string): AbTestVersionDescription {
    const versions = this.tests[testName].versions;
    const defaultVersion = versions.filter(e => e.default);
    return defaultVersion[0] || versions[versions.length - 1];
  }

  /**
   * Checks if the tests and optionally the test version exists
   */
  private isValidTest(testName: string, versionName?: string): boolean {
    return !(!this.tests[testName] || (versionName && this.tests[testName].versions.filter(e => e.name === versionName).length === 0));
  }

  private setUserVersionForTest(testName: string, version: AbTestVersionDescription, skipCookie = false): void {
    this.activeTests[testName] = version;
    if (!skipCookie) {
      this.writeToCookie(testName, version);
    }
  }

  private getUserVersionForTest(testName: string): AbTestVersionDescription {
    // if user's version is already cached return it
    if (this.activeTests[testName]) {
      return this.activeTests[testName];
    }
    // crawlers always get the default
    if (this.userAgent.isCrawler()) {
      const defaultVersion = this.getDefaultVersionOfTest(testName);
      this.setUserVersionForTest(testName, defaultVersion);
      return defaultVersion;
    }
    // if user has a version saved in a cookie use it
    let version = this.readFromCookie(testName);
    const isCookieVersion = !!version;
    // if no cookie, randomly assign a weighted version to the user
    if (!version) {
      version = this.randomTestVersion(testName);
    }
    this.setUserVersionForTest(testName, version, isCookieVersion);
    return version;
  }

  private sortVersionsByWeight(): void {
    for (const [testName, test] of Object.entries(this.tests)) {
      test.versions.sort((a, b) => a.weight - b.weight);
    }
  }

  private getTestVersionByName(testName: string, versionName: string): AbTestVersionDescription {
    if (!this.isValidTest(testName, versionName)) {
      return null;
    }
    const version = this.tests[testName].versions.filter(e => e.name === versionName);
    return version[0] || null;
  }

  /**
   * Reads the currently set test versions from the cookie and swaps out the version name for the full AbTestVersionDescription
   */
  private readFromCookie(testName: string): AbTestVersionDescription {
    const versionName = this.cookieService.get(this.getCookieKey(testName));
    if (!versionName) {
      return null;
    }
    return this.getTestVersionByName(testName, versionName);
  }

  /**
   * Saves the version name for a given test to a cookie
   */
  private writeToCookie(testName: string, version: AbTestVersionDescription): void {
    const expiry = this.tests[testName].expirationDays ? addDays(new Date(), this.tests[testName].expirationDays) : null;
    this.cookieService.put(this.getCookieKey(testName), version.name, {
      expires: expiry,
      domain: this.config.getCookieDomain()
    });
  }

  public getCookieKey(testName: string) {
    return `${GL_AB_TESTS_COOKIE_KEY_PREFIX}_${testName}`;
  }

  /**
   * Gets all active tests versions for a user by checking the cached tests and then the cookie
   */
  public getActiveTestVersions(): { [testName: string]: string } {
    const activeTests = {};
    for (const testName of Object.keys(this.tests)) {
      const activeVersion: AbTestVersionDescription = this.activeTests[testName] || this.readFromCookie(testName);
      if (activeVersion) {
        this.activeTests[testName] = activeVersion;
        activeTests[testName] = activeVersion.name;
      }
    }
    return Object.keys(activeTests).length === 0 ? null : activeTests;
  }
}
