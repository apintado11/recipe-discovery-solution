import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { readSession } from '../auth/session';

const apiUrl = import.meta.env.VITE_API_URL ?? '';

const authLink = setContext((_, { headers }) => {
  const token = readSession()?.token;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(new HttpLink({ uri: apiUrl ? `${apiUrl}/graphql` : '/graphql' })),
  cache: new InMemoryCache({
    // Nutrition has no id. The detail and favorites queries select different parts of it, so merge them.
    typePolicies: { Nutrition: { merge: true }, NutritionFacts: { merge: true } },
  }),
});
