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
import { Link } from "react-router-dom";
import groupBy from "lodash/groupBy";

import { MenuActions } from "../menu/menu-actions";
import { TabLayout } from "../layout/tab-layout-2";
import { WithTooltip } from "../with-tooltip";
import { formatKubeApiResource } from "../../../common/rbac";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import { showShortInfoNotificationInjectable } from "@freelensapp/notifications";
import apiResourcesRouteInjectable from "../../../common/front-end-routing/routes/cluster/api-resources/api-resources-route.injectable";
import routePathParametersInjectable from "../../routes/route-path-parameters.injectable";

interface ApiResourceItem {
  id: string;
  apiVersion: string;
  apiName: string;
  kind: string;
  namespaced: boolean;
  verbs: string[];
  shortNames?: string[];
}

interface Dependencies {
  hostedCluster: ReturnType<typeof hostedClusterInjectable.instantiate>;
  showShortInfoNotification: (message: string) => void;
  routePathParameters: ReturnType<typeof routePathParametersInjectable.instantiate>;
}

const NonInjectedApiResourcesRoute = observer(({
  hostedCluster,
  showShortInfoNotification,
  routePathParameters,
}: Dependencies) => {
  const [hiddenResourceIds] = React.useState(() => observable.set<string>());
  const [detailsResourceId, setDetailsResourceId] = React.useState<string | undefined>();

  const allResources = (hostedCluster?.knownResources ?? [])
    .map((resource) => ({
      id: formatKubeApiResource(resource),
      apiVersion: resource.group || "core",
      apiName: resource.apiName,
      kind: resource.kind,
      namespaced: resource.namespaced,
      verbs: resource.verbs,
      shortNames: resource.shortNames,
    }))
    .filter((resource) => !hiddenResourceIds.has(resource.id));

  const groupedResources = React.useMemo(
    () => groupBy(allResources, (resource) => resource.apiVersion),
    [allResources],
  );

  const selectedApiVersion = routePathParameters.get().apiVersion;
  const resources = selectedApiVersion ? groupedResources[selectedApiVersion] ?? [] : allResources;
  const resourceCount = resources.length;
  const selectedResource = resources.find((r) => r.id === detailsResourceId);

  const onEditResource = (resource: ApiResourceItem) => {
    showShortInfoNotification(`Editing API resource ${resource.apiName} is not supported.`);
  };

  const onDeleteResource = async (resource: ApiResourceItem) => {
    hiddenResourceIds.add(resource.id);
    if (detailsResourceId === resource.id) {
      setDetailsResourceId(undefined);
    }
  };

  return (
    <TabLayout>
      <div className="ApiResources">
        {!hostedCluster ? (
          <div className="ApiResourcesEmpty">No cluster selected.</div>
        ) : selectedApiVersion ? (
          <>
            <div className="ApiResourcesGroupHeader">
              <Link to="/api-resources" className="ApiResourcesBackLink">
                ← API resource groups
              </Link>
              <div>
                <h2>{selectedApiVersion} resources</h2>
                <p className="ApiResourcesGroupSummary">Showing {resourceCount.toLocaleString()} resource{resourceCount === 1 ? "" : "s"} in this group.</p>
              </div>
            </div>
            <div className="ApiResourcesTable">
              <div className="ApiResourcesTableToolbar">
                <span className="ApiResourcesTableCount">{resourceCount.toLocaleString()} resources</span>
              </div>
              <table className="ApiResourcesTableInner">
                <thead>
                  <tr>
                    <th>API Group</th>
                    <th>Name</th>
                    <th>Kind</th>
                    <th>Namespaced</th>
                    <th>Short Names</th>
                    <th>Verbs</th>
                    <th className="menu-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => (
                    <tr
                      key={resource.id}
                      className={resource.id === selectedResource?.id ? "selected" : undefined}
                      onClick={() => setDetailsResourceId(resource.id)}
                    >
                      <td><WithTooltip>{resource.apiVersion}</WithTooltip></td>
                      <td><WithTooltip>{resource.apiName}</WithTooltip></td>
                      <td><WithTooltip>{resource.kind}</WithTooltip></td>
                      <td className={resource.namespaced ? "namespaced yes" : "namespaced no"}>
                        {resource.namespaced ? "Yes" : "No"}
                      </td>
                      <td><WithTooltip>{resource.shortNames?.join(", ") || ""}</WithTooltip></td>
                      <td><WithTooltip>{resource.verbs.join(", ")}</WithTooltip></td>
                      <td className="menu-column">
                        <MenuActions updateAction={() => onEditResource(resource)} removeAction={() => onDeleteResource(resource)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {resources.length === 0 && (
                <div className="ApiResourcesEmpty">No API resources available for this API group.</div>
              )}
            </div>
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
        ) : (
          <div className="ApiResourcesEmpty">
            <h2>API Resources</h2>
            <p>Select an API group from the sidebar to view its resources.</p>
          </div>
        )}
      </div>
    </TabLayout>
  );
});

export const ApiResourcesRoute = withInjectables<Dependencies>(NonInjectedApiResourcesRoute, {
  getProps: (di) => ({
    hostedCluster: di.inject(hostedClusterInjectable),
    showShortInfoNotification: di.inject(showShortInfoNotificationInjectable),
    routePathParameters: di.inject(routePathParametersInjectable, di.inject(apiResourcesRouteInjectable)),
  }),
});
