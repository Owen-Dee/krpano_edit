<template>
    <div class="panorama">
        <div class="show-panorama-btn" @click="showPanoramaPanel">
            <img src="./img/house_choose.png" alt="">
            <div class="title">房间选择</div>
        </div>

        <div class="scene-choose" v-show="showPanorama">
            <div class="header">
                <div class="title">房间选择</div>
                <div class="close" @click="closePanel">×</div>
            </div>

            <vue-perfect-scrollbar class="scene-container" :settings="settings">
                <div class="item" v-for="item in scenes" :key="item.name">
                    <div class="img" @click="showCurrentScene(item)">
                        <img :src="item.thumbUrl" alt="">
                    </div>
                    <div class="description">
                        <span v-text="item.roomType" :title="item.roomType" class="name"></span>
                    </div>
                </div>
            </vue-perfect-scrollbar>
        </div>
    </div>
</template>

<script>
    import VuePerfectScrollbar from 'vue-perfect-scrollbar';
    import { deepClone } from '../../utils/common.js';

    export default {
        name: 'Panorama',
        data() {
            return {
                settings: {
                    maxScrollbarLength: 200
                },
                showPanorama: false
            }
        },
        components: {
            'vue-perfect-scrollbar': VuePerfectScrollbar,
        },
        computed: {
            activeScene() {
                return this.$store.getters.activeScene;
            },
            scenes() {
                return this.$store.getters.scenes;
            },
            krpanoAPI() {
                return this.$store.getters.krpanoAPI;
            }
        },
        methods: {
            showPanoramaPanel() {
                this.showPanorama = true;
            },
            closePanel() {
                this.showPanorama = false;
            },
            showCurrentScene(item) {
                this.$store.dispatch('recordActiveScene', deepClone({}, item));
                let name = item.name;
                let jsCall = `skin_hidetooltips(); 
                              tween(scale,0.25,0.5); 
                              tween(oy,-20,0.5); 
                              tween(alpha,0,0.5); 
                              loadscene(${name},null,get(skin_settings.loadscene_flags),get(skin_settings.loadscene_blend));`;
                this.krpanoAPI.call(jsCall);
                window.resetHotspots(name);
            }
        }
    }
</script>

<style lang="scss" scope>
@import './style/panorama.scss';
</style>

