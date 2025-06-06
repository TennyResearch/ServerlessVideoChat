import json
import time
import urllib.request
from jose import jwk, jwt
from jose.utils import base64url_decode
import logging

logger = logging.getLogger()
logger.setLevel("INFO")

REGION = "us-east-2"
USER_POOL_ID = "us-east-2_nMxpoJRPq"
APP_CLIENT_ID = "4tj2p5qmgtv47ag37qqg2iqns5"

def lambda_handler(event, context):
    connectionId = event["requestContext"]["connectionId"]
    domainName = event["requestContext"]["domainName"]
    stageName = event["requestContext"]["stage"]

    connectionInfo = {
        "Connection Id" : connectionId,
        "Domain Name" : domainName,
        "Stage Name" : stageName
    }
    logging.info("Connection established")
    logging.info(connectionInfo)
    queryStringParameters = event["queryStringParameters"]
    token = queryStringParameters["token"]
    logger.info(f'Identity token received, length = {len(token)}')
    claims = verify_identity_token(token, APP_CLIENT_ID, keys)
    if claims == False:
        logger.error("Token verification failed")
        return {
            'statusCode': 403,
            'body': json.dumps("Not Authorized")
        }
    logger.info("Token verification success. User email from token is {}".format(claims['email']))
    return {
        'statusCode': 200,
        'body': json.dumps({'message': '{} connection successful'.format(claims['email'])})
    }

# gets the public keys for the Cognito application, this should be called on
# cold start so we can cache these
def get_keys(region, user_pool_id):
    keys_url = 'https://cognito-idp.{}.amazonaws.com/{}/.well-known/jwks.json'.format(region,user_pool_id)
    with urllib.request.urlopen(keys_url) as f:
        response = f.read()
    return json.loads(response.decode('utf-8'))['keys']


# cache the keys on cold start
keys = get_keys(REGION, USER_POOL_ID)

# verifies the identity token and returns the claims it contains or False
def verify_identity_token(token, app_client_id, keys):
    # get the unverified headers
    headers = jwt.get_unverified_headers(token)
    kid = headers['kid']

    # search for the kid in the downloaded public keys
    key_index = -1
    for i in range(len(keys)):
        if kid == keys[i]['kid']:
            key_index = i
            break
    if key_index == -1:
        logger.error('Public key not found in the public keys for the Cognito client application')
        return False
    
    # construct the public key
    public_key = jwk.construct(keys[key_index])

    # get the last two sections of the token, sections are deliniated by '.'
    message, encoded_signature = str(token).rsplit('.', 1)

    # decode the signature
    decoded_signature = base64url_decode(encoded_signature.encode('utf-8'))

    # verify the signature
    if not public_key.verify(message.encode("utf-8"), decoded_signature):
        logger.error('Signature verification failed')
        return False
    
    claims = jwt.get_unverified_claims(token)

    # verify token expiration
    if time.time() > claims['exp']:
        logger.error('Token is expired')
        return False
    
    # verify audience
    if claims['aud'] != app_client_id:
        logger.error('Token was not issued to this client app')
        return False
    return claims


