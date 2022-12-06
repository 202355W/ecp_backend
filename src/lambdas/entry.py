import json
import random

from tiny_router import TinyLambdaRouter

app = TinyLambdaRouter()


@app.middleware()
def logging_middleware(aws_event):
    print('In da middleware for the request')
    aws_event['middleware'] = f'added_from_middleware-{random.randint(1,100)}'


@app.route('/implicit-health', extra_arg='an extra arg')
def health(aws_event, aws_context, kwargs):
    kwargs['middleware'] = aws_event['middleware']
    return {
        'statusCode': 200,
        'body': json.dumps(kwargs)
    }

@app.route('/health', extra_arg='an extra arg', methods=['GET'])
def health(aws_event, aws_context, kwargs):
    kwargs['middleware'] = aws_event['middleware']
    return {
        'statusCode': 200,
        'body': json.dumps(kwargs)
    }


def lambda_handler(event, context):
    return app.run(event, context)


# Test
# if __name__ == '__main__':
#     events = [
#         {'path': '/health', 'httpMethod': 'GET'},
#         {'path': '/definitely/fake', 'httpMethod': 'GET'},
#         {'path': '/health', 'httpMethod': 'PUT'},
#         {'path': '/implicit-health', 'httpMethod': 'GET'}
#     ]
#     context = None
#     for event in events:
#         try:
#             print('Resp:', lambda_handler(event, context))
#         except Exception as e:
#             print(e)
#         print('----------------------')