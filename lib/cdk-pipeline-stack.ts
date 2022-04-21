import { Stack, StackProps, pipelines } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { CdkPipelineStage } from './cdk-pipeline-stage';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { BuildSpec, ReportGroup, BuildEnvironmentVariableType } from 'aws-cdk-lib/aws-codebuild';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const githubConnectionArn = ssm.StringParameter.fromStringParameterAttributes(this, 'GetCodestarGithubConnectionArnFromSSM', {
      parameterName: 'gitHubConnection',
    }).stringValue;

    const repo = 'PedroJPerez/cdk-pipeline';

    const cypressSM = "cypress/userPassword";

    const gitHubConnection = pipelines.CodePipelineSource.connection(repo, "master", {
      connectionArn: githubConnectionArn,
    });

    const cypressUsername = ssm.StringParameter.valueForStringParameter(
      this, 'cypressUsername');

    const cypressUserPassword = ssm.StringParameter.valueForStringParameter(
      this, 'cypressUserPassword');

    const reportGroup = new ReportGroup(this, 'ReportGroup', {
      reportGroupName: 'SmokeTest'
    });

    
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'MyPipeline',
      synth: new ShellStep('Synth', {
        input: gitHubConnection,
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
        env: {
          "CYPRESS_USERNAME": cypressUsername,
          "CYPRESS_USER_PASSWORD": cypressUserPassword
        }
      })
    });

    const deploy = new CdkPipelineStage(this, 'Deploy');
    const stage = pipeline.addStage(deploy);

    const postValidation = new CodeBuildStep('Test', {
      buildEnvironment:{
        environmentVariables:{
          CYPRESS_USER_PASSWORD:{
            type: BuildEnvironmentVariableType.SECRETS_MANAGER,
            value: cypressSM,
          }
        }
      },
      env: {
        CYPRESS_USERNAME: cypressUsername,
      },
      commands: ['npm ci', 'npm run delete-reports', 'npm run cypress'],
      partialBuildSpec: BuildSpec.fromObject({
        version: '0.2',
        reports: {
          [reportGroup.reportGroupArn]: {
            files: '*.xml',
            'file-format': 'JUNITXML',
            'base-directory': 'src/cypress/reports'
          }
        }
      })});

    stage.addPost(postValidation);

    pipeline.buildPipeline();
    reportGroup.grantWrite(postValidation);
  }
}
