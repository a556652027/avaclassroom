//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

///////////////////////////////////////////////////////////////////////////////
//

//===============================================================================
// NAME :
// DESC : 使用者登入
//===============================================================================
function CsRequestLogin(member_cid, password, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/member/login",
        {
            member_cid: member_cid,
            password: password,
        },
        (error, result) => {
            const json_object = JSON.parse(result);
            //result = StringToJson(request.responseText);
            if (json_object.errno == "1") {
                Cyberspace.Client.setSession(json_object.session_token, member_cid, json_object.tier, json_object.level_uid, json_object.group_cid);

                if (Object.keys(json_object.permissions).length != 0) {
                    const paperLabel = json_object.permissions.paper_label;
                    const paperValue = json_object.permissions.paper_value;
                    let result = {};
                    for (let i = 0; i < paperLabel.length; i++) {
                        result[paperLabel[i]] = paperValue[i];
                    }
                    Cyberspace.Client.setPermission(result);
                }
            } else {
                Cyberspace.Client.clsSession();
            }

            if (callback) {
                // test
                // Success!
                console.log(result);
                callback(error, result);
            }
        }
    );
}

//===============================================================================
// NAME :
// DESC : 使用者登出
//===============================================================================
function CsRequestLogout() {
    Cyberspace.Client.clsSession();
}

//===============================================================================
// NAME :
// DESC : 重設密碼
//===============================================================================
function CsRequestResetPassword(member_cid, email, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/member/reset_password",
        {
            member_cid: member_cid,
            email: email,
        },
        (error, result) => {
            const json_object = JSON.parse(result);

            if (callback) {
                // test
                // Success!
                console.log(result);
                callback(error, result);
            }
        }
    );
}
