// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import store from './store';
import $ from 'jquery';
import './utils/global.js';
import Bus from './utils/bus';
import EventEnum from './EventEnum.js';
import MessageBox from './components/common/messageBox/messageBox';

Vue.config.productionTip = false;
window.Bus = Bus;
window.EventEnum = EventEnum;

Vue.use(MessageBox);

/* eslint-disable no-new */
new Vue({
    el: '#app',
    store,
    components: { App },
    template: '<App/>'
})