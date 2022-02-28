import React, { useState } from "react";
import { useQuery, gql, useMutation, useSubscription } from "@apollo/client";
import {
  Col,
  Container,
  Row,
  InputGroup,
  FormControl,
  Button,
} from "react-bootstrap";

// const GET_MESSAGES = gql`
//   query {
//     messages {
//       id
//       content
//       user
//     }
//   }
// `;

const POST_MESSAGE = gql`
  mutation ($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`;

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      content
      user
    }
  }
`;

const Messages = (props) => {
  // const { loading, error, data } = useQuery(GET_MESSAGES, {
  //   pollInterval: 500,
  // });

  const { loading, error, data } = useSubscription(GET_MESSAGES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :{error}</p>;

  return (
    <>
      {data.messages.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            justifyContent:
              props.user === item.user ? "flex-end" : "flex-start",
            marginBottom: "1em",
          }}
        >
          {props.user !== item.user && (
            <div
              style={{
                heght: 50,
                width: 50,
                border: "2px solid #e5e6ea",
                borderRadius: 50,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 10,
              }}
            >
              <span style={{ fontSize: "18pt" }}>
                {item.user.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div
            style={{
              background: props.user === item.user ? "#58bf56" : "#e5e6ea",
              color: props.user === item.user ? "white" : "black",
              padding: "1em",
              borderRadius: "1em",
              maxWidth: "60%",
            }}
          >
            {item.content}
          </div>
        </div>
      ))}
    </>
  );
};

const Chat = () => {
  const [state, setState] = useState({
    user: "sj",
    content: "",
  });

  const [postMessage, { data, loading, error }] = useMutation(POST_MESSAGE);

  const onSend = () => {
    //validate
    const { user, content } = state;
    if (user && user.length > 0 && content && content.length > 0) {
      console.log(state);
      // mutation
      postMessage({ variables: state });
    }
    setState({ ...state, content: "" });
  };
  return (
    <Container>
      <p> Message Window</p>
      <Messages user={state.user} />
      <Row>
        <Col xs={2}>
          <InputGroup className="mb-3">
            <FormControl
              placeholder="username"
              aria-label="username"
              aria-describedby="basic-addon1"
              value={state.user}
              onChange={(event) =>
                setState({ ...state, user: event.target.value })
              }
            />
          </InputGroup>
        </Col>
        <Col xs={8}>
          <InputGroup className="mb-3">
            <FormControl
              placeholder="message"
              aria-label="message"
              aria-describedby="basic-addon1"
              value={state.content}
              onChange={(event) =>
                setState({ ...state, content: event.target.value })
              }
              onKeyUp={(event) => {
                if (event.key === "Enter") {
                  onSend();
                }
              }}
            />
          </InputGroup>
        </Col>
        <Col xs={2}>
          <Button variant="primary" onClick={() => onSend()}>
            {loading ? "Sending..." : "Send"}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;
