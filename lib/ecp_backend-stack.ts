import * as cdk from "aws-cdk-lib";
import { Construct } from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as rds from "aws-cdk-lib/aws-rds";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";

export class EcpBackendStack extends cdk.Stack {

    private vpc: ec2.Vpc;
    private apiGateway: LambdaRestApi;
    private bucket: s3.Bucket;
    // private rds_ha: rds.DatabaseCluster; // High availability
    private rds_la: rds.DatabaseInstance; // Low availability
    private dynamo: dynamodb.Table;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here

        this.vpc = new ec2.Vpc(this, "Backend VPC", {
            subnetConfiguration: [
                {
                    name: "Public Subnet",
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    name: "Private Subnet",
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },
            ],
        })

        this.bucket = new s3.Bucket(this, "jobeasy-uploads", {
            accessControl: s3.BucketAccessControl.PUBLIC_READ,
            enforceSSL: true,
            versioned: false,
            lifecycleRules: [
                {
                    transitions: [
                        {
                            storageClass: s3.StorageClass.INTELLIGENT_TIERING,
                        }
                    ]
                }
            ]
        })

        this.rds_la = new rds.DatabaseInstance(this, "jobeasy-db", {
            engine: rds.DatabaseInstanceEngine.mariaDb({
                version: rds.MariaDbEngineVersion.VER_10_6,
            }),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
            vpc: this.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
            }
        })

        this.dynamo = new dynamodb.Table(this, 'Table', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        });
    }
}
