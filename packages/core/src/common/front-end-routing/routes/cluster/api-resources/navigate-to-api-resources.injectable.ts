/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { navigateToRouteInjectionToken } from "../../../navigate-to-route-injection-token";
import apiResourcesRouteInjectable from "./api-resources-route.injectable";

const navigateToApiResourcesInjectable = getInjectable({
  id: "navigate-to-api-resources",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(apiResourcesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToApiResourcesInjectable;
