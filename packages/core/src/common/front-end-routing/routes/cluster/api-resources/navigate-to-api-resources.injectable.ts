/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { navigateToRouteInjectionToken } from "../../../navigate-to-route-injection-token";
import apiResourcesRouteInjectable, { type ApiResourcesPathParameters } from "./api-resources-route.injectable";

export type NavigateToApiResources = (parameters?: ApiResourcesPathParameters) => void;

const navigateToApiResourcesInjectable = getInjectable({
  id: "navigate-to-api-resources",

  instantiate: (di): NavigateToApiResources => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(apiResourcesRouteInjectable);

    return (parameters) => navigateToRoute(route, { parameters });
  },
});

export default navigateToApiResourcesInjectable;
