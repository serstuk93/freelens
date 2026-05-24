/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./api-resources.scss";

import { KubeApi } from "@freelensapp/kube-api";
import { maybeKubeApiInjectable } from "@freelensapp/kube-api-specifics";
import { KubeObject } from "@freelensapp/kube-object";
import { logErrorInjectionToken, logInfoInjectionToken, logWarningInjectionToken } from "@freelensapp/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import apiResourcesRouteInjectable from "../../../common/front-end-routing/routes/cluster/api-resources/api-resources-route.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import createCustomResourceStoreInjectable from "../../../common/k8s-api/api-manager/create-custom-resource-store.injectable";
import { TabLayout } from "../layout/tab-layout-2";
import routePathParametersInjectable from "../../routes/route-path-parameters.injectable";
import { KubeObjectAge } from "../kube-object/age";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { WithTooltip } from "../with-tooltip";
import apiResourceGroupsInjectable from "./api-resource-groups.injectable";

import type { ApiManager } from "../../../common/k8s-api/api-manager/api-manager";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";

interface ApiResourceDescriptor {
  group: string;
  kind: string;
  name: string;
  namespaced: boolean;
  version: string;
}

type CreateApiResourceStore = (resource: ApiResourceDescriptor) => KubeObjectStore<KubeObject>;

interface Dependencies {
  apiManager: ApiManager;
  apiResourceGroups: ReturnType<typeof apiResourceGroupsInjectable.instantiate>;
  createApiResourceStore: CreateApiResourceStore;
  routePathParameters: ReturnType<typeof routePathParametersInjectable.instantiate>;
}

const NonInjectedApiResourcesRoute = observer(
  ({ apiManager, apiResourceGroups, createApiResourceStore, routePathParameters }: Dependencies) => {
    const selectedApiGroup = routePathParameters.get().apiVersion;
    const group = apiResourceGroups.get().find((group) => group.apiVersion === selectedApiGroup);
    const stores = React.useMemo(() => {
      if (!group) {
        return [];
      }

      return group.resources
        .map((resource) => {
          const apiGroup = group.apiVersion === "core" ? "" : group.apiVersion;
          const api = apiManager.getApi(
            (api) => api.apiGroup === apiGroup && api.apiResource === resource.name && api.kind === resource.kind,
          );

          if (api) {
            return apiManager.getStore(api) as KubeObjectStore<KubeObject> | undefined;
          }

          if (!resource.version || !resource.verbs?.includes("list") || resource.name.includes("/")) {
            return undefined;
          }

          return createApiResourceStore({
            group: apiGroup,
            kind: resource.kind,
            name: resource.name,
            namespaced: resource.namespaced,
            version: resource.version,
          });
        })
        .filter((store): store is KubeObjectStore<KubeObject> => Boolean(store));
    }, [apiManager, createApiResourceStore, group]);
    const uniqueStores = Array.from(new Set(stores));
    const items = uniqueStores.flatMap((store) => store.contextItems);
    const hasListableResources = group?.resources.some((resource) => resource.verbs?.includes("list")) ?? false;
    const nonListableDisplayStore = React.useMemo(() => {
      const resource = group?.resources.find((resource) => resource.version);

      if (!group || hasListableResources || !resource?.version) {
        return undefined;
      }

      return createApiResourceStore({
        group: group.apiVersion === "core" ? "" : group.apiVersion,
        kind: resource.kind,
        name: resource.name,
        namespaced: resource.namespaced,
        version: resource.version,
      });
    }, [createApiResourceStore, group, hasListableResources]);
    const [primaryStore, ...dependentStores] = uniqueStores;
    const store = primaryStore ?? nonListableDisplayStore;

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
          subscribeStores={hasListableResources}
          isReady={!hasListableResources || store.isLoaded}
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
    createApiResourceStore: (() => {
      const createCustomResourceStore = di.inject(createCustomResourceStoreInjectable);
      const logError = di.inject(logErrorInjectionToken);
      const logInfo = di.inject(logInfoInjectionToken);
      const logWarn = di.inject(logWarningInjectionToken);
      const maybeKubeApi = di.inject(maybeKubeApiInjectable);

      return (resource) => {
        const apiBase = resource.group
          ? `/apis/${resource.group}/${resource.version}/${resource.name}`
          : `/api/${resource.version}/${resource.name}`;
        const objectConstructor = class extends KubeObject {
          static readonly kind = resource.kind;
          static readonly namespaced = resource.namespaced;
          static readonly apiBase = apiBase;
        };
        const api = new KubeApi(
          {
            logError,
            logInfo,
            logWarn,
            maybeKubeApi,
          },
          { objectConstructor },
        );

        return createCustomResourceStore(api);
      };
    })(),
    routePathParameters: di.inject(routePathParametersInjectable, di.inject(apiResourcesRouteInjectable)),
  }),
});
