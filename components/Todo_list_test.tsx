import React, { useEffect, useState } from 'react';
import Amplify, { API, graphqlOperation, Storage } from 'aws-amplify';
import awsExports from '../src/aws-exports';
import { GraphQLResult } from '@aws-amplify/api';
Amplify.configure(awsExports);

import { listTodos } from '../src/graphql/queries';
import { ListTodosQuery, CreateTodoInput, DeleteTodoInput, UpdateTodoInput } from '../src/API';
import { createTodo, deleteTodo, updateTodo } from '../src/graphql/mutations';

import Link from 'next/link'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

import { fileUploadFunc_lambda } from '../src/pages/api/lambda_api';

const initialState = { name: '', description: '', file_url: '' };

const TodoList: React.VFC = () => {
  const [formState, setFormState] = useState(initialState);
  const [formStateUpd, setFormStateUpd] = useState({ name: '', description: '', id: '', file_url: '' });

  const [showModal, setShowModal] = useState(false);

  const [todos, setTodos] = useState<CreateTodoInput[]>([]);

  const [uploadFile, setUploadFile] = useState<File>();
  const [uploadFileName, setUploadFileName] = useState("No file");

  const [uploadFileUpd, setUploadFileUpd] = useState<File>();
  const [uploadFileUpdName, setUploadFileUpdName] = useState("No file");



  useEffect(() => {
    fetchTodos();
  }, []);

  const setInput = (key: string, value: string) => {
    setFormState({ ...formState, [key]: value });
  };
  const setInputUpd = (key: string, value: string) => {
    setFormStateUpd({ ...formStateUpd, [key]: value });
  };

  const closeModal = () => {
    setShowModal(false);
    if (uploadFileUpd) {
      let e: File;
      setUploadFileUpd(e);
      setUploadFileUpdName("No File");
    }
  };
  const openModal = (unit) => {
    setFormStateUpd(unit);
    setShowModal(true);
  };
  const updateModal = () => {
    updateTodoFunc(formStateUpd);
  };

  // ファイル削除
  const fileDeleteFunc = async (id) => {
    // フォルダ内全削除
    var target = "todo/" + id + "/";
    try {
      Storage.list(target)
        .then(result =>
          result.forEach(function (value) {
            try {
              Storage.remove(value["key"])
                .then(result => console.log('remove:', result))
                .catch(err => console.log(err));
            } catch (err) {
              console.log('error fileDeleteFunc remove:', err);
            }
          }
          ))
        .catch(err => console.log(err));
    } catch (err) {
      console.log('error fileDeleteFunc list:', err);
    }
    return;
  };


  // DB情報取得
  const fetchTodos = async () => {
    try {
      const unitData = (await API.graphql(
        graphqlOperation(listTodos),
      )) as GraphQLResult<ListTodosQuery>;
      if (unitData.data?.listTodos?.items) {
        const todos = unitData.data.listTodos.items as CreateTodoInput[];
        setTodos(todos);
        console.log("fetchTodos");
        console.log(todos);
      }
    } catch (err) {
      console.log('error fetching todos', err);
    }
    return;
  };

  // 新規作成
  const addTodo = async () => {
    try {
      if (!formState.name || !formState.description) return;
      const unit: CreateTodoInput = { ...formState };
      setTodos([...todos, unit]);
      setFormState(initialState);
      var info = (await API.graphql(
        graphqlOperation(createTodo, { input: unit }),
      )) as GraphQLResult<CreateTodoInput>;
      if (uploadFile) {
        fileUploadFunc_lambda(uploadFile, info["data"]["createTodo"]["id"]);
        let e: File;
        setUploadFile(e);
        setUploadFileName("No File");
      }
      fetchTodos();
    } catch (err) {
      console.log('error creating todo:', err);
    }
    return;
  };

  // 削除
  const deleteTodoFunc = async (bookid: string) => {
    try {
      const param = {
        id: bookid,
      };
      var info = (await API.graphql(
        graphqlOperation(deleteTodo, { input: param }),
      )) as GraphQLResult<DeleteTodoInput>;
      if (info["data"]["deleteTodo"]["file_url"]) {
        fileDeleteFunc(bookid);
      }
      fetchTodos();
    } catch (err) {
      console.log('error deleting todo:', err);
    }
    return;
  };

  // 更新
  const updateTodoFunc = async (target) => {
    // ファイル変更がある場合
    if (uploadFileUpd) {
      fileUploadFunc_lambda(uploadFileUpd, target.id);
      let e: File;
      setUploadFileUpd(e);
      setUploadFileUpdName("No File");
    }
    const param = {
      id: target.id,
      name: target.name,
      description: target.description,
    };
    console.log(param);
    try {
      (await API.graphql(
        graphqlOperation(updateTodo, { input: param }),
      )) as GraphQLResult<UpdateTodoInput>;
      fetchTodos();
    } catch (err) {
      console.log('error updating todo:', err);
    }
    closeModal();
    return;
  };

  // ファイルURL情報更新
  const updateFileNameFunc = async (target_id, url) => {
    const param = {
      id: target_id,
      file_url: url,
    };
    try {
      var info = (await API.graphql(
        graphqlOperation(updateTodo, { input: param }),
      )) as GraphQLResult<UpdateTodoInput>;
      fetchTodos();
    } catch (err) {
      console.log('error updateFileNameFunc:', err);
    }
    console.log('updateFileNameFunc');
    console.log(info);
    return;
  };


  // アップロードファイル情報変更(create)
  const onChangeFile = async (target) => {
    setUploadFile(target)
    setUploadFileName(target["name"])
    return;
  };

  // アップロードファイル情報変更(update)
  const onChangeFileUpd = async (target) => {
    setUploadFileUpd(target)
    setUploadFileUpdName(target["name"])
    return;
  };

  return (
    <div style={styles.container}>
      <h2>Todo List</h2>

      <TextField
        id="outlined-name"
        label="title"
        placeholder=""
        variant="filled"

        onChange={(event) => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name}
      />
      <br />
      <TextField
        id="filled-multiline-static"
        label="discription"
        multiline
        rows={4}
        defaultValue=""
        variant="filled"

        onChange={(event) => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
      />
      <br />
      <Button
        variant="outlined"
        component="label"
        color="secondary"
      >
        SELECT FILE
        <input
          type="file"
          hidden
          onChange={(event) => onChangeFile(event.target.files[0])}
        />
      </Button>
      {uploadFileName}
      <br />
      <br />
      <Button variant="contained" onClick={addTodo}>Create Todo</Button>
      <br />
      <Box sx={{ display: 'flex', justifyContent: 'center', border: 1, borderColor: 'grey.500' }}>
      </Box>
      {todos.map((unit, index) => (
        <div key={unit.id ? unit.id : index} style={styles.unit}>
          <a>
            <Card
              sx={{ maxWidth: 345 }}
              style={styles.card}
            >
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {unit.name}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {unit.description}
                </Typography>
                <br />
                file:
                <Link href="">
                  <a target="_blank" href={unit.file_url}>
                    <Typography variant="body2" color="text.secondary">
                      {unit.file_url}
                    </Typography>
                  </a>
                </Link>
              </CardContent>
              <Stack spacing={2} direction="row">
                <Button
                  onClick={() => openModal(unit)}
                  style={{ color: 'green' }}
                  color="inherit" variant="outlined">update</Button>
                <Button
                  onClick={() => deleteTodoFunc(unit.id)}
                  style={{ color: 'red' }}
                  color="inherit" variant="outlined">delete</Button>
              </Stack>
            </Card>
          </a>
        </div>
      ))}


      {showModal ? (
        <div id="overlay" style={styles.overlay}>
          <div id="modalContent" style={styles.modalContent}>
            <TextField
              id="outlined-name"
              label="title"
              placeholder=""
              variant="filled"

              onChange={(event) => setInputUpd('name', event.target.value)}
              value={formStateUpd.name}
              style={styles.modalbox}
            />
            <br />
            <TextField
              id="filled-multiline-static"
              label="discription"
              multiline
              rows={4}
              defaultValue=""
              variant="filled"

              onChange={(event) => setInputUpd('description', event.target.value)}
              value={formStateUpd.description}
              style={styles.modalbox}
            />
            <br />
            <Button
              variant="outlined"
              component="label"
              color="secondary"
              sx={{ m: 0.5 }}
            >
              SELECT FILE
              <input
                type="file"
                hidden
                onChange={(event) => onChangeFileUpd(event.target.files[0])}
              />
            </Button>
            {uploadFileUpdName}
            <br />
            current file:
            <Link href="">
              <a target="_blank" href={formStateUpd.file_url}>
                <Typography variant="body2" color="text.secondary">
                  {formStateUpd.file_url}
                </Typography>
              </a>
            </Link>
            <Button variant="outlined" color="warning" sx={{ m: 0.5 }} onClick={closeModal}>CANCEL</Button>
            <Button variant="contained" onClick={updateModal}>UPDATE</Button>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

const styles: {
  [key: string]: React.CSSProperties;
} = {
  container: {
    width: 400,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    margin: '20px auto',
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "1",
  },
  modalContent: {
    background: "white",
    padding: "10px",
    borderRadius: "3px",
    width: "500px",
  },
  modalbox: {
    width: "100%",
    margin: "5px",
  },
};

export default TodoList;
