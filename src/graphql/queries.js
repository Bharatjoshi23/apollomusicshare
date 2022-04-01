import { gql } from 'apollo-boost';

export const GET_QUEUED_SONGS = gql`
query getQueuedSong {
  queue @client {
    id
    duration
    title
    artist
    thumbnail
    url
  }
  }
`;
