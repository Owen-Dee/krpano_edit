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
                        style: 'hotspot_top', // 该样式已在static/viewer/skin/skin.xml中写好
                        img: topImg
                    },
                    {
                        key: 'left_one',
                        style: 'hotspot_left_one',
                        img: leftOneImg
                    },
                    {
                        key: 'left_two',
                        style: 'hotspot_left_two',
                        img: leftTwoImg
                    },
                    {
                        key: 'right_one',
                        style: 'hotspot_right_one',
                        img: rightOneImg
                    },
                    {
                        key: 'right_two',
                        style: 'hotspot_right_two',
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
            },
            activeScene() {
                return this.$store.getters.activeScene;
            },
            scenes() {
                return this.$store.getters.scenes;
            },
        },
        created() {
            window.Bus.$on(window.EventEnum.SHOW_HOTSPOT_PANEL, (hotspotName) => {
                this.showHotspotPanel = true;
                this.hotspotName = hotspotName;
            });
            
            // 监听点击全景图除热点、底图、房间选择的地方
            $(document).click((e) =>{
                if($(e.target).css('transform-style') === 'preserve-3d'){
                    this.showHotspotPanel = false;
                }
            });
        },
        methods: {
            changeHotspot(item) {
                this.krpanoAPI.set(`hotspot[${this.hotspotName}].url`, item.img);
                this.krpanoAPI.set(`hotspot[${this.hotspotName}].style`, item.style);
                this.scenes.forEach((scene) => {
                    if (scene.name === this.activeScene.name) {
                        let hotspots = scene.hotspots;
                        hotspots.forEach((hotspot) => {
                            if (hotspot.name === this.hotspotName) {
                                hotspot.url = item.img;
                                hotspot.style = item.style;
                            }
                        });
                    }
                });
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

