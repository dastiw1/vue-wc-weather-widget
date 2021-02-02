<template>
  <v-row class="">
    <v-col cols="12" class="px-6">
      <div class="font-weight-bold pb-6">Settings</div>
      <draggable v-model="citiesList" class="cities-list__container" :options="{ handle: '.handle' }" >
        <v-text-field
          v-for="city in cities"
          :key="city.coords.lat + '-' + city.coords.lon"
          readonly
          class="city-input-item mb-4"
          :value="`${city.name}, ${city.country.code}`"
          hide-details=""
          dense
          outlined
        >
          <template v-slot:prepend-inner="">
            <v-icon class="handle">mdi-reorder-horizontal</v-icon>
          </template>
          <template v-slot:append="">
            <v-icon @click="$emit('remove', city)">mdi-trash-can-outline</v-icon>
          </template>
        </v-text-field>
      </draggable>
    </v-col>
    <v-col cols="12" class="px-6">
      <v-form  ref="form" @submit.prevent="handleEnteringNewCity">
        <v-subheader class="black--text pl-0 pb-0 font-weight-bold">Add Location:</v-subheader>
        <v-text-field
          v-model="newCityName"
          hide-details=""
          dense
          outlined
          :rules="inputRules"
        >
          <template v-slot:append="">
            <v-icon @click="handleEnteringNewCity">mdi-subdirectory-arrow-left</v-icon>
          </template>
        </v-text-field>
      </v-form>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import draggable from 'vuedraggable';

import { fetchWeatherByCityName } from '@/api/openweather';
import store from '@/store';

type VForm = Vue & {
  validate(): boolean;
};

@Component({
  components: { draggable },
  props: {
    cities: {
      type: Array,
      required: true,
    },
  },
})
export default class Settings extends Vue {
  cities!: City[];
  newCityName!: string;
  $refs!: {
    form: VForm;
  };
  data() {
    return {
      newCityName: '',
      inputRules: [(v: string) => (v != null && v != '') || 'Please enter city name'],
    };
  }

  public get citiesList() {
    return this.cities;
  }

  public set citiesList(cities: City[]) {
    store.commit('setCities', cities);
  }

  async handleEnteringNewCity() {
    if (!this.$refs.form.validate()) {
      return false;
    }
    try {
      const data = await fetchWeatherByCityName(this.newCityName);

      const city: City = {
        name: data.name,
        country: {
          code: data.sys.country,
        },
        coords: data.coord,
      };

      this.$emit('add', city);
    } catch (error) {
      alert('No city found!');
    } finally {
      this.newCityName = '';
    }
  }

}
</script>

<style lang="scss">
.city-input-item {
  &__handler {
    cursor: move;
  }
}
</style>
