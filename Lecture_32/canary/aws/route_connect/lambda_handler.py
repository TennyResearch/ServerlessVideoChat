import json
import logging

logger = logging.getLogger()

logger.setLevel("INFO")

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

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Connected to Signal Server'})
    }


