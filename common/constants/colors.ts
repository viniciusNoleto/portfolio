
import Color from 'color';


export const PRIMARY_COLOR = '#6057e0';

export const PRIMARY_COLOR_PALETTE = colorVariations(PRIMARY_COLOR);


function lighten (clr: string, val: number) {
  return Color(clr).lighten(val).hex()
};

function darken (clr: string, val: number) {
  return Color(clr).darken(val).hex()
};


function colorVariations(color: string) {
  return {
    50: lighten(color, 0.5),
    100: lighten(color, 0.4),
    200: lighten(color, 0.3),
    300: lighten(color, 0.2),
    400: lighten(color, 0.1),
    500: color,
    600: darken(color, 0.1),
    700: darken(color, 0.2),
    800: darken(color, 0.3),
    900: darken(color, 0.4),
    950: darken(color, 0.5),
  };
};