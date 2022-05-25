import { getContainerEndpoint } from "./get_endpoint.js";

const createViewer = (modelName, models, containerId, hwp_version) => {
    return new Promise(function (resolve, reject) {
        const viewer = new Communicator.WebViewer({
            containerId: containerId,
            endpointUri: "./model-data/" + modelName + ".scs",
            boundingPreviewMode: "none",
        });
        resolve(viewer);
    })
}

export default createViewer;
