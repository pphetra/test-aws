import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as iam from "@aws-cdk/aws-iam";
import * as ecs from "@aws-cdk/aws-ecs";
import {CfnDBCluster} from "@aws-cdk/aws-rds";
import ecs_patterns = require("@aws-cdk/aws-ecs-patterns");
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';

type AppProps = {
  vpc: ec2.Vpc
  db: CfnDBCluster
} & cdk.StackProps;
export class Api extends cdk.Stack {

    constructor(scope: cdk.App, id: string, props: AppProps) {
      super(scope, id, props);
      const {vpc, db} = props;

      const cluster = new ecs.Cluster(this, "test-ecs-10-cluster", {
        vpc: vpc,
      });

      const taskRole = new iam.Role(this, `ecs-taskRole-test-ecs-10`, {
        roleName: `ecs-taskRole-test-ecs-10`,
        assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
      });

      const logging = new ecs.AwsLogDriver({
        streamPrefix: "test-ecs-10-logs",
      });

      const executionRolePolicy =  new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ['*'],
        actions: [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
      });

      const taskDef = new ecs.FargateTaskDefinition(this, "test-ecs-10-taskdef", {
        taskRole: taskRole
      });
      taskDef.addToExecutionRolePolicy(executionRolePolicy);

      const container = taskDef.addContainer('test-ecs-10-api-app', {
        image: ecs.ContainerImage.fromRegistry("317555312301.dkr.ecr.ap-southeast-1.amazonaws.com/test-ecs-10:latest"),
        memoryLimitMiB: 256,
        cpu: 256,
        logging,
        environment: {
          'PGUSER': db.masterUsername || 'pphetra',
          'PGPASSWORD': db.masterUserPassword || '1234',
          'PGHOST': db.attrEndpointAddress || '127.0.0.1',
          'PGPORT': db.attrEndpointPort || '5432',
          'PGDATABASE': db.databaseName || 'test',
        }
      });

      container.addPortMappings({
        containerPort: 3000,
        protocol: ecs.Protocol.TCP
      });

      const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "test-ecs-10-service", {
        cluster: cluster,
        taskDefinition: taskDef,
        publicLoadBalancer: true,
        desiredCount: 1,
        listenerPort: 80
      });

      const scaling = fargateService.service.autoScaleTaskCount({ maxCapacity: 6 });
      scaling.scaleOnCpuUtilization('CpuScaling', {
        targetUtilizationPercent: 10,
        scaleInCooldown: cdk.Duration.seconds(60),
        scaleOutCooldown: cdk.Duration.seconds(60)
      });

    }
}
