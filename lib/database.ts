import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';

import {
  DbName,
  DbUserName,
  Engine,
  EngineMode,
  ParameterGroupFamily,
  ScalingMaxCapacity,
  ScalingMinCapacity,
  ScalingSecondsUtilAutoPause
} from './config';
import {CfnDBCluster} from "@aws-cdk/aws-rds";

type DatabaseProps = {
  vpc: ec2.Vpc
} & cdk.StackProps;

export class Database extends cdk.Stack {
  public readonly dbSG: ec2.SecurityGroup;
  public readonly  dbClusterArn: string;
  public readonly db: CfnDBCluster;

  constructor(scope: cdk.App, id: string, props: DatabaseProps) {
    super(scope, id, props);

    const vpc = props.vpc;

    this.dbSG = new ec2.SecurityGroup(this, 'DBSG', {
      vpc,
      allowAllOutbound: true,
      description: 'for database',
      securityGroupName: 'Database',
    })

    this.dbSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      'postgres connection',
    )

    const subnetGroup = new rds.CfnDBSubnetGroup(this, 'SubnetGroup', {
      dbSubnetGroupDescription: 'CloudFormation managed DB subnet group.',
      subnetIds: vpc.publicSubnets.map(sub => sub.subnetId)
    });

    this.db = new rds.CfnDBCluster(
      this, 'RDS',
      {
        databaseName: DbName,
        dbClusterIdentifier: id,
        dbSubnetGroupName: subnetGroup.ref,
        engine: Engine,
        engineMode: EngineMode,
        port: 5432,
        masterUsername: 'pphetra',
        masterUserPassword: 'pok2lily',
        scalingConfiguration: {
          autoPause: true,
          maxCapacity: ScalingMaxCapacity,
          minCapacity: ScalingMinCapacity,
          secondsUntilAutoPause: ScalingSecondsUtilAutoPause
        },
        vpcSecurityGroupIds: [
          this.dbSG.securityGroupId
        ]
      }
    );

    this.dbClusterArn = this.formatArn({
      service: 'rds',
      resource: 'cluster',
      sep: ':',
      // NOTE: resourceName should be lower case for RDS
      // however arn is evaluated in case sensitive.
      resourceName: (this.db.dbClusterIdentifier || '').toString().toLowerCase()
    });
  }
}
