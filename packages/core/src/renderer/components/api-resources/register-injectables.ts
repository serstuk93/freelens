/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForInjection } from "@ogre-tools/injectable";
import apiResourceGroupsInjectable from "./api-resource-groups.injectable";
import apiResourcesRouteComponentInjectable from "./api-resources-route-component.injectable";
import apiResourcesSidebarItemInjectable from "./sidebar-item.injectable";

export function registerInjectables(di: DiContainerForInjection): void {
  try {
    di.register(apiResourceGroupsInjectable);
  } catch (e) {
    /* Ignore duplicate registration */
  }
  try {
    di.register(apiResourcesRouteComponentInjectable);
  } catch (e) {
    /* Ignore duplicate registration */
  }
  try {
    di.register(apiResourcesSidebarItemInjectable);
  } catch (e) {
    /* Ignore duplicate registration */
  }
}
