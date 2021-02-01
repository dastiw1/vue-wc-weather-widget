import Vue from 'vue';
import Vuex from 'vuex';
import LS from '@/tools/localstorage';
const LOCALSTORAGE_CITIES = 'cities';

Vue.use(Vuex);

const cities = (LS.get(LOCALSTORAGE_CITIES) as Nullable<City[]>) || [];
export interface IAppState {
  cities: City[];
}
const AppState: IAppState = {
  cities,
};

const store = new Vuex.Store({
  state: AppState,
  mutations: {
    addCity(state, city: City) {
      if (state.cities != null) {
        state.cities.push(city);
      } else {
        state.cities = [city];
      }
    },
    setCities(state, cities: City[]) {
      state.cities = cities;
    },
    removeCity(state, city: City) {
      const index = state.cities.findIndex((c) => c.coords.lat === city.coords.lat && c.coords.lon === city.coords.lon);
      if (index > -1) {
        state.cities.splice(index, 1);
      }
    },
  },
  getters: {},
  actions: {},
  modules: {},
});

store.subscribe(({ type }) => {
  switch (type) {
    case 'addCity':
    case 'setCities':
    case 'removeCity':
      LS.set(LOCALSTORAGE_CITIES, store.state.cities);
      break;

    default:
      break;
  }
});

export default store;
