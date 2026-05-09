/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForInjection } from "@ogre-tools/injectable";
import apiServicesRouteInjectable from "./api-services-route.injectable";
import navigateToApiServicesInjectable from "./navigate-to-api-services.injectable";

export function registerInjectables(di: DiContainerForInjection): void {
  try {
    di.register(apiServicesRouteInjectable);
  } catch (e) {
    /* Ignore duplicate registration */
  }
  try {
    di.register(navigateToApiServicesInjectable);
  } catch (e) {
    /* Ignore duplicate registration */
  }
}
