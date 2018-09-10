<template>
    <div class="hotspot" v-show="showHotspotPanel">
        <div class="title">
            <div class="name">房间切换热点</div>
            <div class="close" v-on:click="closePanel">×</div>
        </div>
        <div class="options">
            <div class="name">箭头类型</div>
            <div class="items">
                <div class="item" v-for="item in hotspots" 
                    :key="item.key"
                    @click="changeHotspot(item)">
                    <img :src="item.img" alt="">
                </div>
            </div>
        </div>
    </div>  
</template>

<script>
    import topImg from './img/top.png';
    import leftOneImg from './img/left_one.png';
    import leftTwoImg from './img/left_two.png';
    import rightOneImg from './img/right_one.png';
    import rightTwoImg from './img/right_two.png';

    export default {
        name: 'Hotspot',
        data() {
            return {
                hotspots: [
                    {
                        key: 'top',
                        img: topImg
                    },
                    {
                        key: 'left_one',
                        img: leftOneImg
                    },
                    {
                        key: 'left_two',
                        img: leftTwoImg
                    },
                    {
                        key: 'right_one',
                        img: rightOneImg
                    },
                    {
                        key: 'right_two',
                        img: rightTwoImg
                    },
                ],
                showHotspotPanel: false,
                hotspotName: '',
            }
        },
        computed: {
            krpanoAPI() {
                return this.$store.getters.krpanoAPI;
            }
        },
        created() {
            window.Bus.$on(window.EventEnum.SHOW_HOTSPOT_PANEL, (hotspotName) => {
                this.showHotspotPanel = true;
                this.hotspotName = hotspotName;
            });
        },
        methods: {
            changeHotspot(item) {
                this.krpanoAPI.set(`hotspot[${this.hotspotName}].url`, item.img);
            },
            closePanel() {
                this.showHotspotPanel = false;
            }
        }
    }
</script>

<style lang="scss" scope>
@import './style/hotspot.scss';
</style>

