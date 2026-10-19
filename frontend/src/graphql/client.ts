import { ApolloClient, InMemoryCache } from '@apollo/client';

const apiUrl = import.meta.env.VITE_API_URL ?? '';

export const apolloClient = new ApolloClient({
  uri: apiUrl ? `${apiUrl}/graphql` : '/graphql',
  cache: new InMemoryCache(),
});
