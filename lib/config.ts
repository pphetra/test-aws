export const AppName = 'TestRds';
export const KeyName = 'pphetra';

export const NetworkStackName = `${AppName}Network`;
export const NetworkCidr = '172.31.0.0/16';

export const DatabaseStackName = `${AppName}Database`;
export const DbName = 'test';
export const DbUserName = 'pphetra';
export const Engine = 'aurora-postgresql';
export const EngineMode = 'serverless';
export const ParameterGroupFamily = 'aurora5.6';
export const ScalingMaxCapacity = 4;
export const ScalingMinCapacity = 2;
export const ScalingSecondsUtilAutoPause = 300; // 5min

export const BastionStackName = `${AppName}Bastion`;
