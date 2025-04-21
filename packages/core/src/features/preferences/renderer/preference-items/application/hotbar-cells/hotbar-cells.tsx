/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { Input, InputValidators } from "../../../../../../renderer/components/input";
import { observer } from "mobx-react";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";
import { minHotbarCells, defaultHotbarCells, setDefaultHotbarCells } from "../../../../../../features/hotbar/storage/common/types";
import switchToNextHotbarInjectable from "../../../../../../features/hotbar/storage/common/switch-to-next.injectable";
import switchToPreviousHotbarInjectable from "../../../../../../features/hotbar/storage/common/switch-to-previous.injectable";


interface Dependencies {
  state: UserPreferencesState;
  switchToNextHotbar: () => void;
  switchToPreviousHotbar: () => void;
}

const NonInjectedHotbarCells = observer(({ state, switchToNextHotbar, switchToPreviousHotbar }: Dependencies) => {
  const [hotbarCells, setHotbarCells] = React.useState(defaultHotbarCells.toString());

  const handleHotbarCellsChange = (value: string) => {
    const newHotbarCells = Number(value);

    setHotbarCells(value);
    setDefaultHotbarCells(newHotbarCells);

    switchToNextHotbar();
    switchToPreviousHotbar();
  };


  return (
    <section>
      <SubTitle title="Hotbar Cells Amount" />
      <Input
        theme="round-black"
        type="number"
        min={minHotbarCells}
        validators={InputValidators.isNumber}
        value={hotbarCells}
        onChange={value => {
          setHotbarCells(value);
          setDefaultHotbarCells(Number(value));
          handleHotbarCellsChange(value);
        }}
      />
      {}
    </section>
  );
});

export const HotbarCells = withInjectables<Dependencies>(NonInjectedHotbarCells, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
    switchToNextHotbar: di.inject(switchToNextHotbarInjectable),
    switchToPreviousHotbar: di.inject(switchToPreviousHotbarInjectable),
  }),
});

