export type AmplifyDependentResourcesAttributes = {
  "api": {
    "googleImageSearch": {
      "ApiId": "string",
      "ApiName": "string",
      "RootUrl": "string"
    },
    "imageProxy": {
      "ApiId": "string",
      "ApiName": "string",
      "RootUrl": "string"
    },
    "travellog": {
      "GraphQLAPIEndpointOutput": "string",
      "GraphQLAPIIdOutput": "string"
    }
  },
  "auth": {
    "travellog44cb0c14": {
      "AppClientID": "string",
      "AppClientIDWeb": "string",
      "IdentityPoolId": "string",
      "IdentityPoolName": "string",
      "UserPoolArn": "string",
      "UserPoolId": "string",
      "UserPoolName": "string"
    }
  },
  "function": {
    "googleImageSearch": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    },
    "imageProxyFunction": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    }
  },
  "storage": {
    "travellogdb": {
      "BucketName": "string",
      "Region": "string"
    }
  }
}