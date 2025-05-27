import boto3
import json
import logging
from datetime import datetime, timezone

dynamodb = boto3.resource("dyanamodb")
table_name = "Connections"
logger = logging.getLogger()
logger.setLevel("INFO")

def lambda_handler(event, context):
    connectionId = event["requestContext"]["connectionId"]
    domainName = event["requestContext"]["domainName"]
    stageName = event["requestContext"]["stage"]

    data = json.loads(event['body'])
    callSetup = data['callSetup']

    connectionInfo = {
        'Connection id': connectionId,
        'Domain name' : domainName,
        'Stage name': stageName
    }
    logger.info(connectionInfo)

    try:
        callSetup['callerConnectionId'] = connectionId
        connectionsTable = dynamodb.Table(table_name)
        response = connectionsTable.scan()
        items = response.get("Items",[])
        items = remove_duplicates_by_email(items)

        logger.info(items)
        connections = [x for x in items if x.get('email') == callSetup['calleeEmail']]
        if len(connections) == 1:
            connection = connections[0]
            callSetup['calleeConnectionId'] = connection["connectionId"]
            client = boto3.client('apigatewaymanagementapi', endpoint_url=f'https://{domainName}/{stageName}')
            client.post_to_connection(ConnectionId=connection['connectionId'], Data=json.dumps({'type': 'offer', 'callSetup': callSetup}))
            logger.info(f'Sent offer ot {callSetup['calleeEmail']}')
            return {
                'statusCode': 200,
                'body': json.dumps({'type': "offerSent", "callSetup": callSetup})
            }
        return {
            'statusCode': 500,
            'body': json.dumps({'type': "offerSent", "callSetup": callSetup})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'type': 'error', 'error': str(e)})
        }
    
# removes duplicate emails and keeps the latest connection 
def remove_duplicates_by_email(connections):
    sorted_by_email = sorted(connections, key=lambda c: c.get('email'))
    unique_objects = {}
    for obj in sorted_by_email:
        email = obj.get('email')
        timestamp = obj.get('connectedAtUTC')
        if email:
            if email not in unique_objects or unique_objects[email]['connectedAtUTC'] < timestamp:
                unique_objects[email] = obj
    return list(unique_objects.values())

