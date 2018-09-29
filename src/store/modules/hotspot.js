const hotspot = {
    state: {
        isHotspotChanged: false
    },
    mutations: {
        recordHotspotChanged(state, params) {
            state.isHotspotChanged = params;
        }
    },
    actions: {
        recordHotspotChanged({ commit }, params) {
            commit('recordHotspotChanged', params);
        }
    }
};

export default hotspot;