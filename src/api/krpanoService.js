class KrpanoService {
    constructor() {}

    static _instance = null;

    webAPI(url, type, params) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                type: type,
                data: params,
                dataType: 'json',
                success: function(data) {
                    resolve(data);
                },
                error: function(data) {
                    reject(data);
                }
            });
        });
    }

    getKrpanoXml(designId, jobId) {
        let xmlUrl = '{0}/{1}/{2}.xml'.format(process.env.KRPANOURL, designId, jobId);
        xmlUrl = xmlUrl + `?${new Date()}`;
        return new Promise((resolve, reject) => {
            $.ajax({
                url: xmlUrl,
                method: 'Get',
                dataType: 'XML',
                success: function(data) {
                    resolve(data);
                },
                error: function(err) {
                    reject(err);
                }
            });
        });
    }

    checkImageExist(imgUrl) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: imgUrl,
                method: 'Get',
                success: function(data) {
                    resolve(data);
                },
                error: function(err) {
                    reject(err);
                }
            });
        });
    }

    getRenderJobs(params) {
        let url = `${process.env.RENDERURL}/Render/GetJobsByDesignId`;
        let type = 'Get';

        return this.webAPI(url, type, params);
    }

    updatePanoramaHotspot(params) {
        let url = `${process.env.RENDERURL}/Render/UpdatePanoramaHotspot`;
        let type = 'Post';

        return this.webAPI(url, type, params);
    }

    static getInstance() {
        KrpanoService._instance = KrpanoService._instance ||
            new KrpanoService();

        return KrpanoService._instance;
    }
}

export default KrpanoService;