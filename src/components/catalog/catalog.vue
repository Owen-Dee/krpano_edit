<template>
    <div class="catalog">
        <div class="room-name">
            <div class="icon">
                <img src="./img/position.svg" alt="">
                <span>当前定位:</span>
            </div>
            <div class="name" v-text="roomType"></div>
        </div>
        <div class="hotspot-added">
            <div class="add-btn" @click="addHotspot">添加切换热点</div>
        </div>
        <vue-perfect-scrollbar class="hotspots-container" :settings="settings">
            <div class="item" v-for="item in hotspots" :key="item.name">
                <div class="img" @click="showCurrentHotspot(item)">
                    <img :src="item.thumbUrl" alt="">
                </div>
                <div class="description">
                    <span v-text="item.roomType" :title="item.roomType" class="name"></span>
                    <span class="delete-btn" @click="deleteHotspot(item)">
                        <img class="btn normal" src="./img/delete.svg" alt="">
                        <img class="btn active" src="./img/delete_light.svg" alt="">
                    </span>
                </div>
            </div>
        </vue-perfect-scrollbar>
    </div> 
</template>

<script>
    import VuePerfectScrollbar from 'vue-perfect-scrollbar';

    export default {
        name: 'Catalog',
        data() {
            return {
                settings: {
                    maxScrollbarLength: 200
                },
                roomType: '',
                hotspots: []
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
        watch: {
            activeScene: {
                handler() {
                    let hotspots = this.activeScene.hotspots;
                    hotspots.forEach((item) => {
                        this.scenes.forEach((scene) => {
                            if (item.linkedscene === scene.name) {
                                item.thumbUrl = scene.thumbUrl;
                                item.roomType = scene.roomType;
                            }
                        });
                    });

                    this.hotspots = hotspots;
                    this.roomType = this.activeScene.roomType;
                },
                deep: true
           } 
        },
        methods: {
            addHotspot() {
                // 关闭全景图房间选择面板
                window.Bus.$emit(window.EventEnum.CLOSE_PANORAMA);
                window.Bus.$emit(window.EventEnum.SHOW_RENDER_JOBS);
            },
            showCurrentHotspot(item) {
                let ath = parseFloat(item.ath);
                let atv = parseFloat(item.atv);
                this.krpanoAPI.set("view.hlookat", ath);
                this.krpanoAPI.set("view.vlookat", atv);
            },
            deleteHotspot(item) {
                // 关闭全景图房间选择面板
                window.Bus.$emit(window.EventEnum.CLOSE_PANORAMA);
                // 关闭查询的渲染图面板
                window.Bus.$emit(window.EventEnum.CLOSE_RENDER_JOB);
                this.$msgBox.showMsgBox({
                    title: '温馨提示:',
                    content: '是否确认删除?'
                }).then(async () => {
                    window.Bus.$emit(window.EventEnum.DELETE_HOTSPOT, item);
                }).catch(() => {
                });   
            }
        }
    }
</script>

<style lang="scss" scope>
@import './style/catalog.scss';
</style>