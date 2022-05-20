import { Axios } from "./axios";

export async function fileUploadFunc_lambda(target, id) {
  const params = new FormData();
  let ext = target["name"].split(".").pop();
  params.append( "file", target, id+"/todo_list_file."+ext ) ;
  var url = "api/proxy/api";
  var s = Axios.post(url, params, {
    headers: {
    },
  })
    .then((res) => {
      console.log("res", res);
      console.log(s);
    })
    .catch((req) => {
      console.log("req", req);
    });
  return;
}

export async function fileUploadFunc2(target, id) {
}
