import React, { useEffect, useState } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
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

const initialState = { name: '', description: '' };

const TodoList: React.VFC = () => {
  const [formState, setFormState] = useState(initialState);
  const [formStateUpd, setFormStateUpd] = useState({ name: '', description: '', id: '' });

  const [showModal, setShowModal] = useState(false);

  const [todos, setTodos] = useState<CreateTodoInput[]>([]);

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
  };
  const openModal = async (unit) => {
    setFormStateUpd(unit);
    setShowModal(true);
  };
  const updateModal = () => {
    updateTodoFunc(formStateUpd);
    setShowModal(false);
    // window.location.reload();
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
      }
      console.log("fetchTodos");
    } catch (err) {
      console.log('error fetching todos', err);
    }
  };

  // 新規作成
  const addTodo = async () => {
    try {
      if (!formState.name || !formState.description) return;
      const unit: CreateTodoInput = { ...formState };
      setTodos([...todos, unit]);
      setFormState(initialState);
      (await API.graphql(
        graphqlOperation(createTodo, { input: unit }),
      )) as GraphQLResult<CreateTodoInput>;
      console.log('addTodo');
    } catch (err) {
      console.log('error creating todo:', err);
    }
  };

  // 削除
  const deleteTodoFunc = async (bookid: string) => {
    console.log(bookid);
    try {
      const param = {
        id: bookid,
      };
      (await API.graphql(
        graphqlOperation(deleteTodo, { input: param }),
      )) as GraphQLResult<DeleteTodoInput>;
      console.log('deleteTodo');
    } catch (err) {
      console.log('error deleting todo:', err);
    }
    window.location.reload();
  };

  // 更新
  const updateTodoFunc = async (target) => {
    const param = {
      id: target.id,
      name: target.name,
      description: target.description,
    };
    try {
      (await API.graphql(
        graphqlOperation(updateTodo, { input: param }),
      )) as GraphQLResult<UpdateTodoInput>;
      console.log('updateTodo');
      fetchTodos();
    } catch (err) {
      console.log('error updating todo:', err);
    }
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
      <Button variant="contained" onClick={addTodo}>Create Todo</Button>

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
                <Typography variant="body2" color="text.secondary">
                  {unit.description}
                </Typography>
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
            <Button variant="outlined" color="secondary" sx={{ m: 0.5 }} onClick={closeModal}>CANCEL</Button>
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
