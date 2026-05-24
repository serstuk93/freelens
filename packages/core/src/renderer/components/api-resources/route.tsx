/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./api-resources.scss";

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import apiResourcesRouteInjectable from "../../../common/front-end-routing/routes/cluster/api-resources/api-resources-route.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import { TabLayout } from "../layout/tab-layout-2";
import routePathParametersInjectable from "../../routes/route-path-parameters.injectable";
import { KubeObjectAge } from "../kube-object/age";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { WithTooltip } from "../with-tooltip";
import apiResourceGroupsInjectable from "./api-resource-groups.injectable";

import type { KubeObject } from "@freelensapp/kube-object";
import type { ApiManager } from "../../../common/k8s-api/api-manager/api-manager";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";

interface Dependencies {
  apiManager: ApiManager;
  apiResourceGroups: ReturnType<typeof apiResourceGroupsInjectable.instantiate>;
  routePathParameters: ReturnType<typeof routePathParametersInjectable.instantiate>;
}

const NonInjectedApiResourcesRoute = observer(
  ({ apiManager, apiResourceGroups, routePathParameters }: Dependencies) => {
    const selectedApiGroup = routePathParameters.get().apiVersion;
    const group = apiResourceGroups.get().find((group) => group.apiVersion === selectedApiGroup);
    const stores = group?.resources
      .map((resource) => {
        const apiGroup = group.apiVersion === "core" ? "" : group.apiVersion;
        const api = apiManager.getApi(
          (api) => api.apiGroup === apiGroup && api.apiResource === resource.name && api.kind === resource.kind,
        );

        if (!api) {
          return undefined;
        }

        return apiManager.getStore(api) as KubeObjectStore<KubeObject> | undefined;
      })
      .filter((store): store is KubeObjectStore<KubeObject> => Boolean(store));
    const uniqueStores = Array.from(new Set(stores ?? []));
    const items = uniqueStores.flatMap((store) => store.contextItems);
    const [store, ...dependentStores] = uniqueStores;

    if (!selectedApiGroup || !group) {
      return (
        <TabLayout>
          <div className="ApiResources">
            <div className="ApiResourcesEmpty">Select an API resource group from the sidebar.</div>
          </div>
        </TabLayout>
      );
    }

    if (!store) {
      return (
        <TabLayout>
          <div className="ApiResources">
            <div className="ApiResourcesEmpty">No registered list view is available for {selectedApiGroup}.</div>
          </div>
        </TabLayout>
      );
    }

    return (
      <TabLayout>
        <KubeObjectListLayout
          key={selectedApiGroup}
          isConfigurable
          tableId={`api-resources-${selectedApiGroup}`}
          className="ApiResources"
          store={store}
          dependentStores={dependentStores}
          items={items}
          resourceName="APIResource"
          sortingCallbacks={{
            name: (item) => item.getName(),
            namespace: (item) => item.getNs() ?? "",
            kind: (item) => item.kind,
            resource: (item) => item.apiVersion,
            age: (item) => -item.getCreationTimestamp(),
          }}
          searchFilters={[(item) => [item.getName(), item.getNs(), item.kind, item.apiVersion, ...item.getLabels()]]}
          renderHeaderTitle={`${selectedApiGroup} resources`}
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: "name", id: "name" },
            { title: "Namespace", className: "namespace", sortBy: "namespace", id: "namespace" },
            { title: "Kind", className: "kind", sortBy: "kind", id: "kind" },
            { title: "API Version", className: "apiVersion", sortBy: "resource", id: "apiVersion" },
            { title: "Age", className: "age", sortBy: "age", id: "age" },
          ]}
          renderTableContents={(item) => [
            <WithTooltip>{item.getName()}</WithTooltip>,
            item.getNs() || "-",
            item.kind,
            item.apiVersion,
            <KubeObjectAge key="age" object={item} />,
          ]}
        />
      </TabLayout>
    );
  },
);

export const ApiResourcesRoute = withInjectables<Dependencies>(NonInjectedApiResourcesRoute, {
  getProps: (di) => ({
    apiManager: di.inject(apiManagerInjectable),
    apiResourceGroups: di.inject(apiResourceGroupsInjectable),
    routePathParameters: di.inject(routePathParametersInjectable, di.inject(apiResourcesRouteInjectable)),
  }),
});
