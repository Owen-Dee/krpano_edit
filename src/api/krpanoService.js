class KrpanoService {
    constructor() {}

    static _instance = null;

    getKrpanoXml(designId, jobId) {
        let xmlUrl = '{0}/{1}/{2}.xml'.format(process.env.KRPANOURL, designId, jobId);
        return new Promise((resolve, reject) => {
            $.ajax({
                url: xmlUrl,
                method: 'get',
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

    static getInstance() {
        KrpanoService._instance = KrpanoService._instance ||
            new KrpanoService();

        return KrpanoService._instance;
    }
}

export default KrpanoService;