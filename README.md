# GDAuth
<img src="logo.png" width="150" alt="the mod's logo" />

## Usage

To get a token, use the `getAuthenticationToken` method.

```cpp
authentication::AuthenticationManager::get()->getAuthenticationToken([](std::string token) {
    log::info("{}", token);
});
```

Then, you can validate the token with a request to `https://gd.figm.io/authentication/validate`, passing in the token as the `sessionID` parameter. Tokens expire after 24 hours. A token is only valid if the user has valid credentials to log into their account. An example response to a validation request is listed below:

```json
{
    "_id": "66bd6141575934ecdee278c2",
    "sessionID": "a90fa1eb-7e44-47c1-8301-7c6f7101b08a",
    "accountID": 107269,
    "username": "FigmentBoy",
    "expires_after": "2024-08-16T02:00:33.488Z"
}
```