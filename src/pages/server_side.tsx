import { GetServerSideProps } from "next";
import axios from "axios";


// propsの型を定義する
type Props = {
  title?: string;
  num?: number;
  data?: any;
};

const Api = (props: Props) => {
  console.log(props);
  return (
    <>

    </>
  )
}
export default Api

// サーバサイドで実行する処理(getServerSideProps)を定義する
export const getServerSideProps: GetServerSideProps = async (context) => {
  var api_url = "https://cors-anywhere.herokuapp.com/https://kirk7lih56.execute-api.ap-northeast-1.amazonaws.com/api";
  var id = "111";
  var ext = "png";
  try {
    // Object の data を FormData 形式に変換する
    const params = new FormData();
    // Object.keys(target).forEach(function (key) {
    //   params.append(key, this[key]);
    // }, target);
    params.append("dynamo_id", id);
    // let ext = target["name"].split(".").pop();
    params.append("ext", ext);
    console.log(params);
    const res = await axios.post(api_url, params, {
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,GET,PUT,DELETE,OPTIONS',
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log(res);
  } catch (err) {
    console.log(err);
  }

  const json_context = context;
  const props: Props = {
    title: "testtitle",
    num: 123,
    data: json_context,
  };

  return {
    props: props,
  };
};
