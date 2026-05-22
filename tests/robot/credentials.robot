*** Settings ***
Library           RequestsLibrary
Library           Collections
Library           OperatingSystem
Resource          keywords/api_keywords.resource
Resource          keywords/auth_keywords.resource

*** Variables ***
${BASE_URL}       ${API_BASE_URL}
${AUTH_TOKEN}     ${EMPTY}

*** Test Cases ***
Health Check Returns Healthy
    [Documentation]    Verify the API health endpoint
    ${response}=    GET    ${BASE_URL}/healthz
    Status Should Be    200
    Dictionary Should Contain Item    ${response.json()}    status    healthy

User Registration
    [Documentation]    Verify user registration flow
    ${email}=    Generate Random Email
    ${body}=    Create Dictionary
    ...    email=${email}
    ...    password=TestPass123!
    ...    display_name=Test Creator
    ${response}=    POST    ${BASE_URL}/api/v1/auth/register
    ...    json=${body}
    ...    expected_status=201
    Dictionary Should Contain Key    ${response.json()}    user_id

User Authentication
    [Documentation]    Verify JWT token generation
    ${email}=    Generate Random Email
    Register User    ${email}    TestPass123!
    ${body}=    Create Dictionary
    ...    email=${email}
    ...    password=TestPass123!
    ${response}=    POST    ${BASE_URL}/api/v1/auth/login
    ...    json=${body}
    ...    expected_status=200
    Dictionary Should Contain Key    ${response.json()}    token
    ${AUTH_TOKEN}=    Set Variable    Bearer ${response.json()}[token]

Credential Issuance
    [Documentation]    Verify soulbound credential issuance
    Set Test Variable    ${email}    test_issuance@example.com
    Register User    ${email}    TestPass123!
    ${token}=    Login User    ${email}    TestPass123!
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${body}=    Create Dictionary
    ...    subject_hash=0xabc123def456
    ...    credential_type=soulbound_passport
    ${response}=    POST    ${BASE_URL}/api/v1/credentials
    ...    json=${body}
    ...    headers=${headers}
    ...    expected_status=201
    Dictionary Should Contain Key    ${response.json()}    credential_id
    Should Be Equal    ${response.json()}[status]    issued

Credential Verification
    [Documentation]    Verify credential verification flow
    ${email}=    Generate Random Email
    Register User    ${email}    TestPass123!
    ${token}=    Login User    ${email}    TestPass123!
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${issuance}=    POST    ${BASE_URL}/api/v1/credentials
    ...    json={"subject_hash": "0xverify123", "credential_type": "soulbound_passport"}
    ...    headers=${headers}
    ...    expected_status=201
    ${cred_id}=    Set Variable    ${issuance.json()}[credential_id]
    ${body}=    Create Dictionary
    ...    credential_id=${cred_id}
    ...    subject_hash=0xverify123
    ${response}=    POST    ${BASE_URL}/api/v1/credentials/verify
    ...    json=${body}
    ...    headers=${headers}
    ...    expected_status=200
    Should Be True    ${response.json()}[valid]

Reputation Score Query
    [Documentation]    Verify reputation score retrieval
    ${response}=    GET    ${BASE_URL}/api/v1/reputation/0xtest123
    ...    expected_status=200
    Dictionary Should Contain Key    ${response.json()}    overall_score

Endorsement Creation
    [Documentation]    Verify peer endorsement flow
    ${email}=    Generate Random Email
    Register User    ${email}    TestPass123!
    ${token}=    Login User    ${email}    TestPass123!
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${body}=    Create Dictionary
    ...    to_hash=0xendorsed_creator
    ...    weight=1.0
    ...    category=reliability
    ...    comment=Great work!
    ${response}=    POST    ${BASE_URL}/api/v1/endorsements
    ...    json=${body}
    ...    headers=${headers}
    ...    expected_status=201
    Dictionary Should Contain Key    ${response.json()}    endorsement_id

AI Reputation Analysis
    [Documentation]    Verify AI-powered reputation analysis
    ${body}=    Create Dictionary
    ...    subject_hash=0xaitest123
    ...    query=How reliable is this creator?
    ${response}=    POST    ${BASE_URL}/api/v1/ai/reputation
    ...    json=${body}
    ...    expected_status=200
    Dictionary Should Contain Key    ${response.json()}    analysis

Quantum Signature
    [Documentation]    Verify PQC signature endpoint
    ${body}=    Create Dictionary
    ...    message=Verify this credential
    ...    algorithm=ML-DSA-65
    ${response}=    POST    ${BASE_URL}/api/v1/quantum/sign
    ...    json=${body}
    ...    expected_status=200
    Dictionary Should Contain Key    ${response.json()}    signature

Nginx PQC TLS
    [Documentation]    Verify PQC TLS connection via Nginx
    ${response}=    GET    https://localhost/healthz
    ...    verify=false
    ...    expected_status=200
    Dictionary Should Contain Item    ${response.json()}    status    healthy
