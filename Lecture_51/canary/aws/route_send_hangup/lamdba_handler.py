import boto3
import json
import logging

logger = logging.getLogger()

logger.setLevel("INFO")

def lambda_handler(event, context):
    connectionId = event['requestContext']['connectionId']
    domainName = event['requestContext']['domainName']
    stageName = event['requestContext']['stage']

    data = json.loads(event['body'])
    cid = data['connectionId']

    connectionInfo = {
        'Connection Id' : connectionId,
        'Domain Name': domainName,
        'Stage Name' : stageName
    }

    logger.info(connectionInfo)

    try:
        client = boto3.client('apigatewaymanagementapi', endpoint_url=f'https://{domainName}/{stageName}')
        client.post_to_connection(ConnectionId=cid, Data=json.dumps({'type': 'hangup'}))
        logger.info(f'Sent a hangup to {cid}')
        return {
            'statusCode' : 200,
            'body': json.dumps({'type': 'hangupSent'})
        }
    except Exception as e:
        logger.error(str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'type': 'error', 'error': str(e)})
        }