<template>
    <div class="catalog">
        <div class="room-name">主卧</div>
        <div class="hotspot-added">
            <div class="add-btn" @click="addHotspot">添加切换热点</div>
        </div>
        <div class="hotspots-container">

        </div>
    </div> 
</template>

<script>
    export default {
        name: 'Catalog',
        data() {
            return {

            }
        },
        methods: {
            addHotspot() {
                window.Bus.$emit(window.EventEnum.ADD_HOTSPOT);
            }
        }
    }
</script>

<style lang="scss" scope>
@import './style/catalog.scss';
</style>