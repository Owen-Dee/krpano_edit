<template>
    <div class="render-job" >
        <div class="job-choose" v-show="showRenderJob">
            <div class="header">
                <div class="title">要跳转的空间</div>
                <div class="close" @click="closePanel">×</div>
            </div>
            <div class="job-container">
                <div class="item" v-for="item in renders" :key="item.ID">
                    <div class="img" @click="chooseOmnistereo(item)">
                        <img :src="item.PreviewUrl" alt="">
                        <div class="mask" v-if="!item.canChoose">
                            <img src="./img/forbid.svg" alt="" class="img-control">
                        </div>
                        <div class="mask" v-if="item.isChoosed">
                            <img src="./img/allow.svg" alt="" class="img-control">
                        </div>
                    </div>
                    <div class="description">
                        <span v-text="item.RoomTypeDisplayName" :title="item.RoomTypeDisplayName" class="name"></span>
                    </div>
                </div>
            </div>
            <div class="pagination">
                <paginate v-if="pageCount > 0"
                        :page-count="pageCount"
                        :page-range="pageRange"
                        :margin-pages="3"
                        :click-handler="clickCallback"
                        :prev-text="'<'"
                        :next-text="'>'"
                        :container-class="'pagination-control'"
                        :page-class="'page-item'"
                        :prev-class= "'prev-class'"
                        :next-class="'next-class'">
                </paginate>
            </div>
            <div class="btn-group">
                <div class="btn" style="margin-right: 10px;" @click="addHotSpot">确定</div>
                <div class="btn" @click="closePanel">取消</div>
            </div>
        </div>

        <vue-loading color="#fcc800" class="vue-loading"
            v-bind:size="{ width: '50px', height: '50px' }"
            v-show="showLoading">
        </vue-loading>

        <mark-info v-bind:show-mark-info="showMarkInfo"
            v-bind:mark="mark"
            v-bind:mark-text="markText">
        </mark-info>
    </div>
</template>

<script>
    import KrpanoService from '../../api/krpanoService.js';
    import VuePerfectScrollbar from 'vue-perfect-scrollbar';
    import VueLoading from '../common/vueloading.vue';
    import Paginate from '../common/paginate.vue';
    import MarkInfo from '../common/markInfo.vue';
    import { deepClone, getUrlParam } from '../../utils/common.js';

    export default {
        name: 'RenderJob',
        data() {
            return {
                pageRange: 3,
                showRenderJob: false,
                showMarkInfo: true,
                showLoading: false,
                designId : getUrlParam('guid'),
                limit: 6,
                renders: [],
                pageIndex: 1,
                pageCount: 0,
                choosedJob: null,
                showMarkInfo: false,
                mark: false,
                markText: ''
            }
        },
        components: {
            'vue-perfect-scrollbar': VuePerfectScrollbar,
            'paginate': Paginate,
            'vue-loading': VueLoading,
            'mark-info': MarkInfo
        },
        computed: {
            activeScene() {
                return this.$store.getters.activeScene;
            }
        },
        watch: {
            activeScene: {
                handler() {
                    setTimeout(() => {
                        let hotspots = this.activeScene.hotspots;
                        this.renders.forEach((item) => { 
                            item.canChoose = true;
                            if (`scene_${item.ID}` === this.activeScene.name) { // 当前场景不可选
                                item.canChoose = false;
                            }

                            if (hotspots && hotspots instanceof Array) { // 已被热点添加的场景,不可选
                                hotspots.forEach((hs) => {
                                    if (`scene_${item.ID}` === hs.linkedscene) {
                                        item.canChoose = false;
                                    }
                                });
                            }
                        });
                    }, 0);
                },
                deep: true
            } 
        },
        created() {
            window.Bus.$on(window.EventEnum.SHOW_RENDER_JOBS, () => {
                this.showRenderJobPanel();
            });

            window.Bus.$on(window.EventEnum.CLOSE_RENDER_JOB, () => {
                this.closePanel();
            });
        },
        methods: {
            initRenderJobs() {
                if (!this.designId) {
                    return;
                }

                let skip = (this.pageIndex - 1) * this.limit;
                let params = {
                    designId: this.designId,
                    status: 1,
                    skip: skip,
                    limit: this.limit,
                    renderType: 'omnistereo', //全景图
                };
                this.showLoading = true;
                let krpanoService = KrpanoService.getInstance();
                krpanoService.getRenderJobs(params).then((result) => {
                    this.showLoading = false;
                    if (!result || !result.items || result.items.length === 0) {
                        return;
                    }

                    let hotspots = this.activeScene.hotspots;
                    result.items.forEach((item) => { // 当前场景已有选择的全景热点,不可选
                        item.RoomTypeDisplayName = item.RoomTypeDisplayName ? item.RoomTypeDisplayName : '无名称';
                        item.canChoose = true; // canChoose:当前全景是否可以选
                        item.isChoosed = false; // isChoosed: 当前全景是否被选中
                        if (`scene_${item.ID}` === this.activeScene.name) { // 当前场景不可选
                            item.canChoose = false;
                        }

                        if (hotspots && hotspots instanceof Array) { // 已被热点添加的场景,不可选
                            hotspots.forEach((hs) => {
                                if (`scene_${item.ID}` === hs.linkedscene) {
                                    item.canChoose = false;
                                }
                            });
                        }

                        if (this.choosedJob && item.ID === this.choosedJob.ID) { // 对否有选中的全景图
                            item.isChoosed = true;
                        }
                    });

                    this.renders = result.items;
                    this.pageCount = Math.ceil(result.total / this.limit);
                }).catch((error) => {
                    this.showLoading = false;
                    console.error('getRenderJobs error: ' + error);
                });
            },
            clickCallback(pageIndex) {
                this.pageIndex = pageIndex;
                this.initRenderJobs();
            },
            chooseOmnistereo(job) {
                if (!job.canChoose) {
                    return;
                }

                this.renders.forEach((item) => { // 当前场景已有选择的全景热点,不可选
                    if (item.ID === job.ID) {
                        job.isChoosed = !job.isChoosed;
                    } else {
                        item.isChoosed = false;
                    }
                });

                if (job.isChoosed) {
                    this.choosedJob = job;
                } else {
                    this.choosedJob = null;
                }
            },
            addHotSpot(item) {
                if (!this.choosedJob) {
                    this.showMarkInfo = true;
                    this.mark = false;
                    this.markText = '请先选择要跳转的空间!';
                    setTimeout(() => {
                        this.showMarkInfo = false;
                    }, 2000);

                    return;
                }

                window.Bus.$emit(window.EventEnum.ADD_HOTSPOT, this.choosedJob);
                this.closePanel();
            },
            showRenderJobPanel() {
                this.showRenderJob = true;
                this.pageIndex = 1;
                this.initRenderJobs();
            },
            closePanel() {
                this.showRenderJob = false;
                this.choosedJob = null;
                this.renders = [];
                this.pageIndex = 1;
                this.pageCount = 0;
            },
        }
    }
</script>

<style lang="scss" scope>
@import './style/renderJob.scss';
</style>

