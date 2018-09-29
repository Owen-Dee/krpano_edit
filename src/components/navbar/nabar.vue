<template>
    <div class="navbar">
        <div class="title">全屋漫游编辑</div>
        <div class="title title-control">热点设置</div>
        <div class="btn-group">
            <div class="save-btn btn" @click="save">保存</div>
            <div class="cancel-btn btn" @click="close">关闭</div>
        </div>

        <mark-info v-bind:show-mark-info="showMarkInfo"
            v-bind:mark="mark"
            v-bind:mark-text="markText">
        </mark-info>
    </div>
</template>

<script>
    import KrpanoService from '../../api/krpanoService.js';
    import MarkInfo from '../common/markInfo.vue';
    import { deepClone, getUrlParam } from '../../utils/common.js';

    export default {
        name: 'Navbar',
        data() {
            return {
                jobId: getUrlParam('jobId'),
                clickCloseBtn: false,
                showMarkInfo: false,
                mark: false,
                markText: ''
            }
        },
        components: {
            'mark-info': MarkInfo
        },
        computed: {
            scenes() {
                return this.$store.getters.scenes;
            },
            isHotspotChanged() {
                return this.$store.getters.isHotspotChanged;
            }
        },
        methods: {
            getParams() {
                let params = {};
                let scenes = deepClone([], this.scenes);
                scenes.forEach((item) => {
                    delete item.thumbUrl;
                    let hotspots = item.hotspots;
                    hotspots.forEach((hs) => {
                        delete hs.url;
                        delete hs.condition;
                    });
                });
                params = {
                    jobId: this.jobId,
                    scenes: scenes
                }

                return params;
            },
            save() {
                if (!this.jobId) {
                    return;
                }
                let _this = this;
                let params = this.getParams();
                let krpanoService = KrpanoService.getInstance();
                krpanoService.updatePanoramaHotspot(params).then((result) => {
                    if (!result) {
                        this.showMarkInfo = true;
                        this.mark = false;
                        this.markText = '保存失败!';

                        setTimeout(() => {
                            this.showMarkInfo = false;
                        }, 2000);
                    }

                    if (result.erMessage === 'Success') {
                        this.showMarkInfo = true;
                        this.mark = true;
                        this.markText = '保存成功!';
                        if (_this.clickCloseBtn) {
                            setTimeout(() => {
                                _this.closePage();
                            }, 500);  
                        } else {
                            setTimeout(() => {
                                this.showMarkInfo = false;
                            }, 2000);
                        }

                        // 热点信息已被保存,热点编辑flag重置
                        let isHotspotChanged = false;
                        this.$store.dispatch('recordHotspotChanged', isHotspotChanged);
                    } else {
                        this.showMarkInfo = true;
                        this.mark = false;
                        this.markText = '保存失败!';

                        setTimeout(() => {
                            this.showMarkInfo = false;
                        }, 2000);  
                    }
                }).catch((error) => {
                    this.showMarkInfo = true;
                    this.mark = false;
                    this.markText = '保存出错!';

                    setTimeout(() => {
                        this.showMarkInfo = false;
                    }, 2000);
                    console.error('updatePanoramaHotspot error:' + error);
                });
            },
            closePage() {
                if (navigator.userAgent.indexOf("MSIE") > 0) {     
                    if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {     
                        window.opener = null; window.close();     
                    } else {     
                        window.open('', '_top'); window.top.close();     
                    }     
                } else if (navigator.userAgent.indexOf("Firefox") > 0) {     
                    window.location.href = 'about:blank'; //火狐默认状态非window.open的页面window.close是无效的    
                } else {     
                    window.opener = null;      
                    window.open('about:blank', '_self', '');     
                    window.close();     
                }
            },
            close() {
                this.clickCloseBtn = true;
                // 关闭全景图房间选择面板
                window.Bus.$emit(window.EventEnum.CLOSE_PANORAMA);
                // 关闭查询的渲染图面板
                window.Bus.$emit(window.EventEnum.CLOSE_RENDER_JOB);
                if (this.isHotspotChanged) {
                    this.$msgBox.showMsgBox({
                        title: '温馨提示:',
                        cancelBtnText: '关闭',
                        confirmBtnText: '保存',
                        content: '关闭前是否需要保存?'
                    }).then(async () => {
                        this.save();
                    }).catch(() => {
                        this.closePage();
                    });
                } else {
                    this.closePage();
                }
            }
        }
    }
</script>

<style lang="scss" scope>
    @import './style/navbar.scss';
</style>

