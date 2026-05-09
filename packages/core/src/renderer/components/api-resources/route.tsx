/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./api-resources.scss";

import { withInjectables } from "@ogre-tools/injectable-react";
import { observable } from "mobx";
import React from "react";
import { observer } from "mobx-react";

import { MenuActions } from "../menu/menu-actions";
import { ItemListLayout, type ItemListStore } from "../item-object-list";
import { TabLayout } from "../layout/tab-layout-2";
import { WithTooltip } from "../with-tooltip";
import { formatKubeApiResource } from "../../../common/rbac";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import { showShortInfoNotificationInjectable } from "@freelensapp/notifications";

interface ApiResourceItem {
  id: string;
  apiVersion: string;
  apiName: string;
  kind: string;
  namespaced: boolean;
  verbs: string[];
  shortNames?: string[];
  getId: () => string;
  getName: () => string;
}

interface Dependencies {
  hostedCluster: ReturnType<typeof hostedClusterInjectable.instantiate>;
  showShortInfoNotification: (message: string) => void;
}

const NonInjectedApiResourcesRoute = observer(({ hostedCluster, showShortInfoNotification }: Dependencies) => {
  const isClusterReady = hostedCluster?.ready.get() ?? false;
  const [selectedResourceIds] = React.useState(() => observable.set<string>());
  const [hiddenResourceIds] = React.useState(() => observable.set<string>());
  const [detailsResourceId, setDetailsResourceId] = React.useState<string | undefined>();

  const resources = (hostedCluster?.knownResources ?? [])
    .map((resource) => ({
      id: formatKubeApiResource(resource),
      apiVersion: resource.group || "core",
      apiName: resource.apiName,
      kind: resource.kind,
      namespaced: resource.namespaced,
      verbs: resource.verbs,
      shortNames: resource.shortNames,
      getId: () => formatKubeApiResource(resource),
      getName: () => resource.apiName,
    }))
    .filter((resource) => !hiddenResourceIds.has(resource.id))
    .sort((a, b) => a.apiVersion.localeCompare(b.apiVersion));

  const selectedResource = resources.find((r) => r.id === detailsResourceId);

  const store: ItemListStore<ApiResourceItem, false> = React.useMemo(
    () => ({
      get isLoaded() {
        return isClusterReady;
      },

      failedLoading: false,

      getTotalCount: () => resources.length,

      toggleSelection: (resource) => {
        if (selectedResourceIds.has(resource.id)) {
          selectedResourceIds.delete(resource.id);
        } else {
          selectedResourceIds.add(resource.id);
        }
      },

      isSelectedAll: (items) => items.length > 0 && items.every((item) => selectedResourceIds.has(item.id)),

      toggleSelectionAll: (items) => {
        const shouldSelect = !items.every((item) => selectedResourceIds.has(item.id));

        if (shouldSelect) {
          items.forEach((item) => selectedResourceIds.add(item.id));
        } else {
          items.forEach((item) => selectedResourceIds.delete(item.id));
        }
      },

      isSelected: (resource) => selectedResourceIds.has(resource.id),

      pickOnlySelected: (items) => items.filter((item) => selectedResourceIds.has(item.id)),

      removeSelectedItems: async () => {
        const selected = resources.filter((item) => selectedResourceIds.has(item.id));

        selected.forEach((item) => {
          hiddenResourceIds.add(item.id);
          selectedResourceIds.delete(item.id);
        });
      },
    }),
    [resources, selectedResourceIds, hiddenResourceIds, isClusterReady],
  );

  const onEditResource = (resource: ApiResourceItem) => {
    showShortInfoNotification(`Editing API resource ${resource.apiName} is not supported.`);
  };

  const onDeleteResource = async (resource: ApiResourceItem) => {
    hiddenResourceIds.add(resource.id);
    selectedResourceIds.delete(resource.id);
  };

  return (
    <TabLayout>
      <div className="ApiResources">
        {!hostedCluster ? (
          <div className="ApiResourcesEmpty">No cluster selected.</div>
        ) : (
          <>
            <ItemListLayout<ApiResourceItem, false>
              className="ApiResourcesTable"
              tableId="api-resources"
              getItems={() => resources}
              store={store}
              preloadStores={false}
              isConfigurable
              isReady={isClusterReady}
              hasDetailsView
              detailsItem={selectedResource}
              onDetails={(resource) => setDetailsResourceId(resource.id)}
              searchFilters={[(resource) => resource.apiVersion, (resource) => resource.apiName, (resource) => resource.kind]}
              tableProps={{
                noItems: <div className="ApiResourcesEmpty">No API resources available for this cluster.</div>,
                sortByDefault: { sortBy: "apiVersion", orderBy: "asc" },
              }}
              sortingCallbacks={{
                apiVersion: (resource) => resource.apiVersion,
                apiName: (resource) => resource.apiName,
                kind: (resource) => resource.kind,
                namespaced: (resource) => resource.namespaced ? 1 : 0,
                shortNames: (resource) => resource.shortNames?.join(", ") || "",
                verbs: (resource) => resource.verbs.join(", "),
              }}
              renderHeaderTitle="API Resources"
              renderTableHeader={[
                { title: "API Group", className: "api-version", sortBy: "apiVersion", id: "apiVersion" },
                { title: "Name", className: "name", sortBy: "apiName", id: "apiName" },
                { title: "Kind", className: "kind", sortBy: "kind", id: "kind" },
                { title: "Namespaced", className: "namespaced", sortBy: "namespaced", id: "namespaced" },
                { title: "Short Names", className: "short-names", sortBy: "shortNames", id: "shortNames" },
                { title: "Verbs", className: "verbs", sortBy: "verbs", id: "verbs" },
              ]}
              renderTableContents={(resource) => [
                <WithTooltip>{resource.apiVersion}</WithTooltip>,
                <WithTooltip>{resource.apiName}</WithTooltip>,
                <WithTooltip>{resource.kind}</WithTooltip>,
                { title: resource.namespaced ? "Yes" : "No", className: resource.namespaced ? "namespaced yes" : "namespaced no" },
                <WithTooltip>{resource.shortNames?.join(", ") || ""}</WithTooltip>,
                <WithTooltip>{resource.verbs.join(", ")}</WithTooltip>,
              ]}
              renderItemMenu={(resource) => (
                <MenuActions updateAction={() => onEditResource(resource)} removeAction={() => onDeleteResource(resource)} />
              )}
              failedToLoadMessage="Failed to load API resources"
              spinnerTestId="api-resources-spinner"
            />
            {selectedResource && (
              <div className="ApiResourceDetails">
                <div className="ApiResourceDetailsPanel">
                  <div className="ApiResourceDetailsHeader">
                    <h3>{selectedResource.apiName}</h3>
                    <button onClick={() => setDetailsResourceId(undefined)}>×</button>
                  </div>
                  <div className="ApiResourceDetailsContent">
                    <div className="DetailRow">
                      <div className="DetailLabel">API Group:</div>
                      <div className="DetailValue">{selectedResource.apiVersion}</div>
                    </div>
                    <div className="DetailRow">
                      <div className="DetailLabel">Kind:</div>
                      <div className="DetailValue">{selectedResource.kind}</div>
                    </div>
                    <div className="DetailRow">
                      <div className="DetailLabel">Namespaced:</div>
                      <div className="DetailValue">{selectedResource.namespaced ? "Yes" : "No"}</div>
                    </div>
                    <div className="DetailRow">
                      <div className="DetailLabel">Short Names:</div>
                      <div className="DetailValue">{selectedResource.shortNames?.join(", ") || "None"}</div>
                    </div>
                    <div className="DetailRow">
                      <div className="DetailLabel">Verbs:</div>
                      <div className="DetailValue">{selectedResource.verbs.join(", ")}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </TabLayout>
  );
});

export const ApiResourcesRoute = withInjectables<Dependencies>(NonInjectedApiResourcesRoute, {
  getProps: (di) => ({
    hostedCluster: di.inject(hostedClusterInjectable),
    showShortInfoNotification: di.inject(showShortInfoNotificationInjectable),
  }),
});
