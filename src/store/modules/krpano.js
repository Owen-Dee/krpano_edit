const krpano = {
    state: {
        krpanoAPI: null
    },
    mutations: {
        recordKrpanoAPI(state, params) {
            state.krpanoAPI = params;
        }
    },
    actions: {
        recordKrpanoAPI({ commit }, params) {
            commit('recordKrpanoAPI', params);
        }
    }
};

export default krpano;