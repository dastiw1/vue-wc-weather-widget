<template>
  <v-app id="app">
    <v-main>
      <v-container class="main-container">
        <v-icon v-if="view === 'cities'" class="settings-icon" @click="changeView('settings')">mdi-cog-outline</v-icon>
        <v-icon v-if="view === 'settings'" class="settings-icon" @click="changeView('cities')">mdi-close</v-icon>

        <!-- BODY -->

        <v-row v-if="view === 'cities'" class="">
          <v-col v-if="geolocationAllowed === true || cities.length > 0" cols="12" class="px-6">
            <city-widget v-for="city in cities" :city="city" :key="city.coords.lat + '-' + city.coords.lon" />
          </v-col>
          <v-col v-else cols="12" class="px-6">
            <v-alert dense class="mt-9" type="error"
              >Geolocation is not enabled. Please enable to use detect your city</v-alert
            >
          </v-col>
        </v-row>
        <settings :cities="cities" v-if="view === 'settings'" @add="addCity" @remove="removeCity" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// Ensure you are using css-loader
import Vuetify from 'vuetify/lib';
import draggable from 'vuedraggable';
import store from './store';
import CityWidget from '@/components/CityWeather.vue';
import Settings from '@/components/Settings.vue';
import { getAddressFromCoords } from '@/api/google';
import vuetify from '@/plugins/vuetify';

const loadStylesheets = () => {
  const idPrefix = 'weather-widget__';
  const stylesheets: Record<string, string> = {
    mdi: '//cdn.materialdesignicons.com/5.4.55/css/materialdesignicons.min.css',
  };

  Object.keys(stylesheets).forEach((cssId: string) => {
    const url = stylesheets[cssId];
    const fullId = idPrefix + cssId;
    if (!document.getElementById(fullId)) {
      const head = document.getElementsByTagName('head')[0];
      const link = document.createElement('link');
      link.id = fullId;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = url;
      link.media = 'all';
      head.appendChild(link);
    }
  });
};

@Component({
  components: { draggable, CityWidget, Settings },
})
export default class App extends Vue {
  view!: string;
  geolocationAllowed!: boolean;
  vuetify!: Vuetify;
  constructor() {
    super();
    this.$vuetify = vuetify.framework;
  }
  data() {
    return {
      view: 'cities',
      geolocationAllowed: null,
    };
  }

  created() {
    this.init();
    loadStylesheets();
  }

  get cities() {
    return store.state.cities;
  }

  changeView(view: string) {
    this.view = view;
    if (view === 'cities' && this.cities.length === 0) {
      this.init();
    }
  }

  public addCity(city: City) {
    return store.commit('addCity', city);
  }

  public removeCity(city: City) {
    return store.commit('removeCity', city);
  }

  async init() {
    if (!this.cities.length) {
      try {
        const city = await this.getCurrentPosition();
        this.addCity(city);
      } catch (error) {
        alert('Geolocation is not allowed!');
      }
    }
  }

  getCurrentPosition(): Promise<City> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          this.geolocationAllowed = true;
          await getAddressFromCoords(latitude, longitude).then((data) => {
            const cityRecord = data.address_components.find((r) => r.types.includes('locality'));
            const countryRecord = data.address_components.find((r) => r.types.includes('country'));

            if (cityRecord != null) {
              const city: City = {
                name: cityRecord.short_name,
                country: {
                  code: countryRecord?.short_name || 'NONE',
                },
                coords: {
                  lat: data.geometry.location.lat,
                  lon: data.geometry.location.lng,
                },
              };
              resolve(city);
            }

            reject('User not in the city');
          });
        },
        (error) => {
          reject(error.message);
          this.geolocationAllowed = false;
        }
      );
    });
  }
}
</script>

<style lang="css">
@import '~@mdi/font/css/materialdesignicons.css';
@import '~vuetify/dist/vuetify.css';
/* @import '//cdn.materialdesignicons.com/5.4.55/css/materialdesignicons.min.css'; */
</style>

<style lang="scss">
 
#app {
  width: 280px;
   box-sizing: border-box;
  /* All browsers without overlaying scrollbars */
  -webkit-text-size-adjust: 100%;
  /* Prevent adjustments of font size after orientation changes in iOS */
  word-break: normal;
  -moz-tab-size: 4;
  tab-size: 4;
  .main-container {
    position: relative;
    .settings-icon {
      position: absolute;
      right: 20px;
      top: 10px;
      cursor: pointer;
    }

    .city-inpu-item {
      background-color: rgb(240, 233, 233);
    }
  }
}
</style>
