const getters = {
    // krpano
    krpanoAPI: state => state.krpano.krpanoAPI,
    activeScene: state => state.krpano.activeScene,
    scenes: state => state.krpano.scenes,
    // hotspot
    isHotspotChanged: state => state.hotspot.isHotspotChanged,
};

export default getters