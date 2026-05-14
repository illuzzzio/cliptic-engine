import React from "react";
import { Composition } from "remotion";
import { ShortClipComposition, ShortClipCompositionProps } from "../components/remotion/ShortClipComposition";
import {
  DEFAULT_CAPTION_FONT_FAMILY,
  DEFAULT_CAPTION_SIZE,
  DEFAULT_CAPTION_STYLE_KEY,
} from "../lib/config/caption-styles";

const defaultProps: ShortClipCompositionProps = {
  videoUrl: "",
  clip: {
    id: "preview",
    projectId: "preview",
    title: "Preview",
    startTime: 0,
    endTime: 30,
    duration: 30,
    captions: [],
    captionStyleKey: DEFAULT_CAPTION_STYLE_KEY,
    captionFontFamily: DEFAULT_CAPTION_FONT_FAMILY,
    captionSize: DEFAULT_CAPTION_SIZE,
  },
  captionStyleKey: DEFAULT_CAPTION_STYLE_KEY,
  captionFontFamily: DEFAULT_CAPTION_FONT_FAMILY,
  captionSize: DEFAULT_CAPTION_SIZE,
};

export function RemotionRoot() {
  return (
    <Composition
      id="ShortClip"
      component={ShortClipComposition}
      durationInFrames={900}
      fps={30}
      width={720}
      height={1280}
      defaultProps={defaultProps}
    />
  );
}
