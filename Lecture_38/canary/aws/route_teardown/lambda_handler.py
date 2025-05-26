import json 
import logging 
import boto3 
from botocore.exceptions import ClientError

table_name = "Connections"
logger = logging.getLogger()
logger.setLevel("INFO")

def lambda_handler(event, context):
    connectionId = event["requestContext"]["connectionId"]
    domainName = event["requestContext"]["domainName"]
    stageName = event["requestContext"]["stage"]
    data = json.loads(event["body"])
    user = data["user"]
    email = user["email"]

    connectionInfo = {
        'Connection Id': connectionId,
        'Domain name': domainName,
        'Stage name': stageName
    }
    logging.info("Teardown connection")
    logging.info(connectionInfo)

    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(table_name)
    retval = delete_item_from_dynamodb(table, email, connectionId)
    send_connections_to_others(table, domainName, stageName)
    return retval

def delete_item_from_dynamodb(table, email, connectionId):
    try:
        logging.info("In delete_item_from_dynamodb()")
        response = table.delete_item(Key={'email': email, 'connectionId': connectionId})
        logging.info(f'DeleteItem succeeded: {response}')
        return {
            'statusCode' : 200,
            'body': json.dumps({'message': 'Connection tear down successful'})
        }
    except ClientError as e:
        logging.error(f'Unable to delete item: {e.response['Error']['Message']}')
        return {
            'statusCode' : 500,
            'body': ({'error': f'Unable to delete item: {e.response['Error']['Message']}'})
        }
    except Exception as e:
        logging.error({'error': str(e)})
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def send_connections_to_others(table, domainName, stage):
    response = table.scan(ConsistentRead=True)
    items = response.get("Items", [])
    items = remove_duplicates_by_email(items)
    logging.info(f"Read {len(items)} items from {table_name}")

    client = boto3.client('apigatewaymanagementapi', endpoint_url=f'https://{domainName}/{stage}')
    for item in items:
        client.post_to_connection(ConnectionId=item["connectionId"], Data=json.dumps({'type': 'users', 'connections': items }))

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

                      

