import Vue from 'vue';
import Vuetify, { VApp, VMain, VContainer, VIcon, VRow, VCol, VAlert } from 'vuetify/lib';
import en from 'vuetify/src/locale/en';
import colors from 'vuetify/lib/util/colors';
Vue.use(Vuetify, {
  components: {
    VApp,
    VMain,
    VContainer,
    VIcon,
    VRow,
    VCol,
    VAlert,
  },
});

export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    themes: {
      light: {
        primary: colors.purple,
        secondary: colors.grey.darken1,
        accent: colors.shades.black,
        error: colors.red.accent3,
      },
      dark: {
        primary: colors.blue.lighten3,
      },
    },
  },
  lang: {
    locales: { en },
    current: 'en',
  },
});
