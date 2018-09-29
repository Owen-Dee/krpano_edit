<template>
    <div class="message-box" v-show="isShowMessageBox">
        <div class="message-content">
            <div class="header">
                <div class="title">{{ title }}</div>
                <div class="close" @click="closeMessageBox">×</div>
            </div>
            <p class="content">{{ content }}</p>
            <div class="position-control">
                <div class="btn-group">
                    <div class="btn" @click="cancel" v-show="isShowCancelBtn">{{ cancelBtnText }}</div>
                    <div class="btn" @click="confirm" v-show="isShowConfimrBtn">{{ confirmBtnText }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            title: {
                type: String,
                default: '标题'
            },
            content: {
                type: String,
                default: '这是弹框内容'
            },
            isShowInput: false,
            inputValue: '',
            isShowCancelBtn: {
                type: Boolean,
                default: true
            },
            isShowConfimrBtn: {
                type: Boolean,
                default: true
            },
            cancelBtnText: {
                type: String,
                default: '取消'
            },
            confirmBtnText: {
                type: String,
                default: '确定'
            }
        },
        data () {
            return {
                isShowMessageBox: false,
                resolve: '',
                reject: '',
                promise: '' // 保存promise对象
            };
        },
        methods: {
            // 确定,将promise断定为resolve状态
            confirm: function () {
                this.isShowMessageBox = false;
                if (this.isShowInput) {
                    this.resolve(this.inputValue);
                } else {
                    this.resolve('confirm');
                }
                this.remove();
            },
            // 取消,将promise断定为reject状态
            cancel: function () {
                this.isShowMessageBox = false;
                this.reject('cancel');
                this.remove();
            },
            // 弹出messageBox,并创建promise对象
            showMsgBox: function () {
                this.isShowMessageBox = true;
                this.promise = new Promise((resolve, reject) => {
                    this.resolve = resolve;
                    this.reject = reject;
                });
                // 返回promise对象
                return this.promise;
            },
            remove: function () {
                setTimeout(() => {
                    this.destroy();
                }, 300);
            },
            destroy: function () {
                this.$destroy();
                document.body.removeChild(this.$el);
            },
            closeMessageBox: function() {
                this.isShowMessageBox = false;
            }
        }
    };
</script>

<style lang="scss" scoped>
    .message-box {
        position: relative;
        .message-content {
            position: fixed;
            box-sizing: border-box;
            min-width: 400px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border-radius: 2px;
            background: #fffdfd;
            z-index: 50001;
            .header {
                width: 100%;
                height: 30px;
                background: #323232d9;
                position: relative;
                color: white;
                line-height: 30px;
                .title {
                    margin-left: 10px;
                    font-size: 16px;
                    font-weight: bolder;
                }
                .close {
                    position: absolute;
                    right: 10px;
                    top: 0px;
                    font-size: 26px;
                    cursor: pointer;
                }
                .close:hover {
                    color: #ffc034;
                }
            }
            .content {
                color: #555;
                height: 40px;
                line-height: 40px;
                margin-left: 15px;
            }
            .position-control {
                display: flex;
                align-items: center;
                height: 50px;
                width: 100%;
                padding-bottom: 5px;
            }
            .btn-group {
                position: absolute;
                right: 20px;
                display: flex;
                .btn {
                        margin-left: 10px;
                        height: 26px;
                        width: 60px;
                        cursor: pointer;
                        border: 1px solid #777575;
                        text-align: center;
                        line-height: 26px;
                        background: #777575;
                        color: white;
                        border-radius: 2px;
                }
                .btn:hover {
                    border: 1px solid #ffc034;
                    background: #ffc034;
                }
            }
        }
    }
</style>