*** Settings ***
Library           RequestsLibrary
Library           FakerLibrary

*** Keywords ***
Create Session With Auth
    [Arguments]    ${token}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    Create Session    api    ${BASE_URL}    headers=${headers}

Generate Random Email
    ${name}=    FakerLibrary.User Name
    ${email}=    Set Variable    ${name}@test.com
    [Return]    ${email}

Register User
    [Arguments]    ${email}    ${password}
    ${body}=    Create Dictionary
    ...    email=${email}
    ...    password=${password}
    ...    display_name=Test Creator
    POST    ${BASE_URL}/api/v1/auth/register
    ...    json=${body}
    ...    expected_status=201

Login User
    [Arguments]    ${email}    ${password}
    ${body}=    Create Dictionary
    ...    email=${email}
    ...    password=${password}
    ${response}=    POST    ${BASE_URL}/api/v1/auth/login
    ...    json=${body}
    ...    expected_status=200
    ${token}=    Set Variable    ${response.json()}[token]
    [Return]    ${token}
