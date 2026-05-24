/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Icon } from "@freelensapp/icon";
import { Tooltip, TooltipPosition } from "@freelensapp/tooltip";
import { cssNames } from "@freelensapp/utilities";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React, { useRef, useState } from "react";
import activeHotbarInjectable from "../../../features/hotbar/storage/common/active.injectable";
import switchToNextHotbarInjectable from "../../../features/hotbar/storage/common/switch-to-next.injectable";
import switchToPreviousHotbarInjectable from "../../../features/hotbar/storage/common/switch-to-previous.injectable";
import { Badge } from "../badge";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import styles from "./hotbar-selector.module.scss";
import { HotbarSwitchCommand } from "./hotbar-switch-command";

import type { IComputedValue } from "mobx";

import type { Hotbar } from "../../../features/hotbar/storage/common/hotbar";
import type { SwitchToNextHotbar } from "../../../features/hotbar/storage/common/switch-to-next.injectable";
import type { SwitchToPreviousHotbar } from "../../../features/hotbar/storage/common/switch-to-previous.injectable";

const maxHotbarNameLength = 26;

function limitHotbarName(name: string) {
  return name.length > maxHotbarNameLength ? `${name.slice(0, maxHotbarNameLength)}...` : name;
}

interface Dependencies {
  activeHotbar: IComputedValue<Hotbar | undefined>;
  openCommandOverlay: (component: React.ReactElement) => void;
  switchToPreviousHotbar: SwitchToPreviousHotbar;
  switchToNextHotbar: SwitchToNextHotbar;
}

const NonInjectedHotbarSelector = observer(
  ({
    activeHotbar,
    openCommandOverlay,
    switchToNextHotbar,
    switchToPreviousHotbar,
  }: Dependencies) => {
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const tooltipTimeout = useRef<number>();
    const hotbar = activeHotbar.get();
    const hotbarName = hotbar?.name.get();
    const displayName = hotbarName ? limitHotbarName(hotbarName) : "??";

    function clearTimer() {
      clearTimeout(tooltipTimeout.current);
    }

    function onTooltipShow() {
      setTooltipVisible(true);
      clearTimer();
      tooltipTimeout.current = window.setTimeout(() => setTooltipVisible(false), 1500);
    }

    function onPrevClick() {
      onTooltipShow();
      switchToPreviousHotbar();
    }

    function onNextClick() {
      onTooltipShow();
      switchToNextHotbar();
    }

    function onMouseEvent(event: React.MouseEvent) {
      clearTimer();
      setTooltipVisible(event.type == "mouseenter");
    }

    return (
      <div className={styles.HotbarSelector}>
        <Icon material="arrow_left" className={cssNames(styles.Icon)} onClick={onPrevClick} />
        <div className={styles.HotbarIndex}>
          <Badge
            id="hotbarIndex"
            small
            label={displayName}
            onClick={() => openCommandOverlay(<HotbarSwitchCommand />)}
            expandable={false}
            className={styles.Badge}
            onMouseEnter={onMouseEvent}
            onMouseLeave={onMouseEvent}
            data-testid={`hotbar-menu-badge-for-${hotbar?.name.get()}`}
          />
          <Tooltip
            visible={tooltipVisible}
            targetId="hotbarIndex"
            preferredPositions={[TooltipPosition.TOP, TooltipPosition.TOP_LEFT]}
            data-testid={`hotbar-menu-badge-tooltip-for-${hotbar?.name.get()}`}
          >
            {hotbarName}
          </Tooltip>
        </div>
        <Icon material="arrow_right" className={styles.Icon} onClick={onNextClick} />
      </div>
    );
  },
);

export const HotbarSelector = withInjectables<Dependencies>(NonInjectedHotbarSelector, {
  getProps: (di, props) => ({
    ...props,
    openCommandOverlay: di.inject(commandOverlayInjectable).open,
    activeHotbar: di.inject(activeHotbarInjectable),
    switchToNextHotbar: di.inject(switchToNextHotbarInjectable),
    switchToPreviousHotbar: di.inject(switchToPreviousHotbarInjectable),
  }),
});
