/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./api-resources.scss";

import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { TabLayout } from "../layout/tab-layout-2";
import { observer } from "mobx-react";

import apiResourceGroupsInjectable from "./api-resource-groups.injectable";

interface Dependencies {
  apiResourceGroups: ReturnType<typeof apiResourceGroupsInjectable.instantiate>;
}

const NonInjectedApiResourcesRoute = observer(({ apiResourceGroups }: Dependencies) => {
  const groups = apiResourceGroups.get();

  return (
    <TabLayout>
      <div className="ApiResources">
        <div className="ApiResourcesHeader">
          <h1>API Resources</h1>
          <p>Kubernetes API resources grouped by API version</p>
        </div>
        <div className="ApiResourcesGroups">
          {groups.length === 0 ? (
            <div className="ApiResourcesEmpty">Loading API resources...</div>
          ) : (
            groups.map((group) => (
              <div key={group.apiVersion} className="ApiResourceGroup">
                <h2>{group.apiVersion}</h2>
                <table className="ApiResourcesTable">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Short Names</th>
                      <th>Kind</th>
                      <th>Namespaced</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.resources.map((resource) => (
                      <tr key={`${group.apiVersion}-${resource.name}`}>
                        <td>{resource.name}</td>
                        <td>{resource.shortNames.join(", ") || "-"}</td>
                        <td>{resource.kind}</td>
                        <td>{resource.namespaced ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>
    </TabLayout>
  );
});

export const ApiResourcesRoute = withInjectables<Dependencies>(NonInjectedApiResourcesRoute, {
  getProps: (di) => ({
    apiResourceGroups: di.inject(apiResourceGroupsInjectable),
  }),
});
