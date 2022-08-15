import * as SibApiV3Sdk from 'sib-api-v3-typescript';

export type MAILParamsType = {
  subject: string;
  body: string;
  sender: {
    name: string;
    email: string;
  };
  to: {
    email: string;
    name: string;
  };
};

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.HD_SENDINBLUE_API_KEY
);

export const sendEmail = async (params: MAILParamsType) => {
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = `My ${params.subject}`;
  sendSmtpEmail.htmlContent = `<html><body>${params.body}</body></html>`;
  sendSmtpEmail.sender = {
    name: params.sender.name,
    email: params.sender.email,
  };
  sendSmtpEmail.to = [{ email: params.to.email, name: params.to.name }];

  return apiInstance.sendTransacEmail(sendSmtpEmail);
};
