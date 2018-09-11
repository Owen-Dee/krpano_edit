<template>
  <div id="app">
    <krpano/>
    <navbar/>
    <catalog/>
    <hotspot/>
    <panorama/>
  </div>
</template>

<script>
import krpano from './components/krpano/krpano';
import navbar from './components/navbar/nabar';
import catalog from './components/catalog/catalog';
import hotspot from './components/hotspot/hotspot';
import panorama from './components/panorama/panorama';

export default {
  name: 'App',
  components: {
    krpano,
    navbar,
    catalog,
    hotspot,
    panorama
  }
}
</script>

<style lang="scss">
@import './styles/reset.scss';

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 14px;
}
</style>
