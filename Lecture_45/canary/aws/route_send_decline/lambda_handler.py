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
    callSetup = data['callSetup']
    
    connectionInfo = {
        'Connection Id': connectionId,
        'Domain Name': domainName,
        'Stage Name': stageName
    }

    logger.info(connectionInfo)

    try:
        client = boto3.client('apigatewaymanagementapi', endpoint_url=f'https://{domainName}/{stageName}')
        client.post_to_connection(ConnectionId=callSetup['callerConnectionId'], Data=json.dumps({'type': 'decline', 'callSetup': callSetup}))
        logger.info('Send decline to the caller')
        return {
            'statusCode': 200,
            'body': json.dumps({'type': 'declineSent', 'callSetup': callSetup})
        }
    except Exception as e:
        logger.error(str(e))
        return {
            'statusCode' : 500,
            'body': json.dumps({'type': 'error', 'error': str(e)})
        }
