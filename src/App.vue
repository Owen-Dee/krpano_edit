<template>
  <div id="app">
    <krpano/>
  </div>
</template>

<script>
import krpano from './components/krpano/krpano.vue'

export default {
  name: 'App',
  components: {
    krpano
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
