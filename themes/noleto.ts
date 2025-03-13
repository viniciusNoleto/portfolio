
import Aura from '@primevue/themes/aura';
import { definePreset } from '@primevue/themes';
import { PRIMARY_COLOR_PALETTE } from '../common/constants/colors';

export const NoletoTheme = definePreset(Aura, {
  semantic: {
    primary: PRIMARY_COLOR_PALETTE,
  },
});