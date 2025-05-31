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
    ice_info = data['ice_info']

    connectionInfo = {
        'Connection Id': connectionId,
        'Domain Name' : domainName,
        'Stage Name' : stageName
    }

    logger.info(connectionInfo)

    try:
        toConnectionId = ice_info['connectionId']
        candidates = ice_info['candidates']
        client = boto3.client('apigatewaymanagementapi', endpoint_url=f'https://{domainName}/{stageName}')
        client.post_to_connection(ConnectionId=toConnectionId, Data=json.dumps({'type': 'ice_candidates', 'ice_candidates': candidates}))
        logger.info(f'Sent ice candidates to {toConnectionId}')
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'ICE candidates sent'})
        }
    except Exception as e:
        logger.error(str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    