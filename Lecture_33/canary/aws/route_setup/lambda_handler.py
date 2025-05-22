import datatime
import boto3
import json
from botocore.exceptions import ClientError
import logging
from datetime import datetime, timezone

logger = logging.getLogger()

dynamodb = boto3.resource('dynamodb')
table_name = "Connections"

def lambda_handler(event, context):
    connectionId = event["requestContext"]["connectionId"]
    domainName = event["requestContext"]["domainName"]
    stageName = event["requestContext"]["stage"]
    data = json.loads(event["body"])
    user = data["user"]
    email = user["email"]

    connectionInfo = {
        "Connection Id": connectionId,
        "User": email,
        "Domain name": domainName,
        "Stage name": stageName}
    logging.info("Setup called")
    logging.info(connectionInfo)

    try:
        item = {
            'connectionId': connectionId,
            'email': email,
            'connectedAtUTC': datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S'),
        }
        table = dynamodb.Table(table_name)
        table.put_item(Item=item)
        send_connections_to_others(table, domainName, stageName)
        return {
            'statusCode': 200,
            'body': json.dumps({'type': 'setupComplete', 'connectionId' : connectionId})
        }
    except KeyError as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'type': 'error', 'error': f'Missing required field: {str(e)}'})
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'type': 'error', 'error': f'DynamoDB error: {e.response["Error"]["Message"]}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'type': 'error', 'error': str(e)})
        }
    
def send_connections_to_others(table, domainName, stage):
    response = table.scan(ConsistentRead=True)
    items = response.get("Items",[])
    items = remove_duplicates_by_email(items)
    logging.info(f"Read {len(items)} items from {table_name}")

    client = boto3.client('apigatewaymanagementapi', endpoint_url=f'https://{domainName}/{stage}')
    for item in items:
        client.post_to_connection(ConnectionId=item['connectionId'], Data=json.dumps({'type': 'user', 'connections': items}))

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

