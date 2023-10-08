import { TestBed, inject } from '@angular/core/testing';
import { LocalStorage } from './localstorage';
import { AlternativeStorage } from './alternativestorage';

const mockLocalStorage: { [key: string]: any } = {};

describe('core/LocalStorage', () => {
  describe('with no localStorage available', () => {
    beforeEach(() => {
      TestBed.configureTestingModule(testBedConfiguration());
      initSpyOnLocalStorage(true);
    });

    it('should use AlternativeStorage when no localStorage1', inject(
      [LocalStorage],
      (service: LocalStorage) => {
        expect(service._wrapped() instanceof AlternativeStorage).toBeTruthy();
      }
    ));

    it('setItem() and getItem() should works properly', inject(
      [LocalStorage],
      (service: LocalStorage) => {
        expect(service.getItem('key')).toBeNull();
        service.setItem('key', 'value');
        expect(service.getItem('key')).toBe('value');
      }
    ));

    it('remove() must remove item', inject(
      [LocalStorage],
      (service: LocalStorage) => {
        service.setItem('key', 'value');
        service.removeItem('key');
        expect(service.getItem('key')).toBeNull();
      }
    ));
  });

  describe('with localStorage available', () => {
    beforeEach(() => {
      TestBed.configureTestingModule(testBedConfiguration());
      initSpyOnLocalStorage(false);
    });

    it('should use localStorage if exists', inject(
      [LocalStorage],
      (service: LocalStorage) => {
        expect(service._wrapped() instanceof AlternativeStorage).toBeFalsy();
      }
    ));

    it('setItem() and getItem() should works properly', inject(
      [LocalStorage],
      (service: LocalStorage) => {
        expect(service.getItem('key')).toBeNull();
        service.setItem('key', 'value');
        expect(service.getItem('key')).toBe('value');
      }
    ));

    it('remove() must remove item', inject(
      [LocalStorage],
      (service: LocalStorage) => {
        service.setItem('key', 'value');
        service.removeItem('key');
        expect(service.getItem('key')).toBeNull();
      }
    ));
  });
});

function testBedConfiguration() {
  return {
    providers: [LocalStorage]
  };
}

function initSpyOnLocalStorage(fakeNoLocalStorage: boolean) {
  jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(
    (key: string): string => {
      return mockLocalStorage[key] || null;
    }
  );
  jest.spyOn(window.localStorage.__proto__, 'removeItem').mockImplementation(
    (key: string): void => {
      delete mockLocalStorage[key];
    }
  );
  jest.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(
    (key: string, value: string): string => {
      if (fakeNoLocalStorage) {
        throw new Error('QuotaExceededError');
      } else {
        return (mockLocalStorage[key] = value as string);
      }
    }
  );
}
