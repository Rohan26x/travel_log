/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTravelLog = /* GraphQL */ `
  mutation CreateTravelLog(
    $input: CreateTravelLogInput!
    $condition: ModelTravelLogConditionInput
  ) {
    createTravelLog(input: $input, condition: $condition) {
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
export const updateTravelLog = /* GraphQL */ `
  mutation UpdateTravelLog(
    $input: UpdateTravelLogInput!
    $condition: ModelTravelLogConditionInput
  ) {
    updateTravelLog(input: $input, condition: $condition) {
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
export const deleteTravelLog = /* GraphQL */ `
  mutation DeleteTravelLog(
    $input: DeleteTravelLogInput!
    $condition: ModelTravelLogConditionInput
  ) {
    deleteTravelLog(input: $input, condition: $condition) {
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
export const createProfile = /* GraphQL */ `
  mutation CreateProfile(
    $input: CreateProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    createProfile(input: $input, condition: $condition) {
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
export const updateProfile = /* GraphQL */ `
  mutation UpdateProfile(
    $input: UpdateProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    updateProfile(input: $input, condition: $condition) {
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
export const deleteProfile = /* GraphQL */ `
  mutation DeleteProfile(
    $input: DeleteProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    deleteProfile(input: $input, condition: $condition) {
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
