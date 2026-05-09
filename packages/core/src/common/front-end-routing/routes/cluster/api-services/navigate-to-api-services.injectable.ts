/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { navigateToRouteInjectionToken } from "../../../navigate-to-route-injection-token";
import apiServicesRouteInjectable from "./api-services-route.injectable";

const navigateToApiServicesInjectable = getInjectable({
  id: "navigate-to-api-services",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(apiServicesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToApiServicesInjectable;
