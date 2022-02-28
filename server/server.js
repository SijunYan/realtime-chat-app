const { GraphQLServer, PubSub } = require("graphql-yoga");

let messages = [];
const typeDefs = `
type Message {
    id: String!
    content: String!
    user: String!
}

  type Query {
    messages: [Message!]
  }

  type Mutation {
    postMessage(content: String!, user: String!): ID!
  }

  type Subscription {
    messages: [Message!]
  }
`;

// ========================== Resolvers ============================================
// ** at very first, fetches all of the existing messages, by publishing an event on subscription itself.
// ** subscription: distinguishing clients and resign every client a seperate chanel

const subscribers = []; // container store fn
const onMessageUpdates = (fn) => subscribers.push(fn); // every message update store a fn

const resolvers = {
  Query: {
    messages: () => messages,
  },
  Mutation: {
    postMessage: (parent, { content, user }) => {
      const id = messages.length;
      messages.push({ id, user, content });
      subscribers.forEach((fn) => fn()); // publishing all the subscription events when mutation
      return id;
    },
  },
  Subscription: {
    messages: {
      subscribe: (parent, args, { pubsub }) => {
        const channel = Math.random().toString(36).slice(2, 15); // use Channel to seperate client, every client has a channel
        console.log(channel);
        onMessageUpdates(() => pubsub.publish(channel, { messages })); // store the publish event (name, payload) into list once subscription is on
        setTimeout(() => pubsub.publish(channel, { messages }), 0); // publish event immidiately after --- !!!! start check:  show the messages in storage already
        return pubsub.asyncIterator(channel); //
      },
    },
  },
};

// ==================== alternative simple solution to subscription ========================
// ** publishing two listeners, one is on mutaiton, another is on subscription it self

// const resolvers = {
//   Query: {
//     messages: () => messages,
//   },
//   Mutation: {
//     postMessage: (parent, { content, user }, { pubsub }) => {
//       const id = messages.length;
//       messages.push({ id, user, content });
//       pubsub.publish("onMutation", { messages }); // publish
//       return id;
//     },
//   },
//   Subscription: {
//     messages: {
//       subscribe: (parent, args, { pubsub }) => {
//         setTimeout(() => pubsub.publish("onSubscription", { messages }), 0); // publish
//         return pubsub.asyncIterator(["onMutation", "onSubscription"]); // listening
//       },
//     },
//   },
// };

// =======================   ===============================

const pubsub = new PubSub();
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });
server.start(() => console.log("Server is running on localhost:4000"));
