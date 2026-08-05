import { Injectable, inject } from '@angular/core';
import { BaseStore } from './base-store';
import { BrewLog } from '../models/brew-log.model';
import { StorageService } from '../storage/storage.service';

@Injectable({ providedIn: 'root' })
export class LogStore extends BaseStore<BrewLog> {
  protected readonly storageKey = 'logs';

  constructor() {
    super(inject(StorageService));
    this.load();
  }
}
