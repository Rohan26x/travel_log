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
