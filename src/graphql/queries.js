/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTravelLog = /* GraphQL */ `
  query GetTravelLog($id: ID!) {
    getTravelLog(id: $id) {
      id
      location
      whatYouDidThere
      overallExperience
      imageUrls
      place
      regionSpeciality
      funLevel
      weather
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listTravelLogs = /* GraphQL */ `
  query ListTravelLogs(
    $filter: ModelTravelLogFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTravelLogs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        location
        whatYouDidThere
        overallExperience
        imageUrls
        place
        regionSpeciality
        funLevel
        weather
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getProfile = /* GraphQL */ `
  query GetProfile($id: ID!) {
    getProfile(id: $id) {
      id
      owner
      username
      firstName
      lastName
      birthdate
      gender
      bio
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listProfiles = /* GraphQL */ `
  query ListProfiles(
    $filter: ModelProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        owner
        username
        firstName
        lastName
        birthdate
        gender
        bio
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
