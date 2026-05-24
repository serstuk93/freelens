/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { frontEndRouteInjectionToken } from "../../../front-end-route-injection-token";

import type { Route } from "../../../front-end-route-injection-token";

export interface ApiResourcesPathParameters {
  apiVersion?: string;
}

const apiResourcesRouteInjectable = getInjectable({
  id: "api-resources-route",

  instantiate: (): Route<ApiResourcesPathParameters> => {
    return {
      path: "/api-resources/:apiVersion?",
      clusterFrame: true,
      isEnabled: computed(() => true),
    };
  },

  injectionToken: frontEndRouteInjectionToken,
});

export default apiResourcesRouteInjectable;
