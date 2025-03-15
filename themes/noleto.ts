
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { PRIMARY_COLOR_PALETTE } from '../common/constants/colors';

export const NoletoTheme = definePreset(Aura, {
  semantic: {
    primary: PRIMARY_COLOR_PALETTE,
  },
});