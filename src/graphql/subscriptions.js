/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateTravelLog = /* GraphQL */ `
  subscription OnCreateTravelLog(
    $filter: ModelSubscriptionTravelLogFilterInput
    $owner: String
  ) {
    onCreateTravelLog(filter: $filter, owner: $owner) {
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
export const onUpdateTravelLog = /* GraphQL */ `
  subscription OnUpdateTravelLog(
    $filter: ModelSubscriptionTravelLogFilterInput
    $owner: String
  ) {
    onUpdateTravelLog(filter: $filter, owner: $owner) {
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
export const onDeleteTravelLog = /* GraphQL */ `
  subscription OnDeleteTravelLog(
    $filter: ModelSubscriptionTravelLogFilterInput
    $owner: String
  ) {
    onDeleteTravelLog(filter: $filter, owner: $owner) {
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
export const onCreateProfile = /* GraphQL */ `
  subscription OnCreateProfile(
    $filter: ModelSubscriptionProfileFilterInput
    $owner: String
  ) {
    onCreateProfile(filter: $filter, owner: $owner) {
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
export const onUpdateProfile = /* GraphQL */ `
  subscription OnUpdateProfile(
    $filter: ModelSubscriptionProfileFilterInput
    $owner: String
  ) {
    onUpdateProfile(filter: $filter, owner: $owner) {
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
export const onDeleteProfile = /* GraphQL */ `
  subscription OnDeleteProfile(
    $filter: ModelSubscriptionProfileFilterInput
    $owner: String
  ) {
    onDeleteProfile(filter: $filter, owner: $owner) {
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
