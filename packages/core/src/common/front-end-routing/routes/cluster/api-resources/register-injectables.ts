/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForInjection } from "@ogre-tools/injectable";
import apiResourcesRouteInjectable from "./api-resources-route.injectable";
import navigateToApiResourcesInjectable from "./navigate-to-api-resources.injectable";

export function registerInjectables(di: DiContainerForInjection): void {
  try {
    di.register(apiResourcesRouteInjectable);
  } catch (e) {
    /* Ignore duplicate registration */
  }
  try {
    di.register(navigateToApiResourcesInjectable);
  } catch (e) {
    /* Ignore duplicate registration */
  }
}
