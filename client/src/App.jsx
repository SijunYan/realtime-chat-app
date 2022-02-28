import React from "react";
import ReactDOM from "react-dom";
import Chat from "./Chat.jsx";
import "./index.css";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";

const link = new WebSocketLink({
  uri: "ws://localhost:4000/",
  options: { reconnect: true },
});

const client = new ApolloClient({
  link,
  uri: "http://localhost:4000/",
  cache: new InMemoryCache(),
});

const App = () => {
  return (
    <div>
      <Chat />
    </div>
  );
};

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("app")
);
