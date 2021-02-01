<template>
  <v-sheet class="city-item mb-4" width="240" v-if="weather">
    <v-row>
      <v-col cols="12" class="font-weight-bold px-0"> {{ city.name }}, {{ city.country.code }} </v-col>
      <v-col cols="12">
        <v-row class="align-center">
          <v-col class="pa-0 d-flex" cols="6">
            <v-img height="100" width="100" :src="iconSrc" />
          </v-col>

          <v-col class="pa-0" cols="6">
            <h1 class="font-weight-bold">{{ weather.temp.toFixed(0) }}°C</h1></v-col
          >
        </v-row>
      </v-col>
      <v-col cols="12" class="px-0"> Feels like {{ weather.feels_like }}°C, {{ weather.text }} </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" class="px-0">
        <v-icon size="18">mdi-windsock</v-icon>
        {{ weather.wind.speed.toFixed(1) }}m/s {{ weatherWindDir }}
      </v-col>
      <v-col cols="6" class="px-0"> <v-icon size="18">mdi-gauge</v-icon> {{ weather.pressure }}hPa</v-col>
    </v-row>
    <v-row>
      <v-col cols="6" class="px-0">Humidity: {{ weather.humidity }}%</v-col>
      <v-col cols="6" class="px-0">Dew point: {{ dewPoint }}°C</v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="px-0"> Visibility: {{ (this.weather.visibility / 1000).toFixed(1) }}km </v-col>
    </v-row>
  </v-sheet>
</template>

<script lang="ts">
import { fetchWeatherByCoordinates } from '@/api/openweather';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  props: {
    city: {
      type: Object,
      required: true,
    },
  },
  components: {},
})
export default class CityWidget extends Vue {
  city!: City;
  weather!: Nullable<CityWeather>;

  data(): Data {
    return {
      weather: null,
    };
  }

  created() {
    this.getWeather();
  }

  get weatherWindDir() {
    if (this.weather) {
      const compassSector = [
        'N',
        'NNE',
        'NE',
        'ENE',
        'E',
        'ESE',
        'SE',
        'SSE',
        'S',
        'SSW',
        'SW',
        'WSW',
        'W',
        'WNW',
        'NW',
        'NNW',
        'N',
      ];
      const index = parseInt((this.weather.wind.deg / 22.5).toFixed(0));
      return compassSector[index];
    }
    return '';
  }

  get iconSrc() {
    if (this.weather) {
      return `http://openweathermap.org/img/wn/${this.weather.icon}@2x.png`;
    }
    return '';
  }

  get dewPoint() {
    if (this.weather) {
      const tem2 = this.weather.temp;
      const r = this.weather.humidity;
      const tem = -1.0 * tem2;
      const es = 6.112 * Math.exp((-1.0 * 17.67 * tem) / (243.5 - tem));
      const ed = (r / 100.0) * es;
      const eln = Math.log(ed / 6.112);
      const dt = (-243.5 * eln) / (eln - 17.67);
      return dt.toFixed(1);
    }
    return 0;
  }

  async getWeather() {
    const { lat, lon } = this.city.coords;
    const data = await fetchWeatherByCoordinates(lat, lon);
    const { temp, feels_like, temp_min, temp_max, pressure, humidity } = data.main;
    console.log('weather data', data);

    this.weather = {
      temp,
      feels_like,
      temp_min,
      temp_max,
      pressure,
      humidity,
      text: data.weather[0].main,
      icon: data.weather[0].icon,
      wind: data.wind,
      visibility: data.visibility,
    };
  }
}

type Data = {
  weather: Nullable<CityWeather>;
};
</script>

<style lang="scss">
.city-item {
}
</style>
