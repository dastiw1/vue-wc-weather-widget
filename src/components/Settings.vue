<template>
  <v-row class="">
    <v-col cols="12" class="px-6">
      <div class="font-weight-bold pb-6">Settings</div>
      <draggable v-model="citiesList" class="cities-list__container">
        <v-text-field
          v-for="city in cities"
          :key="city.coords.lat + '-' + city.coords.lon"
          readonly
          class="city-inpu-item mb-4"
          :value="`${city.name}, ${city.country.code}`"
          hide-details=""
          dense
          outlined
        >
          <template v-slot:prepend-inner="">
            <v-icon>mdi-reorder-horizontal</v-icon>
          </template>
          <template v-slot:append="">
            <v-icon @click="removeCity(city)">mdi-trash-can-outline</v-icon>
          </template>
        </v-text-field>
      </draggable>
    </v-col>
    <v-col cols="12" class="px-6">
      <v-subheader class="black--text pl-0 pb-0 font-weight-bold">Add Location:</v-subheader>
      <v-text-field v-model="newCityName" hide-details="" dense outlined @keyup.enter="handleEnteringNewCity">
        <template v-slot:append="">
          <v-icon @click="handleEnteringNewCity">mdi-subdirectory-arrow-left</v-icon>
        </template>
      </v-text-field>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { fetchWeatherByCityName } from '@/api/openweather';
import { Component, Vue } from 'vue-property-decorator';
import draggable from 'vuedraggable';
import { mapMutations, mapState } from 'vuex';

@Component({
  components: { draggable },
  computed: {
    ...mapState(['cities']),
  },
  methods: mapMutations(['removeCity', 'addCity']),
})
export default class Settings extends Vue {
  cities!: City[];
  newCityName!: string;
  data() {
    return {
      newCityName: '',
    };
  }

  public get citiesList() {
    return this.cities;
  }

  public set citiesList(cities: City[]) {
    this.$store.commit('setCities', cities);
  }

  async handleEnteringNewCity() {
    try {
      const data = await fetchWeatherByCityName(this.newCityName);

      const city: City = {
        name: data.name,
        country: {
          code: data.sys.country,
        },
        coords: data.coord,
      };

      this.$store.commit('addCity', city);
    } catch (error) {
      alert('No city found!');
    } finally {
      this.newCityName = '';
    }
  }
}
</script>

<style lang="scss"></style>
