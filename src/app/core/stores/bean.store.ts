import { Injectable, inject } from '@angular/core';
import { BaseStore } from './base-store';
import { Bean } from '../models/bean.model';
import { StorageService } from '../storage/storage.service';

@Injectable({ providedIn: 'root' })
export class BeanStore extends BaseStore<Bean> {
  protected readonly storageKey = 'beans';

  constructor() {
    super(inject(StorageService));
    this.load();
  }
}
