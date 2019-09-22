importPackage(dw.system);
importPackage(dw.web);
importPackage(dw.order);
importPackage(dw.crypto);
importPackage(dw.util);
importPackage(dw.customer);
importPackage(dw.net);
importPackage(dw.object);
importPackage(dw.svc);
exports.Connector = function () {

    var requestParams = {
        'requestType': 'application/json'
        /*
        'Authorization':Authorization,
        'callUrl':callUrl,
        'requestMethod':requestMethod,
        'requestBody':requestBody,
        */
    };
    var myRequest = request;
    requestParams.callUrl = request.httpHeaders.callurl;
    requestParams.requestMethod = request.httpMethod;
    requestParams.httpHeaders = request.httpHeaders;
    requestParams.requestBody = request.httpParameterMap;
    requestParams.requestBodyAsString = requestParams.requestBody.requestBodyAsString;

    var ocapiService = LocalServiceRegistry.createService("ocapi.customer.auth", {
        createRequest: function (svc, params) {
            svc.setRequestMethod(params.requestMethod);
            svc.setURL(params.callUrl);
            /*
             for each (header in params.httpHeaders) {
                var one = header;
                var two = params.httpHeaders[header];
                svc.addHeader(header, params.httpHeaders[header]);
                //svc.addHeader('Content-type', params.requestType);
            }*/
            var itrHeaders = params.httpHeaders.keySet().iterator();
            while (itrHeaders.hasNext()) {
                var header = itrHeaders.next();
                var headerValue = params.httpHeaders.get(header);
                if (header.toString().toLowerCase() != "origin" && header.toString().toLowerCase() != "callUrl") {
                    svc.addHeader(header, params.httpHeaders.get(header));
                }
            }
            svc.addHeader("Access-Control-Allow-Methods", "POST, GET, PUT, UPDATE, DELETE, OPTIONS");
            svc.addHeader("Access-Control-Expose-Headers", "authorization,etag,location,x-dw-version-status,x-dw-resource-state,authorization,x-dw-request-base-id");
            svc.addHeader("Access-Control-Allow-Credentials", true);
            svc.addHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, X-Requested-With");
            svc.addHeader("Access-Control-Allow-Origin", "*");
            return params.requestBodyAsString;
        },
        parseResponse: function (svce, response) {
            return response;
        },
        mockExec: function (svc, params) {
            return {
                statusCode: 200,
                statusMessage: "mockExec"
            };
        }
    });
    var error = "";
    var result = ocapiService.call(requestParams);
    if (result.status != "ERROR") {
        var resErr = result.object.errorText;
        var resText = result.object.text;

        if (result.status == 'OK') {
            var jsonResult = JSON.parse(result.object.text);
            if (jsonResult == null) {
                error = THIS_SCRIPT + "Invalid JSON Response: " + resErr;
                Logger.error(JSON.parse(resErr).message);
                return;
            }
            response.setContentType('application/json');
            var jsonResponse = {};
            jsonResponse = JSON.parse(result.object.text);
            if (result.object.allResponseHeaders.Authorization != undefined) {
                jsonResponse.Authorization = result.object.allResponseHeaders.Authorization;
            }
            if (result.object.allResponseHeaders.ETag != undefined) {
                jsonResponse.ETag = result.object.allResponseHeaders.ETag;
            }
            var jsonOutput = JSON.stringify(jsonResponse);
            response.writer.print(jsonOutput);
        } else {
            error = result.errorText + " - HTTP ERROR";
            Logger.error(error);
            return;
        }
    } else {
        var errorResult = JSON.parse(result.errorMessage);

        response.setContentType('application/json');
        response.writer.print(result.errorMessage);
        return 0;
    }
};
exports.Request.public = true;