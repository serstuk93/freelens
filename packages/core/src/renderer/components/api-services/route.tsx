/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./api-services.scss";

import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { TabLayout } from "../layout/tab-layout-2";
import { KubeObjectListLayout } from "../kube-object-list-layout";

import type { ApiServiceStore } from "./store";

interface Dependencies {
  apiServiceStore: ApiServiceStore;
}

const NonInjectedApiServicesRoute = ({ apiServiceStore }: Dependencies) => (
  <TabLayout>
    <KubeObjectListLayout
      isConfigurable
      tableId="api-services"
      className="ApiServices"
      store={{
        api: apiServiceStore.api,
        get contextItems() {
          return apiServiceStore.contextItems;
        },
        get failedLoading() {
          return apiServiceStore.failedLoading;
        },
        get isLoaded() {
          return apiServiceStore.isLoaded;
        },
        get selectedItems() {
          return apiServiceStore.selectedItems;
        },
        getByPath: (...params) => apiServiceStore.getByPath(...params),
        getTotalCount: (...params) => apiServiceStore.getTotalCount(...params),
        isSelected: (...params) => apiServiceStore.isSelected(...params),
        isSelectedAll: (...params) => apiServiceStore.isSelectedAll(...params),
        loadAll: (...params) => apiServiceStore.loadAll(...params),
        subscribe: () => apiServiceStore.subscribe(),
        toggleSelection: (...params) => apiServiceStore.toggleSelection(...params),
        toggleSelectionAll: (...params) => apiServiceStore.toggleSelectionAll(...params),
        pickOnlySelected: (...params) => apiServiceStore.pickOnlySelected(...params),
        removeItems: async () => {
          // API Services are typically read-only
        },
        removeSelectedItems: async () => {
          // API Services are typically read-only
        },
      }}
      sortingCallbacks={{
        name: (apiService) => apiService.getName(),
        service: (apiService) => apiService.getService() || "",
        available: (apiService) => apiService.getAvailable() ? "true" : "false",
      }}
      searchFilters={[(apiService) => apiService.getSearchFields()]}
      renderHeaderTitle="API Services"
      renderTableHeader={[
        { title: "Name", className: "name", sortBy: "name", id: "name" },
        { title: "Service", className: "service", sortBy: "service", id: "service" },
        { title: "Available", className: "available", sortBy: "available", id: "available" },
      ]}
      renderTableContents={(apiService) => [
        apiService.getName(),
        apiService.getService() || "Local",
        { title: apiService.getAvailable() ? "True" : "False", className: apiService.getAvailable() ? "success" : "error" },
      ]}
    />
  </TabLayout>
);

export const ApiServicesRoute = withInjectables<Dependencies>(NonInjectedApiServicesRoute, {
  getProps: (di) => ({
    apiServiceStore: di.inject(require("./store.injectable").default),
  }),
});
