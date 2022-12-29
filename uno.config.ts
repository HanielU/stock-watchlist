import {
  defineConfig,
  extractorSvelte,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

import { handler as h, variantGetParameter } from "@unocss/preset-mini/utils";

// https://github.com/unocss/unocss/tree/main/packages/vite
// https://github.com/unocss/unocss/tree/main/packages/vite#svelte
// https://github.com/unocss/unocss/tree/main/packages/preset-uno
// https://github.com/unocss/unocss/tree/main/packages/preset-attributify
// https://github.com/unocss/unocss/tree/main/packages/preset-icons
// https://github.com/unocss/unocss/tree/main/packages/transformer-directives
// https://github.com/unocss/unocss/tree/main/packages/transformer-variant-group

// https://github.com/unocss/unocss#configurations
export default defineConfig({
  extractors: [extractorSvelte],

  // https://github.com/unocss/unocss#extend-theme
  theme: {
    // Palette 24
    colors: convertPalleteToHSL({
      primary: {
        "50": "#FFFAEB",
        "100": "#FCEFC7",
        "200": "#F8E3A3",
        "300": "#F9DA8B",
        "400": "#F7D070",
        "500": "#E9B949",
        "600": "#C99A2E",
        "700": "#A27C1A",
        "800": "#7C5E10",
        "900": "#513C06",
      },

      neutral: {
        "50": "#F7F7F7",
        "100": "#E1E1E1",
        "200": "#CFCFCF",
        "300": "#B1B1B1",
        "400": "#9E9E9E",
        "500": "#7E7E7E",
        "600": "#626262",
        "700": "#515151",
        "800": "#3B3B3B",
        "900": "#222222",
      },

      // Supporting
      blue: {
        "50": "#DCEEFB",
        "100": "#B6E0FE",
        "200": "#84C5F4",
        "300": "#62B0E8",
        "400": "#4098D7",
        "500": "#2680C2",
        "600": "#186FAF",
        "700": "#0F609B",
        "800": "#0A558C",
        "900": "#003E6B",
      },

      orange: {
        "50": "#FFEFE6",
        "100": "#FFD3BA",
        "200": "#FAB38B",
        "300": "#EF8E58",
        "400": "#E67635",
        "500": "#C65D21",
        "600": "#AB4E19",
        "700": "#8C3D10",
        "800": "#77340D",
        "900": "#572508",
      },

      red: {
        "50": "#FFEEEE",
        "100": "#FACDCD",
        "200": "#F29B9B",
        "300": "#E66A6A",
        "400": "#D64545",
        "500": "#BA2525",
        "600": "#A61B1B",
        "700": "#911111",
        "800": "#780A0A",
        "900": "#610404",
      },

      green: {
        "50": "#E3F9E5",
        "100": "#C1EAC5",
        "200": "#A3D9A5",
        "300": "#7BC47F",
        "400": "#57AE5B",
        "500": "#3F9142",
        "600": "#2F8132",
        "700": "#207227",
        "800": "#0E5814",
        "900": "#05400A",
      },
    }),
  },

  // https://github.com/unocss/unocss#custom-rules
  rules: [],

  // https://github.com/unocss/unocss#shortcuts
  shortcuts: [
    {
      "page-heading": "mb-8 px-5 font-(secondary semibold) text-(3xl neutral-900) tracking-tight",
    },
    [
      // flex-u stands for flex-utility
      // to avoid mixups with default flex utilities like flex-wrap
      /^flex-u-([a-z]+)-?([a-z]*)$/,
      ([, justify, align]) => `flex justify-${justify} items-${align || "center"}`,
    ],
    // use when width and height values are the same
    [/^square-(.*)$/, ([, v]) => `h-${v} w-${v}`],
  ],

  preflights: [
    {
      getCSS: ({ theme }) => `
      *,
      *::before,
      *::after {
        border-color: ${theme.colors.neutral[100]};
      }

      html,
      body {
        overflow-x: hidden !important;
        height: 100%;
      }

      :root {
        -webkit-tap-highlight-color: transparent;
        position: relative;
        color: ${theme.colors.neutral[300]};
        font-family: OpenSans;
        background-color: ${theme.colors.neutral[50]};
      }
      `,
    },
  ],

  variants: [
    {
      // adds support for "@min-[width]:class" and "@max-[width]:class"
      // or
      // "@min-width:class" and "@max-width:class"
      name: "arbitrary-media-query",
      match(matcher) {
        // prefix with @ to specify that it's a media query
        const minVariant = variantGetParameter("@min-", matcher, [":"]);
        const maxVariant = variantGetParameter("@max-", matcher, [":"]);
        const minHeightVariant = variantGetParameter("@min-h-", matcher, [":"]);
        const maxHeightVariant = variantGetParameter("@max-h-", matcher, [":"]);

        // the order that we check the variants is important
        // because we want to match the most specific one
        const matched =
          (minHeightVariant && {
            type: "min-h",
            variant: minHeightVariant,
          }) ||
          (maxHeightVariant && {
            type: "max-h",
            variant: maxHeightVariant,
          }) ||
          (minVariant && {
            type: "min",
            variant: minVariant,
          }) ||
          (maxVariant && {
            type: "max",
            variant: maxVariant,
          });

        if (matched?.variant) {
          const [match, rest] = matched.variant;
          // this is for extracting the value from the match and
          // makes sure it either has no brackets or has brackets
          const extractedValue =
            h.bracket(match) || (!match.startsWith("[") && !match.endsWith("]") && match) || "";
          const endsWithUnit = /^\d+(em|px|rem)$/.test(extractedValue);
          const isOnlyNum = /^\d+$/.test(extractedValue);

          if (endsWithUnit || isOnlyNum) {
            return {
              matcher: rest,
              handle: (input, next) =>
                next({
                  ...input,
                  parent: `${input.parent ? `${input.parent} $$ ` : ""}@media (${
                    matched.type == "min"
                      ? "min-width"
                      : matched.type == "max"
                      ? "max-width"
                      : matched.type == "min-h"
                      ? "min-height"
                      : "max-height"
                  }:${endsWithUnit ? extractedValue : extractedValue + "px"})`,
                }),
            };
          }
        }
      },
    },

    matcher => {
      const [m1, m2, m3] = ["scrollbar:", "scrollbar-track:", "scrollbar-thumb:"];
      let matchedStr = "";

      if (matcher.startsWith(m1)) {
        matchedStr = m1;
      } else if (matcher.startsWith(m2)) {
        matchedStr = m2;
      } else if (matcher.startsWith(m3)) {
        matchedStr = m3;
      } else {
        return matcher;
      }

      return {
        matcher: matcher.slice(matchedStr.length),
        selector: s =>
          `${s}::-webkit-scrollbar${
            matchedStr == m2 ? "-track" : matchedStr == m3 ? "-thumb" : ""
          }`,
      };
    },
  ],

  // https://github.com/unocss/unocss#using-presets
  presets: [
    presetUno(),
    presetIcons({ scale: 1.2 }),
    presetAttributify(),
    presetWebFonts({
      fonts: {
        sans: "Inter",
        // sans: "Red Hat Display",
        // exo: "Exo",
        // que: "Questrial",
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});

export function convertPalleteToHSL<T extends Record<string, Record<string, string>>>(obj: T) {
  const temp: Record<string, Record<string, string>> = {};
  for (const colorKey in obj) {
    for (const colorShadeKey in obj[colorKey]) {
      if (!temp[colorKey]) {
        temp[colorKey] = {
          [colorShadeKey]: hexToHSL(obj[colorKey][colorShadeKey]),
        };
      } else {
        temp[colorKey][colorShadeKey] = hexToHSL(obj[colorKey][colorShadeKey]);
      }
    }
  }
  return temp as T;
}

function hexToHSL(hex: string, satAndLight?: { s?: number; l?: number }) {
  // convert hex to rgb
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = +("0x" + hex[1] + hex[1]);
    g = +("0x" + hex[2] + hex[2]);
    b = +("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = +("0x" + hex[1] + hex[2]);
    g = +("0x" + hex[3] + hex[4]);
    b = +("0x" + hex[5] + hex[6]);
  }

  // then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0;
  let s = 0;
  let l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `hsl(${h}, ${satAndLight?.s || s}%, ${satAndLight?.l || l}%)`;
}
