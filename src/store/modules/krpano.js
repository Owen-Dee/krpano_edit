const krpano = {
    state: {
        krpanoAPI: null, // krpano接口
        activeScene: '', // 当前被激活的全景图
        scenes: [], // 所有全景图数据
    },
    mutations: {
        recordKrpanoAPI(state, params) {
            state.krpanoAPI = params;
        },
        recordActiveScene(state, params) {
            state.activeScene = params;
        },
        recordScenes(state, params) {
            state.scenes = params;
        },
    },
    actions: {
        recordKrpanoAPI({ commit }, params) {
            commit('recordKrpanoAPI', params);
        },
        recordActiveScene({ commit }, params) {
            commit('recordActiveScene', params);
        },
        recordScenes({ commit }, params) {
            commit('recordScenes', params);
        },
    }
};

export default krpano;