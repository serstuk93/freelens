/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForInjection } from "@ogre-tools/injectable";
import apiServiceApiInjectable from "./api-service.api.injectable";
import apiServiceStoreInjectable from "./store.injectable";
import apiServicesRouteComponentInjectable from "./api-services-route-component.injectable";
import apiServicesSidebarItemInjectable from "./sidebar-item.injectable";

export function registerInjectables(di: DiContainerForInjection): void {
  try {
    di.register(apiServiceApiInjectable);
  } catch (e) {
    /* Ignore duplicate registration */
  }
  try {
    di.register(apiServiceStoreInjectable);
  } catch (e) {
    /* Ignore duplicate registration */
  }
  try {
    di.register(apiServicesRouteComponentInjectable);
  } catch (e) {
    /* Ignore duplicate registration */
  }
  try {
    di.register(apiServicesSidebarItemInjectable);
  } catch (e) {
    /* Ignore duplicate registration */
  }
}
