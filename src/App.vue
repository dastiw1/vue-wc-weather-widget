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
        <settings v-if="view === 'settings'" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import draggable from 'vuedraggable';
import store from './store';
import CityWidget from '@/components/CityWeather.vue';
import Settings from '@/components/Settings.vue';
import { getAddressFromCoords } from '@/api/google';
import { mapMutations, mapState } from 'vuex';

@Component({
  components: { draggable, CityWidget, Settings },
  computed: {
    ...mapState(['cities']),
  },
  methods: mapMutations(['removeCity', 'addCity']),
})
export default class App extends Vue {
  cities!: City[];
  view!: string;
  geolocationAllowed!: boolean;

  data() {
    return {
      view: 'cities',
      geolocationAllowed: null,
    };
  }

  created() {
    this.$store.registerModule('app', store);
    this.init();
  }

  changeView(view: string) {
    this.view = view;
    if (view === 'cities' && this.cities.length === 0) {
      this.init();
    }
  }

  async init() {
    if (!this.cities.length) {
      try {
        const city = await this.getCurrentPosition();
        this.$store.commit('addCity', city);
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
            console.log('google data', data);

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
          console.log(error.message);
          reject(error.message);
          this.geolocationAllowed = false;
        }
      );
    });
  }
}
</script>

<style lang="scss">
#app {
  width: 280px;
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
