/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useRef, useLayoutEffect, useState } from "react";

import { cssNames } from "@freelensapp/utilities";
import randomColor from "randomcolor";
//import React from "react";
// import { computeDefaultShortName } from "../../../common/catalog/helpers";
import styles from "./avatar.module.scss";

import type { StrictReactNode } from "@freelensapp/utilities";

import type { ImgHTMLAttributes, MouseEventHandler } from "react";

export interface AvatarProps {
  title: string;
  colorHash?: string;
  size?: number;
  src?: string;
  background?: string;
  variant?: "circle" | "rounded" | "square";
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
  disabled?: boolean;
  children?: StrictReactNode;
  className?: string;
  id?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  "data-testid"?: string;
}

export const Avatar = ({
  title,
  variant = "rounded",
  size = 32,
  colorHash,
  children,
  background,
  imgProps,
  src,
  className,
  disabled,
  id,
  onClick,
  "data-testid": dataTestId,
}: AvatarProps) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [twoLines, setTwoLines] = useState(false);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (el) {
      setTwoLines(el.scrollWidth > el.clientWidth);
    }
  }, [title, size]);

  // Adjust height: 1 line = size px, 2 lines = size * 1.8 px (adjust as needed)
 // const avatarHeight = twoLines ? size * 1.8 : size;

  return (
    <div
      className={cssNames(
        styles.Avatar,
        {
          [styles.circle]: variant == "circle",
          [styles.rounded]: variant == "rounded",
          [styles.disabled]: disabled,
        },
        className,
      )}
      style={{
        width: `${size * 2.5}px`,
        height: size, //`${avatarHeight}px`,
        background: background || (src ? "transparent" : randomColor({ seed: colorHash, luminosity: "dark" })),
      }}
      id={id}
      onClick={onClick}
      data-testid={dataTestId}
    >
      {src ? (
        <img src={src} {...imgProps} alt={title} />
      ) : children ? (
        children
      ) : (
        <span
          ref={textRef}
          className={cssNames(styles.text, {
            [styles.oneLine]: !twoLines,
            [styles.twoLines]: twoLines,
          })}
          title={title}
          style={{
            //display: "block",
          
            width: "100%",
            textAlign: "center",
          //   whiteSpace: "normal",           // allow wrapping
            wordBreak: "break-all",        // break long words
            overflowWrap: "break-word",
            whiteSpace: twoLines ? "normal" : "nowrap",
          }}
        >
          {title}
        </span>
      )}
    </div>
  );
};
