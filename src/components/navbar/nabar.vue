<template>
    <div class="navbar">
        <div class="title">全屋漫游编辑</div>
        <div class="title title-control">热点设置</div>
        <div class="btn-group">
            <div class="save-btn btn" @click="save">保存</div>
            <div class="cancel-btn btn" @click="close">关闭</div>
        </div>
    </div>
</template>

<script>
    import { deepClone } from '../../utils/common.js';

    export default {
        name: 'Navbar',
        data() {
            return {
            }
        },
        computed: {
            scenes() {
                return this.$store.getters.scenes;
            },
        },
        methods: {
            save() {
                let scenes = deepClone([], this.scenes);
                scenes.forEach((item) => {
                    delete item.thumbUrl;
                    let hotspots = item.hotspots;
                    hotspots.forEach((hs) => {
                        delete hs.url;
                        delete hs.condition;
                    });
                });

                console.log(scenes);
            },
            close() {
                this.$msgBox.showMsgBox({
                    title: '温馨提示:',
                    content: '关闭前是否需要保存?'
                }).then(async () => {
                    this.save();
                }).catch(() => {
                    window.close();
                });
            }
        }
    }
</script>

<style lang="scss" scope>
    @import './style/navbar.scss';
</style>

