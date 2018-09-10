import Vue from 'vue';
import Vuex from 'vuex';
import catalog from './modules/catalog';
import hotspot from './modules/hotspot';
import krpano from './modules/krpano';
import getters from './getters';

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        catalog,
        hotspot,
        krpano
    },
    getters
});

export default store