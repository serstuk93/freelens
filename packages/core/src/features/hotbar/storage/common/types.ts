/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


export interface HotbarItem {
  entity: {
    uid: string;
    name: string;
    source?: string;
  };
  params?: {
    [key: string]: string;
  };
}

export interface CreateHotbarData {
  id?: string;
  name: string;
  items?: (HotbarItem | null)[];
}

export interface CreateHotbarOptions {
  setActive?: boolean;
}

export let defaultHotbarCells = 12;

export let minHotbarCells = 5;

export function setDefaultHotbarCells(value: number) {
  if (value >= minHotbarCells
  ) {
    defaultHotbarCells = value;
  }
}
