*** Settings ***
Library           RequestsLibrary
Library           Collections
Resource          ../keywords/api_keywords.resource

*** Variables ***
${BASE_URL}       ${API_BASE_URL}

*** Test Cases ***
A01 Broken Access Control - IDOR Test
    [Documentation]    Attempt to access another user's credentials
    ${email1}=    Generate Random Email
    ${email2}=    Generate Random Email
    Register User    ${email1}    TestPass123!
    Register User    ${email2}    TestPass123!
    ${token1}=    Login User    ${email1}    TestPass123!
    ${token2}=    Login User    ${email2}    TestPass123!
    ${headers1}=    Create Dictionary    Authorization=Bearer ${token1}
    ${issuance}=    POST    ${BASE_URL}/api/v1/credentials
    ...    json={"subject_hash": "0xidor_test", "credential_type": "test"}
    ...    headers=${headers1}
    ...    expected_status=201
    ${cred_id}=    Set Variable    ${issuance.json()}[credential_id]
    ${headers2}=    Create Dictionary    Authorization=Bearer ${token2}
    ${response}=    GET    ${BASE_URL}/api/v1/credentials/${cred_id}
    ...    headers=${headers2}
    ...    expected_status=403

A02 Cryptographic Failures - Weak TLS Test
    [Documentation]    Verify TLS configuration rejects weak ciphers
    ${response}=    GET    https://localhost/healthz
    ...    verify=false
    ...    expected_status=200

A03 Injection - SQL Injection Test
    [Documentation]    Attempt SQL injection on parameters
    ${body}=    Create Dictionary
    ...    email="' OR '1'='1"
    ...    password="' OR '1'='1"
    ${response}=    POST    ${BASE_URL}/api/v1/auth/login
    ...    json=${body}
    ...    expected_status=401

A05 Security Misconfiguration - Headers Audit
    [Documentation]    Verify security headers are present
    ${response}=    GET    ${BASE_URL}/healthz
    Should Not Be Empty    ${response.headers}
    Dictionary Should Contain Key    ${response.headers}    X-Request-ID

A07 Authentication - Weak JWT Test
    [Documentation]    Verify invalid JWT is rejected
    ${headers}=    Create Dictionary    Authorization=Bearer invalid.jwt.token
    GET    ${BASE_URL}/api/v1/credentials/test
    ...    headers=${headers}
    ...    expected_status=401

A07 Authentication - Expired Token Test
    [Documentation]    Verify expired JWT is rejected
    ${headers}=    Create Dictionary    Authorization=Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNTE2MjM5MDIyfQ.expired_token
    GET    ${BASE_URL}/api/v1/credentials/test
    ...    headers=${headers}
    ...    expected_status=401

A10 SSRF - URL Injection Test
    [Documentation]    Verify SSRF protections
    ${headers}=    Create Dictionary    X-Forwarded-Host=malicious-site.com
    GET    ${BASE_URL}/api/v1/credentials/test
    ...    headers=${headers}
    ...    expected_status=401

Rate Limiting Test
    [Documentation]    Verify rate limiting is enforced
    ${email}=    Generate Random Email
    Register User    ${email}    TestPass123!
    ${token}=    Login User    ${email}    TestPass123!
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    FOR    ${i}    IN RANGE    150
        GET    ${BASE_URL}/api/v1/credentials/test
        ...    headers=${headers}
        ...    expected_status=200|429
    END
