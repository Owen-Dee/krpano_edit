class KrpanoService {
	constructor() {
		this.krpanoBaseUrl = 'http://j3ddev.oss-cn-shanghai.aliyuncs.com/Data/KRPano/designpanos/panos';
	}

	static _instance = null;

	getKrpanoXml(designId, jobId) {
		let xmlUrl = `${this.krpanoBaseUrl}/${designId}/${jobId}.xml`;
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
		KrpanoService._instance = KrpanoService._instance
			|| new KrpanoService();

		return KrpanoService._instance;
	}
}

export default KrpanoService;