/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { sidebarItemInjectionToken } from "@freelensapp/cluster-sidebar";
import { computedAnd } from "@freelensapp/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import { matches } from "lodash";
import { computed } from "mobx";
import React from "react";
import apiResourcesRouteInjectable, { type ApiResourcesPathParameters } from "../../../common/front-end-routing/routes/cluster/api-resources/api-resources-route.injectable";
import navigateToApiResourcesInjectable from "../../../common/front-end-routing/routes/cluster/api-resources/navigate-to-api-resources.injectable";
import { shouldShowResourceInjectionToken } from "../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import routePathParametersInjectable from "../../routes/route-path-parameters.injectable";
import apiResourcesSidebarItemInjectable from "./sidebar-item.injectable";
import apiResourceGroupsInjectable from "./api-resource-groups.injectable";
import { Icon } from "@freelensapp/icon";

import type { SidebarItemRegistration } from "@freelensapp/cluster-sidebar";

const sideBarItemApiResourceGroupPrefix = "sidebar-item-api-resource-group";

const apiResourceGroupsSidebarItemsComputedInjectable = getInjectable({
  id: "api-resource-groups-sidebar-items-computed",

  instantiate: (di) => {
    const apiResourceGroups = di.inject(apiResourceGroupsInjectable);
    const navigateToApiResources = di.inject(navigateToApiResourcesInjectable);
    const apiResourcesRoute = di.inject(apiResourcesRouteInjectable);
    const pathParameters = di.inject(routePathParametersInjectable, apiResourcesRoute);
    const isRouteActive = di.inject(routeIsActiveInjectable, apiResourcesRoute);

    return computed(() => {
      return apiResourceGroups.get().map((group, index) => {
        const parameters: ApiResourcesPathParameters = { apiVersion: group.apiVersion };
        const isVisible = computed(() =>
          group.resources.some((resource) =>
            di.inject(shouldShowResourceInjectionToken, {
              group: group.apiVersion,
              apiName: resource.name,
            }).get(),
          ),
        );

        return getInjectable({
          id: `${sideBarItemApiResourceGroupPrefix}-${group.apiVersion}`,
          instantiate: (): SidebarItemRegistration => ({
            parentId: apiResourcesSidebarItemInjectable.id,
            onClick: () => navigateToApiResources(parameters),
            title: group.apiVersion.replaceAll(".", "\u200b."),
            getIcon: () => React.createElement(Icon, { material: "label" }),
            isActive: computedAnd(
              isRouteActive,
              computed(() => matches(parameters)(pathParameters.get())),
            ),
            isVisible,
            orderNumber: index + 1,
          }),
          injectionToken: sidebarItemInjectionToken,
        });
      });
    });
  },
});

export default apiResourceGroupsSidebarItemsComputedInjectable;
