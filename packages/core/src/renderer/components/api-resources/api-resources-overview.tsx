import "./api-resources-overview.scss";

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import { Icon } from "@freelensapp/icon";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";

interface ApiResourceGroup {
  title: string;
  icon: string;
  resources: Array<{
    name: string;
    kind: string;
    namespaced: boolean;
    verbs?: string[];
    shortNames?: string[];
  }>;
}

interface Dependencies {
  hostedCluster: any;
}

const NonInjectedApiResourcesOverview = observer(({
  hostedCluster,
}: Dependencies) => {
  const groups: ApiResourceGroup[] = React.useMemo(() => {
    const resources = hostedCluster?.knownResources ?? [];
    const groupsMap = new Map<string, ApiResourceGroup["resources"]>();

    for (const resource of resources) {
      const apiVersion = resource.group || "core";
      const resourcesByGroup = groupsMap.get(apiVersion) ?? [];

      resourcesByGroup.push({
        name: resource.apiName,
        kind: resource.kind,
        namespaced: resource.namespaced,
        verbs: resource.verbs,
        shortNames: resource.shortNames,
      });

      groupsMap.set(apiVersion, resourcesByGroup);
    }

    return Array.from(groupsMap, ([apiVersion, resources]) => ({
      title: apiVersion,
      icon: "api",
      resources: resources.sort((a, b) => a.name.localeCompare(b.name)),
    })).sort((a, b) => a.title.localeCompare(b.title));
  }, [hostedCluster?.knownResources]);

  return (
    <div className="ApiResourcesOverview">
      <div className="groups">
        {groups.map((group) => (
          <div key={group.title} className="group">
            <div className="group-header">
              <Icon material={group.icon} />
              <h3>{group.title}</h3>
            </div>
            <div className="group-items">
              {group.resources.map((resource) => (
                <div
                  key={resource.name}
                  className="group-item"
                  title={`${resource.kind} (${resource.namespaced ? 'Namespaced' : 'Cluster'})`}
                >
                  <div className="resource-info">
                    <span className="resource-name">{resource.name}</span>
                    <span className="resource-kind">{resource.kind}</span>
                    {resource.shortNames && resource.shortNames.length > 0 && (
                      <span className="resource-shortnames">
                        ({resource.shortNames.join(', ')})
                      </span>
                    )}
                  </div>
                  <div className="resource-meta">
                    {resource.namespaced ? (
                      <span className="namespaced-badge">NS</span>
                    ) : (
                      <span className="cluster-badge">CL</span>
                    )}
                    {resource.verbs && (
                      <span className="verbs-count">{resource.verbs.length} verbs</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export const ApiResourcesOverview = withInjectables<Dependencies>(NonInjectedApiResourcesOverview, {
  getProps: (di) => ({
    hostedCluster: di.inject(hostedClusterInjectable),
  }),
});
