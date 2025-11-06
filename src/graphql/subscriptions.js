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
